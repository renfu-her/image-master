import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Upload, Download, Crop, RotateCw, RotateCcw, X, RefreshCw, 
  Stamp, Type, Image as ImageIcon, Palette, LayoutGrid 
} from 'lucide-react';

type AspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '9:16';
type WatermarkPosition = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const BasicEditor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'crop';
  const isRotateMode = mode === 'rotate';
  const isWatermarkMode = mode === 'watermark';
  
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  // Crop State
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [aspect, setAspect] = useState<AspectRatio>('free');
  const [crop, setCrop] = useState<CropRect>({ x: 10, y: 10, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startCrop, setStartCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });

  // Rotate State
  const [rotation, setRotation] = useState(0);

  // Watermark State
  const [wmType, setWmType] = useState<'text' | 'image'>('text');
  const [wmText, setWmText] = useState('ImgMaster');
  const [wmImage, setWmImage] = useState<HTMLImageElement | null>(null);
  const [wmOpacity, setWmOpacity] = useState(80);
  const [wmSize, setWmSize] = useState(20); // Percentage of image width (1-100)
  const [wmColor, setWmColor] = useState('#ffffff');
  const [wmPosition, setWmPosition] = useState<WatermarkPosition>('bottom-right');
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wmFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setImage(img);
        setRotation(0);
        // Initial crop center
        if (containerRef.current) {
            const cw = containerRef.current.clientWidth;
            const ch = containerRef.current.clientHeight;
            const w = cw * 0.8;
            const h = ch * 0.6; 
            setCrop({ x: (cw - w)/2, y: (ch - h)/2, width: w, height: h });
        }
      };
    }
  };

  const handleWmFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      const img = new Image();
      img.src = url;
      img.onload = () => setWmImage(img);
    }
  };

  // Observe image dimensions for accurate watermark preview
  useEffect(() => {
      if (!imgRef.current) return;
      
      const updateDimensions = () => {
          if (imgRef.current) {
              setImgDimensions({
                  width: imgRef.current.clientWidth,
                  height: imgRef.current.clientHeight
              });
          }
      };

      const observer = new ResizeObserver(updateDimensions);
      observer.observe(imgRef.current);
      
      // Initial call
      updateDimensions();
      // Add a slight delay for image loading to settle
      setTimeout(updateDimensions, 100);

      return () => observer.disconnect();
  }, [image, rotation]); // Re-run when image or rotation changes

  // --- Crop Interaction Logic ---
  const getClientPos = (e: ReactMouseEvent | ReactTouchEvent | globalThis.MouseEvent | globalThis.TouchEvent) => {
    if ('touches' in e) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as any).clientX, y: (e as any).clientY };
  };

  const handleStart = (e: ReactMouseEvent | ReactTouchEvent, handle: string) => {
    if (mode !== 'crop') return; // Only enable drag in crop mode

    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragHandle(handle);
    setStartPos(getClientPos(e));
    setStartCrop({ ...crop });
  };

  useEffect(() => {
    const handleMove = (e: globalThis.MouseEvent | globalThis.TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      if (e.cancelable) e.preventDefault();

      const currentPos = getClientPos(e);
      const dx = currentPos.x - startPos.x;
      const dy = currentPos.y - startPos.y;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxWidth = containerRect.width;
      const maxHeight = containerRect.height;

      let newCrop = { ...startCrop };

      if (dragHandle === 'move') {
        newCrop.x = Math.max(0, Math.min(startCrop.x + dx, maxWidth - startCrop.width));
        newCrop.y = Math.max(0, Math.min(startCrop.y + dy, maxHeight - startCrop.height));
      } else {
        if (dragHandle?.includes('e')) {
            newCrop.width = Math.max(40, Math.min(startCrop.width + dx, maxWidth - startCrop.x));
            if (aspect !== 'free') newCrop.height = newCrop.width / (parseInt(aspect.split(':')[0]) / parseInt(aspect.split(':')[1]));
        }
        if (dragHandle?.includes('s')) {
            newCrop.height = Math.max(40, Math.min(startCrop.height + dy, maxHeight - startCrop.y));
            if (aspect !== 'free') newCrop.width = newCrop.height * (parseInt(aspect.split(':')[0]) / parseInt(aspect.split(':')[1]));
        }
        if (dragHandle?.includes('se')) {
             newCrop.width = Math.max(40, startCrop.width + dx);
             newCrop.height = Math.max(40, startCrop.height + dy);
             if (aspect !== 'free') {
                 const [aw, ah] = aspect.split(':').map(Number);
                 newCrop.height = newCrop.width / (aw / ah);
             }
        }
      }
      setCrop(newCrop);
    };

    const handleEnd = () => {
      setIsDragging(false);
      setDragHandle(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, startPos, startCrop, dragHandle, aspect]);

  const handleAspectChange = (newAspect: AspectRatio) => {
      setAspect(newAspect);
      if (newAspect !== 'free') {
          const [aw, ah] = newAspect.split(':').map(Number);
          const ratio = aw / ah;
          const newH = crop.width / ratio;
          
          if (containerRef.current && newH <= containerRef.current.clientHeight) {
               setCrop(c => ({ ...c, height: newH }));
          } else {
               setCrop(c => ({ ...c, width: c.height * ratio }));
          }
      }
  };

  const handleRotate = (direction: 'left' | 'right') => {
      setRotation(prev => {
          const delta = direction === 'left' ? -90 : 90;
          return (prev + delta) % 360;
      });
  };

  const handleDownload = () => {
    if (!image) return;

    if (isWatermarkMode) {
        // --- Watermark Download Logic ---
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw main image
        ctx.drawImage(image, 0, 0);

        // Watermark settings
        ctx.globalAlpha = wmOpacity / 100;
        
        const paddingX = canvas.width * 0.05; // 5% padding
        const paddingY = canvas.height * 0.05;

        let x = 0, y = 0;

        if (wmType === 'text' && wmText) {
            // Text Watermark
            // wmSize is percentage of image width
            const fontSize = (canvas.width * wmSize) / 100; 
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = wmColor;
            ctx.textBaseline = 'top';
            
            // Measure
            const metrics = ctx.measureText(wmText);
            const txtW = metrics.width;
            const txtH = fontSize; // Approximate height

            // Calculate Position
            if (wmPosition.includes('left')) x = paddingX;
            else if (wmPosition.includes('right')) x = canvas.width - txtW - paddingX;
            else x = (canvas.width - txtW) / 2; // center

            if (wmPosition.includes('top')) y = paddingY;
            else if (wmPosition.includes('bottom')) y = canvas.height - txtH - paddingY;
            else y = (canvas.height - txtH) / 2; // center

            // Shadow for better visibility
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.fillText(wmText, x, y);

        } else if (wmType === 'image' && wmImage) {
            // Image Watermark
            const targetW = (canvas.width * wmSize) / 100; 
            const ratio = wmImage.naturalWidth / wmImage.naturalHeight;
            const targetH = targetW / ratio;

            // Calculate Position
            if (wmPosition.includes('left')) x = paddingX;
            else if (wmPosition.includes('right')) x = canvas.width - targetW - paddingX;
            else x = (canvas.width - targetW) / 2;

            if (wmPosition.includes('top')) y = paddingY;
            else if (wmPosition.includes('bottom')) y = canvas.height - targetH - paddingY;
            else y = (canvas.height - targetH) / 2;

            ctx.drawImage(wmImage, x, y, targetW, targetH);
        }

        const link = document.createElement('a');
        link.download = `watermarked-${Date.now()}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.92);
        link.click();

    } else if (isRotateMode) {
        // --- Rotate Download Logic ---
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rads = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rads));
        const cos = Math.abs(Math.cos(rads));

        const newWidth = image.naturalWidth * cos + image.naturalHeight * sin;
        const newHeight = image.naturalWidth * sin + image.naturalHeight * cos;

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(rads);
        ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

        const link = document.createElement('a');
        link.download = `rotated-${Date.now()}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.92);
        link.click();

    } else {
        // --- Crop Download Logic ---
        if (!containerRef.current) return;
        
        const displayedRect = containerRef.current.getBoundingClientRect();
        const imgRatio = image.naturalWidth / image.naturalHeight;
        const containerRatio = displayedRect.width / displayedRect.height;
        
        let renderW, renderH, offsetX = 0, offsetY = 0;
        
        if (imgRatio > containerRatio) {
            renderW = displayedRect.width;
            renderH = renderW / imgRatio;
            offsetY = (displayedRect.height - renderH) / 2;
        } else {
            renderH = displayedRect.height;
            renderW = renderH * imgRatio;
            offsetX = (displayedRect.width - renderW) / 2;
        }
        
        const scale = image.naturalWidth / renderW;
        
        const cropXRel = crop.x - offsetX;
        const cropYRel = crop.y - offsetY;
        
        const canvas = document.createElement('canvas');
        canvas.width = crop.width * scale;
        canvas.height = crop.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(
            image,
            cropXRel * scale, cropYRel * scale, crop.width * scale, crop.height * scale,
            0, 0, canvas.width, canvas.height
        );
        
        const link = document.createElement('a');
        link.download = `cropped-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
  };

  // Helper for rendering watermark preview styles
  const getWatermarkStyle = (): React.CSSProperties => {
      const style: React.CSSProperties = {
          position: 'absolute',
          opacity: wmOpacity / 100,
          zIndex: 20,
      };

      // Position logic for CSS absolute
      // Using percentage padding (5%)
      const padding = '5%';
      
      if (wmPosition.includes('top')) style.top = padding;
      if (wmPosition.includes('bottom')) style.bottom = padding;
      if (wmPosition === 'center-left' || wmPosition === 'center' || wmPosition === 'center-right') {
          style.top = '50%';
          style.transform = style.transform ? `${style.transform} translateY(-50%)` : 'translateY(-50%)';
      }

      if (wmPosition.includes('left')) style.left = padding;
      if (wmPosition.includes('right')) style.right = padding;
      if (wmPosition === 'top-center' || wmPosition === 'center' || wmPosition === 'bottom-center') {
          style.left = '50%';
          style.transform = style.transform ? `${style.transform} translateX(-50%)` : 'translateX(-50%)';
      }

      // Size logic: Sync with Download logic using rendered image dimensions
      // If imgDimensions is not ready, default to 20px
      const baseWidth = imgDimensions.width > 0 ? imgDimensions.width : 500;
      const sizePx = (baseWidth * wmSize) / 100;

      if (wmType === 'text') {
          style.color = wmColor;
          style.fontSize = `${sizePx}px`; 
          style.fontWeight = 'bold';
          style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
          style.whiteSpace = 'nowrap';
          style.lineHeight = '1';
      } else {
          style.width = `${sizePx}px`;
          style.height = 'auto';
      }

      return style;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-6 flex flex-col transition-colors duration-300">
      <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            {isRotateMode ? <RotateCw className="text-teal-500" /> : 
             isWatermarkMode ? <Stamp className="text-blue-500" /> :
             <Crop className="text-cyan-500" />}
            
            <span className="hidden sm:inline">
                {isRotateMode ? '圖片旋轉' : isWatermarkMode ? '新增浮水印' : '圖片裁剪'}
            </span>
            <span className="sm:hidden">
                {isRotateMode ? '旋轉' : isWatermarkMode ? '浮水印' : '裁剪'}
            </span>
          </h1>
          <div className="flex gap-2 md:gap-4">
            {image && (
                <button 
                  onClick={() => setImage(null)} 
                  className="bg-white dark:bg-gray-800 p-2 rounded-lg text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
            )}
            <button 
              onClick={handleDownload}
              disabled={!image}
              className="bg-primary hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 text-sm md:text-base shadow-lg shadow-indigo-900/20"
            >
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">下載結果</span><span className="sm:hidden">下載</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {!image ? (
           <div 
             className="flex-grow border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[50vh] shadow-sm"
             onClick={() => fileInputRef.current?.click()}
           >
             <Upload className="w-12 h-12 md:w-16 md:h-16 text-gray-400 dark:text-gray-600 mb-4" />
             <p className="text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300">
                 {isRotateMode ? '選擇圖片開始旋轉' : isWatermarkMode ? '選擇圖片加浮水印' : '選擇圖片開始裁剪'}
             </p>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
           </div>
        ) : (
           <div className="flex flex-col lg:flex-row gap-4 md:gap-6 flex-grow min-h-0">
              {/* Canvas Area */}
              <div className="flex-grow bg-gray-100 dark:bg-black/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative touch-none select-none flex items-center justify-center h-[50vh] lg:h-auto transition-colors">
                 
                 {/* 
                    Wrapper div: This ensures we have a reference context that tightly wraps the image 
                    so absolute positioning of watermarks works relative to the image borders.
                 */}
                 <div ref={containerRef} className="relative inline-flex items-center justify-center max-w-full max-h-full">
                    <img 
                        ref={imgRef}
                        src={image.src} 
                        alt="Target" 
                        className={`max-w-full max-h-full object-contain pointer-events-none transition-transform duration-300 ease-in-out`}
                        style={{
                            transform: isRotateMode ? `rotate(${rotation}deg)` : 'none'
                        }}
                    />

                    {/* Watermark Overlay */}
                    {isWatermarkMode && (
                        wmType === 'text' ? (
                            <div style={getWatermarkStyle()} className="pointer-events-none">
                                {wmText}
                            </div>
                        ) : (
                            wmImage && (
                                <img 
                                    src={wmImage.src} 
                                    alt="watermark" 
                                    style={getWatermarkStyle()}
                                    className="pointer-events-none object-contain"
                                />
                            )
                        )
                    )}
                    
                    {/* Crop Overlay */}
                    {mode === 'crop' && (
                        <div 
                            className="absolute border-2 border-white cursor-move z-10 box-content touch-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] dark:shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
                            style={{
                                left: crop.x,
                                top: crop.y,
                                width: crop.width,
                                height: crop.height,
                            }}
                            onMouseDown={(e) => handleStart(e, 'move')}
                            onTouchStart={(e) => handleStart(e, 'move')}
                        >
                             <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-50">
                                 <div className="border-r border-b border-white/30"></div>
                                 <div className="border-r border-b border-white/30"></div>
                                 <div className="border-b border-white/30"></div>
                                 <div className="border-r border-b border-white/30"></div>
                                 <div className="border-r border-b border-white/30"></div>
                                 <div className="border-b border-white/30"></div>
                                 <div className="border-r border-white/30"></div>
                                 <div className="border-r border-white/30"></div>
                             </div>
                             <div 
                                className="absolute -bottom-3 -right-3 w-8 h-8 flex items-center justify-center cursor-se-resize z-20"
                                onMouseDown={(e) => handleStart(e, 'se')}
                                onTouchStart={(e) => handleStart(e, 'se')}
                             >
                                <div className="w-4 h-4 bg-primary border-2 border-white rounded-full"></div>
                             </div>
                              <div 
                                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center cursor-s-resize z-20 lg:hidden"
                                onMouseDown={(e) => handleStart(e, 's')}
                                onTouchStart={(e) => handleStart(e, 's')}
                             >
                                <div className="w-6 h-2 bg-white/50 rounded-full"></div>
                             </div>
                        </div>
                    )}
                 </div>
              </div>

              {/* Sidebar Controls */}
              <div className="w-full lg:w-72 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 lg:h-fit space-y-6 transition-colors shadow-sm overflow-y-auto max-h-[40vh] lg:max-h-none">
                  
                  {isWatermarkMode && (
                      <div className="space-y-6">
                           {/* Type Toggle */}
                           <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                               <button 
                                 onClick={() => setWmType('text')}
                                 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${wmType === 'text' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-500'}`}
                               >
                                   <Type className="w-4 h-4" /> 文字
                               </button>
                               <button 
                                 onClick={() => setWmType('image')}
                                 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${wmType === 'image' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-500'}`}
                               >
                                   <ImageIcon className="w-4 h-4" /> 圖片
                               </button>
                           </div>

                           {/* Content Input */}
                           {wmType === 'text' ? (
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 mb-2">浮水印文字</label>
                                   <input 
                                     type="text" 
                                     value={wmText}
                                     onChange={(e) => setWmText(e.target.value)}
                                     className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                   />
                                   <div className="mt-3">
                                       <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-2"><Palette className="w-3 h-3" /> 文字顏色</label>
                                       <div className="flex gap-2 flex-wrap">
                                           {['#ffffff', '#000000', '#ef4444', '#f59e0b', '#10b981', '#3b82f6'].map(c => (
                                               <button 
                                                 key={c}
                                                 onClick={() => setWmColor(c)}
                                                 className={`w-6 h-6 rounded-full border border-gray-300 ${wmColor === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                                 style={{ backgroundColor: c }}
                                               />
                                           ))}
                                            <input 
                                              type="color" 
                                              value={wmColor}
                                              onChange={(e) => setWmColor(e.target.value)}
                                              className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                                            />
                                       </div>
                                   </div>
                               </div>
                           ) : (
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 mb-2">上傳浮水印圖片</label>
                                   <button 
                                     onClick={() => wmFileInputRef.current?.click()}
                                     className="w-full border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center gap-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                   >
                                       {wmImage ? (
                                           <img src={wmImage.src} className="h-10 object-contain" alt="preview" />
                                       ) : (
                                           <>
                                            <Upload className="w-5 h-5" />
                                            <span className="text-xs">選擇圖片 (PNG 尤佳)</span>
                                           </>
                                       )}
                                   </button>
                                   <input ref={wmFileInputRef} type="file" hidden accept="image/*" onChange={handleWmFileChange} />
                               </div>
                           )}

                           {/* Common Controls */}
                           <div className="space-y-4">
                               <div>
                                   <label className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                                       <span>透明度</span>
                                       <span>{wmOpacity}%</span>
                                   </label>
                                   <input 
                                     type="range" min="10" max="100" 
                                     value={wmOpacity} onChange={(e) => setWmOpacity(Number(e.target.value))}
                                     className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                   />
                               </div>

                               <div>
                                   <label className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                                       <span>大小 (圖片寬度 %)</span>
                                       <span>{wmSize}%</span>
                                   </label>
                                   <input 
                                     type="range" min="5" max="80" step="1"
                                     value={wmSize} onChange={(e) => setWmSize(Number(e.target.value))}
                                     className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                   />
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-2">
                                       <LayoutGrid className="w-3 h-3" /> 位置
                                   </label>
                                   <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
                                       {['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
                                           <button
                                             key={pos}
                                             onClick={() => setWmPosition(pos as WatermarkPosition)}
                                             className={`w-8 h-8 rounded border flex items-center justify-center transition-all ${
                                                 wmPosition === pos 
                                                 ? 'bg-primary border-primary text-white' 
                                                 : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100'
                                             }`}
                                           >
                                               <div className={`w-1.5 h-1.5 rounded-full ${wmPosition === pos ? 'bg-white' : 'bg-gray-400'}`} />
                                           </button>
                                       ))}
                                   </div>
                               </div>
                           </div>
                      </div>
                  )}

                  {isRotateMode && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-200">旋轉方向</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleRotate('left')}
                                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <RotateCcw className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">向左 90°</span>
                            </button>
                            <button
                                onClick={() => handleRotate('right')}
                                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <RotateCw className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">向右 90°</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setRotation(0)}
                            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary"
                        >
                            <RefreshCw className="w-4 h-4" /> 重置角度
                        </button>
                      </div>
                  )}

                  {mode === 'crop' && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-200">裁剪比例</h3>
                        <div className="flex flex-wrap lg:grid lg:grid-cols-2 gap-2 md:gap-3">
                            {(['free', '1:1', '4:3', '16:9', '9:16'] as AspectRatio[]).map(r => (
                                <button
                                    key={r}
                                    onClick={() => handleAspectChange(r)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-medium transition-colors border whitespace-nowrap ${
                                        aspect === r 
                                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                                        : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {r === 'free' ? '自由' : r}
                                </button>
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 leading-relaxed hidden md:block">
                            電腦版：拖動邊角調整大小，拖動內部移動。<br/>
                            手機版：單指拖曳，支援觸控調整。
                        </div>
                      </div>
                  )}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default BasicEditor;