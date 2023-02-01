import { checkNull } from './utils'
import { Viewer } from './viewer';



// async function btn1(): Promise<void> {
//     console.log("Button clicked")
//     const content = await (await fetch("http://localhost:8001")).json()
//     console.log(content)
// }

// document.getElementById("btn1")!.addEventListener("click", btn1);

// const ws = new WebSocket("ws://localhost:8001/ws")
// ws.onmessage = (event) => {
//     const messages = document.getElementById('messages')!
//     const message = document.createElement('li')
//     const content = document.createTextNode(event.data)
//     message.appendChild(content)
//     messages.appendChild(message)
//     console.log(event.data)
// }

// export async function sendMessage(event: Event) {
//                 event.preventDefault()
//                 const inputElement = <HTMLInputElement> document.getElementById("messageText")!
//                 ws.send(inputElement.value)
//             }

// document.getElementById("form1")!.addEventListener("submit", sendMessage)



//////////////////




// IMAGE NUMBERING
let imgNumber = 0;
const imgNumberDiv = document.getElementById("imgNumber")!;  // assume not null
checkNull(imgNumberDiv, "imgNumberDiv");  // check assumption that div is not null
imgNumberDiv.innerHTML = imgNumber.toString();

// IMAGE
let img: HTMLImageElement = new Image();
img.src = "https://picsum.photos/500/500?image=" + imgNumber

const viewer = new Viewer('viewer1', 500)
img.addEventListener("load", () => viewer.handleImage(img));

function nextImage(): void {
    imgNumber++;
    img.src = "https://picsum.photos/500/500?image=" + imgNumber;
    imgNumberDiv.innerHTML = imgNumber.toString();
}

function prevImage(): void {
    if (imgNumber == 0) {
        return;
    }
    imgNumber--;
    img.src = "https://picsum.photos/500/500?image=" + imgNumber;
    imgNumberDiv.innerHTML = imgNumber.toString();
}



// bind to buttons
document.getElementById("next")!.addEventListener("click", nextImage);
checkNull(document.getElementById("next"), "next button");
document.getElementById("prev")!.addEventListener("click", prevImage);
checkNull(document.getElementById("prev"), "prev button");