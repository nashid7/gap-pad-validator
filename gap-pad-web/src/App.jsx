import React, { useRef, useState, useEffect } from "react";
import PRODUCT_LIBRARY from "./productLibrary.js";

// Use the external product library
const PRODUCT_TEMPLATES = PRODUCT_LIBRARY;

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionCanvasRef = useRef(null);
  const [serial, setSerial] = useState("");
  const [side, setSide] = useState("back");
  const [validationMode, setValidationMode] = useState(false);
  const [referenceImages, setReferenceImages] = useState({});
  const [captureMode, setCaptureMode] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [message, setMessage] = useState("");
  const [validationStatus, setValidationStatus] = useState(null);
  const validationIntervalRef = useRef(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [detectedPads, setDetectedPads] = useState([]);
  const [showDetectionOverlay, setShowDetectionOverlay] = useState(false);
  
  // New state for enhanced features
  const [selectedProduct, setSelectedProduct] = useState("3U");
  const [selectedVariant, setSelectedVariant] = useState("3U-Basic");
  const [showTemplateOverlay, setShowTemplateOverlay] = useState(true);
  const [manualTeachingMode, setManualTeachingMode] = useState(false);
  const [manualPadPositions, setManualPadPositions] = useState([]);
  const [cameraCalibration, setCameraCalibration] = useState({
    pixelsPerMm: 10, // Default calibration
    offsetX: 0,
    offsetY: 0
  });
  const [showCalibration, setShowCalibration] = useState(false);

  useEffect(() => {
    // Load saved reference images from localStorage on component mount
    const savedImages = localStorage.getItem('gapPadReferenceImages');
    if (savedImages) {
      try {
        const parsed = JSON.parse(savedImages);
        setReferenceImages(parsed);
      } catch (e) {
        console.error("Failed to parse saved images", e);
        setMessage("Error loading saved images");
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }, 
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera error", err);
        setMessage("Camera access error. Please check permissions.");
      }
    })();

    // Cleanup function for validation interval
    return () => {
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
      }
    };
  }, []);

  // Advanced gap pad detection based on your Python script approach
  const detectGapPads = async (imageData) => {
    return new Promise(async (resolve) => {
      try {
        console.log("Trying advanced HSV detection...");
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        const img = new Image();
        img.onload = async () => {
          console.log(`Starting detection on image: ${img.width}x${img.height}`);
          
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          tempCtx.drawImage(img, 0, 0);
          
          const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imgData.data;
          
          console.log('Converting to HSV...');
          // Convert to HSV for better color detection (similar to Python OpenCV)
          const hsvData = rgbToHsv(data, tempCanvas.width, tempCanvas.height);
          
          console.log('Creating color mask...');
          // Create mask for pink/magenta colors
          const mask = createColorMask(hsvData, tempCanvas.width, tempCanvas.height);
          
          // Count mask pixels for debugging
          let maskPixelCount = 0;
          for (let i = 0; i < mask.length; i++) {
            if (mask[i] === 255) maskPixelCount++;
          }
          console.log(`Color mask contains ${maskPixelCount} pink/magenta pixels (${((maskPixelCount/(tempCanvas.width*tempCanvas.height))*100).toFixed(2)}% of image)`);
          
          // If HSV detection found very few pixels, try simple RGB detection
          if (maskPixelCount < 100) {
            console.log("HSV detection found too few pixels, trying simple RGB detection...");
            const simplePads = await detectGapPadsSimple(imageData);
            if (simplePads.length > 0) {
              console.log(`Simple detection succeeded with ${simplePads.length} pads`);
              resolve(simplePads);
              return;
            }
          }
          
          console.log('Finding contours...');
          // Find contours (connected components)
          const contours = findContours(mask, tempCanvas.width, tempCanvas.height);
          
          console.log('Filtering gap pads...');
          // Filter contours by size and aspect ratio (similar to your Python script)
          const validPads = filterGapPadsAdvanced(contours, tempCanvas.width, tempCanvas.height);
          
          // Draw detection results
          drawDetectionResults(tempCtx, validPads, tempCanvas.width, tempCanvas.height);
          
          console.log(`? Detection complete: Found ${validPads.length} gap pads`);
          resolve(validPads);
        };
        
        img.onerror = async (error) => {
          console.error('HSV detection image loading error:', error);
          console.log('Trying simple RGB detection as fallback...');
          const simplePads = await detectGapPadsSimple(imageData);
          resolve(simplePads);
        };
        
        img.src = imageData;
        
      } catch (error) {
        console.error('Advanced detection failed:', error);
        console.log('Trying simple RGB detection as fallback...');
        try {
          const simplePads = await detectGapPadsSimple(imageData);
          resolve(simplePads);
        } catch (fallbackError) {
          console.error('Fallback detection also failed:', fallbackError);
          resolve([]);
        }
      }
    });
  };

  // Convert RGB to HSV (similar to OpenCV cvtColor)
  const rgbToHsv = (data, width, height) => {
    const hsvData = new Uint8Array(width * height * 3);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      
      let h = 0;
      let s = 0;
      const v = max;
      
      if (delta !== 0) {
        s = delta / max;
        
        if (max === r) {
          h = ((g - b) / delta) % 6;
        } else if (max === g) {
          h = (b - r) / delta + 2;
        } else {
          h = (r - g) / delta + 4;
        }
        h *= 60;
        if (h < 0) h += 360;
      }
      
      const pixelIndex = (i / 4) * 3;
      hsvData[pixelIndex] = h;           // H: 0-360
      hsvData[pixelIndex + 1] = s * 100; // S: 0-100
      hsvData[pixelIndex + 2] = v * 100; // V: 0-100
    }
    
    return hsvData;
  };

  // Create mask for gap pad colors only (magenta, cyan, silver) - Board-aware detection
  const createColorMask = (hsvData, width, height) => {
    const mask = new Uint8Array(width * height);
    
    // Gap pad specific HSV ranges (based on your image examples)
    // Range 1: Magenta gap pads (300-330�) - Most common thermal pads
    const lowerMagenta = [300, 45, 50];
    const upperMagenta = [330, 100, 95];
    
    // Range 2: Cyan gap pads (180-200�) - Less common but used
    const lowerCyan = [180, 45, 50];
    const upperCyan = [200, 100, 95];
    
    // Range 3: Silver/metallic gap pads (low saturation, high value)
    const lowerSilver = [0, 0, 75];    // Any hue, very low saturation, high brightness
    const upperSilver = [360, 15, 95]; // Any hue, very low saturation, high brightness
    
    let detectedPixels = 0;
    let excludedPixels = 0;
    
    for (let i = 0; i < hsvData.length; i += 3) {
      const h = hsvData[i];
      const s = hsvData[i + 1];
      const v = hsvData[i + 2];
      
      // EXCLUDE board colors first (negative detection)
      const isBluePCB = (h >= 200 && h <= 250 && s >= 60 && v >= 30); // Blue PCB
      const isYellowPCB = (h >= 45 && h <= 65 && s >= 70 && v >= 60); // Yellow PCB edges
      const isBlackComponent = (v <= 25); // Black components (very dark)
      const isGrayComponent = (s <= 20 && v >= 25 && v <= 70); // Gray components
      const isGoldenConnector = (h >= 35 && h <= 55 && s >= 40 && s <= 80 && v >= 50); // Golden connectors
      const isWhiteComponent = (s <= 25 && v >= 80); // White/cream components
      
      // If it's a board color, exclude it
      if (isBluePCB || isYellowPCB || isBlackComponent || isGrayComponent || isGoldenConnector || isWhiteComponent) {
        mask[i / 3] = 0;
        excludedPixels++;
        continue;
      }
      
      // INCLUDE only gap pad colors (positive detection)
      const isMagentaPad = (h >= lowerMagenta[0] && h <= upperMagenta[0] && 
                           s >= lowerMagenta[1] && s <= upperMagenta[1] && 
                           v >= lowerMagenta[2] && v <= upperMagenta[2]);
      
      const isCyanPad = (h >= lowerCyan[0] && h <= upperCyan[0] && 
                        s >= lowerCyan[1] && s <= upperCyan[1] && 
                        v >= lowerCyan[2] && v <= upperCyan[2]);
      
      const isSilverPad = (s >= lowerSilver[1] && s <= upperSilver[1] && 
                          v >= lowerSilver[2] && v <= upperSilver[2]);
      
      if (isMagentaPad || isCyanPad || isSilverPad) {
        mask[i / 3] = 255;
        detectedPixels++;
      } else {
        mask[i / 3] = 0;
      }
    }
    
    console.log(`?? Board-aware detection: ${detectedPixels} gap pad pixels, ${excludedPixels} board pixels excluded (${((detectedPixels/(width*height))*100).toFixed(4)}%)`);
    
    // Apply more aggressive morphological cleanup for board environments
    return morphologicalCleanupBoard(mask, width, height);
  };

  // Enhanced morphological cleanup for board environments
  const morphologicalCleanupBoard = (mask, width, height) => {
    // More aggressive opening to remove PCB trace noise
    let result = erode(mask, width, height, 2); // Stronger erosion
    result = dilate(result, width, height, 2);  // Restore size
    
    // Closing to fill gaps within gap pads
    result = dilate(result, width, height, 1);
    result = erode(result, width, height, 1);
    
    // Final noise removal - remove very small isolated pixels
    result = removeSmallNoise(result, width, height, 25); // Remove clusters smaller than 25 pixels
    
    return result;
  };

  // Remove small noise clusters
  const removeSmallNoise = (mask, width, height, minSize) => {
    const result = new Uint8Array(mask);
    const visited = new Set();
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        
        if (mask[index] === 255 && !visited.has(index)) {
          const cluster = [];
          const queue = [{x, y}];
          
          while (queue.length > 0) {
            const {x: cx, y: cy} = queue.shift();
            const cIndex = cy * width + cx;
            
            if (visited.has(cIndex) || cx < 0 || cy < 0 || cx >= width || cy >= height || mask[cIndex] !== 255) {
              continue;
            }
            
            visited.add(cIndex);
            cluster.push(cIndex);
            
            // Add 4-connected neighbors
            queue.push({x: cx + 1, y: cy});
            queue.push({x: cx - 1, y: cy});
            queue.push({x: cx, y: cy + 1});
            queue.push({x: cx, y: cy - 1});
          }
          
          // If cluster is too small, remove it
          if (cluster.length < minSize) {
            cluster.forEach(idx => result[idx] = 0);
          }
        }
      }
    }
    
    return result;
  };

  // Morphological erosion
  const erode = (mask, width, height, iterations) => {
    let result = new Uint8Array(mask);
    
    for (let iter = 0; iter < iterations; iter++) {
      const temp = new Uint8Array(width * height);
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          
          // Check 3x3 neighborhood
          let allWhite = true;
          for (let dy = -1; dy <= 1 && allWhite; dy++) {
            for (let dx = -1; dx <= 1 && allWhite; dx++) {
              const nIdx = (y + dy) * width + (x + dx);
              if (result[nIdx] !== 255) {
                allWhite = false;
              }
            }
          }
          
          temp[idx] = allWhite ? 255 : 0;
        }
      }
      
      result = temp;
    }
    
    return result;
  };

  // Morphological dilation
  const dilate = (mask, width, height, iterations) => {
    let result = new Uint8Array(mask);
    
    for (let iter = 0; iter < iterations; iter++) {
      const temp = new Uint8Array(width * height);
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          
          // Check 3x3 neighborhood
          let hasWhite = false;
          for (let dy = -1; dy <= 1 && !hasWhite; dy++) {
            for (let dx = -1; dx <= 1 && !hasWhite; dx++) {
              const nIdx = (y + dy) * width + (x + dx);
              if (result[nIdx] === 255) {
                hasWhite = true;
              }
            }
          }
          
          temp[idx] = hasWhite ? 255 : 0;
        }
      }
      
      result = temp;
    }
    
    return result;
  };

  // Simpler RGB-based detection as fallback - Board-aware
  const detectGapPadsSimple = async (imageData) => {
    return new Promise((resolve) => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      const img = new Image();
      img.onload = () => {
        console.log(`Board-aware simple detection on image: ${img.width}x${img.height}`);
        
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);
        
        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imgData.data;
        
        // Create mask using board-aware RGB thresholds
        const mask = new Uint8Array(tempCanvas.width * tempCanvas.height);
        let gapPadPixelCount = 0;
        let boardPixelCount = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const pixelIndex = i / 4;
          
          // EXCLUDE board colors (RGB-based)
          const isBluePCB = (b > r + 30 && b > g + 30 && b > 100); // Blue dominant
          const isYellowPCB = (r > 180 && g > 150 && b < 100 && r > b + 80); // Yellow
          const isBlackComponent = (r < 50 && g < 50 && b < 50); // Very dark
          const isGrayComponent = (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r > 50 && r < 150); // Neutral gray
          const isGoldenConnector = (r > 150 && g > 120 && b < 80 && r > g + 20); // Golden
          const isWhiteComponent = (r > 200 && g > 200 && b > 200); // White/bright
          
          if (isBluePCB || isYellowPCB || isBlackComponent || isGrayComponent || isGoldenConnector || isWhiteComponent) {
            mask[pixelIndex] = 0;
            boardPixelCount++;
            continue;
          }
          
          // INCLUDE gap pad colors only
          const isMagentaPad = (r > 120 && r > g + 30 && r > b + 10 && // Magenta: red dominant with some blue
                               g < 150 && b > 80); // Not too green, some blue
          
          const isCyanPad = (b > r + 30 && g > r + 20 && // Cyan: blue and green dominant
                            b > 120 && g > 120 && r < 120);
          
          const isSilverPad = (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && // Silver: neutral color
                              r > 150 && g > 150 && b > 150 && // Bright
                              r < 220 && g < 220 && b < 220); // But not pure white
          
          if (isMagentaPad || isCyanPad || isSilverPad) {
            mask[pixelIndex] = 255;
            gapPadPixelCount++;
          } else {
            mask[pixelIndex] = 0;
          }
        }
        
        console.log(`Board-aware simple detection: ${gapPadPixelCount} gap pad pixels, ${boardPixelCount} board pixels excluded (${((gapPadPixelCount/(tempCanvas.width*tempCanvas.height))*100).toFixed(2)}%)`);
        
        // Apply board-aware cleanup
        const cleanMask = morphologicalCleanupBoard(mask, tempCanvas.width, tempCanvas.height);
        
        // Find contours in the cleaned mask
        const contours = findContours(cleanMask, tempCanvas.width, tempCanvas.height);
        console.log(`Board-aware simple detection found ${contours.length} contours`);
        
        // Filter contours with gap pad specific criteria
        const validPads = [];
        contours.forEach((contour, index) => {
          const bbox = contour.boundingBox;
          const area = bbox.width * bbox.height;
          const aspectRatio = bbox.width / bbox.height;
          
          // Gap pad specific filtering (2cm x 2cm expected)
          if (area > 200 && area < 5000 && // Reasonable size
              aspectRatio > 0.5 && aspectRatio < 2.0) { // Roughly square
            validPads.push({
              x: (bbox.x + bbox.width / 2) / tempCanvas.width,
              y: (bbox.y + bbox.height / 2) / tempCanvas.height,
              width: bbox.width / tempCanvas.width,
              height: bbox.height / tempCanvas.height,
              area: area,
              aspectRatio: aspectRatio,
              confidence: 0.6, // Lower confidence for simple detection
              boundingBox: bbox,
              id: `board_aware_pad_${bbox.x}_${bbox.y}`
            });
            console.log(`Board-aware simple detection: accepted pad ${index} with area ${area}, aspect ${aspectRatio.toFixed(2)}`);
          }
        });
        
        console.log(`Board-aware simple detection result: ${validPads.length} pads`);
        resolve(validPads);
      };
      
      img.onerror = (error) => {
        console.error('Board-aware simple detection image error:', error);
        resolve([]);
      };
      
      img.src = imageData;
    });
  };

  // Find contours (connected components) - More strict version
  const findContours = (mask, width, height) => {
    const visited = new Set();
    const contours = [];
    
    for (let y = 0; y < height; y += 2) { // Skip every other pixel for performance
      for (let x = 0; x < width; x += 2) {
        const index = y * width + x;
        
        if (mask[index] === 255 && !visited.has(index)) {
          const contour = floodFill(mask, width, height, x, y, visited);
          
          // More strict minimum size threshold for gap pads
          if (contour.points.length > 200) { // Increased from 50 to 200
            contours.push(contour);
          }
        }
      }
    }
    
    console.log(`?? Found ${contours.length} contours with strict size filtering`);
    return contours;
  };

  // Flood fill to find connected components
  const floodFill = (mask, width, height, startX, startY, visited) => {
    const queue = [{x: startX, y: startY}];
    const points = [];
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    
    while (queue.length > 0) {
      const {x, y} = queue.shift();
      const index = y * width + x;
      
      if (visited.has(index) || x < 0 || y < 0 || x >= width || y >= height || mask[index] !== 255) {
        continue;
      }
      
      visited.add(index);
      points.push({x, y});
      
      // Update bounding box
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      
      // Add 4-connected neighbors
      queue.push({x: x + 1, y: y});
      queue.push({x: x - 1, y: y});
      queue.push({x: x, y: y + 1});
      queue.push({x: x, y: y - 1});
    }
    
    return {
      points,
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
      }
    };
  };

  // Draw detection results (similar to cv2.rectangle and cv2.putText)
  const drawDetectionResults = (ctx, pads, width, height) => {
    pads.forEach((pad, index) => {
      const bbox = pad.boundingBox;
      
      // Draw detection rectangle with confidence-based color
      const color = pad.confidence > 0.7 ? '#00ff00' : 
                   pad.confidence > 0.5 ? '#ffff00' : '#ff6600';
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
      
      // Draw label background
      const label = `P${index + 1} (${Math.round(pad.confidence * 100)}%)`;
      ctx.font = '14px Arial';
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillStyle = color;
      ctx.fillRect(bbox.x, bbox.y - 22, textWidth + 8, 22);
      
      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.fillText(label, bbox.x + 4, bbox.y - 6);
    });
  };

  // Test gap pad detection on current video frame
  const testDetection = async () => {
    if (!videoRef.current) {
      setMessage("? Video not available");
      return;
    }

    // Ensure canvas ref is available
    if (!canvasRef.current) {
      setMessage("? Canvas not available - check browser console");
      console.error("Canvas ref is null:", canvasRef.current);
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Make canvas visible temporarily for capture
    canvas.style.display = "block";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "10";
    
    console.log("=== BOARD-AWARE DETECTION TEST ===");
    console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
    console.log("Canvas element:", canvas);
    
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg');
      console.log("Image data captured, length:", imageData.length);
      
      setMessage("Running board-aware gap pad detection...");
      
      console.log("Starting board-aware detection...");
      const detectedPads = await detectGapPads(imageData);
      console.log("Board-aware detection result:", detectedPads);
      
      setDetectedPads(detectedPads);
      setShowDetectionOverlay(true);
      setMessage(`? Board-aware detection complete! Found ${detectedPads.length} gap pads (excluding PCB colors)`);
      
      // Save a debug image to localStorage
      localStorage.setItem('debugBoardAwareImage', imageData);
      
    } catch (error) {
      console.error("Board-aware detection error:", error);
      setMessage("? Board-aware detection failed. Check console for details.");
    } finally {
      // Hide canvas again
      canvas.style.display = "none";
    }
  };

  const captureReferenceImage = async () => {
    if (!serial.trim()) {
      setMessage("Please enter a serial number first");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video) {
      setMessage("? Video not available");
      console.error("Video ref is null:", video);
      return;
    }
    
    if (!canvas) {
      setMessage("? Canvas not available");
      console.error("Canvas ref is null:", canvas);
      return;
    }
    
    console.log("=== BOARD-AWARE CAPTURE DEBUG ===");
    console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
    console.log("Video ready state:", video.readyState);
    console.log("Canvas element:", canvas);
    
    try {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg');
      const key = `${serial.trim().toUpperCase()}_${side}`;
      
      console.log("Image data length:", imageData.length);
      console.log("Starting board-aware detection...");
      
      setMessage("Running board-aware gap pad detection...");
      
      // Try detection with error handling
      let detectedPads = [];
      try {
        detectedPads = await detectGapPads(imageData);
        console.log("Board-aware detection completed, found:", detectedPads.length, "pads");
      } catch (detectionError) {
        console.error("Board-aware detection failed:", detectionError);
        setMessage("? Board-aware detection failed. Saving reference anyway...");
        
        // For now, let's save the image anyway without detection
        // This allows testing the basic capture functionality
      }
      
      if (detectedPads.length === 0) {
        // Ask user if they want to save anyway or use manual mode
        const saveAnyway = confirm("No gap pads detected with board-aware algorithm. This could mean:\n1. No gap pads are present\n2. Gap pads are a different color than expected\n3. Lighting conditions need adjustment\n\nSave reference anyway?");
        if (!saveAnyway) {
          setMessage("?? Capture cancelled. Try different lighting or check gap pad colors.");
          return;
        }
        detectedPads = []; // Save with empty positions
      }
      
      // Save the reference image with detected positions (or empty array)
      const updatedImages = {
        ...referenceImages,
        [key]: {
          imageData,
          timestamp: new Date().toISOString(),
          serial: serial.trim().toUpperCase(),
          side,
          padPositions: detectedPads
        }
      };
      
      setReferenceImages(updatedImages);
      localStorage.setItem('gapPadReferenceImages', JSON.stringify(updatedImages));
      
      if (detectedPads.length > 0) {
        setMessage(`? Reference saved! Board-aware detection found ${detectedPads.length} gap pads`);
      } else {
        setMessage(`?? Reference saved without gap pad detection. Ensure gap pads are magenta/cyan/silver colored.`);
      }
      setCaptureMode(false);
      
    } catch (error) {
      console.error("Board-aware capture error:", error);
      setMessage("? Capture failed. Check console for details.");
    }
  };

  const validateCurrentView = async () => {
    if (!serial.trim()) {
      setMessage("Please enter a serial number first");
      return;
    }
    
    const key = `${serial.trim().toUpperCase()}_${side}`;
    
    if (!referenceImages[key]) {
      setMessage(`No reference image found for ${serial} (${side})`);
      return;
    }
    
    const refImage = referenceImages[key];
    
    if (!refImage.padPositions || refImage.padPositions.length === 0) {
      setMessage("No gap pad positions found in reference. Please recapture with board-aware detection.");
      return;
    }
    
    setValidationResult({
      referenceImage: refImage.imageData,
      timestamp: refImage.timestamp,
      padPositions: refImage.padPositions
    });
    
    setShowOverlay(true);
    setMessage("?? Starting board-aware real-time validation...");
    
    // Start continuous validation with board-aware detection
    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
    }
    
    validationIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !showOverlay) {
        return;
      }
      
      try {
        // Capture current frame
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        
        const currentImageData = tempCanvas.toDataURL('image/jpeg');
        
        // Detect gap pads in current frame using board-aware detection
        const currentPads = await detectGapPads(currentImageData);
        
        // Compare with reference
        const referencePositions = refImage.padPositions || [];
        let matchedCount = 0;
        const tolerance = 0.05; // 5% tolerance for position matching
        
        // For each reference pad, find if there's a matching detected pad
        referencePositions.forEach(refPad => {
          const hasMatch = currentPads.some(currentPad => {
            const xDiff = Math.abs(refPad.x - currentPad.x);
            const yDiff = Math.abs(refPad.y - currentPad.y);
            return xDiff <= tolerance && yDiff <= tolerance;
          });
          
          if (hasMatch) {
            matchedCount++;
          }
        });
        
        // Calculate match percentage
        const matchPercentage = referencePositions.length > 0 
          ? (matchedCount / referencePositions.length) * 100 
          : 0;
        
        // Update validation status
        let status;
        if (matchPercentage >= 90) {
          status = "success";
        } else if (matchPercentage >= 70) {
          status = "warning";
        } else {
          status = "error";
        }
        
        setValidationStatus({
          status,
          matchPercentage,
          matchedCount,
          totalCount: referencePositions.length,
          currentPads: currentPads.length
        });
        
        // Update message
        if (status === "success") {
          setMessage(`? VALIDATION PASSED! ${matchedCount}/${referencePositions.length} gap pads correctly placed (board-aware detection)`);
        } else if (status === "warning") {
          setMessage(`?? Some gaps detected: ${matchedCount}/${referencePositions.length} gap pads found (check gap pad colors)`);
        } else {
          setMessage(`? VALIDATION FAILED: Only ${matchedCount}/${referencePositions.length} gap pads detected (ensure gap pads are magenta/cyan/silver)`);
        }
        
      } catch (error) {
        console.error("Board-aware validation error:", error);
      }
    }, 2000); // Check every 2 seconds
  };

  const stopValidation = () => {
    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
    }
    setShowOverlay(false);
    setValidationStatus(null);
  };

  const deleteReferenceImage = () => {
    if (!serial.trim()) {
      setMessage("Please enter a serial number first");
      return;
    }
    
    const key = `${serial.trim().toUpperCase()}_${side}`;
    
    if (!referenceImages[key]) {
      setMessage(`No reference image found for ${serial} (${side})`);
      return;
    }
    
    const updatedImages = { ...referenceImages };
    delete updatedImages[key];
    
    setReferenceImages(updatedImages);
    localStorage.setItem('gapPadReferenceImages', JSON.stringify(updatedImages));
    setMessage(`Reference image deleted for ${serial} (${side})`);
    
    if (validationResult) {
      stopValidation();
    }
  };

  const hasReferenceImage = () => {
    if (!serial.trim()) return false;
    const key = `${serial.trim().toUpperCase()}_${side}`;
    return !!referenceImages[key];
  };

  // Render product template overlay
  const renderTemplateOverlay = () => {
    if (!showTemplateOverlay || !videoRef.current) return null;
    
    const template = PRODUCT_TEMPLATES[selectedProduct]?.variants[selectedVariant];
    if (!template) return null;
    
    const video = videoRef.current;
    const videoRect = video.getBoundingClientRect();
    
    // Calculate template dimensions in pixels based on camera calibration
    const templateWidth = template.width * cameraCalibration.pixelsPerMm;
    const templateHeight = template.height * cameraCalibration.pixelsPerMm;
    
    // Center the template on screen
    const centerX = videoRect.width / 2 + cameraCalibration.offsetX;
    const centerY = videoRect.height / 2 + cameraCalibration.offsetY;
    
    return (
      <div
        style={{
          position: 'absolute',
          left: centerX - templateWidth / 2,
          top: centerY - templateHeight / 2,
          width: templateWidth,
          height: templateHeight,
          border: '3px solid #00ff00',
          borderStyle: 'dashed',
          backgroundColor: 'rgba(0, 255, 0, 0.1)',
          pointerEvents: 'none',
          zIndex: 1000
        }}
      >
        {/* Render expected pad positions */}
        {template.padLayout.map((pad, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: pad.x * templateWidth,
              top: pad.y * templateHeight,
              width: pad.width * templateWidth,
              height: pad.height * templateHeight,
              border: `2px solid ${pad.required ? '#ff6600' : '#ffff00'}`,
              backgroundColor: 'rgba(255, 102, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#ffffff',
              fontWeight: 'bold',
              textShadow: '1px 1px 1px #000000'
            }}
            title={`${pad.name} ${pad.required ? '(Required)' : '(Optional)'}`}
          >
            {pad.name}
          </div>
        ))}
        
        {/* Product label */}
        <div
          style={{
            position: 'absolute',
            top: -30,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#00ff00',
            fontSize: '14px',
            fontWeight: 'bold',
            textShadow: '1px 1px 1px #000000'
          }}
        >
          {template.name} - {template.expectedPads} pads expected
        </div>
      </div>
    );
  };

  // Manual teaching mode - add pad position by clicking
  const handleTemplateClick = (event) => {
    if (!manualTeachingMode || !videoRef.current) return;
    
    const video = videoRef.current;
    const videoRect = video.getBoundingClientRect();
    const template = PRODUCT_TEMPLATES[selectedProduct]?.variants[selectedVariant];
    
    if (!template) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Convert to relative coordinates (0-1)
    const relativeX = clickX / rect.width;
    const relativeY = clickY / rect.height;
    
    // Find the closest expected pad position
    let closestPad = null;
    let minDistance = Infinity;
    
    template.padLayout.forEach(pad => {
      const distance = Math.sqrt(
        Math.pow(relativeX - pad.x, 2) + Math.pow(relativeY - pad.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestPad = pad;
      }
    });
    
    if (closestPad && minDistance < 0.1) { // Within 10% of expected position
      const newPad = {
        x: relativeX,
        y: relativeY,
        width: 0.1, // Default size
        height: 0.1,
        name: closestPad.name,
        required: closestPad.required,
        confidence: 1.0,
        id: `manual_${Date.now()}_${Math.random()}`
      };
      
      setManualPadPositions(prev => [...prev, newPad]);
      setMessage(`Added manual pad: ${closestPad.name} at (${relativeX.toFixed(2)}, ${relativeY.toFixed(2)})`);
    }
  };

  // Camera calibration function
  const calibrateCamera = () => {
    setShowCalibration(true);
    setMessage("Place a known-size object (e.g., 100mm ruler) in view and click Calibrate");
  };

  const performCalibration = () => {
    // This would typically use a known reference object
    // For now, we'll use a simple approach
    const newCalibration = {
      pixelsPerMm: cameraCalibration.pixelsPerMm * 1.1, // Increase by 10%
      offsetX: cameraCalibration.offsetX + 5,
      offsetY: cameraCalibration.offsetY + 5
    };
    
    setCameraCalibration(newCalibration);
    setShowCalibration(false);
    setMessage("Camera calibration updated");
  };

  // Enhanced validation that checks pad count and placement
  const enhancedValidation = (currentPads, referencePads, template) => {
    if (!template) return { status: 'error', message: 'No template selected' };
    
    const expectedPads = template.padLayout.filter(pad => pad.required).length;
    const detectedPads = currentPads.length;
    const referencePadsCount = referencePads.length;
    
    // Check if we have the right number of pads
    if (detectedPads < expectedPads) {
      return {
        status: 'error',
        message: `Missing pads: Found ${detectedPads}, Expected ${expectedPads}`,
        missingPads: expectedPads - detectedPads
      };
    }
    
    if (detectedPads > expectedPads) {
      return {
        status: 'warning',
        message: `Extra pads detected: Found ${detectedPads}, Expected ${expectedPads}`,
        extraPads: detectedPads - expectedPads
      };
    }
    
    // Check placement accuracy
    let correctPlacements = 0;
    const tolerance = 0.05; // 5% tolerance
    
    referencePads.forEach(refPad => {
      const hasMatch = currentPads.some(currentPad => {
        const xDiff = Math.abs(refPad.x - currentPad.x);
        const yDiff = Math.abs(refPad.y - currentPad.y);
        return xDiff <= tolerance && yDiff <= tolerance;
      });
      
      if (hasMatch) correctPlacements++;
    });
    
    const placementAccuracy = (correctPlacements / referencePadsCount) * 100;
    
    if (placementAccuracy >= 90) {
      return {
        status: 'success',
        message: `All pads correctly placed! Accuracy: ${placementAccuracy.toFixed(1)}%`,
        accuracy: placementAccuracy
      };
    } else if (placementAccuracy >= 70) {
      return {
        status: 'warning',
        message: `Some placement issues: ${correctPlacements}/${referencePadsCount} correct`,
        accuracy: placementAccuracy
      };
    } else {
      return {
        status: 'error',
        message: `Poor placement accuracy: ${correctPlacements}/${referencePadsCount} correct`,
        accuracy: placementAccuracy
      };
    }
  };

  // Main UI render
  return (
    <div style={{ padding: "20px", backgroundColor: "#0a0a0a", minHeight: "100vh", color: "#e5e5e5" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#00ff00" }}>
        Gap Pad Validator - Enhanced
      </h1>
      
      {/* Product Selection Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '20px', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Product Type:</label>
          <select 
            value={selectedProduct} 
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setSelectedVariant(Object.keys(PRODUCT_TEMPLATES[e.target.value]?.variants || {})[0] || '');
            }}
            style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
          >
            {Object.keys(PRODUCT_TEMPLATES).map(product => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Variant:</label>
          <select 
            value={selectedVariant} 
            onChange={(e) => setSelectedVariant(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
          >
            {Object.keys(PRODUCT_TEMPLATES[selectedProduct]?.variants || {}).map(variant => (
              <option key={variant} value={variant}>
                {PRODUCT_TEMPLATES[selectedProduct]?.variants[variant]?.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Template Overlay:</label>
          <button 
            onClick={() => setShowTemplateOverlay(!showTemplateOverlay)}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '4px', 
              backgroundColor: showTemplateOverlay ? '#00aa00' : '#666',
              color: '#fff', 
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {showTemplateOverlay ? 'Hide' : 'Show'}
          </button>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Camera Calibration:</label>
          <button 
            onClick={calibrateCamera}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '4px', 
              backgroundColor: '#0066ff',
              color: '#fff', 
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Calibrate
          </button>
        </div>
      </div>
      
      {/* Product Info Display */}
      {PRODUCT_TEMPLATES[selectedProduct]?.variants[selectedVariant] && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px', 
          padding: '15px',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>
            {PRODUCT_TEMPLATES[selectedProduct].variants[selectedVariant].name}
          </h3>
          <p style={{ margin: '5px 0', color: '#ccc' }}>
            {PRODUCT_TEMPLATES[selectedProduct].variants[selectedVariant].description}
          </p>
          <p style={{ margin: '5px 0', color: '#ffaa00' }}>
            Dimensions: {PRODUCT_TEMPLATES[selectedProduct].width}mm × {PRODUCT_TEMPLATES[selectedProduct].height}mm
          </p>
          <p style={{ margin: '5px 0', color: '#00aaff' }}>
            Expected Pads: {PRODUCT_TEMPLATES[selectedProduct].variants[selectedVariant].expectedPads}
          </p>
        </div>
      )}

      {/* Main Controls */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", justifyContent: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Enter Serial Number"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          style={{ padding: "10px", borderRadius: "4px", backgroundColor: "#333", color: "#fff", border: "1px solid #555" }}
        />
        
        <select
          value={side}
          onChange={(e) => setSide(e.target.value)}
          style={{ padding: "10px", borderRadius: "4px", backgroundColor: "#333", color: "#fff", border: "1px solid #555" }}
        >
          <option value="front">Front</option>
          <option value="back">Back</option>
        </select>
        
        <button
          onClick={() => setCaptureMode(!captureMode)}
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            backgroundColor: captureMode ? "#aa0000" : "#006600",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          {captureMode ? "Cancel Capture" : "Capture Reference"}
        </button>
        
        <button
          onClick={() => setManualTeachingMode(!manualTeachingMode)}
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            backgroundColor: manualTeachingMode ? "#aa6600" : "#666600",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          {manualTeachingMode ? "Exit Teaching" : "Manual Teaching"}
        </button>
        
        <button
          onClick={testDetection}
          style={{
            padding: "10px 20px",
            borderRadius: "4px",
            backgroundColor: "#0066aa",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Test Detection
        </button>
        
        {hasReferenceImage() && (
          <button
            onClick={validateCurrentView}
            style={{
              padding: "10px 20px",
              borderRadius: "4px",
              backgroundColor: validationMode ? "#aa0000" : "#006600",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            {validationMode ? "Stop Validation" : "Start Validation"}
          </button>
        )}
        
        {hasReferenceImage() && (
          <button
            onClick={deleteReferenceImage}
            style={{
              padding: "10px 20px",
              borderRadius: "4px",
              backgroundColor: "#aa0000",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            Delete Reference
          </button>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          textAlign: "center",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          border: "1px solid #333"
        }}>
          <p style={{ margin: 0, color: "#e5e5e5" }}>{message}</p>
        </div>
      )}

      {/* Camera View Container */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <video
          ref={videoRef}
          style={{
            width: "100%",
            maxWidth: "800px",
            height: "auto",
            border: "2px solid #333",
            borderRadius: "8px"
          }}
          autoPlay
          muted
          playsInline
        />
        
        {/* Template Overlay */}
        {renderTemplateOverlay()}
        
        {/* Detection Results Overlay */}
        {showDetectionOverlay && detectedPads.length > 0 && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 1001
          }}>
            {detectedPads.map((pad, index) => (
              <div
                key={pad.id || index}
                style={{
                  position: "absolute",
                  left: pad.x * 100 + "%",
                  top: pad.y * 100 + "%",
                  width: (pad.width || 0.1) * 100 + "%",
                  height: (pad.height || 0.1) * 100 + "%",
                  border: "2px solid #ff0000",
                  backgroundColor: "rgba(255, 0, 0, 0.3)",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              >
                P{index + 1}
              </div>
            ))}
          </div>
        )}
        
        {/* Manual Teaching Mode Click Handler */}
        {manualTeachingMode && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              cursor: "crosshair",
              zIndex: 1002
            }}
            onClick={handleTemplateClick}
          />
        )}
      </div>

      {/* Hidden Canvas for Image Processing */}
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />
      
      <canvas
        ref={detectionCanvasRef}
        style={{ display: "none" }}
      />

      {/* Validation Overlay */}
      {showOverlay && validationResult && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: "#1a1a1a",
            padding: "30px",
            borderRadius: "12px",
            border: "2px solid #333",
            maxWidth: "600px",
            textAlign: "center"
          }}>
            <h2 style={{ color: "#00ff00", marginBottom: "20px" }}>Validation Results</h2>
            
            {validationStatus && (
              <div style={{
                padding: "20px",
                backgroundColor: validationStatus.status === 'success' ? '#1a3a1a' : 
                              validationStatus.status === 'warning' ? '#3a3a1a' : '#3a1a1a',
                borderRadius: "8px",
                marginBottom: "20px",
                border: `2px solid ${
                  validationStatus.status === 'success' ? '#00ff00' : 
                  validationStatus.status === 'warning' ? '#ffff00' : '#ff0000'
                }`
              }}>
                <h3 style={{ 
                  color: validationStatus.status === 'success' ? '#00ff00' : 
                         validationStatus.status === 'warning' ? '#ffff00' : '#ff0000',
                  margin: "0 0 10px 0"
                }}>
                  {validationStatus.status === 'success' ? '✓ PASSED' : 
                   validationStatus.status === 'warning' ? '⚠ WARNING' : '✗ FAILED'}
                </h3>
                <p style={{ margin: "5px 0", color: "#e5e5e5" }}>
                  {validationStatus.status === 'success' ? 
                    `All ${validationStatus.matchedCount} pads correctly placed!` :
                   validationStatus.status === 'warning' ? 
                    `Found ${validationStatus.currentPads} pads, ${validationStatus.matchedCount} match reference` :
                    `Only ${validationStatus.matchedCount}/${validationStatus.totalCount} pads match reference`
                  }
                </p>
                {validationStatus.accuracy && (
                  <p style={{ margin: "5px 0", color: "#00aaff" }}>
                    Placement Accuracy: {validationStatus.accuracy.toFixed(1)}%
                  </p>
                )}
              </div>
            )}
            
            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button
                onClick={stopValidation}
                style={{
                  padding: "12px 24px",
                  borderRadius: "6px",
                  backgroundColor: "#666",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Calibration Modal */}
      {showCalibration && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: "#1a1a1a",
            padding: "30px",
            borderRadius: "12px",
            border: "2px solid #333",
            maxWidth: "500px",
            textAlign: "center"
          }}>
            <h2 style={{ color: "#0066ff", marginBottom: "20px" }}>Camera Calibration</h2>
            <p style={{ color: "#e5e5e5", marginBottom: "20px" }}>
              Place a known-size object (e.g., 100mm ruler) in the camera view.
              The template overlay will be adjusted to match the real-world dimensions.
            </p>
            
            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button
                onClick={performCalibration}
                style={{
                  padding: "12px 24px",
                  borderRadius: "6px",
                  backgroundColor: "#0066ff",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Calibrate
              </button>
              <button
                onClick={() => setShowCalibration(false)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "6px",
                  backgroundColor: "#666",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {showInstructions && (
        <div style={{
          backgroundColor: "#1a1a1a",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #333",
          marginTop: "20px"
        }}>
          <h3 style={{ color: "#00ff00", marginTop: 0 }}>Instructions</h3>
          <ol style={{ color: "#e5e5e5", lineHeight: "1.6" }}>
            <li><strong>Select Product:</strong> Choose your 3U or 6U board type and variant</li>
            <li><strong>Position Board:</strong> Align your PCB with the green template overlay on screen</li>
            <li><strong>Calibrate Camera:</strong> Use the Calibrate button to adjust template size if needed</li>
            <li><strong>Capture Reference:</strong> Take a reference image with the board properly positioned</li>
            <li><strong>Manual Teaching (Optional):</strong> Use Manual Teaching mode to manually define pad positions</li>
            <li><strong>Validate:</strong> Use Start Validation to continuously check pad placement</li>
            <li><strong>Monitor:</strong> Watch for real-time feedback on pad count and placement accuracy</li>
          </ol>
          <button
            onClick={() => setShowInstructions(false)}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              backgroundColor: "#666",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Hide Instructions
          </button>
        </div>
      )}
    </div>
  );
}
