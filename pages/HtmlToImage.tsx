import React, { useState } from 'react';
import { Code2, Download, Globe, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

const HtmlToImage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      // Basic validation
      let targetUrl = url;
      if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
      }

      // Using thum.io as a demo service for client-side only environments
      // In a real production app, you would use a backend service like Puppeteer
      const imageUrl = `https://image.thum.io/get/width/1200/crop/800/noanimate/${targetUrl}`;
      
      // Pre-load to check success
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        setResultUrl(imageUrl);
        setLoading(false);
      };
      img.onerror = () => {
        setError('無法載入網頁預覽，請檢查網址是否正確或該網站拒絕了連線。');
        setLoading(false);
      };

    } catch (err) {
      setError('發生錯誤，請稍後再試。');
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    
    // Attempt to download. Note: Direct fetching might fail due to CORS on some browser configurations for cross-origin images.
    // We open in new tab as fallback.
    try {
        const response = await fetch(resultUrl);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `web-capture-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch(e) {
        window.open(resultUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Code2 className="text-orange-500 w-10 h-10" />
            HTML 網頁轉圖片
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            輸入任何公開的網頁連結 (URL)，我們會將其轉換為高品質的圖像。
            適合用於製作縮圖、存檔或分享網頁設計。
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-gray-700 mb-8 transition-colors">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
              />
            </div>
            <button
              onClick={handleConvert}
              disabled={!url || loading}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {loading ? '轉換中...' : '開始轉換'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {/* Result Section */}
        {resultUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> 轉換成功
              </span>
              <button 
                onClick={handleDownload}
                className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> 下載圖片
              </button>
            </div>
            <div className="relative group">
               <img src={resultUrl} alt="Website Screenshot" className="w-full h-auto block" />
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button 
                     onClick={handleDownload}
                     className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center gap-2"
                   >
                      <Download className="w-5 h-5" /> 點擊下載
                   </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Missing icon import fallback
function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export default HtmlToImage;