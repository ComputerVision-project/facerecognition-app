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




def resize(img, scale_percent):
    width = int(img.shape[1] * scale_percent / 100)
    height = int(img.shape[0] * scale_percent / 100)
    dim = (width, height)
    return cv2.resize(img, dim, interpolation=cv2.INTER_AREA)


# Process an uploaded image
def process_image(file_path):
    try:
        # Read the image
        img = cv2.imread(file_path)
        if img is None:
            raise ValueError(f"Unable to read the image from the path: {file_path}")

        # Resize and convert image for processing
        # Adjust the scale percent according to your needs for balance between speed and accuracy
        scale_percent = 50  # percentage of original size
        img_small = resize(img, scale_percent)
        img_small = cv2.cvtColor(img_small, cv2.COLOR_BGR2RGB)

        # Detect faces using a faster but less accurate model for quick processing
        face_locations = face_recognition.face_locations(img_small, model="hog", number_of_times_to_upsample=2)

        # Check the current date
        current_date = datetime.now().strftime("%Y-%m-%d")

        # Load existing attendance data from CSV file
        existing_attendance_list = []
        try:
            with open('attendance.csv', 'r') as file:
                reader = csv.reader(file)
                existing_attendance_list = list(reader)
        except FileNotFoundError:
            pass

        # Check if the CSV file date is the same as the current date
        if existing_attendance_list and existing_attendance_list[-1][-1].split()[0] == current_date:
            print("Same day. Continuing with existing data.")
        else:
            print("New day. Resetting CSV file.")
            existing_attendance_list = []

        # Encode faces in the image
        encode_img = face_recognition.face_encodings(img_small, face_locations)

        # Create a new list to store the attendance data
        new_attendance_list = []

        # Keep track of the student IDs that have already been added to the attendance list
        added_student_ids = set()

        for encodeface, faceloc in zip(encode_img, face_locations):
            matches = face_recognition.compare_faces(encodelistknown, encodeface, tolerance=0.7)
            facedistance = face_recognition.face_distance(encodelistknown, encodeface)
            matchIndex = np.argmin(facedistance)

            if matches[matchIndex] and facedistance[matchIndex] < 0.7:
                student_id = studIds[matchIndex]
                student_info = db.reference(f'Students/{student_id}').get() or {}
                name = student_info.get('name', "Unknown")
                email = student_info.get('email', "Unknown")
            else:
                name = "Unknown"
                email = "Unknown"
                student_id = "Unknown"

            # Draw a rectangle around the face and write the name
            y1, x2, y2, x1 = faceloc
            y1, x2, y2, x1 = [int(coord * (100 / scale_percent)) for coord in (y1, x2, y2, x1)]  # Scale back up
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(img, name, (x1, y2 + 20), cv2.FONT_HERSHEY_COMPLEX, 1, (0, 255, 0), 2)

            if student_id not in added_student_ids:
                # Check if the person is not already in the existing attendance list
                if all(student_id != entry[0] for entry in existing_attendance_list):
                    new_attendance_list.append([student_id, name, email, datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
                    added_student_ids.add(student_id)

        # Append new attendance to existing data
        combined_attendance_list = existing_attendance_list + new_attendance_list

        # Write the combined attendance to CSV file
        with open('attendance.csv', 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerows(combined_attendance_list)

        # Encode the processed image to base64
        _, buffer = cv2.imencode('.jpg', img)
        img_encoded = base64.b64encode(buffer).decode('utf-8')

        return img_encoded, combined_attendance_list

    except Exception as e:
        print(f"An error occurred: {e}")


# def process_image(file_path):
#     try:
#         # Read the image
#         img = cv2.imread(file_path)
#         if img is None:
#             raise ValueError(f"Unable to read the image from the path: {file_path}")

#         # Resize and convert image for processing
#         scale_percent = 50  # percentage of original size
#         img_small = resize(img, scale_percent)
#         img_small = cv2.cvtColor(img_small, cv2.COLOR_BGR2RGB)

#         attendance_list = []

#         face_locations = face_recognition.face_locations(img_small, model="hog",number_of_times_to_upsample=2)
        
#         # If no faces are detected, there's no point in continuing
#         if not face_locations:
#             print("No faces detected in the image.")
#             return img, attendance_list


#         # Check the current date
#         current_date = datetime.now().strftime("%Y-%m-%d")
#         # Encode faces in the image
#         encode_img = face_recognition.face_encodings(img_small, face_locations)

#         new_attendance_list = []
#         added_student_ids = set()

#         for encodeface, faceloc in zip(encode_img, face_locations):
#             matches = face_recognition.compare_faces(encodelistknown, encodeface, tolerance=0.7)
#             facedistance = face_recognition.face_distance(encodelistknown, encodeface)
#             matchIndex = np.argmin(facedistance)

#             if matches[matchIndex] and facedistance[matchIndex] < 0.7:
#                 student_id = studIds[matchIndex]
#                 student_info = db.reference(f'Students/{student_id}').get() or {}
#                 name = student_info.get('name', "Unknown")
#                 email = student_info.get('email', "Unknown")
#             else:
#                 name = "Unknown"
#                 email = "Unknown"
#                 student_id = "Unknown"

#             # Draw a rectangle around the face and write the name
#             y1, x2, y2, x1 = faceloc
#             y1, x2, y2, x1 = [int(coord * (100 / scale_percent)) for coord in (y1, x2, y2, x1)]  # Scale back up
#             cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
#             cv2.putText(img, name, (x1, y2 + 20), cv2.FONT_HERSHEY_COMPLEX, 1, (0, 255, 0), 2)

#             if student_id not in added_student_ids:
#                 new_attendance_list.append([student_id, name, email, datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
#                 added_student_ids.add(student_id)

#         # Write attendance to CSV file
#         with open('attendance.csv', 'w', newline='') as file:
#             writer = csv.writer(file)
#             for entry in new_attendance_list:
#                 writer.writerow(entry)

#         # Encode the processed image to base64
#         _, buffer = cv2.imencode('.jpg', img)
#         img_encoded = base64.b64encode(buffer).decode('utf-8')

#         return img_encoded, attendance_list

#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return None, None




