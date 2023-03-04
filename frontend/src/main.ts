import './style.css';
import { Viewer } from './viewer';

export const IPaddress = "138.231.63.90"


let img: HTMLImageElement = new Image();
const timestamp = new Date().getTime();  // hack to always reload
img.src = `http://${IPaddress}:8002/img?timestamp=${timestamp}`;

const viewer = new Viewer('viewer1', 1)
// wait for viewer to be ready before loading image
// await new Promise(r => setTimeout(r, 1000));
console.log('reset')
img.addEventListener("load", () => viewer.handleImage(img));

