from ultralytics import YOLO

# This line will automatically download yolov8n.pt if it's missing
model = YOLO("yolov8n.pt")

print("✅ YOLOv8n model loaded successfully.")
