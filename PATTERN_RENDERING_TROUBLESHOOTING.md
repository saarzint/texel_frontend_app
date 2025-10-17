# Pattern Rendering Troubleshooting Guide

## Issue: 2D and 3D Views Show Different or Incorrect Structures

If the pattern views are showing structures that don't match your uploaded image, follow this debugging guide.

---

## Step 1: Enable Debug Mode

1. Open your pattern in the PatternView page
2. Click the **"🐛 Debug"** button in the top-right corner
3. This will show three panels:
   - **Original Uploaded Image** - What you actually uploaded
   - **Outline Image** - The extracted outline from backend processing
   - **Data Structure** - Information about the pattern data received

---

## Step 2: Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab. You should see detailed logs:

### Pattern Data Logs:
```
=== Pattern Data Received ===
Full response: {...}
Pattern object: {...}
2D Data: {...}
3D Data: {...}
```

### Pattern2DViewer Logs:
```
=== Pattern2DViewer Data ===
Data object: {...}
SVG URL: http://...
Points count: X
Segments count: Y
```

### Pattern3DViewer Logs:
```
=== Pattern3DViewer Data ===
Data object: {...}
Vertices count: X
Faces count: Y
Edges count: Z
Sample vertices: [{x, y, z}, ...]
Sample faces: [[0, 1, 2], ...]
```

---

## Step 3: Identify the Problem

### Problem A: Pattern Data is Empty or Missing

**Symptoms:**
- Console shows: `Points count: 0` or `Vertices count: 0`
- Debug panel shows: "❌ No" for 2D or 3D data
- Viewer shows: "pattern data not available"

**Likely Causes:**
1. **Processing Not Complete**: Check pattern status in debug panel
   - If status is `pending`, `processing`, etc., wait for completion
   - Only `completed` status has full data

2. **Backend Processing Failed**: Check pattern status
   - If status is `failed`, check backend logs
   - Look for `error_message` in the pattern object

3. **Backend Not Generating Data**: Backend might not be creating pattern_2d_data or pattern_3d_data

**Solutions:**
- Wait for processing to complete (check ProcessingScreen)
- Check backend logs for processing errors
- Verify backend is populating `pattern_2d_data` and `pattern_3d_data` fields

---

### Problem B: Pattern Shows Wrong Structure

**Symptoms:**
- Pattern renders, but doesn't match uploaded image
- Outline image in debug panel looks wrong
- Different structure than expected

**Likely Causes:**
1. **Backend Image Processing Error**:
   - OpenCV or image processing algorithm extracting wrong contours
   - Image preprocessing (thresholding, edge detection) settings incorrect

2. **Coordinate System Mismatch**:
   - Backend using different coordinate system than frontend expects
   - Y-axis might be inverted
   - Scale/units might be different

3. **Wrong Segments or Vertices**:
   - Backend extracting multiple contours (noise, background)
   - Not filtering out small or invalid contours

**Solutions:**

#### Solution 1: Check Outline Image
1. Enable debug panel
2. Compare "Original Image" with "Outline Image"
3. If outline is wrong, the issue is in backend image processing

**Backend Fix Needed:**
```python
# Check your backend image processing
# Typical issues:
- Wrong threshold values
- Not removing noise/small contours
- Not using the right contour detection mode
- Image not preprocessed correctly (grayscale, blur, etc.)
```

#### Solution 2: Check Coordinate Data
Look at console logs for sample data:

**2D Pattern:**
```javascript
Sample points: [
  {x: 100, y: 200},  // Check if coordinates make sense
  {x: 150, y: 250},
  ...
]
```

**3D Pattern:**
```javascript
Sample vertices: [
  {x: 10, y: 20, z: 0},  // Z should be 0 or small for flat patterns
  {x: 15, y: 25, z: 0},
  ...
]
```

**Backend Fix Needed:**
```python
# Verify your backend is returning correct format:
{
  "pattern_2d_data": {
    "points": [{"x": float, "y": float}, ...],
    "segments": [{"id": int, "start": {x, y}, "end": {x, y}, "length": float}, ...],
    "total_perimeter": float,
    "area": float,
    "bounding_box": {"x": float, "y": float, "width": float, "height": float}
  },
  "pattern_3d_data": {
    "vertices": [{"x": float, "y": float, "z": float}, ...],
    "faces": [[int, int, int], ...],  // Indices into vertices array
    "edges": [[int, int], ...]  // Pairs of vertex indices
  }
}
```

---

### Problem C: SVG Image Not Loading

**Symptoms:**
- 2D view is blank
- Console shows 404 error for SVG
- Debug panel shows: "❌ No" for Has SVG

**Solutions:**
1. Check if backend is generating and saving SVG file
2. Verify SVG URL is accessible:
   ```
   pattern_2d_svg_url: "http://localhost:8000/media/patterns/123/pattern.svg"
   ```
3. Check CORS and static file serving on backend
4. Verify media files are being served correctly

---

### Problem D: 3D Model Renders But Looks Wrong

**Symptoms:**
- 3D view shows a mesh, but shape is incorrect
- Model is flat when it should be 3D
- Model is inside-out or has wrong normals

**Likely Causes:**
1. **Flat Pattern Data**: If all Z coordinates are 0, model will be flat
   - This is expected for 2D patterns
   - Backend needs to create actual 3D extrusion

2. **Wrong Face Winding**: Faces defined in wrong order
   - Should be counter-clockwise for front-facing

3. **Scale Issues**: Model too large or too small
   - Camera might be inside the model
   - Model might be too far from camera

**Solutions:**

#### For Flat Models:
Check if backend is creating 3D extrusion:
```python
# Backend should extrude 2D outline into 3D
# Each 2D point should generate 2 vertices (front and back)
# Example: point (x, y) becomes:
#   - (x, y, 0) for front face
#   - (x, y, depth) for back face
```

#### For Inside-Out Models:
Check face winding in console logs:
```javascript
Sample faces: [[0, 1, 2], [2, 3, 0], ...]
// Vertices should be in counter-clockwise order when viewed from outside
```

**Backend Fix:**
```python
# Ensure face indices are in correct order
# For each triangle, vertices should be CCW from outside view
```

#### For Scale Issues:
Check vertex coordinates in console:
```javascript
Sample vertices: [
  {x: 10000, y: 20000, z: 0},  // TOO LARGE - should be 0-1000 range
]
```

**Backend Fix:**
```python
# Normalize coordinates to reasonable scale
# Typical range: 0-500 or 0-1000
```

---

## Step 4: Common Backend Issues

### Issue 1: Image Not Being Processed Correctly

**Check Backend Logs For:**
- Image loading errors
- OpenCV processing errors
- Contour detection issues

**Common Fixes:**
```python
# Better image preprocessing
import cv2

# Read image
img = cv2.imread(image_path)

# Convert to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Apply Gaussian blur to reduce noise
blur = cv2.GaussianBlur(gray, (5, 5), 0)

# Apply adaptive thresholding
thresh = cv2.adaptiveThreshold(
    blur, 255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY_INV, 11, 2
)

# Find contours
contours, _ = cv2.findContours(
    thresh,
    cv2.RETR_EXTERNAL,  # Only external contours
    cv2.CHAIN_APPROX_SIMPLE
)

# Filter small contours (noise)
min_contour_area = 100
contours = [c for c in contours if cv2.contourArea(c) > min_contour_area]

# Get largest contour (main pattern)
if contours:
    main_contour = max(contours, key=cv2.contourArea)
```

### Issue 2: Coordinate System Problems

**Frontend Expectations:**
- Origin (0, 0) is top-left for 2D
- X increases to the right
- Y increases downward
- Units are pixels

**Backend Should:**
```python
# Ensure coordinates match frontend expectations
points = []
for point in contour:
    x, y = point[0]
    points.append({
        'x': float(x),
        'y': float(y)
    })
```

### Issue 3: Missing or Incorrect Data Format

**Required Pattern Response Format:**
```json
{
  "success": true,
  "pattern": {
    "id": 1,
    "status": "completed",
    "original_image_url": "http://localhost:8000/media/patterns/1/original.png",
    "outline_image_url": "http://localhost:8000/media/patterns/1/outline.png",
    "pattern_2d_svg_url": "http://localhost:8000/media/patterns/1/pattern.svg",
    "pattern_2d_data": {
      "points": [...],
      "segments": [...],
      "total_perimeter": 0.0,
      "area": 0.0,
      "bounding_box": {...}
    },
    "pattern_3d_data": {
      "vertices": [...],
      "faces": [...],
      "edges": [...]
    }
  }
}
```

---

## Step 5: Quick Fixes

### Fix 1: Reload Pattern Data
If processing completed but view is wrong:
1. Refresh the page
2. Or navigate back to dashboard and reopen pattern

### Fix 2: Try Different View Modes
For 2D patterns:
1. Toggle between SVG View and Canvas View
2. SVG shows backend-generated vector
3. Canvas draws from point/segment data

### Fix 3: Check Processing Status
1. Go back to dashboard
2. Check pattern status
3. If not "completed", wait or reprocess

### Fix 4: Clear Cache and Retry
```bash
# Clear browser cache
# Or open in incognito mode
# Upload pattern again
```

---

## Step 6: Report Issue

If problem persists, collect this information:

1. **Screenshot of Debug Panel**
   - Shows original image vs rendered pattern

2. **Console Logs**
   - Copy all logs starting with "=== Pattern"

3. **Pattern ID and Status**
   - From debug panel or URL

4. **Backend Logs**
   - Error messages during processing
   - Image processing steps

5. **Sample Data**
   ```javascript
   {
     points_count: X,
     segments_count: Y,
     vertices_count: Z,
     faces_count: W
   }
   ```

---

## Additional Tips

### For Development:
- Keep browser console open while testing
- Use debug panel for every upload
- Compare original vs outline vs rendered
- Check each processing step

### For Backend Developers:
- Save intermediate images (preprocessed, thresholded, contours)
- Log coordinate ranges and counts
- Validate data before returning
- Add unit tests for image processing

### For Testing:
- Start with simple shapes (squares, circles)
- Use high-contrast images
- Avoid complex patterns initially
- Test with different image formats (PNG, JPG)

---

## Contact

For additional support:
- Check backend API logs
- Review image processing pipeline
- Validate data format matches expected structure
- Test with sample patterns first
