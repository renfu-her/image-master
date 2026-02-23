import React, { useState } from 'react';
import { TOOLS } from '../constants';
import ToolCard from '../components/ToolCard';

const Dashboard: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'edit' | 'convert' | 'ai'>('all');

  const filteredTools = filter === 'all' 
    ? TOOLS 
    : TOOLS.filter(t => t.category === filter);

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-900 pt-20 pb-16 px-4 text-center transition-colors duration-300">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
          可批量編輯圖片 的所有工具
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          你的線上圖片編輯器就在這裡，而且永遠免費！<br/>
          (Gemini AI 驅動的智能圖像處理)
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { id: 'all', label: '全部' },
            { id: 'ai', label: 'AI 最佳化' },
            { id: 'edit', label: '建立 & 編輯' },
            { id: 'convert', label: '轉換' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === f.id 
                  ? 'bg-primary text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {/* SEO / Footer Content Area */}
      <div className="max-w-4xl mx-auto mt-24 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">為什麼選擇 ImgMaster AI?</h2>
        <p className="text-gray-600 dark:text-gray-400">
          我們集成了 Google Gemini 最新的 AI 模型，不僅提供基礎的裁剪、旋轉功能，
          更能理解您的圖片內容，進行智慧消除背景、畫質修復與創意編輯。
        </p>
      </div>
    </div>
  );
};

export default Dashboard;