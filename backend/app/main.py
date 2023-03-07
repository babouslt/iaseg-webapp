import logging
import numpy as np
logger = logging.getLogger("uvicorn")

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.iaseg import IASeg
from app.serialization import encode_mask, decode_mask


# define global variables
app = FastAPI()
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


iaseg = IASeg(logger=logger)
connected_websockets = {}

# http endpoints
# # frontend
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")
app.mount("/assets", StaticFiles(directory="frontend/assets"), name="assets")

@app.get("/", response_class=HTMLResponse)
async def root():  # serve frontend
    return open("frontend/index.html").read()

# # load image
@app.get("/img/{imgNumber}")
async def get_img(imgNumber: int=None, timestamp: int = None):
    if timestamp is not None:
        logger.info("reset")
        iaseg.clear()
        img_path = iaseg.reset(imgNumber)
        logger.info("clicks = " + str(iaseg.state.clicks))
        return FileResponse(img_path)

@app.get("/files")
async def get_files():
    logger.info("get files")
    # return the list of image paths
    return iaseg.state.files


# websocket endpoints
@app.websocket("/ws/clicks")
async def receive_clicks(websocket: WebSocket):
    await websocket.accept()
    connected_websockets['clicks'] = websocket
    try:
        while True:
            clicks = await websocket.receive_json()
            logger.info(f"clicks = {clicks}")
            iaseg.set_clicks_and_infer(clicks)
            await mask_to_frontend(iaseg.state.pilMask)
    except WebSocketDisconnect:
        del connected_websockets["clicks"]
        await websocket.close()


@app.websocket("/ws/region")
async def handle_mask(websocket: WebSocket):
    await websocket.accept()
    connected_websockets["region"] = websocket
    try:
        while True:
            region = await websocket.receive_json()
            logger.info(f"region = {region}")
    except WebSocketDisconnect:
        del connected_websockets["region"]
        await websocket.close()



@app.websocket("/ws/mask")
async def handle_mask(websocket: WebSocket):
    await websocket.accept()
    connected_websockets["mask"] = websocket
    try:
        while True:
            packed = await websocket.receive_bytes()
            logger.info("received mask from frontend")
            mask = decode_mask(packed, iaseg.mask.shape)
            iaseg.set_mask(mask)
    except WebSocketDisconnect:
        del connected_websockets["mask"]
        await websocket.close()


async def mask_to_frontend(mask):
    logger.info("mask_to_frontend")
    logger.info(connected_websockets)
    if "mask" in connected_websockets:
        # mask = iaseg.crop_mask(mask)
        mask_array = np.array(mask).astype(bool)
        fbin_mask, packed, shape = encode_mask(mask_array)
        await connected_websockets["mask"].send_bytes(packed)
        logger.info("sent mask to frontend")





