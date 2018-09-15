FROM nginx:1.15.3

# Default configuration
ENV PORT 80
ENV GOOGLE_MAPS_API_KEY="notyourrealkey"

COPY app /usr/share/nginx/html
COPY app/index.html /usr/share/nginx/html/index.html.template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Heroku uses the "PORT" environment variable in their container service. Since this is
# a nginx docker image, we have to modify the config on container start. Sorry for the hack.
# I have also modified the CMD to update the GOOGLE_MAPS_API_KEY= on container start from an environment variable
CMD envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && \
    envsubst < /usr/share/nginx/html/index.html.template > /usr/share/nginx/html/index.html && \
    exec nginx -g 'daemon off;'


