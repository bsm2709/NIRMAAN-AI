from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
import numpy as np
from utils import preprocess_image
from progress_model import predict_stage, stage_to_percent

app = Flask(__name__)
CORS(app)
model = load_model("backend/delay_model.h5")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        timeline = float(request.form["timeline_days"])
        budget = float(request.form["budget_utilized_percent"])
        file = request.files["image"]

        # Save and use the uploaded image
        filepath = "temp.jpg"
        file.save(filepath)

        # Predict stage and progress % from image
        stage, conf = predict_stage(filepath)
        progress = stage_to_percent[stage]

        # Prepare inputs for hybrid model
        img = preprocess_image(filepath).reshape(1, 224, 224, 3)
        tabular = np.array([[timeline, progress, budget]])

        pred = model.predict([img, tabular])[0][0]

        return jsonify({
            "predicted_stage": int(stage),
            "confidence": round(float(conf), 2),
            "estimated_progress_percent": progress,
            "delayed": int(pred > 0.5),
            "probability": round(float(pred), 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
