document.addEventListener("DOMContentLoaded", () => {
    const vid = document.getElementById('vid');
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    
    // In-memory canvas for drawing paths properly
    const drawCanvas = document.createElement('canvas');
    const drawCtx = drawCanvas.getContext('2d');
    
    let paths = [];
    let currentPath = null;
    let shiftPressed = false;
    let altPressed = false;
    let wantsSplash = false; // New Splash Trigger
    let isDrawing = false;
    let smoothX = null, smoothY = null;
    
    const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#00FF00', '#FF4500'];
    let colorIndex = 0;

    window.onkeydown = (e) => {
      if (e.key === 'Shift') shiftPressed = true;
      if (e.key === 'Alt') { e.preventDefault(); altPressed = true; } 
      if (e.code === 'Space') paths = []; 
      if (e.key.toLowerCase() === 'c') colorIndex = (colorIndex + 1) % colors.length; 
      // Trigger Splash on 'S' key
      if (e.key.toLowerCase() === 's' && !e.repeat) wantsSplash = true; 
    };
    window.onkeyup = (e) => {
      if (e.key === 'Shift') shiftPressed = false;
      if (e.key === 'Alt') altPressed = false;
    };

    function onResults(res) {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      drawCanvas.width = window.innerWidth;
      drawCanvas.height = window.innerHeight;
      
      // Draw Video & Dark Background
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(res.image, 0, 0, c.width, c.height);
      ctx.fillStyle = 'rgba(10, 6, 2, 0.80)'; 
      ctx.fillRect(0, 0, c.width, c.height);

      // Perform drawing logic on temp canvas
      drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height); 
      paths.forEach(p => {
        // --- NEW SPLASH LOGIC ---
        if (p.type === 'splash') {
          drawCtx.globalCompositeOperation = 'source-over';
          drawCtx.shadowColor = p.color;
          drawCtx.shadowBlur = 15;
          drawCtx.fillStyle = p.color;
          
          p.drops.forEach(d => {
            drawCtx.beginPath();
            drawCtx.arc(p.cx + d.ox, p.cy + d.oy, d.r, 0, Math.PI * 2);
            drawCtx.fill();
          });
          return;
        }

        // --- NORMAL LINE DRAWING ---
        if(p.points.length < 2) return;
        
        if (p.erasing) {
          drawCtx.globalCompositeOperation = 'destination-out';
          drawCtx.strokeStyle = 'rgba(0,0,0,1)'; 
          drawCtx.lineWidth = 40; 
          drawCtx.shadowBlur = 0;
        } else {
          drawCtx.globalCompositeOperation = 'source-over';
          drawCtx.shadowColor = p.color;
          drawCtx.shadowBlur = 20;
          drawCtx.strokeStyle = p.color;
          drawCtx.lineWidth = 8;
        }
        
        drawCtx.lineCap = 'round';
        drawCtx.lineJoin = 'round';
        drawCtx.beginPath();
        drawCtx.moveTo(p.points[0].x, p.points[0].y);
        for(let i=1; i<p.points.length; i++) drawCtx.lineTo(p.points[i].x, p.points[i].y);
        drawCtx.stroke();
      });

      // Composite drawing onto main canvas
      ctx.drawImage(drawCanvas, 0, 0);

      // Draw Cursor, Wires & Logic
      if (res.multiHandLandmarks && res.multiHandLandmarks.length > 0) {
        const lm = res.multiHandLandmarks[0];
        drawConnectors(ctx, lm, HAND_CONNECTIONS, {color: 'rgba(255, 255, 255, 0.3)', lineWidth: 2});
        drawLandmarks(ctx, lm, {color: '#FFFFFF', lineWidth: 1, radius: 2});

        const ind = lm[8]; 
        const tX = ind.x * c.width, tY = ind.y * c.height;

        if (smoothX === null) { smoothX = tX; smoothY = tY; } 
        else { smoothX += (tX - smoothX) * 0.45; smoothY += (tY - smoothY) * 0.45; }

        ctx.beginPath();
        ctx.arc(smoothX, smoothY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = altPressed ? '#555' : (shiftPressed ? '#FFF' : colors[colorIndex]);
        ctx.shadowBlur = shiftPressed && !altPressed ? 20 : 0;
        ctx.shadowColor = colors[colorIndex];
        ctx.fill();
        if (altPressed) { ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2; ctx.stroke(); } 

        // Add Splash to paths
        if (wantsSplash) {
          let drops = [];
          drops.push({ ox: 0, oy: 0, r: Math.random() * 12 + 10 }); // Center blob
          for(let i=0; i<20; i++) { // Splatters
            let angle = Math.random() * Math.PI * 2;
            let radius = Math.random() * 60 + 15;
            drops.push({ ox: Math.cos(angle)*radius, oy: Math.sin(angle)*radius, r: Math.random() * 5 + 2 });
          }
          paths.push({ type: 'splash', cx: smoothX, cy: smoothY, color: colors[colorIndex], drops: drops });
          wantsSplash = false;
        }

        // Add Lines to paths
        let active = shiftPressed || altPressed;
        if (active) {
          if (!isDrawing || currentPath.erasing !== altPressed) {
            isDrawing = true;
            currentPath = { type: 'line', points: [], color: colors[colorIndex], erasing: altPressed };
            paths.push(currentPath);
          }
          currentPath.points.push({x: smoothX, y: smoothY});
        } else isDrawing = false;
      } else { 
        isDrawing = false; 
        smoothX = null; 
        wantsSplash = false; 
      }
    }

    const h = new Hands({locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
    h.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    h.onResults(onResults);

    const cam = new Camera(vid, { onFrame: async () => { await h.send({image: vid}); }, width: 1280, height: 720 });
    cam.start();
});