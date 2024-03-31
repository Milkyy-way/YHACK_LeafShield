from fastapi import FastAPI, File, UploadFile
from PIL import Image
from io import BytesIO
import tensorflow as tf
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Load the pre-trained model
MODEL = tf.keras.models.load_model("../training/tomato_model.keras")

# Define class names
CLASS_NAMES = ['Tomato_Bacterial_spot',
 'Tomato_Early_blight',
 'Tomato_Late_blight',
 'Tomato_Leaf_Mold',
 'Tomato_Septoria_leaf_spot',
 'Tomato_Spider_mites_Two_spotted_spider_mite',
 'Tomato__Target_Spot',
 'Tomato_Tomato_YellowLeaf_Curl_Virus',
 'Tomato__Tomato_mosaic_virus',
 'Tomato_healthy']

# Define route to check if the server is alive
@app.get("/ping")
async def ping():
    return "Hello, I am alive"

# Function to read the uploaded image as numpy array
def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

# Route to handle prediction requests
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read the uploaded image
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)
    
    # Make predictions
    predictions = MODEL.predict(img_batch)

    # Get predicted class and confidence
    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = float(np.max(predictions[0]))

    # Return prediction result
    return {
        'predicted_class': predicted_class,
        'confidence': confidence
    }

# Run the FastAPI server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host='localhost', port=8000)
