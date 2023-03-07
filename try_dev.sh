cd frontend
npm install
npm run build
rm -rf ../backend/dist
mv dist/ ../backend/dist
cd ../backend
docker build -t iaseg-app-dev .
cd ..
docker run --volume ./vol/out:/vol/out --volume ./vol/images:/vol/images -p 8000:80 iaseg-app-dev
