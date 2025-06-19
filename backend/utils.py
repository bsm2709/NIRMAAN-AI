from PIL import Image
import numpy as np
from io import BytesIO

def preprocess_image(path_or_bytes):
    if isinstance(path_or_bytes, bytes):
        img = Image.open(BytesIO(path_or_bytes)).convert("RGB")
    else:
        img = Image.open(path_or_bytes).convert("RGB")
    img = img.resize((224, 224))
    return np.array(img) / 255.0