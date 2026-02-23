import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { useSearchParams } from 'react-router-dom';
import { Upload, Archive, Download, X, FileImage, Loader2, CheckCircle2, Maximize2, Settings2 } from 'lucide-react';

interface FileItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  originalSize: number;
  newSize?: number;
}

const BatchProcessor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as 'compress' | 'resize' | 'convert') || 'compress';

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings
  const [quality, setQuality] = useState(0.8);
  const [outputFormat, setOutputFormat] = useState<'webp' | 'jpeg' | 'png'>('webp');
  const [resizeType, setResizeType] = useState<'percentage' | 'fixed'>('percentage');
  const [scalePercent, setScalePercent] = useState(50);
  const [fixedWidth, setFixedWidth] = useState(1920);
  const [fixedHeight, setFixedHeight] = useState(1080);
  const [maintainAspect, setMaintainAspect] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: FileItem[] = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
        originalSize: file.size
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processAndDownload = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProcessingProgress(0);

    const zip = new JSZip();
    const processedFiles: FileItem[] = [...files];

    try {
      for (let i = 0; i < processedFiles.length; i++) {
        const item = processedFiles[i];
        item.status = 'processing';
        setFiles([...processedFiles]);

        try {
            const blob = await processImage(item.file);
            
            if (blob) {
                let ext = 'jpg';
                if (outputFormat === 'webp') ext = 'webp';
                if (outputFormat === 'png') ext = 'png';

                const fileNameWithoutExt = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;
                zip.file(`${fileNameWithoutExt}_processed.${ext}`, blob);
                
                item.newSize = blob.size;
                item.status = 'done';
            } else {
                item.status = 'error';
            }
        } catch (e) {
            console.error(e);
            item.status = 'error';
        }
        
        setProcessingProgress(Math.round(((i + 1) / processedFiles.length) * 100));
        setFiles([...processedFiles]);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `imgmaster-batch-${mode}-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Error processing images:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processImage = (file: File): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Logic for Resize Mode
        if (mode === 'resize') {
            if (resizeType === 'percentage') {
                width = Math.round(img.width * (scalePercent / 100));
                height = Math.round(img.height * (scalePercent / 100));
            } else {
                if (maintainAspect) {
                   const aspect = img.width / img.height;
                   width = fixedWidth;
                   height = Math.round(fixedWidth / aspect);
                } else {
                   width = fixedWidth;
                   height = fixedHeight;
                }
            }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          let mimeType = 'image/jpeg';
          if (outputFormat === 'webp') mimeType = 'image/webp';
          if (outputFormat === 'png') mimeType = 'image/png';

          canvas.toBlob((blob) => {
            resolve(blob);
          }, mimeType, quality);
        } else {
          resolve(null);
        }
      };
      img.onerror = (e) => reject(e);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-3 capitalize">
            {mode === 'resize' 
                ? <Maximize2 className="text-blue-500 dark:text-blue-400 w-8 h-8" /> 
                : <Archive className="text-red-500 dark:text-red-400 w-8 h-8" />
            }
            {mode === 'resize' ? '批量調整大小' : '批量轉換 (WebP/PNG)'}
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 px-4">
            {mode === 'resize' 
               ? '設定統一的尺寸或縮放比例，一次處理多張圖片。' 
               : '將多張圖片批量轉換為 WebP 或 PNG 格式，並可調整品質。'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
            {/* Settings Panel */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-5 md:p-6 border border-gray-200 dark:border-gray-700 h-fit order-2 lg:order-1 transition-colors">
                <div className="flex items-center gap-2 mb-4 text-primary font-bold">
                    <Settings2 className="w-5 h-5" />
                    參數設定
                </div>
                
                <div className="space-y-6">
                    {/* Common Setting: Format */}
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">輸出格式</label>
                        <select 
                            value={outputFormat} 
                            onChange={(e) => setOutputFormat(e.target.value as any)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                        >
                            <option value="webp">WebP (最佳壓縮)</option>
                            <option value="png">PNG (無損透明)</option>
                            <option value="jpeg">JPG (通用性高)</option>
                        </select>
                    </div>

                    {/* Common Setting: Quality */}
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                           品質: {Math.round(quality * 100)}%
                        </label>
                        <input 
                           type="range" min="0.1" max="1.0" step="0.05"
                           value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))}
                           className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>

                    {/* Resize Specific Settings */}
                    {mode === 'resize' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">調整方式</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setResizeType('percentage')}
                                        className={`flex-1 py-2 rounded text-sm transition-colors ${resizeType === 'percentage' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        百分比
                                    </button>
                                    <button 
                                        onClick={() => setResizeType('fixed')}
                                        className={`flex-1 py-2 rounded text-sm transition-colors ${resizeType === 'fixed' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        固定尺寸
                                    </button>
                                </div>
                            </div>

                            {resizeType === 'percentage' ? (
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">縮放比例: {scalePercent}%</label>
                                    <input 
                                        type="range" min="10" max="200" step="10"
                                        value={scalePercent} onChange={(e) => setScalePercent(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">寬度 (px)</label>
                                        <input 
                                            type="number" value={fixedWidth} onChange={(e) => setFixedWidth(Number(e.target.value))}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    {!maintainAspect && (
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">高度 (px)</label>
                                            <input 
                                                type="number" value={fixedHeight} onChange={(e) => setFixedHeight(Number(e.target.value))}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {resizeType === 'fixed' && (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" id="aspect"
                                        checked={maintainAspect}
                                        onChange={(e) => setMaintainAspect(e.target.checked)}
                                        className="rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="aspect" className="text-sm text-gray-600 dark:text-gray-300">保持長寬比 (依寬度自動調整高度)</label>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload & List Panel */}
            <div className="lg:col-span-2 order-1 lg:order-2">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80 rounded-xl p-6 md:p-8 text-center cursor-pointer transition-all mb-6 active:scale-95 shadow-sm"
                >
                    <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">點擊或拖放圖片至此</p>
                    <p className="text-sm text-gray-500">支援 JPG, PNG, WebP (可多選)</p>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        multiple 
                        onChange={handleFileChange} 
                    />
                </div>

                {files.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-colors">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <span className="font-medium text-gray-700 dark:text-gray-300">已選擇 {files.length} 張圖片</span>
                            <button 
                                onClick={processAndDownload}
                                disabled={isProcessing}
                                className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-indigo-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                {isProcessing ? `處理中 ${processingProgress}%` : '開始處理並下載 ZIP'}
                            </button>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {files.map(item => (
                                <div key={item.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 flex items-center gap-3 border border-gray-200 dark:border-gray-700/50 transition-colors">
                                    <img src={item.previewUrl} alt="" className="w-12 h-12 rounded object-cover bg-gray-200 dark:bg-gray-800" />
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm text-gray-900 dark:text-gray-200 truncate">{item.file.name}</p>
                                        <p className="text-xs text-gray-500">{formatSize(item.originalSize)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {item.status === 'done' && item.newSize && (
                                            <span className="text-xs text-green-600 dark:text-green-400 font-mono hidden sm:inline">
                                                {formatSize(item.newSize)}
                                            </span>
                                        )}
                                        {item.status === 'processing' && <Loader2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-spin" />}
                                        {item.status === 'done' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                        {item.status === 'error' && <span className="text-xs text-red-500 dark:text-red-400">失敗</span>}
                                        {item.status === 'pending' && (
                                            <button onClick={() => removeFile(item.id)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BatchProcessor;