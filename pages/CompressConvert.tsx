import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { Upload, Archive, Download, X, FileImage, Loader2, CheckCircle2 } from 'lucide-react';

interface FileItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  originalSize: number;
  newSize?: number;
}

const CompressConvert: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Explicitly type 'file' as File to avoid inference issues with Array.from on FileList which might default to unknown
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
        
        // Update status to processing
        item.status = 'processing';
        setFiles([...processedFiles]);

        // Process Image
        const blob = await convertToWebP(item.file, quality);
        
        if (blob) {
            // Add to ZIP
            const fileNameWithoutExt = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;
            zip.file(`${fileNameWithoutExt}.webp`, blob);
            
            // Update stats
            item.newSize = blob.size;
            item.status = 'done';
        } else {
            item.status = 'error';
        }
        
        // Update Progress
        setProcessingProgress(Math.round(((i + 1) / processedFiles.length) * 100));
        setFiles([...processedFiles]);
      }

      // Generate ZIP
      const content = await zip.generateAsync({ type: "blob" });
      
      // Trigger Download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `images-optimized-webp-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Error processing images:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToWebP = (file: File, quality: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/webp', quality);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-3 flex items-center justify-center gap-3">
            <Archive className="text-red-400 w-8 h-8" />
            批量壓縮 & 轉 WebP
          </h1>
          <p className="text-gray-400">
            一次上傳多張圖片，自動轉換為高效的 WebP 格式並打包下載。
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8 shadow-lg">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="w-full md:w-1/2">
                <label className="block text-sm text-gray-400 mb-2">
                   壓縮品質: {Math.round(quality * 100)}%
                </label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.1"
                  value={quality} 
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                   <span>更小檔案 (低畫質)</span>
                   <span>更大檔案 (高畫質)</span>
                </div>
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isProcessing}
                   className="flex-1 md:flex-none px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                 >
                    <Upload className="w-5 h-5" /> 加入圖片
                 </button>
                 <button 
                   onClick={processAndDownload}
                   disabled={files.length === 0 || isProcessing}
                   className="flex-1 md:flex-none px-6 py-3 bg-primary hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    {isProcessing ? `處理中 ${processingProgress}%` : '轉換並下載 ZIP'}
                 </button>
              </div>
           </div>
           <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg" 
              multiple 
              onChange={handleFileChange} 
           />
        </div>

        {/* File List */}
        {files.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
             {files.map(item => (
               <div key={item.id} className="bg-gray-800/50 rounded-lg p-4 flex items-center gap-4 border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="w-16 h-16 bg-gray-900 rounded-md overflow-hidden flex-shrink-0 border border-gray-700">
                     <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                     <p className="text-sm font-medium text-white truncate">{item.file.name}</p>
                     <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span>原始: {formatSize(item.originalSize)}</span>
                        {item.newSize && (
                           <span className="text-green-400 font-bold">
                              → WebP: {formatSize(item.newSize)} 
                              (-{Math.round(((item.originalSize - item.newSize) / item.originalSize) * 100)}%)
                           </span>
                        )}
                     </div>
                  </div>

                  <div className="flex-shrink-0">
                     {item.status === 'processing' && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
                     {item.status === 'done' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                     {item.status === 'pending' && (
                        <button 
                           onClick={() => removeFile(item.id)}
                           className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors"
                        >
                           <X className="w-5 h-5" />
                        </button>
                     )}
                  </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl">
             <FileImage className="w-16 h-16 text-gray-700 mx-auto mb-4" />
             <p className="text-gray-500">尚未加入任何圖片</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CompressConvert;