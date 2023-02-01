# dev
you can try the frontend with `npm run dev` but in order to use compose you should run `npm run build` first. Basically we develop the frontend using vite and then vite creates the frontend app in the `frontend/dist` folder, which is then served by nginx (this might change in the future). 
Use `docker compose up` to run the app. The backend is served by uvicorn and the frontend by nginx. The frontend is served at `localhost:8082` and the backend at `localhost:8001`. 

# to-do
- send clicks to backend
- send mask to frontend
- display mask
- implement reset when changing images
- run `npm run build` when running `docker-compose up`


- pixelate when zooming in

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


