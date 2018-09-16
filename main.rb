# This is a quick script to pull movie location data from DataSF (City of San Francisco)
# and create a dataset more usable in a map visualization. It will dump this data to STDOUT
#
# This will take a few minutes to run, and probably get a lot of things wrong. We have
# to Geocode all of the locations.
#
# Ruby via:
#
# ruby main.rb your-google-maps-api-key-here
#

require 'json'
require 'net/http'

GOOGLE_API_KEY = ARGV[0]

# Reead JSON from a URL into a symbol-forward ruby object
def read_json(url)
  uri = URI(url)
  response = Net::HTTP.get(uri)
  JSON.parse(response, symbolize_names: true)
end

# Read movie data from the City of San Francisco
def query_datasf
  read_json("https://data.sfgov.org/resource/wwmu-gmzc.json?$limit=1000000")
end

# Function to geocode a given text-based address
def lookup_coordinates(geocoder_text)
  uri = URI("https://maps.googleapis.com/maps/api/geocode/json?address=#{URI::encode(geocoder_text)}&key=#{URI::encode(GOOGLE_API_KEY)}")
  response = Net::HTTP.get(uri)
  json = JSON.parse(response, symbolize_names: true)
  if json[:status] == "OK" && !json[:results].empty?
    json[:results].first[:geometry][:location]
  end
end

grouped_records = query_datasf.group_by{|j| j[:title].strip}

records = grouped_records.map do |_title, films|
  first_film = films.first

  title = first_film[:title].strip
  year = first_film[:release_year].nil? ? nil : first_film[:release_year].to_i
  director = first_film[:director]
  writer = first_film[:writer]
  production_company = first_film[:production_company]
  distributor = first_film[:distributor]
  actors = [first_film[:actor_1], first_film[:actor_2], first_film[:actor_3]].compact.uniq

  locations = films.map { |f| f[:locations] }
  notes = films.map { |f| f[:fun_facts] }
  location_details = locations.zip(notes).select { |location, fact| !location.nil? }

  locations = location_details.map do |location, fun_fact|
    # Google maps doesn't play well with "&"
    geocoder_text = "#{location.gsub("&", "and")}, San Francisco, California, USA"
    coordinates = lookup_coordinates(geocoder_text)
    coordinates ? coordinates.merge(location: location, facts: fun_fact) : nil
  end

  {
    title: title,
    year: year.nil? ? nil : year.to_i,
    director: director,
    production_company: production_company,
    distributor: distributor,
    writer: writer,
    actors: actors,
    locations: locations.compact
  }
end

active_records = records.select{|r| !r[:locations].empty? }

# Write JSON to STDOUT
puts JSON.pretty_generate(active_records)
