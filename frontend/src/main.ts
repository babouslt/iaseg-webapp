import './style.css';
import { Viewer } from './viewer';
import { FileManager } from './fileManager';

// if local/dev
export const IPaddress = "localhost"
export const port = "8000"
// // if deploy
// export const IPaddress = "138.231.63.90"
// export const port = "2332"

const fileManager = new FileManager();
const viewer = new Viewer('viewer1', 1);
const img: HTMLImageElement = new Image();
img.addEventListener("load", () => {
    viewer.reset()
    viewer.handleImage(img)
  }
)

function setImgSrc(img: HTMLImageElement, imgNumber: number) {
  const timestamp = new Date().getTime();  // hack to always reload
  img.src = `http://${IPaddress}:${port}/img/${imgNumber}?timestamp=${timestamp}`;
}

document.addEventListener("updateImage", () => {
  setImgSrc(img, fileManager.imgNumber);
});

setImgSrc(img, fileManager.imgNumber)
  

;

