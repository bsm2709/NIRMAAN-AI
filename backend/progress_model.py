from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from ultralytics import YOLO
from PIL import Image
import numpy as np

# Load models
stage_model = load_model("progress_stage_model.h5")
yolo_model = YOLO("yolov8n.pt")

# Stage mapping
stage_to_percent = {0: 10, 1: 25, 2: 50, 3: 70, 4: 90, 5: 100}

def extract_building_roi(image_path):
    results = yolo_model(image_path)[0]
    for box in results.boxes:
        cls = int(box.cls[0])
        label = results.names[cls]
        if label.lower() in ["building", "house", "construction", "skyscraper"]:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            img = Image.open(image_path).convert("RGB")
            return img.crop((x1, y1, x2, y2))
    return Image.open(image_path).convert("RGB")

def predict_stage(img_path):
    roi = extract_building_roi(img_path)
    roi = roi.resize((224, 224))
    img_array = np.expand_dims(np.array(roi) / 255.0, axis=0)
    pred = stage_model.predict(img_array)
    stage = np.argmax(pred)
    return stage, pred[0][stage]
