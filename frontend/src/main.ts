import { Viewer } from './viewer';

let img: HTMLImageElement = new Image();
img.src = "http://localhost:8001"  // load one image only

const viewer = new Viewer('viewer1', 500)
img.addEventListener("load", () => viewer.handleImage(img));

