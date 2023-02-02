import numpy as np
from pathlib import Path
from PIL import Image


def default_read_img_fn(img_path):
  # reads image using PIL.Image.open into PIL.Image obj
  return Image.open(img_path)

class IASeg:
  def __init__(self, img_path, read_img_fn=default_read_img_fn):
    # get image and mask
    # binary mask is in the same image path but ends with _mask.pbm
    img_Path = Path(img_path)
    mask_path = img_Path.with_stem(img_Path.name + '_mask').with_suffix('.pbm')
    self.Img = read_img_fn(img_path)  # should read into numpy array
    H, W = self.Img.size
    if mask_path.exists():
      self.mask = Image.open(mask_path)
    else:
      self.mask = Image.fromarray(np.zeros((H, W), dtype=bool))
    # get tool
    self.tool = 0
    # init clicks
    self.clicks = []  # clicks are (x, y, is_pos) tuples

  def set_tool(self, tool):
    self.tool = tool

  def set_clicks(self, clicks):
    breakpoint()
    assert isinstance(clicks, list), "`clicks` should be a list"
    self.clicks = clicks
    print(clicks)

  def predict(self):
    # dummy prediction, just add some mask around the click position
    for x, y, is_pos in self.clicks:
      self.mask.putpixel((x, y), is_pos)
      self.mask.putpixel((x+1, y), is_pos)
      self.mask.putpixel((x-1, y), is_pos)
      self.mask.putpixel((x, y+1), is_pos)
      self.mask.putpixel((x, y-1), is_pos)
    return self.mask

    
