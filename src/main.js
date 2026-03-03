/**
 * Holi AR Canvas 
 * Built by Shreyansh Srivastava (CODERUDRA-X)
 * Uses MediaPipe for real-time hand tracking and HTML5 Canvas for rendering.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize DOM Elements
    const videoElement = document.getElementById('input-video');
    const canvasElement = document.getElementById('ar-canvas');
    const canvasCtx = canvasElement.getContext('2d');

    // UI Buttons for Eraser and Clear All (Make sure these IDs exist in your HTML)
    const toggleEraserBtn = document.getElementById('toggle-eraser');
    const clearAllBtn = document.getElementById('clear-all');

    // 2. State Management
    const state = {
        paths: [],
        currentPath: [],
        colors: ['#FF00FF', '#00FFFF', '#FFFF00', '#00FF00', '#FF0000'],
        colorIndex: 0,
        isDrawing: false,
        isErasing: false // New state for tracking eraser mode
    };

    // Button Event Listeners
    if(toggleEraserBtn) {
        toggleEraserBtn.addEventListener('click', () => {
            state.isErasing = !state.isErasing;
            toggleEraserBtn.innerText = state.isErasing ? "Eraser Mode: ON" : "Eraser Mode: OFF";
            // Visual feedback for button
            toggleEraserBtn.style.borderColor = state.isErasing ? "#ffffff" : "#FF00FF";
        });
    }

    if(clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            state.paths = [];
            state.currentPath = [];
        });
    }

    // Responsive Canvas Resizing
    const resizeCanvas = () => {
        canvasElement.width = canvasElement.clientWidth;
        canvasElement.height = canvasElement.clientHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial call

    // 3. Render Loop (Called by MediaPipe on every frame)
    const onResults = (results) => {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        // Draw webcam feed
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

        // Render existing paths
        drawSavedPaths(state.paths);
        
        // Render current active path
        drawActivePath({ points: state.currentPath, isErasing: state.isErasing, color: state.colors[state.colorIndex] });

        // Hand Detection Logic
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0]; // Assuming single hand
            processHandGestures(landmarks);
        } else {
            // If hand disappears while drawing, save the stroke
            if (state.currentPath.length > 0) saveCurrentPath();
        }

        canvasCtx.restore();
    };

    // 4. Core Logic Functions
    const processHandGestures = (landmarks) => {
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        // Draw visual indicators for joints
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: 'rgba(255,255,255,0.2)', lineWidth: 1});

        // Calculate pinch distance
        const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
        const PINCH_THRESHOLD = 0.06;

        if (distance > PINCH_THRESHOLD) {
            // Fingers apart -> DRAW OR ERASE
            state.currentPath.push({
                x: indexTip.x * canvasElement.width,
                y: indexTip.y * canvasElement.height
            });
            state.isDrawing = true;
        } else if (state.isDrawing) {
            // Pinch detected -> STOP DRAWING/ERASING
            saveCurrentPath();
            
            // Only change color if we were drawing (not erasing)
            if (!state.isErasing) {
                cycleColor();
            }
        }
    };

    const saveCurrentPath = () => {
        if (state.currentPath.length > 0) {
            state.paths.push({ 
                points: [...state.currentPath], 
                color: state.colors[state.colorIndex],
                isErasing: state.isErasing // Save the mode with the path
            });
            state.currentPath = [];
            state.isDrawing = false;
        }
    };

    const cycleColor = () => {
        state.colorIndex = (state.colorIndex + 1) % state.colors.length;
    };

    // 5. Canvas Drawing Utilities
    const applyNeonStyles = (color) => {
        canvasCtx.strokeStyle = color;
        canvasCtx.lineWidth = 12;
        canvasCtx.lineCap = 'round';
        canvasCtx.lineJoin = 'round';
        canvasCtx.shadowBlur = 20;
        canvasCtx.shadowColor = color;
    };

    const drawActivePath = (pathObj) => {
        const path = pathObj.points;
        if (!path || path.length < 2) return;

        if (pathObj.isErasing) {
            // ERASER MODE
            canvasCtx.globalCompositeOperation = "destination-out";
            canvasCtx.strokeStyle = "rgba(0,0,0,1)"; 
            canvasCtx.lineWidth = 40; // Thicker eraser stroke
            canvasCtx.lineCap = 'round';
            canvasCtx.lineJoin = 'round';
            canvasCtx.shadowBlur = 0; // No glow
        } else {
            // NORMAL DRAWING MODE
            canvasCtx.globalCompositeOperation = "source-over";
            applyNeonStyles(pathObj.color);
        }

        canvasCtx.beginPath();
        canvasCtx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            canvasCtx.lineTo(path[i].x, path[i].y);
        }
        canvasCtx.stroke();
        
        // Reset composite operation so webcam feed doesn't get messed up
        canvasCtx.globalCompositeOperation = "source-over"; 
    };

    const drawSavedPaths = (pathsArray) => {
        pathsArray.forEach(p => drawActivePath(p));
    };

    // 6. MediaPipe Initialization
    const initMediaPipe = () => {
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1, 
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });

        hands.onResults(onResults);

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: 1280,
            height: 720
        });

        camera.start()
            .then(() => console.log("Camera started successfully."))
            .catch(err => console.error("Camera failed to start:", err));
    };

    initMediaPipe();
});