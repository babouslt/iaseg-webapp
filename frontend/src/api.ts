import { Viewer } from "./viewer";  // only here for typing
export type ClickType = [number, number, boolean]

export class API {
  private wsRegion: WebSocket;
  private wsClicks: WebSocket;
  private wsMask: WebSocket;
  viewer: Viewer;
  receivedMask: Uint8ClampedArray;
  
  // private wsRegion: WebSocket;
  // private wsAux: WebSocket;


  // manaoges the websockets and requests to the backend
  constructor(viewer: Viewer) {
    this.viewer = viewer;  // tight coupling
    this.wsRegion = new WebSocket("ws://localhost:8001/ws/region");
    this.wsClicks = new WebSocket("ws://localhost:8001/ws/clicks");

    this.wsMask = new WebSocket("ws://localhost:8001/ws/mask");
    this.wsMask.binaryType = "arraybuffer";
    this.receivedMask = new Uint8ClampedArray(0);
    this.wsMask.onmessage = this.receiveMask.bind(this);

  //   this.wsAux = new WebSocket("ws://localhost:8001/ws/aux");
  }

  // send clicks to backend
  sendClicks(clicks: ClickType[]) {
    this.wsClicks.send(JSON.stringify(clicks));
  }

  sendRegion(dx: number, dy: number, zoom: number) {
    this.wsRegion.send(JSON.stringify({"dx":dx, "dy":dy, "zoom":zoom}));
  }


  receiveMask(event: MessageEvent) {
    console.log("receiving mask")
    this.receivedMask = this.decodeMask(event)
    const maskData = new ImageData(this.receivedMask, Math.floor(this.viewer.imgWidth), Math.floor(this.viewer.imgHeight));
    // put image in canvas, create new canvas
    const maskCanvas = document.getElementById("maskCanvas") as HTMLCanvasElement;
    maskCanvas.width = Math.floor(this.viewer.imgWidth);
    maskCanvas.height = Math.floor(this.viewer.imgHeight);
    const ctx = maskCanvas.getContext("2d")!;
    ctx.putImageData(maskData, 0, 0);
    this.viewer.annContext.putImageData(maskData, 0, 0);
    this.viewer.redraw()
  }


  private decodeMask(event: MessageEvent): Uint8ClampedArray {
    const height = Math.floor(this.viewer.imgHeight);
    const width = Math.floor(this.viewer.imgWidth);
    console.log("decoding mask")
    const dataView = new DataView(event.data);
    const flattenedBinaryImage = new Uint8Array(height * width);
    const rgbaImage = new Uint8ClampedArray(height * width * 4);

    let binaryIndex = 0;
    let rgbaIndex = 0;

    // Loop through each byte in the binary data
    for (let i = 0; i < event.data.byteLength; i++) {
        const byte = dataView.getUint8(i);
        // Loop through each bit in the current byte
        for (let j = 0; j < 8; j++) {
            // Set the corresponding pixel in the binary image based on the value of the bit
            if (binaryIndex >= width * height) {
                break;
            }
            flattenedBinaryImage[binaryIndex] = (byte >> (7-j)) & 1;
            rgbaImage[rgbaIndex + 0] = 255;
            rgbaImage[rgbaIndex + 1] = (1 - flattenedBinaryImage[binaryIndex]) * 255;
            rgbaImage[rgbaIndex + 2] = 255;
            rgbaImage[rgbaIndex + 3] = flattenedBinaryImage[binaryIndex] * 255;

            binaryIndex++;
            rgbaIndex += 4;
        }

    }
    console.log(flattenedBinaryImage)
    return rgbaImage;
  }


}
