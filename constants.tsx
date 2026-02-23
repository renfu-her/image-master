import { 
  Minimize2, Maximize2, Crop, FileImage, 
  Image as ImageIcon, Wand2, Trash2, Stamp, 
  Smile, RotateCw, Code2, UserX, Scissors,
  Archive, Eraser
} from 'lucide-react';
import { ToolItem } from './types';

export const TOOLS: ToolItem[] = [
  {
    id: 'remove-watermark',
    title: 'Nano Banana 去除浮水印',
    description: '使用最新的 Nano Banana 模型，智能識別並無痕去除圖片中的浮水印。',
    icon: Eraser,
    color: 'text-yellow-500 dark:text-yellow-400',
    isNew: true,
    category: 'ai',
    route: '/ai-editor?mode=remove-watermark'
  },
  {
    id: 'compress-batch',
    title: '批量壓縮',
    description: '批量上傳多張圖片，調整品質並壓縮為 WebP 或 JPG，最後打包成 ZIP 下載。',
    icon: Archive,
    color: 'text-red-600 dark:text-red-400',
    category: 'convert',
    isNew: true,
    route: '/batch-editor?mode=compress'
  },
  {
    id: 'resize',
    title: '批量調整大小',
    description: '一次調整多張圖片的大小。支援按百分比縮放或設定固定寬高。',
    icon: Maximize2,
    color: 'text-blue-600 dark:text-blue-400',
    category: 'edit',
    route: '/batch-editor?mode=resize'
  },
  {
    id: 'crop',
    title: '裁剪圖片',
    description: '裁剪單張圖片。提供 1:1, 16:9 等常用比例遮罩，或自由裁剪。',
    icon: Crop,
    color: 'text-cyan-600 dark:text-cyan-400',
    category: 'edit',
    route: '/basic-editor?mode=crop'
  },
  {
    id: 'convert-to-jpg',
    title: '轉換至 WebP/PNG',
    description: '輕鬆地批量轉換圖片格式至 WebP 或 PNG (亦支援 JPG)。預設使用 WebP 以獲得最佳壓縮。',
    icon: FileImage,
    color: 'text-yellow-600 dark:text-yellow-400',
    category: 'convert',
    route: '/batch-editor?mode=convert'
  },
  {
    id: 'photo-editor',
    title: 'AI 相片編輯器',
    description: '利用 AI 描述指令、效果，讓圖片更加生動有趣。使用智能編輯工具。',
    icon: ImageIcon,
    color: 'text-purple-600 dark:text-purple-400',
    category: 'ai',
    route: '/ai-editor'
  },
  {
    id: 'upscale',
    title: '提升圖片質量',
    description: '以高解析度放大圖像。輕鬆提升JPG和PNG圖片的大小，同時保持視覺品質。',
    icon: Wand2,
    color: 'text-emerald-600 dark:text-emerald-400',
    isNew: true,
    category: 'ai',
    route: '/ai-editor?mode=upscale'
  },
  {
    id: 'remove-bg',
    title: '刪除背景',
    description: '快速刪除圖像的背景，並保持高品質。快速探測到目標，並輕鬆刪除背景。',
    icon: Trash2,
    color: 'text-green-600 dark:text-green-500',
    isNew: true,
    category: 'ai',
    route: '/ai-editor?mode=remove-bg'
  },
  {
    id: 'watermark',
    title: '給一個圖片加浮水印',
    description: '快速給你的圖片加上圖像或浮水印。選擇排版、透明度和位置。',
    icon: Stamp,
    color: 'text-blue-600 dark:text-blue-500',
    category: 'security',
    route: '/basic-editor?mode=watermark'
  },
  {
    id: 'meme',
    title: '搞笑創意圖片生成器',
    description: '通過一個簡單的步驟，線上製作搞笑創意圖片。選擇你自己的範本。',
    icon: Smile,
    color: 'text-pink-600 dark:text-pink-400',
    category: 'ai',
    route: '/ai-editor?mode=meme'
  },
  {
    id: 'rotate',
    title: '旋轉一個圖片',
    description: '同時旋轉多個 JPG, PNG 或 GIF 圖片。每次只選擇橫向或縱向圖片！',
    icon: RotateCw,
    color: 'text-teal-600 dark:text-teal-400',
    category: 'edit',
    route: '/basic-editor?mode=rotate'
  },
  {
    id: 'html-to-image',
    title: 'HTML轉圖片',
    description: '將網頁轉換為圖片。複製並粘貼網頁的URL鏈接，然後單擊生成截圖。',
    icon: Code2,
    color: 'text-orange-600 dark:text-orange-400',
    category: 'convert',
    route: '/html-to-image'
  },
  {
    id: 'blur-face',
    title: '模糊面部',
    description: '簡便地模糊照片中的人臉。此外，你還可以模糊車牌或其他物體，以隱藏隱私信息。',
    icon: UserX,
    color: 'text-indigo-600 dark:text-indigo-400',
    isNew: true,
    category: 'security',
    route: '/ai-editor?mode=blur'
  }
];