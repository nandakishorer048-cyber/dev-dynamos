import React, { useRef, useEffect, useState } from 'react';
import { Eye, Flame, Target, Sliders, Layers, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface GradCamHotspot {
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  radiusPercent: number; // 5 - 40
  intensity: number; // 0.1 - 1.0
  label?: string;
  biradsCategory?: string;
  confidence?: number;
}

interface GradCamViewerProps {
  imageSrc: string;
  hotspots?: GradCamHotspot[];
  title?: string;
  biradsCategory?: string;
  malignancyRisk?: string | number;
}

export function GradCamViewer({
  imageSrc,
  hotspots = [],
  title = "Mammogram Analysis",
  biradsCategory = "BI-RADS 4 - Suspicious",
  malignancyRisk = "68.5%"
}: GradCamViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [opacity, setOpacity] = useState<number>(0.65);
  const [viewMode, setViewMode] = useState<'heatmap' | 'bbox' | 'original'>('heatmap');
  const [colorScheme, setColorScheme] = useState<'jet' | 'thermal' | 'plasma'>('jet');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 600, height: 600 });

  // Default fallback hotspot if none provided
  const activeHotspots: GradCamHotspot[] = hotspots.length > 0 ? hotspots : [
    { xPercent: 52, yPercent: 41, radiusPercent: 22, intensity: 0.92, label: 'Upper Outer Quadrant Mass', confidence: 91.4 },
    { xPercent: 38, yPercent: 62, radiusPercent: 14, intensity: 0.65, label: 'Microcalcification Cluster', confidence: 74.2 }
  ];

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
  }, [imageSrc]);

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. Draw base mammogram image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (viewMode === 'original') return;

      if (viewMode === 'heatmap') {
        // 2. Create offscreen canvas for Grad-CAM heat intensity map
        const heatCanvas = document.createElement('canvas');
        heatCanvas.width = canvas.width;
        heatCanvas.height = canvas.height;
        const heatCtx = heatCanvas.getContext('2d');

        if (heatCtx) {
          // Fill with black (0 activation)
          heatCtx.fillStyle = 'rgba(0, 0, 0, 1)';
          heatCtx.fillRect(0, 0, heatCanvas.width, heatCanvas.height);

          // Draw radial gradients for each hotspot
          activeHotspots.forEach(spot => {
            const centerX = (spot.xPercent / 100) * heatCanvas.width;
            const centerY = (spot.yPercent / 100) * heatCanvas.height;
            const radius = (spot.radiusPercent / 100) * Math.min(heatCanvas.width, heatCanvas.height);

            const radGrad = heatCtx.createRadialGradient(
              centerX, centerY, 0,
              centerX, centerY, radius
            );

            const val = Math.min(1, Math.max(0.1, spot.intensity));
            radGrad.addColorStop(0, `rgba(255, 255, 255, ${val})`);
            radGrad.addColorStop(0.4, `rgba(200, 200, 200, ${val * 0.7})`);
            radGrad.addColorStop(0.7, `rgba(90, 90, 90, ${val * 0.3})`);
            radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            heatCtx.fillStyle = radGrad;
            heatCtx.beginPath();
            heatCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            heatCtx.fill();
          });

          // Extract grayscale intensity data
          const heatImgData = heatCtx.getImageData(0, 0, heatCanvas.width, heatCanvas.height);
          const pixels = heatImgData.data;

          // Color map converter (Jet / Thermal / Plasma)
          const getHeatColor = (v: number) => {
            // v in [0, 255]
            const norm = v / 255;
            let r = 0, g = 0, b = 0;

            if (colorScheme === 'jet') {
              if (norm < 0.25) {
                b = Math.floor(norm * 4 * 255);
              } else if (norm < 0.5) {
                g = Math.floor((norm - 0.25) * 4 * 255);
                b = 255 - Math.floor((norm - 0.25) * 4 * 255);
              } else if (norm < 0.75) {
                r = Math.floor((norm - 0.5) * 4 * 255);
                g = 255;
              } else {
                r = 255;
                g = 255 - Math.floor((norm - 0.75) * 4 * 255);
              }
            } else if (colorScheme === 'thermal') {
              r = Math.floor(Math.min(255, norm * 1.5 * 255));
              g = Math.floor(Math.max(0, (norm - 0.3) * 1.4 * 255));
              b = Math.floor(Math.max(0, (norm - 0.7) * 3.3 * 255));
            } else {
              // Plasma
              r = Math.floor(Math.sin(norm * Math.PI) * 255);
              g = Math.floor(Math.sin(norm * Math.PI - Math.PI / 4) * 255);
              b = Math.floor(Math.cos(norm * Math.PI) * 255);
            }

            return { r: Math.max(0, Math.min(255, r)), g: Math.max(0, Math.min(255, g)), b: Math.max(0, Math.min(255, b)) };
          };

          // Apply color map and alpha blending onto base image
          const baseImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const basePixels = baseImageData.data;

          for (let i = 0; i < pixels.length; i += 4) {
            const intensity = pixels[i]; // Gray level
            if (intensity > 15) {
              const heatColor = getHeatColor(intensity);
              const alpha = (intensity / 255) * opacity;

              // Alpha blend heat map color onto base mammogram
              basePixels[i] = Math.floor(basePixels[i] * (1 - alpha) + heatColor.r * alpha);
              basePixels[i + 1] = Math.floor(basePixels[i + 1] * (1 - alpha) + heatColor.g * alpha);
              basePixels[i + 2] = Math.floor(basePixels[i + 2] * (1 - alpha) + heatColor.b * alpha);
            }
          }

          ctx.putImageData(baseImageData, 0, 0);
        }
      }

      if (viewMode === 'bbox' || viewMode === 'heatmap') {
        // Draw ROI boxes and target markers
        activeHotspots.forEach((spot, index) => {
          const centerX = (spot.xPercent / 100) * canvas.width;
          const centerY = (spot.yPercent / 100) * canvas.height;
          const radius = (spot.radiusPercent / 100) * Math.min(canvas.width, canvas.height);

          const boxWidth = radius * 1.8;
          const boxHeight = radius * 1.8;
          const boxX = centerX - boxWidth / 2;
          const boxY = centerY - boxHeight / 2;

          // Bounding Box
          ctx.strokeStyle = index === 0 ? '#ef4444' : '#f59e0b';
          ctx.lineWidth = Math.max(2, Math.floor(canvas.width / 200));
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

          // Center Reticle
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
          ctx.fillStyle = index === 0 ? '#ef4444' : '#f59e0b';
          ctx.fill();

          // Label Box
          const labelText = spot.label || `ROI #${index + 1} (${spot.confidence || 85}% Grad-CAM Activation)`;
          ctx.font = `bold ${Math.max(12, Math.floor(canvas.width / 40))}px sans-serif`;
          const textWidth = ctx.measureText(labelText).width;
          const pad = 6;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(boxX, Math.max(0, boxY - 26), textWidth + pad * 2, 22);

          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, boxX + pad, Math.max(16, boxY - 10));
        });
      }
    };
  }, [imageLoaded, imageSrc, opacity, viewMode, colorScheme, activeHotspots]);

  return (
    <div className="space-y-4 rounded-2xl bg-slate-950 p-4 text-white border border-slate-800 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base text-slate-100 flex items-center gap-2">
              Grad-CAM Heatmap Visualization
              <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs">
                AI Deep Learning ROI
              </Badge>
            </h3>
            <p className="text-xs text-slate-400">
              Breast Cancer Screening • Heatmap activation highlights suspicious tissue density & lesions
            </p>
          </div>
        </div>

        {/* BIRADS Badge */}
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs py-1 px-3 shadow-md">
            {biradsCategory}
          </Badge>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs">
        {/* View Mode Buttons */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-blue-400" /> View Overlay Mode
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('heatmap')}
              className={`py-1.5 px-2 rounded-md font-bold transition-all text-center ${
                viewMode === 'heatmap' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setViewMode('bbox')}
              className={`py-1.5 px-2 rounded-md font-bold transition-all text-center ${
                viewMode === 'bbox' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ROI Box
            </button>
            <button
              onClick={() => setViewMode('original')}
              className={`py-1.5 px-2 rounded-md font-bold transition-all text-center ${
                viewMode === 'original' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Original
            </button>
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-400 font-bold">
            <span className="flex items-center gap-1">
              <Sliders className="h-3.5 w-3.5 text-amber-400" /> Heatmap Intensity
            </span>
            <span className="text-white font-mono">{Math.round(opacity * 100)}%</span>
          </div>
          <Slider
            value={[opacity * 100]}
            min={10}
            max={100}
            step={5}
            onValueChange={(vals) => setOpacity(vals[0] / 100)}
            disabled={viewMode === 'original'}
            className="py-1"
          />
        </div>

        {/* Color Palette Selector */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Color Map Scheme
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setColorScheme('jet')}
              className={`py-1.5 px-2 rounded-md font-bold transition-all text-center ${
                colorScheme === 'jet' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Jet Spectrum
            </button>
            <button
              onClick={() => setColorScheme('thermal')}
              className={`py-1.5 px-2 rounded-md font-bold transition-all text-center ${
                colorScheme === 'thermal' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Thermal
            </button>
            <button
              onClick={() => setColorScheme('plasma')}
              className={`py-1.5 px-2 rounded-md font-bold transition-all text-center ${
                colorScheme === 'plasma' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Plasma
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Screen */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl bg-black border border-slate-800 flex items-center justify-center min-h-[320px] max-h-[500px]"
      >
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-[480px] object-contain rounded-lg shadow-inner"
        />

        {/* Heatmap Legend Overlay */}
        {viewMode === 'heatmap' && (
          <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold space-y-1 shadow-lg">
            <div className="text-slate-400">Grad-CAM Activation Scale</div>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400">Low</span>
              <div className="h-2.5 w-24 rounded-full bg-gradient-to-r from-blue-600 via-green-500 via-yellow-400 to-red-600 border border-white/20" />
              <span className="text-red-400 font-extrabold">High (Mass)</span>
            </div>
          </div>
        )}
      </div>

      {/* Hotspots Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
        {activeHotspots.map((spot, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              i === 0
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${i === 0 ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'}`}>
              <Target className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between font-bold">
                <span>{spot.label || `Target Region #${i + 1}`}</span>
                <span className="font-mono text-xs underline">
                  {spot.confidence || Math.round(spot.intensity * 100)}% Activation
                </span>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                Localization: ({spot.xPercent}%, {spot.yPercent}%) • Radius ~{spot.radiusPercent}% • Grad-CAM Peak: {(spot.intensity * 1.0).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
