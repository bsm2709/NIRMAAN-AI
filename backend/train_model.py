import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from hybrid_model import build_model
from utils import preprocess_image
import os

# Load CSV
df = pd.read_csv("../data/metadata_autolabeled.csv")


X_tabular = df[['timeline_days', 'progress_percent', 'budget_utilized_percent']].values
y = df['delayed'].values
X_images = np.array([
    preprocess_image(os.path.join("../data/images", fname)) for fname in df['image']
])

X_img_train, X_img_test, X_tab_train, X_tab_test, y_train, y_test = train_test_split(
    X_images, X_tabular, y, test_size=0.2, random_state=42
)

model = build_model()
model.fit([X_img_train, X_tab_train], y_train, epochs=10, batch_size=4, validation_split=0.2)
model.save("backend/delay_model.h5")
print("✅ Model saved to backend/delay_model.h5")
