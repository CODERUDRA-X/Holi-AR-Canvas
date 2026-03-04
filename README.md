# 🎨 Holi AR Canvas by CODERUDRA-X

An interactive, browser-based Augmented Reality experiment built to celebrate Holi. This project utilizes computer vision to track hand movements in real-time, allowing users to draw neon "Gulal" (colors) in the air using just their webcam.

## 🚀 The Vision
I wanted to build a fun, engaging way to celebrate Holi digitally. Instead of standard apps, I opted for an AR experience using Vanilla JS and MediaPipe to keep it lightweight and accessible directly via a web browser.

## 🧠 Technical Overview
* **Computer Vision:** Employs [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html) for robust, low-latency hand tracking (specifically targeting landmark `8` - Index Tip, and `4` - Thumb Tip).
* **Gesture Recognition:** Implements a custom Euclidean distance calculation between the thumb and index finger to detect a "pinch" gesture.
  * **Open Hand:** Triggers the drawing state.
  * **Pinch:** Stops drawing and automatically cycles to the next neon color in the palette.
* **Rendering:** Uses the HTML5 `<canvas>` API with custom shadow/glow properties (`shadowBlur`, `shadowColor`) to simulate vibrant neon strokes over a mirrored video feed.
* **Architecture:** Structured with a clean separation of concerns (HTML view, CSS styling, and JS logic separated) for maintainability.

## 🛠️ Stack & Setup
* **HTML5 / CSS3**
* **Vanilla JavaScript (ES6)**
* **MediaPipe JS Solution API**

### Running Locally
Because this app requests webcam access, modern browsers require it to be run on a secure origin (HTTPS) or localhost.

1. Clone this repository:
   ```bash
   git clone [https://github.com/your-username/Holi-AR-Canvas.git](https://github.com/CODERUDRA-X/Holi-AR-Canvas.git)


Navigate to the directory:

Bash
cd Holi-AR-Canvas/public
Run a local server. If you have Python installed, you can use:

Bash
python -m http.server 8000
Open http://localhost:8000 in your browser.

🔮 Future Scope
Eraser Functionality: Mapping a different gesture (like a closed fist) to clear the canvas or erase specific strokes.

## 🌟 New Features (V1.1)
* **Precision Eraser Mode:** Added a functional eraser using HTML5 Canvas `globalCompositeOperation ("destination-out")`, allowing users to correct strokes without clearing the entire board. The eraser stroke is computationally thicker for better UX.

Performance Tuning: Experimenting with WebGL or Three.js for handling the rendering loop to support more complex particle effects instead of simple strokes.

Built with 💜 by CODERUDRA-X