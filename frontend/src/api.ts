// import UPNG from "upng-js";
import { Viewer } from "./viewer";  // only here for typing
import { IPaddress, port } from "./main"
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
    // add websocket to IPaddress
    this.wsRegion = new WebSocket(`ws://${IPaddress}:${port}/ws/region`);
    this.wsClicks = new WebSocket(`ws://${IPaddress}:${port}/ws/clicks`);

    this.wsMask = new WebSocket(`ws://${IPaddress}:${port}/ws/mask`);
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
    // what is received are the bytes of a .png file
    const imageData = new Uint8Array(event.data);
    const blob = new Blob([imageData], {type: "image/png"});
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      // // put image in canvas, create new canvas
      const maskCanvas = document.getElementById("maskCanvas") as HTMLCanvasElement;
      maskCanvas.width = Math.floor(this.viewer.imgWidth);
      maskCanvas.height = Math.floor(this.viewer.imgHeight);
      const ctx = maskCanvas.getContext("2d")!;
      // ctx.putImageData(maskData, 0, 0);
      ctx.drawImage(img, 0, 0)
      // this.viewer.annContext.putImageData(maskData, 0, 0);
      this.viewer.annContext.drawImage(img, 0, 0);
      this.viewer.redraw()
    }
  }

}