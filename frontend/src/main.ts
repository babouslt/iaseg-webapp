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



// const fileInput = document.getElementById('fileInput') as HTMLInputElement;
// fileInput.addEventListener('change', async () => {
//   const files = fileInput.files
//   if (files && files.length > 0) {
//   const file = files[0];
//   const reader = new FileReader();
//   reader.readAsArrayBuffer(file);

//   reader.onload = async () => {
//     const imgArrayBuffer = reader.result as ArrayBuffer;
//     console.log(imgArrayBuffer)
//     console.log("uploading image")

//     const response = await fetch(`http://${IPaddress}:${port}/upload`, {
//       method: 'POST',

//       headers: {
//       //   'Content-Type': 'image/jpeg'
//       //   'Content-Type': 'application/octet-stream'
//       },
//       body: imgArrayBuffer
//     });
//     if (response.ok) {
//       const imgBlob = new Blob([imgArrayBuffer], {type: 'image/jpeg'});
//       img.src = URL.createObjectURL(imgBlob);  // resets and handles image
//     }
//     else {
//       console.log("error when uploading image")
//     }
//   }
//   };
// }
// );

