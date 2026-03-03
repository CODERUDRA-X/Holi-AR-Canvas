import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import os
import urllib.request

# Auto-download model
model_path = 'hand_landmarker.task'
if not os.path.exists(model_path):
    url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
    urllib.request.urlretrieve(url, model_path)

# Initialize Tasks API
base_options = python.BaseOptions(model_asset_path=model_path)
options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=1)
detector = vision.HandLandmarker.create_from_options(options)

cap = cv2.VideoCapture(0)
cap.set(3, 1280)
cap.set(4, 720)

# Create canvas
canvas = np.zeros((720, 1280, 3), np.uint8)
colors = [(255, 0, 255), (255, 255, 0), (0, 255, 255), (0, 255, 0), (0, 69, 255)]
color_idx = 0
draw_color = colors[color_idx]
px, py = 0, 0

while True:
    success, img = cap.read()
    if not success: break
    img = cv2.flip(img, 1)

    # Convert to MP Image
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_img)

    # Detect hand
    res = detector.detect(mp_image)

    # 1. Darken the background 
    dark_overlay = np.zeros_like(img)
    img = cv2.addWeighted(img, 0.3, dark_overlay, 0.7, 0) # 30% camera, 70% black

    if res.hand_landmarks:
        for hand_lms in res.hand_landmarks:
            h, w, c = img.shape
            
            # Wires & Joints
            for lm in hand_lms:
                cx, cy = int(lm.x * w), int(lm.y * h)
                cv2.circle(img, (cx, cy), 2, (255, 255, 255), -1)

            idx_tip = hand_lms[8]
            thumb_tip = hand_lms[4]

            x1, y1 = int(idx_tip.x * w), int(idx_tip.y * h)
            tx, ty = int(thumb_tip.x * w), int(thumb_tip.y * h)

            length = np.hypot(x1 - tx, y1 - ty)

            if length < 40:
                cv2.circle(img, (x1, y1), 12, draw_color, cv2.FILLED)
                cv2.circle(img, (x1, y1), 18, (255, 255, 255), 2)
                if px == 0 and py == 0: px, py = x1, y1

                # Draw smooth line
                thickness = 50 if draw_color == (0, 0, 0) else 15
                cv2.line(canvas, (px, py), (x1, y1), draw_color, thickness)
                px, py = x1, y1
            else:
                cv2.circle(img, (x1, y1), 10, draw_color, 2)
                px, py = 0, 0

    # 2. Khatarnak NEON GLOW Magic
    blur = cv2.GaussianBlur(canvas, (35, 35), 0)
    glow_canvas = cv2.add(blur, canvas)

    # 3. Combine Layers
    img_gray = cv2.cvtColor(glow_canvas, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(img_gray, 1, 255, cv2.THRESH_BINARY)
    mask_inv = cv2.bitwise_not(mask)

    img_bg = cv2.bitwise_and(img, img, mask=mask_inv)
    img_fg = cv2.bitwise_and(glow_canvas, glow_canvas, mask=mask)
    img = cv2.add(img_bg, img_fg)

    # 4. Pro Watermark
    cv2.putText(img, "CODERUDRA-X", (420, 680), cv2.FONT_HERSHEY_DUPLEX, 1.5, (100, 100, 100), 2)

    cv2.imshow("Holi AR - CODERUDRA-X Edition", img)

    # Controls
    key = cv2.waitKey(1) & 0xFF
    if key == 27: break
    elif key == ord('c'): canvas = np.zeros((720, 1280, 3), np.uint8)
    elif key == ord('n'):
        color_idx = (color_idx + 1) % len(colors)
        draw_color = colors[color_idx]
    elif key == ord('e'): draw_color = (0, 0, 0)

cap.release()
cv2.destroyAllWindows()