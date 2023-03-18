import { ClickType, API } from "./api";
import { checkNull } from "./utils";

export class Viewer {
  private api: API;
  private div: HTMLElement;

  private imgCanvas : HTMLCanvasElement;
  private imgContext : CanvasRenderingContext2D;
  private annCanvas : HTMLCanvasElement;
  annContext : CanvasRenderingContext2D;  // acess this one from api.ts
  private dispLCanvas : HTMLCanvasElement;  // L stands for "layout"
  private dispLContext : CanvasRenderingContext2D;
  private prev1LCanvas : HTMLCanvasElement;
  private prev1LContext : CanvasRenderingContext2D;

  private canvasFactor : number;
  private canvasWidth : number;
  private canvasHeight : number;

  private zoom: number = 1;
  private dx: number = 0;
  private dy: number = 0;
  private alpha: number = 0.5;
  private clicks: ClickType[] = [];
  imgWidth: number = 0;
  imgHeight: number = 0;

  constructor(divId: string, factor: number) {
    console.log("construct")
    this.div = document.getElementById(divId)!;
    checkNull(this.div, "div");
    console.log("factor" + factor)
    this.canvasFactor = factor;
    this.canvasHeight = this.canvasFactor * 224;
    this.canvasWidth = this.canvasFactor * 224;
    this.api = new API(this)



    this.imgCanvas = document.createElement("canvas");
    this.annCanvas = document.createElement("canvas");
    this.dispLCanvas = document.createElement("canvas");

    this.imgContext = this.imgCanvas.getContext("2d")!;
    this.annContext = this.annCanvas.getContext("2d")!;
    this.dispLContext = this.dispLCanvas.getContext("2d")!;
    // this.refCanvas = document.createElement("canvas");
    // this.annCanvas = document.createElement("canvas");
    // this.propCanvas = document.createElement("canvas");
    // this.propLCanvas = document.createElement("canvas");
    this.prev1LCanvas = document.createElement("canvas");
    // this.prev2LCanvas = document.createElement("canvas");
    // this.refContext = this.refCanvas.getContext("2d")!;
    // this.propContext = this.propCanvas.getContext("2d")!;
    // this.propLContext = this.propLCanvas.getContext("2d")!;
    this.prev1LContext = this.prev1LCanvas.getContext("2d")!;
    // this.prev2LContext = this.prev2LCanvas.getContext("2d")!;

    for (const ctx of [
      this.imgContext,
      this.annContext,
      this.dispLContext,
      // this.refContext,
      // this.propContext, 
      // this.propLContext,
      this.prev1LContext,
      // this.prev2LContext
    ]) {
      checkNull(ctx, "context");
      ctx.imageSmoothingEnabled = false;
      ctx.lineWidth = 2;
    }

    this.div.appendChild(this.dispLCanvas);
    // // reactivate this pls!
    // this.dispLCanvas.width = this.canvasWidth;
    // this.dispLCanvas.height = this.canvasHeight;
    // this.annCanvas.width = this.canvasWidth;
    // this.annCanvas.height = this.canvasHeight;



    // // act on user input from the preview Canvas
    // this.dispLCanvas.addEventListener('mouseup', this._mouseUp);
    this.dispLCanvas.addEventListener('mousedown', this._mouseDown);
    // this.dispLCanvas.addEventListener('mousemove', this._mouseMove);
    // this.dispLCanvas.addEventListener('wheel', this.zoomInOut);
    this.dispLCanvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    }
  
  private resetValues() {
    this.zoom = 1;
    this.dx = 0;
    this.dy = 0;
    this.alpha = 0.5;
    this.clicks = [];
    this.imgHeight = 0;
    this.imgWidth = 0;
  }

  reset() {
    this.resetValues();
    this.clearDataCanvases();
    this.redraw();
  }

  clear () {
    this.api.clear();
    this.resetValues();
    this.annContext.clearRect(0, 0, this.annCanvas.width, this.annCanvas.height);
    this.prev1LContext.clearRect(0, 0, this.prev1LCanvas.width, this.prev1LCanvas.height);
    this.redraw();
  }
  

    

  redraw(): void {
    // at some point should consider: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
    // to not always scale the image. But maybe not necessary, I still seem to get 60 fps
    // according to the firefox devtools performance thing
    this.dispLContext.clearRect(0, 0, this.dispLCanvas.width, this.dispLCanvas.height);
    this._drawInDisplayAlias(this.imgCanvas);
    this.dispLContext.globalAlpha = this.alpha;
    this._drawInDisplayAlias(this.annCanvas);
    this._drawInDisplayAlias(this.prev1LCanvas);
    // this._drawInDisplayAlias(this._canvases["ref"]);
    // this._drawInDisplayAlias(this._canvases["prop"]);
    this.dispLContext.globalAlpha = 1;
  }


  private clearDataCanvases() {
    this.imgContext.clearRect(0, 0, this.imgCanvas.width, this.imgCanvas.height);
    this.annContext.clearRect(0, 0, this.annCanvas.width, this.annCanvas.height);
    }

    private resizeDataCanvases(width: number, height: number) {
      this.imgCanvas.width = width;
      this.imgCanvas.height = height;
      this.annCanvas.width = width;
      this.annCanvas.height = height;
      // this._canvasesNames.forEach(name => {
      //   this._canvases[name].width = width;
      //   this._canvases[name].height = height;
      // });
      this.canvasWidth = width
      this.canvasHeight = height
      this.dispLCanvas.width = this.canvasWidth;
      this.dispLCanvas.height = this.canvasHeight;
      this.prev1LCanvas.width = this.canvasWidth;
      this.prev1LCanvas.height = this.canvasHeight;
      this.zoom = Math.min(this.canvasWidth / width, this.canvasHeight / height);
      this.dx = (this.canvasWidth - width * this.zoom) / 2;
      this.dy = (this.canvasHeight - height * this.zoom) / 2;
      // this.api.sendRegion(this.dx, this.dy, this.zoom)
    }


  private _drawInDisplayAlias(sourceCanvas: HTMLCanvasElement): void {
    this.dispLContext.drawImage(  // where the reshaping happens
      sourceCanvas,
      this.dx, 
      this.dy, 
      sourceCanvas.width * this.zoom, 
      sourceCanvas.height * this.zoom,
    );
  }

  
  public handleImage(img: HTMLImageElement) {
      this.imgContext.clearRect(0, 0, this.imgCanvas.width, this.imgCanvas.height);
      this.imgHeight = img.height;
      this.imgWidth = img.width;
      this.putImage(img)
      this.resetMaskCanvas()
      console.log('viewer clicks' + this.clicks)
   }

  resetMaskCanvas() {
    const maskCanvas = document.getElementById("maskCanvas") as HTMLCanvasElement;
    maskCanvas.width = Math.floor(this.imgWidth);
    maskCanvas.height = Math.floor(this.imgHeight);
    const ctx = maskCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  }


  private putImage(img: HTMLImageElement) {
      this.clearDataCanvases();
      this.resizeDataCanvases(img.width, img.height);
      this.imgContext.drawImage(img, 0, 0); 
      this.redraw()
    }



  //   private drawVerticalLine(x: number) {
  //       this.contexts["prev2L"].beginPath();
  //       this.contexts["prev2L"].moveTo(x, 0);
  //       this.contexts["prev2L"].lineTo(x, this.canvases["prev2L"].height);
  //       this.contexts["prev2L"].stroke();
  //   }

  //   private drawHorizontalLine(y: number) {
  //       this.contexts["prev2L"].beginPath();
  //       this.contexts["prev2L"].moveTo(0, y);
  //       this.contexts["prev2L"].lineTo(this.canvases["prev2L"].width, y);
  //       this.contexts["prev2L"].stroke();
  //   }

  changeTool(tool: string) {
    this.api.changeTool(tool);
  }



  // private _clear(): void {  // clears proposals and previews
  //   // clear all canvases (except img,ref,ann)
  //   this.contexts["prop"].clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  //   this.contexts["propL"].clearRect(0, 0, this.canvases["propL"].width, this.canvases["propL"].height);
  // }



  private drawClicks(): void {
    // draws the clicks on the preview canvas
    // for each click, draw a circle on the class canvas
    const posClickColor = 'rgb(0, 255, 0)';
    const negClickColor = 'rgb(255, 0, 0)';
    this.clicks.forEach((click: ClickType) => {
      this.prev1LContext.fillStyle = click[2] ? posClickColor : negClickColor;
      this.prev1LContext.fillRect(click[0] - 5, click[1] - 5, 10, 10);
    })
    this.redraw()
  }


  //////////////////////////////////////////////////////////////////////////////
  ////////////////////  INTERACTIONS   /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  imgRelCoords(e: MouseEvent): [number, number] {
    // in [0, 1]
    const mx = e.offsetX
    const my = e.offsetY
    const imgWidth = this.imgCanvas.width * this.zoom;
    const imgHeight = this.imgCanvas.height * this.zoom;
    const mrx = (mx - this.dx) / imgWidth;  // in the image
    const mry = (my - this.dy) / imgHeight;
    return [mrx, mry];
  }

  imgAbsCoords(e: MouseEvent): [number, number] {
    // in number of pixels
    const mx = e.offsetX
    const my = e.offsetY
    const cx = (mx - this.dx) / this.zoom;  // in the image
    const cy = (my - this.dy) / this.zoom;
    return [cx, cy];
  }

  //////////////////////////////////////////////////////////////////////////////
  ////////////////////  INTERACTIONS: wheel  ///////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////


// important! gotta be an arrow function so we can keep on
// using this to refer to the Drawing rather than
// the clicked element
// private zoomInOut = (event: WheelEvent ): void => {
//   event.preventDefault();
//   const mx = event.offsetX
//   const my = event.offsetY
//   let imgWidth = this.imgCanvas.width * this.zoom;
//   let imgHeight = this.imgCanvas.height * this.zoom;
//   const mrx = (mx - this.dx) / imgWidth;  // in the image
//   const mry = (my - this.dy) / imgHeight;

//   let newZoom = 0;
//   if (event.deltaY < 0) {
//     newZoom = this.zoom * 1.1;
//   } else {
//     newZoom = this.zoom / 1.1;
//   }
//   imgWidth = imgWidth / this.zoom * newZoom;
//   imgHeight = imgHeight / this.zoom * newZoom;
//   this.zoom = newZoom;

//   this.dx = -mrx * imgWidth + mx;
//   this.dy = -mry * imgHeight + my;

//   // console.log("dx: " + dx + " dy: " + dy);
//   // console.log("mrx: " + mrx + "mry: " + mry);
//   // dx = mx - mrx * zoom;
//   // dy = my - mry * zoom;

//   this.redraw()
//   // ctx.clearRect(0, 0, canvas.width, canvas.height);
//   // imgHeight 
//   // ctx.drawImage(img, dx, dy, img.width * zoom, img.height * zoom);
// }



  //////////////////////////////////////////////////////////////////////////////
  ////////////////////  INTERACTIONS: mouse Down  //////////////////////////////
  //////////////////////////////////////////////////////////////////////////////


  // private mouseDownPan(e: MouseEvent): void {
  //   e.preventDefault();
  //   this._panStartX = e.offsetX - this.dx
  //   this._panStartY = e.offsetY - this.dy
  //   this.panning = true;
  // }

  // private mouseMovePan(e: MouseEvent): void {
  //   this.dx = e.offsetX - this._panStartX
  //   this.dy = e.offsetY - this._panStartY 
  //   this.redraw();

  // }

  // private mouseUpPan(_e: MouseEvent): void {
  //   this.panning = false;
  //   // this.pushAnnToBackend();
  //   // this.pushImgLToBackend();
  // }


  private _mouseDown = (e: MouseEvent): void => {
    // if ((e.button === 1 || e.button === 2)) {  // middle click = pan
    //   this.mouseDownPan(e);  // pan with middle button or, if outside iis/spix mode, with right button too 
    //   // append click to clicks
    //   // this.clicks.push([e.offsetX, e.offsetY, false]);
    //   console.log("woohoo")
    // }
    const [cx, cy] = this.imgAbsCoords(e)
    const is_pos = e.button == 0
    const click : ClickType = [Math.floor(cx), Math.floor(cy), is_pos]
    this.clicks.push(click);
    this.api.sendClicks(this.clicks)
    console.log(this.clicks)
    console.log("you should have received the clicks")
    this.drawClicks()

    // else if ((e.button === 0) || ((e.button === 2) && (2 < this.model.tool))) {  // left click
    //   // this.tools[this.model.tool].mouseDown(e, this);
    
    // }

  }


  // private _mouseMove = (e: MouseEvent): void => {
  //   if (this.panning) 3
  //     this.mouseMovePan(e);
  //   }
  //   else {  // lasso implementation
  //     // this.tools[this.model.tool].mouseMove(e, this);
  //   }
  // };

  // private _mouseUp = (e: MouseEvent): void => {
  //   if (this.panning) {
  //     this.mouseUpPan(e);
  //   }
  //   else {
  //     // this.tools[this.model.tool].mouseUp(e, this)
  //   }
  // };


  // resetView(): void {
  //   // clear all canvases
  //   console.log('resetView...')
  //   this.previewLContext.clearRect(0, 0, this.previewLCanvas.width, this.previewLCanvas.height);
  //   this.displayLContext.clearRect(0, 0, this.displayLCanvas.width, this.displayLCanvas.height);
  //   // this.resize();
  //   this.redraw();
  // }

  // pushAnnToBackend() {  // both I and L, resets displayLContext
  //   this.displayLContext.clearRect(0, 0, this.displayLCanvas.width, this.displayLCanvas.height);
  //   this._drawInDisplayAlias(this.model.annICanvas)
  //   this.model.pushImageToBackend(this.displayLCanvas, this.displayLContext, 'annL');
  //   this.model.pushImageToBackend(this.model.annICanvas, this.model.annIContext, 'annI');
  //   this.redraw();
  // }


  // pushImgLToBackend() {  // resets displayLContext
  //   this.displayLContext.clearRect(0, 0, this.displayLCanvas.width, this.displayLCanvas.height);
  //   this._drawInDisplayAlias(this.model.imgICanvas)
  //   this.model.pushImageToBackend(this.displayLCanvas, this.displayLContext, 'imgL');
  //   this.redraw()
  // }

  // debouncedPushToBackend = debounce(() => {
  //   this.pushAnnToBackend();
  //   this.pushImgLToBackend();
  // }, 300)



  // _drawInAnnAlias(sourceCanvas: HTMLCanvasElement): void {
  //   this.model.annIContext.drawImage(  // put preview on class canvas
  //     sourceCanvas,
  //     0,
  //     0,
  //     sourceCanvas.width,
  //     sourceCanvas.height,
  //     this._Sx,
  //     this._Sy,
  //     this._sWidth,
  //     this._sHeight
  //   );
  // }


  // model: segmentModel;
  // displayLCanvas: HTMLCanvasElement;
  // previewLCanvas: HTMLCanvasElement;
  // displayLContext: CanvasRenderingContext2D;
  // previewLContext: CanvasRenderingContext2D;
  // private panning: boolean;
  // private userZoom = 1;
  // private intrinsicZoom = 1;
  // _Sx = 0;
  // _Sy = 0;
  // _sWidth = 0;
  // _sHeight = 0;
  // private _panStartX = 0;
  // private _panStartY = 0;
  // private displayWidth = 1000;
  // private displayHeight = 1000;

  // FUTURE
  // private refCanvas : HTMLCanvasElement;
  // private refContext : CanvasRenderingContext2D;
  // private propCanvas : HTMLCanvasElement;
  // private propContext : CanvasRenderingContext2D;
  // private propLCanvas : HTMLCanvasElement;
  // private propLContext : CanvasRenderingContext2D;

  // private prev2LCanvas : HTMLCanvasElement;
  // private prev2LContext : CanvasRenderingContext2D;

  // private _panStartX: number = 0;
  // private _panStartY: number = 0;
  // private panning: boolean = false;

}