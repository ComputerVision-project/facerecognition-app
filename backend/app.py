import os
from flask import Flask, request, jsonify, send_file
import main 
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        # Save the file temporarily
        file_path = "temp_image.jpg"
        file.save(file_path)

        # Process the image
        try:
            img_encoded, _ = main.process_image(file_path)
            os.remove(file_path)  # Remove the saved image file
            return jsonify({"success": "Image processed", "image": img_encoded}), 200
        except Exception as e:
            os.remove(file_path)  # Ensure temporary file is deleted in case of error
            return jsonify({"error": str(e)}), 500
        
@app.route('/download_csv', methods=['GET'])
def download_csv():
    try:
        return send_file('attendance.csv', as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)