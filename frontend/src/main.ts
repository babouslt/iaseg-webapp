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
img.addEventListener("load", () => {
    viewer.reset()
    viewer.handleImage(img)
  }
)

const fileManager = new FileManager(img);
console.log(fileManager)






