# install
after cloning this repo:

- we need to manually download the cocolvis_vit_base.pth and set them at `backend/app/SimpleClick/weights/simpleclick_models/cocolvis_vit_base.pth`
from :
https://drive.google.com/drive/folders/1qpK0gtAPkVMF7VC42UA9XF4xMWr5KJmL?usp=sharing
for instance using the curl-wget extension

`wget --header="Host: doc-00-4k-docs.googleusercontent.com" --header="User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.0.0" --header="Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7" --header="Accept-Language: en,es-419;q=0.9,es;q=0.8,fr;q=0.7,pt-BR;q=0.6,pt;q=0.5" --header="Cookie: AUTH_8lgug8pkrnala31oohg39in1p6jmd4ek_nonce=c4qugirhj0qno" --header="Connection: keep-alive" "https://doc-00-4k-docs.googleusercontent.com/docs/securesc/2u29ja6t9asifmq6e1sq342j8uvn7p18/s20mvkqro8g6cq7kie5vnufp8tjhs67l/1677855600000/08472223717964117495/06501203322491305766/1dLAEFXhnk_Nebq3Net11sf6MjRCBEe0O?e=download&ax=AB85Z1D-Ib62kBdC-yFQIwKkU1P4DYkGKzUphTIxOh0-R2Nky9x094xjlsJQlFaw1kQC3bHF5eDdFnbc25S3ZUc8041pvL1ScexmmwAMCkYR5J9ithDAMtPdFBAgwO4gNetCIkWtBXxvHx4E1TBh7gDdhXidtjGSJDYloixTwlpgS4giYyU-pVsPCpfrFWYeyrEKR4REDKvNW6-Ha-UwmMSxwKAcVkdf2vg1uaZn0McdxnBrc-WpSr2SUvRrT5N2wug4dCtHfiT8nq8sJ6qfPSCrcj4xc5E5y5vSi9yUnLBJMR0qhWv8bVIQNPRyxH6Pv5BaJUYMvL-7UeAahr8vIGEgPYChTtG0EiG_J1DI785rswaBB76vJgBmYucxOXeeWzqhJq0j1vl07JtfA7LE8okZOzyWemxZPI2ytd92t64I25wGv-cPp59pV1JT6DyQHGBPThSdeDE4SwIjKIlAK9IY-zV7AG-NPxB5GOEo2lADGc1lT9nnlXFcfgIiVWO0HidZsdg59GDrHk03q7phO5YSMiOVzC4B9c5LRbAlSd7Ff6RAMnIzHB5BNE8gUnGJW3Uf2QDEks-7Co8zPCLINM1IC-QX21l8kkzdocZV81UGEJ8Z7mwb8hAk7vi9J17sPLAbKFfE2JBnyh4NE0ngNCY50K2HPC0JnJlpivVqwl4yVbLGqcvEVg311jAz6Z0FR_OCBJuo_Qz4KTsK8cFUPfIwscyUU6-2fbEEpzHBYPCj8E0emav87f4xP6FGO6DSX9t6lzlX6gDaxchjTIoh8onLdbZe1jzQ_IEhoxRoghQSPE1opSuAhUyv47fg1VUNukfH6Uq-tNJsjPYtICJFa6lwjs7Ak0tZiivOQnA85QrimzryzKtLphn66xC7wsNqJlI&uuid=2b198dc6-ecd0-4034-a410-0578728b4a3e&authuser=0&nonce=c4qugirhj0qno&user=06501203322491305766&hash=kdiuvc8eagtb9q670jiidh39uq7pn0cv" -c -O 'cocolvis_vit_base.pth'`

- then `cd frontend` and run `npm install` and `npm run build` (this is just to check that `frontend/dist` is up to date)

- cd back to the root folder and run `docker compose up`


# dev
you can try the frontend with `npm run dev` but in order to use compose you should run `npm run build` first. Basically we develop the frontend using vite and then vite creates the frontend app in the `frontend/dist` folder, which is then served by nginx (this might change in the future). 
Use `docker compose up` to run the app. The backend is served by uvicorn and the frontend by nginx. The frontend is served at `localhost:8082` and the backend at `localhost:8001`. 

# thoughts
img data = original size
mask data = original size
display = 244 * factor
sent mask = 224 * factor

operations:
  - put sent mask into mask data
  - extract mask from mask data
  - extract img from mask data

The background image is always the same, what changes is what part the user sees, which depends on the zoom-in factor and the padding. When we want to do a prediciton or an annotation we work on the visible part and only that visible part should be transmitted, and the resolution should be consistent, i.e. the front and back should assign the same pixel correspondence. 
To do this we fix the layout canvas size to be square and multiple of 224 (as input for neural networks). When the mask is edited we just print it on the big canvas using zero order (nearsert n) interpolation

we need the frontend viewer to communicate to the backend iaseg and for that the frontend viewer needs to access and open the websockets in itself or via a manager

# to-do
[x] fix pip versions
[x] try tool using frontend of docker compose
[x] git clone in docker image pointing to specific commit <- we just copied pasted the code, it's better (easier, more reliable)
[] upload image to dockerhub ?
[x] integrate simpleclick into iaseg
- restart prediction when new clicks come 
- open an image when requesting root (http)
- send clicks to backend
  - for simplicity we always send all the clicks, although a more efficient implementation would send only the last click
- send mask to frontend
- display mask
- implement reset when changing images
- run `npm run build` when running `docker-compose up`

- add vertical and horizontal lines in cursor
- add zoom in again
- set origins
- pixelate when zooming in
- think about the need of a "real mask" channel that allows to draw scribbles



# Data flow
front to back:
  http:
  - buttons (tool, sliders)
  - next / prev image
  - reset
  ws:
  - clicks
  - zoomed region
  - mask
    - eraser
    - brush
    - lasso
    - polygon

back to front:
  http:
  - image

  ws:
  - mask
  - aux image




to zoom in we need the x y displacement with respect to the center and the scale, with the mouse position given, we change the scale around the mouse, which is the same than putting the mouse position in the center, scaling around the new center and moving the new center back to its old position. The scaling is done irrespective of the position, so the only thing we need to figure out is how much translation do we need to do.

let dx, dy be the position of the top left corner of the image wrt the canvas. The mouse position is mx, my wrt the canvas and mrx, mry wrt the top left corner of the image. From there we have that mx = dx + mrx and my = dy + mry. Now we know that the new mrx2 = mrx * scale, and mx2 = mx, then we have mx2 = mx = dx2 + mrx2 = dx2 + mrx * scale. We can solve for dx2 and we get dx2 = mx - mrx * scale. We can do the same for dy2 and we get dy2 = my - mry * scale. Now we have the new position of the top left corner of the image wrt the canvas, and we can just set the new position of the image to that.

Desiredata
- Run without sudo
- fastapi
- plain ts
- remote development
- I need:
  - image file
  - mask file
  - reference file
  - extras 1 (lines, etc.)
  - extras 2 (other)
  - secondary image
  - win image file



## pseudocode 

index.html
  div id = viewer

main.ts
  set image in viewer

viewer.ts
  canvasFactor = 1  // side is 224 * factor
  handleImage

api.ts
  sync:
    - dx, dy, zoom
    - mask
    - aux (later)


