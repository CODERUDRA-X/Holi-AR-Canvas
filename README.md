## 🎨 Holi AR Canvas by CODERUDRA-X

An interactive, browser-based Augmented Reality experiment built to celebrate Holi.
This project utilizes computer vision to track hand movements in real-time, allowing users to draw neon "Gulal" in the air using just their webcam.

---

🚀 The Vision

I wanted to build a fun, engaging way to celebrate Holi digitally.
Instead of standard applications, I opted for an AR spatial experience using Vanilla JS and MediaPipe to keep it lightweight, zero-friction, and accessible directly via any modern web browser.

---

🕹️ Spatial Interaction Manual (How to Use)

To create a seamless AR experience, this system maps physical hand gestures combined with keyboard triggers to execute spatial commands.

🖌️ Trace & Draw

Hold "Shift" + Move your Index Finger

The AI locks onto Landmark 8 to trace your hand's path and render glowing neon strokes in 3D space.

---

🧽 Precision Spatial Eraser

Hold "Alt" + Swipe your hand

Engages the destination-out masking protocol, allowing you to erase mistakes without damaging the video background.

---

💦 Particle Color Splash

Press "S" + Make a Sprinkle Gesture

Triggers the mathematical physics engine to generate a randomized Gulal splash at your hand coordinates.

---

🎨 Cycle Palette

Press "C" + Pinch your fingers

Switches to the next vibrant neon color in the palette.

---

💥 Flush Canvas

Press "Spacebar" + Snap or Clap

Instantly wipes the multi-layered in-memory buffer, giving you a fresh canvas.

---

🧠 Technical Overview

Computer Vision

Uses MediaPipe Hands for robust, low-latency hand tracking and spatial coordinate calculation.

Gesture Recognition

Implements Euclidean distance mathematics between hand landmarks to detect gestures.

Dual-Layer Rendering

Uses HTML5 "<canvas>" API with an invisible in-memory buffer.

Key techniques:

- "globalCompositeOperation"
- "shadowBlur"
- "shadowColor"

This creates glowing neon strokes on top of a mirrored video feed.

Architecture

Structured with clean separation:

- HTML → View
- CSS → Styling
- JavaScript → Logic

This ensures modularity and maintainability.

---

🌟 Core Features (V1.1)

Destructive vs Non-Destructive Editing

A functional eraser implemented using HTML5 Canvas compositing ("destination-out").

Dynamic Sizing

The eraser stroke dynamically increases thickness for better user experience.

---

🛠️ Stack & Setup

- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- MediaPipe JS Solution API

---

⚙️ Running Locally

Since this application requires hardware-level webcam access, browsers require it to run on HTTPS or localhost.

1️⃣ Clone the repository

git clone https://github.com/CODERUDRA-X/Holi-AR-Canvas.git

2️⃣ Navigate to the project folder

cd Holi-AR-Canvas

3️⃣ Run a local server

If you have Python installed:

python -m http.server 8000

4️⃣ Launch the project

Open this in your browser:

http://localhost:8000

---

🔮 Future Scope

Performance Optimization

Experiment with WebGL / Three.js to support advanced 3D particle effects.

Advanced Gesture Control

Closed-fist gesture could act as a grab and move tool for drawn objects.

---

<div align="center">Built with 💜 by Shreyansh Srivastava (CODERUDRA-X)

</div>