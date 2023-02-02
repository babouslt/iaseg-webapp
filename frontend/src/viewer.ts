import { checkNull } from "./utils";
// import { ClickType, API } from "./api";

export class Viewer {
  // private api: API;
  private div: HTMLElement;

  private imgCanvas : HTMLCanvasElement;
  private imgContext : CanvasRenderingContext2D;
  // private refCanvas : HTMLCanvasElement;
  // private refContext : CanvasRenderingContext2D;
  // private annCanvas : HTMLCanvasElement;
  // private annContext : CanvasRenderingContext2D;
  // private propCanvas : HTMLCanvasElement;
  // private propContext : CanvasRenderingContext2D;
  // private propLCanvas : HTMLCanvasElement;
  // private propLContext : CanvasRenderingContext2D;
  private dispLCanvas : HTMLCanvasElement;
  private dispLContext : CanvasRenderingContext2D;
  // private prev1LCanvas : HTMLCanvasElement;
  // private prev1LContext : CanvasRenderingContext2D;
  // private prev2LCanvas : HTMLCanvasElement;
  // private prev2LContext : CanvasRenderingContext2D;


  private canvasWidth: number;
  private canvasHeight: number;
  private zoom: number = 1;
  private dx: number = 0;
  private dy: number = 0;
  // private alpha: number = 0.5;
  private _panStartX: number = 0;
  private _panStartY: number = 0;
  private panning: boolean = false;

  // private clicks: ClickType[] = [];

  constructor(divId: string, size: number) {
    // this.api = new API()
    console.log("consturct")
    this.div = document.getElementById(divId)!;
    checkNull(this.div, "div");


    this.imgCanvas = document.createElement("canvas");
    // this.refCanvas = document.createElement("canvas");
    // this.annCanvas = document.createElement("canvas");
    // this.propCanvas = document.createElement("canvas");
    // this.propLCanvas = document.createElement("canvas");
    this.dispLCanvas = document.createElement("canvas");
    // this.prev1LCanvas = document.createElement("canvas");
    // this.prev2LCanvas = document.createElement("canvas");

    this.imgContext = this.imgCanvas.getContext("2d")!;
    // this.refContext = this.refCanvas.getContext("2d")!;
    // this.annContext = this.annCanvas.getContext("2d")!;
    // this.propContext = this.propCanvas.getContext("2d")!;
    // this.propLContext = this.propLCanvas.getContext("2d")!;
    this.dispLContext = this.dispLCanvas.getContext("2d")!;
    // this.prev1LContext = this.prev1LCanvas.getContext("2d")!;
    // this.prev2LContext = this.prev2LCanvas.getContext("2d")!;

    for (const ctx of [
      this.imgContext,
      // this.refContext,
      // this.annContext,
      // this.propContext, 
      // this.propLContext,
      this.dispLContext,
      // this.prev1LContext,
      // this.prev2LContext
    ]) {
      checkNull(ctx, "context");
      ctx.imageSmoothingEnabled = false;
      ctx.lineWidth = 2;
    }

    this.canvasWidth = size;
    this.canvasHeight = size;
  

    this.div.appendChild(this.dispLCanvas);
    this.dispLCanvas.width = this.canvasWidth;
    this.dispLCanvas.height = this.canvasHeight;


    // // act on user input from the preview Canvas
    this.dispLCanvas.addEventListener('mouseup', this._mouseUp);
    this.dispLCanvas.addEventListener('mousedown', this._mouseDown);
    this.dispLCanvas.addEventListener('mousemove', this._mouseMove);
    this.dispLCanvas.addEventListener('wheel', this.zoomInOut);
    this.dispLCanvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    }

    public putImage(img: HTMLImageElement) {
      this.clearDataCanvases();
      this.resizeDataCanvases(img.width, img.height);
      this.imgContext.drawImage(img, 0, 0); 
      this.redraw()
    }

  redraw(): void {
    // at some point should consider: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
    // to not always scale the image. But maybe not necessary, I still seem to get 60 fps
    // according to the firefox devtools performance thing
    this.dispLContext.clearRect(0, 0, this.dispLCanvas.width, this.dispLCanvas.height);
    this._drawInDisplayAlias(this.imgCanvas);
    // this.dispLContext.globalAlpha = this.alpha;
    // this._drawInDisplayAlias(this._canvases["ann"]);
    // this._drawInDisplayAlias(this._canvases["ref"]);
    // this._drawInDisplayAlias(this._canvases["prop"]);
    // this.dispLContext.globalAlpha = 1;
  }


  private clearDataCanvases() {
    this.imgContext.clearRect(0, 0, this.imgCanvas.width, this.imgCanvas.height);
      // this._canvasesNames.forEach(name => {
      //   this._contexts[name].clearRect(0, 0, this._canvases[name].width, this._canvases[name].height);
      // })
    }

    private resizeDataCanvases(width: number, height: number) {
      this.imgCanvas.width = width;
      this.imgCanvas.height = height;
      // this._canvasesNames.forEach(name => {
      //   this._canvases[name].width = width;
      //   this._canvases[name].height = height;
      // });
      this.zoom = Math.min(this.canvasWidth / width, this.canvasHeight / height);
      this.dx = (this.canvasWidth - width * this.zoom) / 2;
      this.dy = (this.canvasHeight - height * this.zoom) / 2;
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
      console.log('hhandle image')
      this.imgContext.clearRect(0, 0, this.imgCanvas.width, this.imgCanvas.height);
      this.putImage(img)
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



  // private _clear(): void {  // clears proposals and previews
  //   // clear all canvases (except img,ref,ann)
  //   this.contexts["prop"].clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  //   this.contexts["propL"].clearRect(0, 0, this.canvases["propL"].width, this.canvases["propL"].height);
  // }



  // private _drawClicks(): void {
  //   // draws the clicks on the preview canvas
  //   // for each click, draw a circle on the class canvas
  //   let clickColor = 'rgb(0, 255, 0)';
  //   this.pcs.forEach((pc: number[]) => {
  //     this.previewLContext.fillStyle = clickColor;
  //     this.previewLContext.fillRect(pc[0] - 5, pc[1] - 5, 10, 10);
  //   })
  //   clickColor = 'rgb(255, 0, 0)';
  //   this.ncs.forEach((nc: number[]) => {
  //     this.previewLContext.fillStyle = clickColor;
  //     this.previewLContext.fillRect(nc[0] - 5, nc[1] - 5, 10, 10);
  //   })
  // }


  //////////////////////////////////////////////////////////////////////////////
  ////////////////////  INTERACTIONS   /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  imgCoords(e: MouseEvent): [number, number] {
    const mx = e.offsetX
    const my = e.offsetY
    const imgWidth = this.imgCanvas.width * this.zoom;
    const imgHeight = this.imgCanvas.height * this.zoom;
    const mrx = (mx - this.dx) / imgWidth;  // in the image
    const mry = (my - this.dy) / imgHeight;
    return [mrx, mry];
  }

  //////////////////////////////////////////////////////////////////////////////
  ////////////////////  INTERACTIONS: wheel  ///////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////


// important! gotta be an arrow function so we can keep on
// using this to refer to the Drawing rather than
// the clicked element
private zoomInOut = (event: WheelEvent ): void => {
  event.preventDefault();
  const mx = event.offsetX
  const my = event.offsetY
  let imgWidth = this.imgCanvas.width * this.zoom;
  let imgHeight = this.imgCanvas.height * this.zoom;
  const mrx = (mx - this.dx) / imgWidth;  // in the image
  const mry = (my - this.dy) / imgHeight;

  let newZoom = 0;
  if (event.deltaY < 0) {
    newZoom = this.zoom * 1.1;
  } else {
    newZoom = this.zoom / 1.1;
  }
  imgWidth = imgWidth / this.zoom * newZoom;
  imgHeight = imgHeight / this.zoom * newZoom;
  this.zoom = newZoom;

  this.dx = -mrx * imgWidth + mx;
  this.dy = -mry * imgHeight + my;

  // console.log("dx: " + dx + " dy: " + dy);
  // console.log("mrx: " + mrx + "mry: " + mry);
  // dx = mx - mrx * zoom;
  // dy = my - mry * zoom;

  this.redraw()
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  // imgHeight 
  // ctx.drawImage(img, dx, dy, img.width * zoom, img.height * zoom);
}



  //////////////////////////////////////////////////////////////////////////////
  ////////////////////  INTERACTIONS: mouse Down  //////////////////////////////
  //////////////////////////////////////////////////////////////////////////////


  private mouseDownPan(e: MouseEvent): void {
    e.preventDefault();
    this._panStartX = e.offsetX - this.dx
    this._panStartY = e.offsetY - this.dy
    this.panning = true;
  }

  private mouseMovePan(e: MouseEvent): void {
    this.dx = e.offsetX - this._panStartX
    this.dy = e.offsetY - this._panStartY 
    this.redraw();

  }

  private mouseUpPan(_e: MouseEvent): void {
    this.panning = false;
    // this.pushAnnToBackend();
    // this.pushImgLToBackend();
  }


  private _mouseDown = (e: MouseEvent): void => {
    if ((e.button === 1 || e.button === 2)) {  // middle click = pan
      this.mouseDownPan(e);  // pan with middle button or, if outside iis/spix mode, with right button too 
      // append click to clicks
      // this.clicks.push([e.offsetX, e.offsetY, false]);
      console.log("woohoo")
    }
    else if (e.button == 0) {
      // this.clicks.push([e.offsetX, e.offsetY, true]);
    }
    // this.api.sendClicks(this.clicks)
    // console.log("you should have received the clicks")

    // else if ((e.button === 0) || ((e.button === 2) && (2 < this.model.tool))) {  // left click
    //   // this.tools[this.model.tool].mouseDown(e, this);
    
    // }

  }


  private _mouseMove = (e: MouseEvent): void => {
    if (this.panning) {
      this.mouseMovePan(e);
    }
    else {  // lasso implementation
      // this.tools[this.model.tool].mouseMove(e, this);
    }
  };

  private _mouseUp = (e: MouseEvent): void => {
    if (this.panning) {
      this.mouseUpPan(e);
    }
    else {
      // this.tools[this.model.tool].mouseUp(e, this)
    }
  };


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
}