import './style.css';
import { Viewer } from './viewer';

// if local/dev
export const IPaddress = "localhost"
export const port = "8000"
// // if deploy
// export const IPaddress = "138.231.63.90"
// export const port = "2332"



const viewer = new Viewer('viewer1', 1);
let img: HTMLImageElement = new Image();
const timestamp = new Date().getTime();  // hack to always reload
img.src = `http://${IPaddress}:${port}/img?timestamp=${timestamp}`;


img.addEventListener("load", () => {
  console.log("reload image")
  viewer.reset()
  viewer.handleImage(img)
}
);

