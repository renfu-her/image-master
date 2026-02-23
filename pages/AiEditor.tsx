import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, Sparkles, Loader2, Download, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { fileToGenerativePart, editImageWithAI, analyzeImage } from '../services/geminiService';
import { ImageFile, ProcessingStatus } from '../types';

const AiEditor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'general'; // upscale, remove-bg, meme, blur, general
  
  const [image, setImage] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill prompt based on mode
  useEffect(() => {
    switch (mode) {
      case 'remove-watermark':
        setPrompt("Remove all watermarks, logos, and text overlays from this image. Restore the original background seamlessly.");
        break;
      case 'remove-bg':
        setPrompt("Remove the background from this image, keep the subject on a white background.");
        break;
      case 'upscale':
        setPrompt("Upscale this image to high resolution, improve details and sharpness.");
        break;
      case 'meme':
        setPrompt("Make this image into a funny meme with a caption.");
        break;
      case 'blur':
        setPrompt("Blur all faces in this image to protect privacy.");
        break;
      default:
        setPrompt("");
    }
  }, [mode]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      const base64 = await fileToGenerativePart(file);
      
      setImage({ file, previewUrl, base64 });
      setResultImage(null);
      setAnalysisText(null);
      setStatus('idle');

      // Auto analyze when uploaded
      analyzeContent(base64);
    }
  };

  const analyzeContent = async (base64: string) => {
    try {
        const text = await analyzeImage(base64, "Describe this image concisely in Traditional Chinese.");
        setAnalysisText(text);
    } catch (err) {
        console.error("Analysis failed", err);
    }
  };

  const handleProcess = async () => {
    if (!image?.base64 || !prompt) return;
    
    setStatus('processing');
    try {
      const resultBase64 = await editImageWithAI(image.base64, prompt);
      setResultImage(resultBase64);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const downloadImage = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `imgmaster-ai-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
           <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
             <Sparkles className="text-primary" />
             AI 智能圖片編輯器
           </h1>
           <p className="text-gray-600 dark:text-gray-400">
             目前模式: <span className="text-indigo-600 dark:text-indigo-400 font-medium capitalize">{mode.replace('-', ' ')}</span>. 
             使用 Google Gemini 模型來理解並轉換您的圖片。
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input */}
          <div className="space-y-6">
            <div 
              className={`border-2 border-dashed rounded-2xl h-80 flex flex-col items-center justify-center transition-colors cursor-pointer relative overflow-hidden shadow-sm ${
                image 
                    ? 'border-indigo-500 bg-gray-100 dark:bg-gray-800' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <img 
                  src={image.previewUrl} 
                  alt="Original" 
                  className="w-full h-full object-contain p-2" 
                />
              ) : (
                <div className="text-center p-6">
                  <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">點擊上傳或拖放圖片</p>
                  <p className="text-sm text-gray-500 mt-2">支援 JPG, PNG</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              {image && (
                  <div className="absolute top-2 right-2 bg-black/60 text-xs px-2 py-1 rounded text-white">
                      原始圖片
                  </div>
              )}
            </div>

            {/* Analysis Result */}
            {analysisText && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">AI 圖像分析</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{analysisText}</p>
                </div>
            )}

            {/* Prompt Input */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                編輯指令 (Prompt)
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] outline-none transition-colors"
                placeholder="例如：把背景換成海灘，或者讓圖片變成油畫風格..."
              />
              <button
                onClick={handleProcess}
                disabled={!image || status === 'processing' || !prompt}
                className={`mt-4 w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  !image || status === 'processing' || !prompt
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                }`}
              >
                {status === 'processing' ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> 正在處理 (AI 思考中)...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> 開始生成
                  </>
                )}
              </button>
              {status === 'error' && (
                <div className="mt-3 flex items-center gap-2 text-red-500 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" /> 處理失敗，請重試或檢查 API 設定。
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="space-y-6">
             <div className="border-2 border-gray-300 dark:border-gray-700 rounded-2xl h-[calc(100%-80px)] min-h-[400px] bg-white dark:bg-gray-800 flex items-center justify-center relative overflow-hidden shadow-sm transition-colors">
                {resultImage ? (
                  <img 
                    src={resultImage} 
                    alt="Result" 
                    className="w-full h-full object-contain p-2" 
                  />
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                    {status === 'processing' ? (
                       <div className="flex flex-col items-center">
                          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                          <p>Gemini 正在繪製您的圖片...</p>
                       </div>
                    ) : (
                       <>
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>處理後的圖片將顯示在這裡</p>
                       </>
                    )}
                  </div>
                )}
             </div>
             
             {resultImage && (
               <button 
                 onClick={downloadImage}
                 className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
               >
                 <Download className="w-5 h-5" /> 下載圖片
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiEditor;