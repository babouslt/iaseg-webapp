import numpy as np

def encode_mask(mask):
  assert mask.dtype == bool
  mask_shape = mask.shape
  fbin_mask = mask.flatten()
  packed = np.packbits(mask).tobytes()
  return fbin_mask, packed, mask_shape

def decode_mask(packed, shape):
  count = shape[0] * shape[1]
  mask = np.unpackbits(np.frombuffer(packed, dtype=np.uint8), count=count)
  mask = mask.reshape(shape).astype(bool)
  return mask
  
