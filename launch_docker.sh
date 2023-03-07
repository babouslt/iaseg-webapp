# data dir should contain ./vol/out and ./vol/images  
DATA_DIR=${PWD}
docker run --volume ${DATA_DIR}/vol/out:/vol/out --volume ${DATA_DIR}/vol/images:/vol/images -p 8000:80 --pull always franchesoni/iaseg-app 
