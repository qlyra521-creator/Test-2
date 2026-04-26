import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCcw } from 'lucide-react';

interface Props {
  src: string;
  onDone: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

function centerAspectCrop(w: number, h: number) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, w / h, w, h), w, h);
}

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0,
    canvas.width, canvas.height,
  );
  return canvas.toDataURL('image/jpeg', 0.92);
}

export default function ImageCropModal({ src, onDone, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  const handleDone = () => {
    if (!completedCrop || !imgRef.current) { onDone(src); return; }
    onDone(getCroppedImg(imgRef.current, completedCrop));
  };

  const ASPECT_OPTIONS: { label: string; value: number | undefined }[] = [
    { label: '自由 Free', value: undefined },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:4', value: 3 / 4 },
  ];

  return (
    <div className="modal-overlay" style={{ zIndex: 400 }} onClick={onCancel}>
      <div
        className="w-full max-w-lg animate-slide-up flex flex-col overflow-hidden"
        style={{
          background: 'rgba(255, 251, 247, 0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 40px rgba(80, 60, 100, 0.18)',
          maxHeight: '90vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(200,190,210,0.2)' }}>
          <span className="font-serif text-lg font-light text-primary">裁剪照片 · Crop Photo</span>
          <button onClick={onCancel} className="text-secondary hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Aspect ratio selector */}
        <div className="flex items-center gap-2 px-5 py-2.5 flex-wrap" style={{ borderBottom: '1px solid rgba(200,190,210,0.15)' }}>
          <span className="text-xs text-secondary/60 mr-1">比例</span>
          {ASPECT_OPTIONS.map(opt => (
            <button
              key={opt.label}
              onClick={() => {
                setAspect(opt.value);
                if (imgRef.current) {
                  const { width, height } = imgRef.current;
                  if (opt.value) {
                    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, opt.value, width, height), width, height));
                  } else {
                    setCrop(centerAspectCrop(width, height));
                  }
                }
              }}
              className="px-2.5 py-1 rounded-full text-xs transition-all"
              style={
                aspect === opt.value
                  ? { background: 'linear-gradient(135deg, #C97EA0, #7DAFC8)', color: 'white' }
                  : { background: 'rgba(210,195,225,0.25)', color: 'var(--text-secondary)' }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Crop area */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center" style={{ minHeight: 200 }}>
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            onComplete={c => setCompletedCrop(c)}
            aspect={aspect}
            style={{ maxHeight: '55vh' }}
          >
            <img
              ref={imgRef}
              src={src}
              onLoad={onImageLoad}
              style={{ maxHeight: '55vh', maxWidth: '100%', display: 'block' }}
              alt="crop"
            />
          </ReactCrop>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(200,190,210,0.2)' }}>
          <button
            onClick={() => { setCrop(undefined); setCompletedCrop(undefined); }}
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors"
          >
            <RotateCcw size={13} /> 重置 Reset
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="text-sm text-secondary hover:text-primary transition-colors">
              取消 Cancel
            </button>
            <button
              onClick={handleDone}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C97EA0, #7DAFC8)' }}
            >
              <Check size={14} /> 完成 Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
