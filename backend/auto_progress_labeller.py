import pandas as pd
import os
from progress_model import predict_stage, stage_to_percent

df = pd.read_csv("../data/metadata.csv")

updated_progress = []
for fname in df['image']:
    img_path = os.path.join("../data/images", fname)
    try:
        stage, _ = predict_stage(img_path)
        percent = stage_to_percent[stage]
    except Exception as e:
        print(f"⚠️ Error for {fname}: {e}")
        percent = 0  # fallback
    updated_progress.append(percent)

df['progress_percent'] = updated_progress
df.to_csv("../data/metadata_autolabeled.csv", index=False)
print("✅ Created: data/metadata_autolabeled.csv")
