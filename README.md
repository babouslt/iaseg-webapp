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
- integrate simpleclick into iaseg
- restart prediction when new clicks come
- open an image when requesting root (http)
- send clicks to backend
  - for simplicity we always send all the clicks, although a more efficient implementation would send only the last click
- send mask to frontend
- display mask
- implement reset when changing images
- run `npm run build` when running `docker-compose up`


- add vertical and horizontal lines in cursor
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


