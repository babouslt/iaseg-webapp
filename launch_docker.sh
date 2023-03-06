# if local
docker run --volume ./vol/out:/vol/out --volume ./vol/images:/vol/images -p 8000:80 iaseg-app-dev
# # if deploy
# docker run -p 8000:80 --pull always franchesoni/iaseg-app 
