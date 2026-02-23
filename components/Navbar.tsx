import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Image, Menu, X, Crown, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Close menu when route changes
  React.useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group z-50 relative">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                 <Image className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">ImgMaster <span className="text-primary">AI</span></span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-1">
                <Link to="/batch-editor?mode=compress" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">壓縮圖片</Link>
                <Link to="/batch-editor?mode=resize" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">調整大小</Link>
                <Link to="/basic-editor?mode=crop" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">裁剪</Link>
                <Link to="/ai-editor" className="ml-2 text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium shadow-md shadow-indigo-500/20 transition-all">AI 編輯器</Link>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
                title={theme === 'dark' ? '切換至亮色模式' : '切換至暗色模式'}
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
                <>
                   {!user.isPremium && (
                       <Link to="/upgrade" className="flex items-center gap-1 text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 text-sm font-bold border border-orange-500/50 rounded-full px-3 py-1 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all">
                           <Crown className="w-4 h-4" /> <span className="hidden lg:inline">升級 Premium</span><span className="lg:hidden">PRO</span>
                       </Link>
                   )}
                   <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm border-l border-gray-300 dark:border-gray-700 pl-4 ml-2">
                       <User className="w-4 h-4" />
                       <span className="font-medium truncate max-w-[100px]">{user.name}</span>
                       {user.isPremium && <span className="bg-primary text-[10px] px-1.5 rounded text-white font-bold">PRO</span>}
                   </div>
                   <button onClick={logout} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="登出">
                       <LogOut className="w-5 h-5" />
                   </button>
                </>
            ) : (
                <>
                    <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium px-2">
                        登入
                    </Link>
                    <Link to="/register" className="bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent dark:border-gray-700">
                        註冊
                    </Link>
                </>
            )}
          </div>
          
          <div className="flex items-center gap-2 md:hidden">
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
             >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             {/* Mobile Menu Button */}
             <button 
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors z-50 relative"
             >
               {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-40 transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ top: '64px' }}
      >
        <div className="px-4 pt-4 pb-8 space-y-2">
           {user && (
               <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 mb-2">
                   <p className="text-gray-500 dark:text-gray-400 text-sm">已登入為</p>
                   <p className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                       {user.name}
                       {user.isPremium && <span className="bg-primary text-[10px] px-1.5 rounded text-white">PRO</span>}
                   </p>
               </div>
           )}
           <Link to="/batch-editor?mode=compress" className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-3 rounded-xl text-base font-medium transition-colors">
              批量壓縮圖片
           </Link>
           <Link to="/batch-editor?mode=resize" className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-3 rounded-xl text-base font-medium transition-colors">
              批量調整大小
           </Link>
           <Link to="/basic-editor?mode=crop" className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-3 rounded-xl text-base font-medium transition-colors">
              圖片裁剪
           </Link>
           <Link to="/ai-editor" className="block text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-3 rounded-xl text-base font-medium shadow-lg shadow-indigo-900/20 mt-4 text-center">
              ✨ AI 智能編輯器
           </Link>
           
           <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4 space-y-2">
                {user ? (
                    <>
                         {!user.isPremium && (
                            <Link to="/upgrade" className="block text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800 px-4 py-3 rounded-xl text-base font-bold text-center border border-orange-500/30">
                                升級 Premium
                            </Link>
                         )}
                         <button onClick={logout} className="w-full text-left block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-3 rounded-xl text-base font-medium">
                            登出
                         </button>
                    </>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                         <Link to="/login" className="block text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 py-3 rounded-xl font-medium">
                            登入
                         </Link>
                         <Link to="/register" className="block text-center text-white bg-gray-900 dark:bg-gray-700 py-3 rounded-xl font-medium">
                            註冊
                         </Link>
                    </div>
                )}
           </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;