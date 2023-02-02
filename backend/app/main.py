from fastapi import FastAPI, WebSocket
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.iaseg import IASeg

app = FastAPI()
iaseg = IASeg('app/images/chile.jpg')

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return FileResponse("app/images/chile.jpg")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")

@app.websocket("/ws/clicks")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            clicks = await websocket.receive_json()
            iaseg.set_clicks(clicks)
    except Exception as e:
        print(e)
    finally:
        websocket.close()



