import './style.css';
import { Viewer } from './viewer';

let img: HTMLImageElement = new Image();
img.src = "http://localhost:8001"  // load one image only

const viewer = new Viewer('viewer1', 1)
// wait for viewer to be ready before loading image
// await new Promise(r => setTimeout(r, 1000));
img.addEventListener("load", () => viewer.handleImage(img));

