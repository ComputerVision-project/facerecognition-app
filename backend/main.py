import base64
import cv2
import pickle
import numpy as np
import face_recognition
import firebase_admin
from firebase_admin import credentials, db
import csv
from datetime import datetime

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': "https://facerecognition-159b3-default-rtdb.firebaseio.com/"
    })

# Load the encoding file that has encodings and student IDs
with open('Encodingfile.p', 'rb') as file:
    encodelistknown, studIds = pickle.load(file)

# Function to resize an image
def resize_image(img, target_size):
    return cv2.resize(img, target_size)

# Process an uploaded image
def process_image(file_path):
    # Load the encoding file
    with open('Encodingfile.p', 'rb') as file:
        encodelistknown, studIds = pickle.load(file)

    # Read the image
    img = cv2.imread(file_path)
    img_small = cv2.resize(img, (0, 0), fx=0.25, fy=0.25)
    img_small = cv2.cvtColor(img_small, cv2.COLOR_BGR2RGB)

    attendance_list = []

    # Detect faces and encode them
    face_locations = face_recognition.face_locations(img_small)
    encode_img = face_recognition.face_encodings(img_small, face_locations)

    for encodeface, faceloc in zip(encode_img, face_locations):
        matches = face_recognition.compare_faces(encodelistknown, encodeface)
        facedistance = face_recognition.face_distance(encodelistknown, encodeface)
        matchIndex = np.argmin(facedistance)

        if matches[matchIndex]:
            student_id = studIds[matchIndex]
            student_info = db.reference(f'Students/{student_id}').get()

            # Draw a rectangle around the face and write the name
            y1, x2, y2, x1 = faceloc
            y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(img, student_info['name'], (x1, y2 + 20), cv2.FONT_HERSHEY_COMPLEX, 1, (0, 255, 0), 2)

            # Add student info to the attendance list
            attendance_list.append([student_id, student_info['name'], student_info['email'], datetime.now().strftime("%Y-%m-%d %H:%M:%S")])

    # Write attendance to CSV file
    with open('attendance.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["ID", "Name", "Email", "Date"])
        writer.writerows(attendance_list)
    
    # After processing the image (drawing rectangles and names)
    _, buffer = cv2.imencode('.jpg', img)
    img_encoded = base64.b64encode(buffer).decode('utf-8')

    return img_encoded
