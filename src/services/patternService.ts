// Pattern API Service
import api from './api';

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface PatternSegment {
  id: number;
  start: Point2D;
  end: Point2D;
  length: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Pattern2DData {
  points: Point2D[];
  segments: PatternSegment[];
  total_perimeter: number;
  area: number;
  bounding_box: BoundingBox;
}

export interface Pattern3DData {
  vertices: Point3D[];
  faces: number[][];
  edges: number[][];
}

export interface PatternMeasurement {
  id: number;
  measurement_type: string;
  value: number;
  unit: string;
  created_at: string;
}

export interface Pattern {
  id: number;
  user: number;
  user_email: string;
  name: string;
  description?: string;
  original_image: string;
  original_image_url: string;
  outline_image?: string;
  outline_image_url?: string;
  outline_data?: OutlineData;
  pattern_2d_svg?: string;
  pattern_2d_svg_url?: string;
  pattern_2d_data?: Pattern2DData;
  pattern_3d_data?: Pattern3DData;
  dxf_file?: string;
  dxf_file_url?: string;
  pdf_file?: string;
  pdf_file_url?: string;
  status: 'pending' | 'processing' | 'outline_extracted' | 'pattern_generated' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  is_processing: boolean;
  is_completed: boolean;
  is_failed: boolean;
  measurements: PatternMeasurement[];
}

export interface PatternResponse {
  success: boolean;
  pattern: Pattern;
}

export interface Seamly2DOptions {
  seam_allowance?: number;
  add_grainline?: boolean;
  add_notches?: boolean;
  add_seam_allowance?: boolean;
  piece_name?: string;
}

export interface DownloadResponse {
  file_url: string;
  filename: string;
}

export interface OutlineExtractionMetadata {
  method: string;
  contour_count: number;
  points_before_simplification: number;
  points_after_simplification: number;
  processing_time_seconds: number;
}

export interface OutlineData {
  contours: Point2D[][];
  main_contour_index: number;
  extraction_metadata: OutlineExtractionMetadata;
}

export interface Seamly2DOptions {
  seam_allowance?: number;
  add_grainline?: boolean;
  add_notches?: boolean;
  add_seam_allowance?: boolean;
  piece_name?: string;
}

export interface DownloadResponse {
  file_url: string;
  filename: string;
}

class PatternService {
  private baseUrl = '/api/patterns';

  /**
   * Get pattern by ID
   */
  async getPattern(id: number): Promise<PatternResponse> {
    const response = await api.get<PatternResponse>(`${this.baseUrl}/${id}/`);
    return response.data;
  }

  /**
   * Get all patterns
   */
  async getPatterns(): Promise<{ results: Pattern[]; count: number }> {
    const response = await api.get<{ results: Pattern[]; count: number }>(`${this.baseUrl}/`);
    return response.data;
  }

  /**
   * Get 3D preview data for Three.js
   */
  async get3DPreview(id: number): Promise<{ pattern_3d_data: Pattern3DData }> {
    const response = await api.get<{ pattern_3d_data: Pattern3DData }>(
      `${this.baseUrl}/${id}/preview-3d/`
    );
    return response.data;
  }

  /**
   * Download DXF file
   */
  async downloadDXF(id: number): Promise<DownloadResponse> {
    const response = await api.get<DownloadResponse>(
      `${this.baseUrl}/${id}/download-dxf/`
    );
    return response.data;
  }

  /**
   * Download PDF file
   */
  async downloadPDF(id: number): Promise<DownloadResponse> {
    const response = await api.get<DownloadResponse>(
      `${this.baseUrl}/${id}/download-pdf/`
    );
    return response.data;
  }

  /**
   * Download Seamly2D enhanced DXF with professional garment construction elements
   */
  async downloadSeamly2D(id: number, options: Seamly2DOptions): Promise<DownloadResponse> {
    const response = await api.post<DownloadResponse>(
      `${this.baseUrl}/${id}/download-seamly2d/`,
      options
    );
    return response.data;
  }

  /**
   * Create new pattern
   */
  async createPattern(formData: FormData): Promise<PatternResponse> {
    const response = await api.post<PatternResponse>(`${this.baseUrl}/create/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Reprocess pattern
   */
  async reprocessPattern(id: number): Promise<PatternResponse> {
    const response = await api.post<PatternResponse>(`${this.baseUrl}/${id}/reprocess/`);
    return response.data;
  }

  /**
   * Update pattern with size options
   */
  async updatePattern(
    id: number,
    data: { region?: string; size?: string }
  ): Promise<PatternResponse> {
    const response = await api.patch<PatternResponse>(`${this.baseUrl}/${id}/`, data);
    return response.data;
  }

  /**
   * Delete pattern
   */
  async deletePattern(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}/`);
  }
}

export default new PatternService();
