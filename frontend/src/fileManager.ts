import { IPaddress, port } from "./main";

export class FileManager {
  img : HTMLImageElement;
  imgNumber: number = 0;
  private newImgNumber: number = 0;
  private imgNumberDiv: HTMLDivElement;
  private files: string[] = [];
  private filesDiv: HTMLDivElement;
  private prevButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;

  constructor(img : HTMLImageElement) {
    this.img = img;
    this.imgNumberDiv = document.getElementById("imgNumber") as HTMLDivElement;
    this.filesDiv = document.getElementById("fileList") as HTMLDivElement;
    this.prevButton = document.getElementById("prev") as HTMLButtonElement;
    this.nextButton = document.getElementById("next") as HTMLButtonElement;
    fetch(`http://${IPaddress}:${port}/files`).then(
      (response) => {
        return response.json()
      }
    ).then(
      (resJson) => {
        this.files = resJson;
        this.filesDiv.innerHTML = resJson;
      }
    ).then(() => {
      this.imgNumberDiv.innerHTML = `index ${this.imgNumber}: ${this.files[this.imgNumber]}`;
    })
    // wait for the last promise to finish before exiting constructor
      
    // add event listeners to buttons
    this.prevButton.addEventListener("click", () => this.prev());
    this.nextButton.addEventListener("click", () => this.next());
    this.img.addEventListener("load", () => {
      // if success
      this.imgNumber = this.newImgNumber;
      this.imgNumberDiv.innerHTML = `index ${this.imgNumber}: ${this.files[this.imgNumber]}`;
    })
    this.triggerUpdateImage(this.imgNumber);
  }



  private prev() {
    console.log('prev')
    if (this.imgNumber > 0) {
      this.triggerUpdateImage(this.imgNumber - 1);
    }
  }

  private next() {
    console.log('next')
    if (this.imgNumber < this.files.length - 1) {
      this.triggerUpdateImage(this.imgNumber + 1);
    }
  }

  private triggerUpdateImage(newImgNumber: number) {
    this.newImgNumber = newImgNumber;
    this.setImgSrc(this.img, newImgNumber);

  }

  setImgSrc(img: HTMLImageElement, imgNumber: number) {
    const timestamp = new Date().getTime();  // hack to always reload
    img.src = `http://${IPaddress}:${port}/img/${imgNumber}?timestamp=${timestamp}`;
  }
}
  


  // // show file list
  // // get fileList div
  // const fileListDiv = document.getElementById("fileList") as HTMLDivElement;
  // // get file list from backend
  // fetch(`http://${IPaddress}:${port}/filenames`).then(
  //   (response) => {
  //     return response.text()
  //   }
  // ).then(
  //   (text) => {
  //     fileListDiv.innerHTML = text;
  //     console.log(text)
  //   }
  // )