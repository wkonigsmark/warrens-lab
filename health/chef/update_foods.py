import json
import os

with open("foods.json", "r") as f:
    data = json.load(f)

# Add/Update Salt
if "salt" not in data:
    data["salt"] = {"id": "salt", "display_name": "Salt", "image": "salt.png", "nutrients": {}}
data["salt"]["category"] = "misc"

# Add/Update Pepper (Black Pepper)
if "black_pepper" not in data:
    data["black_pepper"] = {"id": "black_pepper", "display_name": "Black Pepper", "image": "pepper.png", "nutrients": {}}
data["black_pepper"]["category"] = "misc"

# Add/Update Sugar
if "sugar" not in data:
    data["sugar"] = {"id": "sugar", "display_name": "Sugar", "image": "sugar.png", "nutrients": {}}
data["sugar"]["category"] = "misc"

with open("foods.json", "w") as f:
    json.dump(data, f, indent=2)

print("Updated foods.json successfully.")
