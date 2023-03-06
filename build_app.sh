cd frontend
npm install
npm run build
rm -rf ../backend/dist
mv dist/ ../backend/dist
cd ../backend
# if local
docker build -t iaseg-app-dev .
# # if deploy
# docker build -t iaseg-app .
# docker tag iaseg-app franchesoni/iaseg-app
# docker push franchesoni/iaseg-app

