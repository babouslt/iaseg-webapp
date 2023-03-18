import './style.css';
import { Viewer } from './viewer';
import { FileManager } from './fileManager';

// // if local/dev
// export const IPaddress = "localhost"
// export const port = "8000"
// if deploy
export const IPaddress = "138.231.63.90"
export const port = "2332"

const viewer = new Viewer('viewer1', 1);
const img: HTMLImageElement = new Image();

// define loadimg callback
const loadImg = () => {
  viewer.reset()
  viewer.handleImage(img)
}

img.addEventListener("load", loadImg);

const fileManager = new FileManager(img);
console.log(fileManager)

const clearAnn = () => {
  viewer.clear();
  viewer.resetMaskCanvas();
  viewer.clear();
}

const clearBtn = document.getElementById("clearBtn") as HTMLButtonElement;
clearBtn.addEventListener("click", clearAnn);





