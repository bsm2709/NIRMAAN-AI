from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam

datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

train_data = datagen.flow_from_directory(
    '../data/stage_data/',
    target_size=(224, 224),
    batch_size=32,
    class_mode='sparse',
    subset='training'
)

val_data = datagen.flow_from_directory(
    '../data/stage_data/',
    target_size=(224, 224),
    batch_size=32,
    class_mode='sparse',
    subset='validation'
)

base = MobileNetV2(include_top=False, weights='imagenet', input_shape=(224, 224, 3))
x = GlobalAveragePooling2D()(base.output)
x = Dense(64, activation='relu')(x)
output = Dense(6, activation='softmax')(x)
model = Model(inputs=base.input, outputs=output)

model.compile(optimizer=Adam(1e-4), loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(train_data, validation_data=val_data, epochs=30)

model.save('progress_stage_model.h5')
print("✅ Model saved as progress_stage_model.h5")
