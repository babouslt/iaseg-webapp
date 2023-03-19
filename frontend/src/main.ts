import './style.css';
import { Viewer } from './viewer';
import { FileManager } from './fileManager';
import { checkNull } from './utils';

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

const fileManager = new FileManager(img);  // requests an image
console.log(fileManager)

const clearAnn = () => {
  viewer.clear();
  viewer.resetMaskCanvas();
}

const clearBtn = document.getElementById("clearBtn") as HTMLButtonElement;
clearBtn.addEventListener("click", clearAnn);


const form = document.querySelector<HTMLFormElement>('#methodForm')!;
checkNull(form, "methodForm")

form.addEventListener('change', () => {
  const selectedButton = form.querySelector<HTMLInputElement>('input[type=radio]:checked');

  if (selectedButton) {
    const selectedButtonValue = selectedButton.value;
    console.log(`Selected button: ${selectedButtonValue}`);
    viewer.changeTool(selectedButtonValue);
    clearAnn();
  }
});