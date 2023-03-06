from math import floor
import numpy as np
from pathlib import Path
from PIL import Image

import sys
# simpleclick_path = '/code/app/external/SimpleClick'
simpleclick_path = 'app/SimpleClick'
sys.path.append(simpleclick_path)
from clean_inference import load_controller


def default_read_img_fn(img_path):
    # reads image using PIL.Image.open into PIL.Image obj
    return Image.open(img_path)


class IASeg:
    def __init__(self, img_path, logger, read_img_fn=default_read_img_fn):
        self.logger = logger
        # get image and mask
        # binary mask is in the same image path but ends with _mask.pbm
        img_Path = Path(img_path)
        mask_path = img_Path.with_stem(img_Path.name + "_mask").with_suffix(".pbm")
        self.set_PIL_Image_and_reset(read_img_fn(img_path))
        if mask_path and mask_path.exists():
            self.mask = Image.open(mask_path)

    def set_PIL_Image_and_reset(self, Img):
        self._set_PIL_Image(Img)
        self._reset()

    
    def _reset(self):
        assert hasattr(self, 'Img'), "call set_PIL_Image first"
        # get tool
        self.tool = 0
        # init clicks
        self.clicks = []  # clicks are (x, y, is_pos) tuples
        self.dx, self.dy, self.zoom = 0, 0, 1

        # IIS
        self.controller = load_controller()
        self.controller.set_image(np.array(self.Img))  # self.controller.predictor.original_image.shape == [1, 3, H, W]


    def _set_PIL_Image(self, Img):
        self.Img = Img
        self.H, self.W = self.Img.size
        self.mask_path = None
        self.mask = Image.fromarray(np.zeros((self.W, self.H), dtype=bool))
        

    def set_clicks(self, clicks):
        assert len(clicks) == len(self.clicks) + 1, "add only one click at a time"
        self.clicks = clicks
        x, y, is_pos = clicks[-1]
        self.controller.add_click(x, y, is_pos)  # this call launches prediction
        self.mask = Image.fromarray(np.array(0 < self.controller.result_mask))

    def crop_mask(self, mask):
        self.logger.info('sizes')
        self.logger.info(mask.size)
        mask_crop = mask.crop(
          (
            min(0, floor(-self.dy / self.zoom)),
            min(0, floor(-self.dx / self.zoom)),
            max(self.H, floor((self.H - self.dy) / self.zoom)),
            max(self.W, floor((self.W - self.dx) / self.zoom)),
          )
        )
        self.logger.info(mask_crop.size)
        return mask_crop

    def dummy_predict(self):
        # dummy prediction, just add some mask around the click position
        mask = np.array(self.mask)
        for xa, ya, is_pos in self.clicks:
            x, y = ya, xa
            mask[x - 10 : x + 10, y - 10 : y + 10] = is_pos
        self.mask = Image.fromarray(mask)
        self.mask.save("/code/vol/mask.png")
        self.crop_mask(self.mask).save("/code/vol/mask_crop.png")
        return self.mask

