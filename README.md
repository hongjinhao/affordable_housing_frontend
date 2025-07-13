# Frontend for affordable housing API   

This repo contains the simple frontend scripts that are hosted on S3 and calls the API (hosted on lambda + API Gateway)

When users enter the website, a `/health` API call is made to check the health of the API and a `/predict` call is made to immediately start up the lambda microcontainer. 

