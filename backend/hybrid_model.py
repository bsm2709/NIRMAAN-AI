from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Conv2D, MaxPooling2D, Flatten, concatenate
from tensorflow.keras.optimizers import Adam

def build_model():
    img_input = Input(shape=(224, 224, 3), name="image_input")
    x = Conv2D(32, (3, 3), activation='relu')(img_input)
    x = MaxPooling2D(pool_size=(2, 2))(x)
    x = Conv2D(64, (3, 3), activation='relu')(x)
    x = MaxPooling2D(pool_size=(2, 2))(x)
    x = Flatten()(x)

    tab_input = Input(shape=(3,), name="tabular_input")
    y = Dense(32, activation='relu')(tab_input)

    combined = concatenate([x, y])
    z = Dense(64, activation='relu')(combined)
    z = Dense(1, activation='sigmoid')(z)

    model = Model(inputs=[img_input, tab_input], outputs=z)
    model.compile(optimizer=Adam(0.001), loss='binary_crossentropy', metrics=['accuracy'])
    return model;