# if local
docker run --volume ./backend/out:/code/vol/out --volume ./backend/app/images:/code/vol/images -p 8000:80 iaseg-app-dev
# # if deploy
# docker run -p 8000:80 --pull always franchesoni/iaseg-app 
