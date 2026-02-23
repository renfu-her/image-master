import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AiEditor from './pages/AiEditor';
import BasicEditor from './pages/BasicEditor';
import BatchProcessor from './pages/BatchProcessor';
import HtmlToImage from './pages/HtmlToImage';
import Login from './pages/Login';
import Register from './pages/Register';
import Upgrade from './pages/Upgrade';

const Footer = () => (
  <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 text-center text-gray-500 text-sm transition-colors duration-300">
    <p>© 2024 ImgMaster AI. All rights reserved.</p>
    <p className="mt-2">Powered by React, Tailwind & Google Gemini</p>
  </footer>
);

// Wrapper to handle layout logic if needed
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const hideNavAndFooter = ['/login', '/register'].includes(location.pathname);

  if (hideNavAndFooter) {
      return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/ai-editor" element={<AiEditor />} />
              <Route path="/basic-editor" element={<BasicEditor />} />
              <Route path="/batch-editor" element={<BatchProcessor />} />
              <Route path="/compress-convert" element={<BatchProcessor />} />
              <Route path="/html-to-image" element={<HtmlToImage />} />
              {/* Catch all redirect */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Layout>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;