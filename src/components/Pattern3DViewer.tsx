import { useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import type { Pattern3DData } from '../services/patternService';

interface Pattern3DViewerProps {
  data: Pattern3DData;
  textureUrl?: string;
}

// Component to render the 3D mesh from pattern data
function PatternMesh({ data, showWireframe, showEdges, meshColor, edgeColor, opacity }: {
  data: Pattern3DData;
  showWireframe: boolean;
  showEdges: boolean;
  meshColor: string;
  edgeColor: string;
  opacity: number;
}) {
  // Create geometry from pattern data
  const geometry = new THREE.BufferGeometry();

  // Convert vertices to Float32Array
  const positions = new Float32Array(data.vertices.flatMap((v) => [v.x, v.y, v.z]));
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Convert faces to indices
  const indices = new Uint16Array(data.faces.flat());
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  // Compute normals for proper lighting
  geometry.computeVertexNormals();

  // Center the geometry
  geometry.computeBoundingBox();
  const center = new THREE.Vector3();
  geometry.boundingBox?.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={meshColor}
        wireframe={showWireframe}
        side={THREE.DoubleSide}
        flatShading={false}
        metalness={0.3}
        roughness={0.4}
        emissive={meshColor}
        emissiveIntensity={0.2}
        transparent={opacity < 1}
        opacity={opacity}
      />
      {showEdges && !showWireframe && (
        <lineSegments>
          <edgesGeometry args={[geometry]} />
          <lineBasicMaterial color={edgeColor} linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );
}

// Component to render textured plane (if texture URL is provided)
function TexturedPlane({ textureUrl }: { textureUrl: string }) {
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[500, 500]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

const Pattern3DViewer = ({ data, textureUrl }: Pattern3DViewerProps) => {
  const [showWireframe, setShowWireframe] = useState(false);
  const [showEdges, setShowEdges] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showTexture, setShowTexture] = useState(false);
  const [meshColor, setMeshColor] = useState('#ff6b6b');
  const [edgeColor, setEdgeColor] = useState('#2c3e50');
  const [opacity, setOpacity] = useState(0.9);

  return (
    <div className="flex h-full relative">
      {/* Main 3D Viewport */}
      <div className="flex-1 bg-gray-100">
        <Canvas>
          <PerspectiveCamera makeDefault position={[500, 500, 500]} />

          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[100, 100, 100]} intensity={0.8} />
          <directionalLight position={[-100, -100, -100]} intensity={0.3} />

          {/* Controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            autoRotate={autoRotate}
            autoRotateSpeed={2.0}
            enablePan
            enableZoom
            enableRotate
          />

          {/* Grid */}
          <Grid
            args={[1000, 20]}
            cellSize={50}
            cellThickness={1}
            cellColor="#6f6f6f"
            sectionSize={200}
            sectionThickness={1.5}
            sectionColor="#9d4b4b"
            fadeDistance={2000}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={false}
          />

          {/* Pattern Mesh */}
          {!showTexture && (
            <PatternMesh
              data={data}
              showWireframe={showWireframe}
              showEdges={showEdges}
              meshColor={meshColor}
              edgeColor={edgeColor}
              opacity={opacity}
            />
          )}

          {/* Textured Plane (if texture is available and enabled) */}
          {showTexture && textureUrl && (
            <TexturedPlane textureUrl={textureUrl} />
          )}
        </Canvas>
      </div>

      {/* View Options - Top Right */}
      <div className="absolute right-6 top-6 bg-white border border-gray-300 rounded-lg shadow-lg p-4 space-y-3 max-w-xs">
        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">View Options</h3>

        {/* Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showWireframe}
              onChange={(e) => setShowWireframe(e.target.checked)}
              disabled={showTexture}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Wireframe</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showEdges}
              onChange={(e) => setShowEdges(e.target.checked)}
              disabled={showTexture}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Show Edges</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Auto Rotate</span>
          </label>
          {textureUrl && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTexture}
                onChange={(e) => setShowTexture(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Show Texture</span>
            </label>
          )}
        </div>

        {/* Color Controls */}
        {!showTexture && (
          <div className="space-y-3 pt-2 border-t">
            <h4 className="text-xs font-semibold text-gray-700">Colors</h4>

            {/* Mesh Color */}
            <div className="space-y-1">
              <label className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-600">Mesh Color</span>
                <input
                  type="color"
                  value={meshColor}
                  onChange={(e) => setMeshColor(e.target.value)}
                  className="w-12 h-6 rounded cursor-pointer border border-gray-300"
                />
              </label>
              {/* Preset colors for mesh */}
              <div className="flex gap-1">
                {['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#e74c3c', '#9b59b6', '#2ecc71', '#34495e'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setMeshColor(color)}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Edge Color */}
            {showEdges && (
              <div className="space-y-1">
                <label className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600">Edge Color</span>
                  <input
                    type="color"
                    value={edgeColor}
                    onChange={(e) => setEdgeColor(e.target.value)}
                    className="w-12 h-6 rounded cursor-pointer border border-gray-300"
                  />
                </label>
                {/* Preset colors for edges */}
                <div className="flex gap-1">
                  {['#2c3e50', '#000000', '#ffffff', '#e74c3c', '#f39c12', '#3498db'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setEdgeColor(color)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Opacity Slider */}
            <div className="space-y-1">
              <label className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-600">Opacity</span>
                <span className="text-xs font-mono text-gray-500">{Math.round(opacity * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3D Info - Bottom Right */}
      <div className="absolute right-6 bottom-6 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-2">
        <div className="text-xs text-gray-600 space-y-1">
          <div>Vertices: {data.vertices.length}</div>
          <div>Faces: {data.faces.length}</div>
          <div>Edges: {data.edges.length}</div>
        </div>
      </div>

      {/* Instructions - Bottom Left */}
      <div className="absolute left-6 bottom-6 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-2">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold mb-2">Controls:</div>
          <div>• Left Click + Drag: Rotate</div>
          <div>• Right Click + Drag: Pan</div>
          <div>• Scroll: Zoom</div>
        </div>
      </div>
    </div>
  );
};

export default Pattern3DViewer;
