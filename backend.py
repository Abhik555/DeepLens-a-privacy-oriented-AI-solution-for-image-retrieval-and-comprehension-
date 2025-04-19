import os
import io
import base64

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from huggingface_hub import hf_hub_download

# --- Configuration: set local directory and file names ---
MODEL_DIR = "models"
MODEL_FILENAME = "ggml-model-Q4_K_M.gguf"      # gguf model file
CLIP_FILENAME = "mmproj-model-f16.gguf"      # associated clip/mmproj file

# Create the model directory if it doesn't exist.
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

# Construct full paths.
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_FILENAME)
CLIP_PATH = os.path.join(MODEL_DIR, CLIP_FILENAME)

# Download the model file if it doesn't exist.
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = hf_hub_download(
        repo_id="openbmb/MiniCPM-V-2_6-gguf",
        filename=MODEL_FILENAME,
        local_dir=MODEL_DIR
    )
    print(f"Downloaded model to: {MODEL_PATH}")

# Download the clip/mmproj file if it doesn't exist.
if not os.path.exists(CLIP_PATH):
    CLIP_PATH = hf_hub_download(
        repo_id="openbmb/MiniCPM-V-2_6-gguf",
        filename=CLIP_FILENAME,
        local_dir=MODEL_DIR
    )
    print(f"Downloaded mmproj file to: {CLIP_PATH}")

# --- Import the Llama class and chat handler for MiniCPM-V 2.6 ---
from llama_cpp import Llama
from llama_cpp.llama_chat_format import MiniCPMv26ChatHandler

# Initialize the chat handler with the clip file.
chat_handler = MiniCPMv26ChatHandler(clip_model_path=CLIP_PATH)
# Load the model once on startup.
llm = Llama(model_path=MODEL_PATH, chat_handler=chat_handler, n_ctx=2048 , n_gpu_layers=30)

# --- Create FastAPI app ---
app = FastAPI(title="MiniCPM-V-2.6 Image Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# --- Define the expected JSON request model ---
class ImageRequest(BaseModel):
    # Expect the image as a base64-encoded string (with or without a data URI prefix)
    image: str
@app.post("/example")
async def get_example_response():
    # Return a predefined example JSON response
    return {
        "text": """{
  "description": "A man is sitting and eating a sandwich with peanut butter. He is wearing glasses, a light blue shirt, and a red wristwatch. There is a bottle on the table in front of him.",
  "objects": [
    {
      "name": "Man",
      "description": "A young male with glasses, wearing a light blue shirt and dark pants, eating a sandwich.",
      "attributes": "Wearing a red wristwatch, holding a sandwich with peanut butter, sitting on a black chair, and has a bottle on the table in front of him."
    },
    {
      "name": "Sandwich",
      "description": "A sandwich with peanut butter being eaten by the man.",
      "attributes": "Held in the man's right hand, partially eaten."
    },
    {
      "name": "Bottle",
      "description": "A bottle, likely a beverage, on the table in front of the man.",
      "attributes": "Standing upright, partially visible, and placed on the table."
    },
    {
      "name": "Chair",
      "description": "A black chair where the man is sitting.",
      "attributes": "The man is seated on it, and it is positioned in front of a table."
    },
    {
      "name": "Wall",
      "description": "The wall in the background of the image.",
      "attributes": "The wall has a poster or notice pinned to it, and there is a door on the right side."
    }
  ]
}"""
    }

# --- API endpoint to analyze an image ---
@app.post("/analyze")
async def analyze_image(request: ImageRequest):
    try:
        # If the string already has a data URI prefix, use it; otherwise, add one for PNG.
        if request.image.startswith("data:image"):
            data_uri = request.image
        else:
            data_uri = "data:image/jpeg;base64," + request.image

        # Validate the image by decoding it.
        header, encoded = data_uri.split(",", 1)
        image_data = base64.b64decode(encoded)
        # Attempt to open the image using Pillow.
        _ = Image.open(io.BytesIO(image_data))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

    # Build a predefined chat prompt: a system message and a user message with the image and fixed text.
    messages = [
        {
            "role": "system",
            "content": "You are an assistant that provides detailed descriptions of images and all objects inside it in json format."
        },
        {
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": data_uri}},
                {"type": "text", "text": "Analyze this image in detail and provide a comprehensive caption in JSON format. Include:\n1. A complete description of the overall scene\n2. All identifiable objects in the image\n\nReturn your response strictly in this JSON format:\n{\n  \"description\": \"Provide a thorough description of the entire image, capturing the main elements, setting, activities, and overall context\",\n  \"objects\": [\n    {\n      \"name\": \"Specific name of object 1\",\n      \"description\": \"Brief explanation of what this object is doing or its role in the image\",\n      \"attributes\": \"Color, size, condition, position, and other distinctive features of the object\"\n    },\n    {\n      \"name\": \"Specific name of object 2\",\n      \"description\": \"Brief explanation of what this object is doing or its role in the image\",\n      \"attributes\": \"Color, size, condition, position, and other distinctive features of the object\"\n    }\n    // Include all visible objects\n  ]\n}\n\nImportant requirements:\n- Be factual and accurate in your descriptions\n- Identify ALL visible objects in the image\n- Use precise, descriptive language\n- Maintain the exact JSON structure provided\n- Ensure proper JSON formatting with no trailing commas\n- Do not include any explanatory text outside the JSON structure"}
            ]
        }
    ]

    try:
        # Generate a chat completion using the model.
        response = llm.create_chat_completion(messages=messages)
        output_text = response['choices'][0]['message']['content'] #response["choices"][0]["text"].strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference error: {str(e)}")

    # Return the output as JSON.
    return {"text": output_text}

# --- Run the server directly if this script is executed as main ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend:app", host="0.0.0.0", port=8000, reload=True)