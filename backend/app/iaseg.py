import importlib
from math import floor
import numpy as np
from pathlib import Path
from PIL import Image

# import sys
# simpleclick_path = 'app/SimpleClick'
# sys.path.append(simpleclick_path)
# clickseg_path = 'app/ClickSEG'
# sys.path.append(clickseg_path)
import app.SimpleClick.clean_inference as inference_sc
import app.ClickSEG.clean_inference  as inference_cs

"""Notes:
maskPath is always imgPath + _mask.png
"""

class IAsegState:
    def __init__(self):
        self.reset()

    def reset(self, imgNumber=None):
        # image and mask
        self.pilImg : Image = None
        self.pilMask : Image = None
        self.imgPath : Path = None
        self.maskPath : Path = None
        # algorithms
        self.tool : int = 0
        self.clicks = []  # clicks are (x, y, is_pos) tuples
        # display
        self.dx, self.dy, self.zoom = 0, 0, 1
        # filesystem
        self.imgNumber : int = imgNumber
        self.files = []

    def reset_keeping_img(self):
        # image and mask
        self.pilMask : Image = None
        # algorithms
        self.tool : int = 0
        self.clicks = []  # clicks are (x, y, is_pos) tuples
        # display
        self.dx, self.dy, self.zoom = 0, 0, 1
        # filesystem
        self.files = []


def find_files(path: str = "/vol/images", allowed_extensions : list[str] =['.jpg', '.jpeg', '.PNG', '.png']):
    # finds all files with allowed extensions in a dir recursively
    return sorted([str(file) for file in Path(path).glob('**/*') if file.is_file() and file.suffix in allowed_extensions])


def default_read_img_fn(img_path):
    # reads image using PIL.Image.open into PIL.Image obj
    return Image.open(img_path)


class IASeg:
    def __init__(self, logger, read_img_fn=default_read_img_fn):
        self.logger = logger
        self.read_img_fn = read_img_fn
        self.clear()
        self.state.files = find_files()  # this might change from run to run
        self.method = 'simpleclick'

    def clear(self):
        # initialize
        self.state = IAsegState()  # reset state
        if hasattr(self, "controller"):
            del self.controller  # delete controller to free memory

    def clear_keeping_img(self):
        # initialize
        self.state.reset_keeping_img()
        if hasattr(self, "controller"):
            del self.controller

    def reset(self, imgNumber=None):
        self.state.files = find_files()  # this might change from run to run
        # load image
        if imgNumber is not None:
            self.state.imgNumber = imgNumber 
            img_path = self.state.files[self.state.imgNumber]
            self.state.pilImg, self.state.pilMask, self.state.H, self.state.W = IASeg.load_image_and_mask(img_path)
        elif self.state.pilImg is not None:  # we had an image but we're resetting, then clear the mask
            W, H = self.state.pilImg.size
            self.state.pilMask = Image.fromarray(np.zeros((H, W), dtype=bool))
            img_path = None

        # IIS
        if self.method == 'simpleclick':
            importlib.reload(inference_sc)
            self.controller = inference_sc.load_controller(self.logger)
        elif self.method == 'focalclick':
            importlib.reload(inference_cs)
            self.controller = inference_cs.load_controller(self.logger)
        else:
            raise ValueError(f"Unknown method {self.method}")
        self.logger.info(f"device = {self.controller.device}")
        self.controller.set_image(np.array(self.state.pilImg))  # self.controller.predictor.original_image.shape == [1, 3, H, W]
        return img_path

    def change_tool(self, tool):
        self.method = tool.lower()

    @staticmethod
    def load_image_and_mask(img_path):
        imgPath = Path(img_path)

        pilImg = Image.open(img_path)
        pilImg = pilImg.convert("RGB")
        W, H = pilImg.size

        maskPath = imgPath.with_stem(imgPath.name + "_mask").with_suffix(".png")
        if maskPath and maskPath.exists():
            pilMask = Image.open(maskPath)
        else:
            pilMask = Image.fromarray(np.zeros((H, W), dtype=bool))
        return pilImg, pilMask, H, W

    def set_clicks_and_infer(self, clicks):
        assert len(clicks) == len(self.state.clicks) + 1, "add only one click at a time"
        self.state.clicks = clicks
        x, y, is_pos = clicks[-1]
        self.controller.add_click(x, y, is_pos)  # this call launches prediction
        self.state.pilMask = Image.fromarray(np.array(0 < self.controller.result_mask))  # the same as proposal

    # def crop_mask(self, mask):
    #     self.logger.info('sizes')
    #     self.logger.info(mask.size)
    #     mask_crop = mask.crop(
    #       (
    #         min(0, floor(-self.dy / self.zoom)),
    #         min(0, floor(-self.dx / self.zoom)),
    #         max(self.H, floor((self.H - self.dy) / self.zoom)),
    #         max(self.W, floor((self.W - self.dx) / self.zoom)),
    #       )
    #     )
    #     self.logger.info(mask_crop.size)
    #     return mask_crop

    # def dummy_predict(self):
    #     # dummy prediction, just add some mask around the click position
    #     mask = np.array(self.mask)
    #     for xa, ya, is_pos in self.clicks:
    #         x, y = ya, xa
    #         mask[x - 10 : x + 10, y - 10 : y + 10] = is_pos
    #     self.mask = Image.fromarray(mask)
    #     self.mask.save("/code/vol/mask.png")
    #     self.crop_mask(self.mask).save("/code/vol/mask_crop.png")
    #     return self.mask

