import importlib
from math import floor
import numpy as np
from pathlib import Path
from PIL import Image


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
        """Initialize state but keeping pilImg, imgPath, maskPath, imgNumber as is"""
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
        self.state = IAsegState()  # reset state, same than state.reset()
        self.state.files = find_files()  # this might change from run to run
        self.method = 'focalclick'
        self.state.imgPath = None

    def state_reset_controller_del(self):
        """Reinitialize state"""
        # initialize
        self.state.reset()  # reset state
        if hasattr(self, "controller"):
            del self.controller  # delete controller to free memory

    def state_reset_keeping_img_controller_del(self):
        """Reinitialize state keeping the current image and paths"""
        # initialize
        self.state.reset_keeping_img()
        if hasattr(self, "controller"):
            del self.controller

    def clear_mask(self):
        """Clear mask"""
        W, H = self.state.pilImg.size
        self.state.pilMask = Image.fromarray(np.zeros((H, W), dtype=bool))

    def files_update_image_load(self, imgNumber):
        assert type(imgNumber) == int, "imgNumber must be an integer"
        updated_files = find_files()  # this might change from run to run
        # load image
        if (imgNumber != self.state.imgNumber or updated_files != self.state.files):
            self.state.files = updated_files
            self.state.imgNumber = imgNumber 
            self.state.imgPath = Path(self.state.files[self.state.imgNumber])
            self.state.pilImg, self.state.pilMask, self.state.H, self.state.W = IASeg.load_image_and_mask(self.state.imgPath)
        else:  # we already have the image
            if self.state.files != updated_files:
                self.logger.warning("filelist changed, image index shifted")
                self.state.files = updated_files
            self.state.imgPath = self.state.files[self.state.imgNumber] 

    def reload_method(self):
        if self.method == 'focalclick':
            # importlib.reload(inference_cs)  # to use when there are more IIS methods (e.g. simpleclick)
            self.controller = inference_cs.load_controller(self.logger)
            self.logger.info(f"device = {self.controller.device}")
            self.controller.set_image(np.array(self.state.pilImg))  # self.controller.predictor.original_image.shape == [1, 3, H, W]
        elif self.method == "dummy":
            self.logger.info("Using dummy method")
        else:
            raise ValueError(f"Unknown method {self.method}")

    
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

    def focalclick_set_clicks_and_infer(self, clicks):
        assert len(clicks) == len(self.state.clicks) + 1, "add only one click at a time"
        self.state.clicks = clicks
        x, y, is_pos = clicks[-1]
        self.controller.add_click(x, y, is_pos)  # this call launches prediction
        self.state.pilMask = Image.fromarray(np.array(0 < self.controller.result_mask))  # the same as proposal

    # ## API ##
    def api_get_img(self, imgNumber):
        """Should reset, load the image at imgNumber and return the path to it"""
        self.state_reset_controller_del()
        self.files_update_image_load(imgNumber)
        return str(self.state.imgPath)

    def api_clear(self):
        """Should clear the mask and clicks. Reset states preserving the image"""
        # could be made more efficient by clearing the controllers instead of reloading
        self.state_reset_keeping_img_controller_del()
        self.reload_method()  # reloads the controller if needed
        return 'cleared'
    
    def api_get_files(self):
        self.files_update_image_load(self.state.imgNumber)
        return self.state.files

    def api_set_tool(self, tool):
        self.method = tool.lower()
        self.reload_method()
        return 'tool set'
        
    def api_receive_clicks(self, clicks):
        if self.method == 'focalclick':
            if not hasattr(self, "controller"):
                self.reload_method()
            self.focalclick_set_clicks_and_infer(clicks)
        else:
            pass
        return self.state.pilMask
    
    