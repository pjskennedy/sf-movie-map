GOOGLE_MAPS_API_KEY ?= "not defined"
HEROKU_APPLICATION ?= "not-defined"

.PHONY : all

app/films.json:
	echo "Geocoding, this may take several minutes."
	ruby main.rb	$(GOOGLE_MAPS_API_KEY) > app/films.json

build: app/films.json
	docker build --build-arg google_maps_api_key=$(GOOGLE_MAPS_API_KEY) -t pjskennedy/movie-map .

push: build
	docker tag pjskennedy/movie-map registry.heroku.com/$(HEROKU_APPLICATION)/web
	docker push registry.heroku.com/$(HEROKU_APPLICATION)/web

deploy: push
	heroku container:release web -a $(HEROKU_APPLICATION)

all: build