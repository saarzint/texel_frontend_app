# Backend API Integration - Complete Implementation

## ✅ Fully Implemented Features

### 1. Pattern Data Structure

The frontend now supports the complete pattern data structure from your backend:

#### Pattern Interface ([patternService.ts:51-79](src/services/patternService.ts#L51-L79))
```typescript
interface Pattern {
  // Basic Info
  id: number;
  name: string;
  description?: string;
  status: 'pending' | 'processing' | 'outline_extracted' | 'pattern_generated' | 'completed' | 'failed';

  // Images
  original_image_url: string;
  outline_image_url?: string;

  // NEW: Outline extraction data with metadata
  outline_data?: OutlineData;

  // Pattern Data
  pattern_2d_svg_url?: string;
  pattern_2d_data?: Pattern2DData;  // 100+ points
  pattern_3d_data?: Pattern3DData;  // 100+ vertices

  // Download Files
  dxf_file_url?: string;
  pdf_file_url?: string;

  // Timestamps & Status
  created_at: string;
  updated_at: string;
  processed_at?: string;
  error_message?: string;
}
```

#### Outline Data Structure ([patternService.ts:98-110](src/services/patternService.ts#L98-L110))
```typescript
interface OutlineData {
  contours: Point2D[][];  // All detected contours
  main_contour_index: number;  // Index of the main pattern contour
  extraction_metadata: {
    method: string;  // e.g., "adaptive_threshold", "canny_edge"
    contour_count: number;  // Total contours found
    points_before_simplification: number;
    points_after_simplification: number;
    processing_time_seconds: number;
  };
}
```

### 2. API Endpoints Implemented

#### Core Pattern Endpoints

**GET /api/patterns/{id}/**
```typescript
const response = await patternService.getPattern(1);
// Returns complete pattern with all data
```

**GET /api/patterns/**
```typescript
const { results, count } = await patternService.getPatterns();
// Returns paginated list of patterns
```

**POST /api/patterns/create/**
```typescript
const formData = new FormData();
formData.append('name', 'My Pattern');
formData.append('description', 'Optional description');
formData.append('original_image', imageFile);

const response = await patternService.createPattern(formData);
```

**PATCH /api/patterns/{id}/**
```typescript
await patternService.updatePattern(1, {
  region: 'US',
  size: 'M'
});
```

**DELETE /api/patterns/{id}/**
```typescript
await patternService.deletePattern(1);
```

**POST /api/patterns/{id}/reprocess/**
```typescript
await patternService.reprocessPattern(1);
```

#### Preview & Download Endpoints

**GET /api/patterns/{id}/preview-3d/**
```typescript
const { pattern_3d_data } = await patternService.get3DPreview(1);
// Returns 3D mesh data for Three.js rendering
```

**GET /api/patterns/{id}/download-dxf/**
```typescript
const { file_url, filename } = await patternService.downloadDXF(1);
window.open(file_url, '_blank');
```

**GET /api/patterns/{id}/download-pdf/**
```typescript
const { file_url, filename } = await patternService.downloadPDF(1);
window.open(file_url, '_blank');
```

#### NEW: Seamly2D Enhanced Export

**POST /api/patterns/{id}/download-seamly2d/** ([patternService.ts:175-184](src/services/patternService.ts#L175-L184))
```typescript
const { file_url, filename } = await patternService.downloadSeamly2D(1, {
  seam_allowance: 15.0,          // mm
  add_grainline: true,            // Add grainline indicators
  add_notches: true,              // Add alignment notches
  add_seam_allowance: true,       // Add seam allowance to pattern
  piece_name: 'Front Panel'       // Name for the pattern piece
});
window.open(file_url, '_blank');
```

### 3. Debug Tools

#### Debug Panel ([PatternView.tsx:180-260](src/pages/Project/PatternView.tsx#L180-L260))

Click the **"🐛 Debug"** button to see:

**Left Panel - Original Image:**
- Shows the exact image you uploaded
- Helps verify correct file was processed

**Middle Panel - Outline Image:**
- Shows the extracted outline from backend
- **Key diagnostic tool** - if this looks wrong, backend processing has issues

**Right Panel - Data Structure & Metadata:**
```
Status: completed

Extraction Metadata:
- Method: adaptive_threshold
- Contours Found: 1
- Points Before: 512
- Points After: 156
- Processing Time: 1.23s

Has 2D Data: ✅ Yes
- Points: 156
- Segments: 156
- Perimeter: 2847.65px
- Area: 235678.32px²

Has 3D Data: ✅ Yes
- Vertices: 312
- Faces: 308
- Edges: 468

Has SVG: ✅ Yes
```

#### Console Logging

Open browser DevTools (F12) to see detailed logs:

```javascript
=== Pattern Data Received ===
Full response: {...}
Pattern object: {...}
Outline Data: {
  contours: [[...]],
  main_contour_index: 0,
  extraction_metadata: {...}
}
Extraction Metadata: {
  method: "adaptive_threshold",
  contour_count: 1,
  points_before_simplification: 512,
  points_after_simplification: 156,
  processing_time_seconds: 1.23
}
2D Data: {points: Array(156), segments: Array(156), ...}
3D Data: {vertices: Array(312), faces: Array(308), ...}

=== Pattern2DViewer Data ===
Data object: {...}
SVG URL: http://localhost:8000/media/patterns/1/pattern.svg
Points count: 156
Segments count: 156

=== Pattern3DViewer Data ===
Data object: {...}
Vertices count: 312
Faces count: 308
Edges count: 468
Sample vertices: [
  {x: 36.26, y: 26.59, z: 0},
  {x: 35.46, y: 45.12, z: 0},
  {x: 38.92, y: 63.45, z: 0}
]
Sample faces: [[0, 1, 2], [2, 3, 4], [4, 5, 6]]
```

### 4. User Flow

#### Complete Pattern Creation Flow

1. **Upload** ([CreatePattern.tsx](src/pages/Project/CreatePattern.tsx))
   - User uploads image
   - Enters pattern name and description
   - Clicks "Generate Pattern"
   - API: `POST /api/patterns/create/`

2. **Processing** ([ProcessingScreen.tsx](src/pages/Project/ProcessingScreen.tsx))
   - Shows animated progress (0-100%)
   - Polls backend every 2 seconds: `GET /api/patterns/{id}/`
   - Status progression:
     - `pending` → "Analyzing sketch..." (10%)
     - `processing` → "Extracting outlines..." (30%)
     - `outline_extracted` → "Generating pattern pieces..." (60%)
     - `pattern_generated` → "Creating 3D preview..." (85%)
     - `completed` → (100%) → Auto-redirect

3. **Pattern View** ([PatternView.tsx](src/pages/Project/PatternView.tsx))
   - Toggle between 3D and 2D views
   - Adjust size options (Region, Size)
   - View debug info
   - Export pattern (DXF, PDF, Seamly2D)

### 5. Expected Backend Data Format

#### Minimal Response (During Processing)
```json
{
  "success": true,
  "pattern": {
    "id": 1,
    "name": "Summer Dress",
    "status": "processing",
    "original_image_url": "http://localhost:8000/media/patterns/1/original.png",
    "created_at": "2025-01-14T10:00:00Z"
  }
}
```

#### Complete Response (After Processing)
```json
{
  "success": true,
  "pattern": {
    "id": 1,
    "name": "Summer Dress",
    "description": "Elegant summer dress pattern",
    "status": "completed",

    "original_image_url": "http://localhost:8000/media/patterns/1/original.png",
    "outline_image_url": "http://localhost:8000/media/patterns/1/outline.png",

    "outline_data": {
      "contours": [
        [
          {"x": 36.26, "y": 26.59},
          {"x": 35.46, "y": 45.12},
          ...
        ]
      ],
      "main_contour_index": 0,
      "extraction_metadata": {
        "method": "adaptive_threshold",
        "contour_count": 1,
        "points_before_simplification": 512,
        "points_after_simplification": 156,
        "processing_time_seconds": 1.23
      }
    },

    "pattern_2d_svg_url": "http://localhost:8000/media/patterns/1/pattern.svg",
    "pattern_2d_data": {
      "points": [
        {"x": 36.26, "y": 26.59},
        ...
      ],
      "segments": [
        {
          "id": 0,
          "start": {"x": 36.26, "y": 26.59},
          "end": {"x": 35.46, "y": 45.12},
          "length": 18.89
        },
        ...
      ],
      "total_perimeter": 2847.65,
      "area": 235678.32,
      "bounding_box": {
        "x": 35.46,
        "y": 26.59,
        "width": 937.34,
        "height": 1322.32
      }
    },

    "pattern_3d_data": {
      "vertices": [
        {"x": 36.26, "y": 26.59, "z": 0},
        {"x": 35.46, "y": 45.12, "z": 0},
        ...
        {"x": 36.26, "y": 26.59, "z": 10},
        ...
      ],
      "faces": [
        [0, 1, 2],
        [2, 3, 4],
        ...
      ],
      "edges": [
        [0, 1],
        [1, 2],
        ...
      ]
    },

    "dxf_file_url": "http://localhost:8000/media/patterns/1/pattern.dxf",
    "pdf_file_url": "http://localhost:8000/media/patterns/1/pattern.pdf",

    "created_at": "2025-01-14T10:00:00Z",
    "updated_at": "2025-01-14T10:01:23Z",
    "processed_at": "2025-01-14T10:01:23Z"
  }
}
```

## 🎯 Key Points for Backend Developers

### 1. Critical: Extract Actual Contours, Not Bounding Box

❌ **WRONG** (what was happening):
```python
# Creating a simple rectangle
vertices = [
    {"x": bbox_min_x, "y": bbox_min_y, "z": 0},
    {"x": bbox_min_x, "y": bbox_max_y, "z": 0},
    {"x": bbox_max_x, "y": bbox_max_y, "z": 0},
    {"x": bbox_max_x, "y": bbox_min_y, "z": 0},
]
# Result: 8 vertices (4 front + 4 back)
```

✅ **CORRECT** (what should happen):
```python
import cv2

# Extract actual garment outline
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
main_contour = max(contours, key=cv2.contourArea)
simplified = cv2.approxPolyDP(main_contour, epsilon, True)

# Result: 100-500 points following actual garment shape
```

### 2. Provide Extraction Metadata

This helps diagnose issues:
```python
outline_data = {
    "contours": [...],
    "main_contour_index": 0,
    "extraction_metadata": {
        "method": "adaptive_threshold",
        "contour_count": len(contours),
        "points_before_simplification": len(main_contour),
        "points_after_simplification": len(simplified),
        "processing_time_seconds": time.time() - start_time
    }
}
```

### 3. Save Intermediate Images

For debugging:
```python
# Save outline image
outline_img = cv2.drawContours(img.copy(), [main_contour], -1, (0, 255, 0), 2)
cv2.imwrite(outline_image_path, outline_img)
```

### 4. Status Progression

Use these exact status values:
```python
pattern.status = 'pending'            # Just uploaded
pattern.status = 'processing'          # Starting processing
pattern.status = 'outline_extracted'   # Outline done
pattern.status = 'pattern_generated'   # 2D pattern done
pattern.status = 'completed'           # Everything done
pattern.status = 'failed'              # Error occurred
```

### 5. Seamly2D Export

If implementing Seamly2D export:
```python
@api_view(['POST'])
def download_seamly2d(request, pattern_id):
    pattern = Pattern.objects.get(id=pattern_id)

    options = {
        'seam_allowance': request.data.get('seam_allowance', 15.0),
        'add_grainline': request.data.get('add_grainline', True),
        'add_notches': request.data.get('add_notches', True),
        'add_seam_allowance': request.data.get('add_seam_allowance', True),
        'piece_name': request.data.get('piece_name', pattern.name)
    }

    # Generate enhanced DXF with professional elements
    dxf_file = generate_seamly2d_dxf(pattern, options)

    return Response({
        'file_url': dxf_file.url,
        'filename': dxf_file.name
    })
```

## 📚 Related Documentation

- [API Integration Guide](API_INTEGRATION_GUIDE.md) - Complete API setup
- [Pattern Rendering Troubleshooting](PATTERN_RENDERING_TROUBLESHOOTING.md) - Debug guide
- [Pattern Service Types](src/services/patternService.ts) - TypeScript interfaces

## ✅ Testing Checklist

### Frontend Ready ✓
- [x] Pattern data types defined
- [x] API service methods implemented
- [x] Debug panel with metadata display
- [x] Console logging for all data
- [x] 2D and 3D viewers with debug logs
- [x] Processing screen with status polling
- [x] Seamly2D export support

### Backend Required
- [ ] Actual contour extraction (not bounding box)
- [ ] Outline data with extraction metadata
- [ ] 100+ points in pattern_2d_data
- [ ] 100+ vertices in pattern_3d_data
- [ ] Proper status progression
- [ ] Intermediate image saving (outline_image)
- [ ] SVG generation from contours
- [ ] Optional: Seamly2D enhanced DXF export

## 🚀 Ready for Integration

The frontend is **fully ready** to receive and display:
- ✅ Complete pattern data (100+ points)
- ✅ Outline extraction metadata
- ✅ Debug information at every step
- ✅ Real-time processing status
- ✅ Professional export options

Once your backend implements the proper contour extraction (not bounding boxes), the frontend will automatically display the correct pattern shapes in both 2D and 3D views!
