import React from 'react';
import { Link } from 'react-router-dom';
import { ToolItem } from '../types';
import { ArrowRight } from 'lucide-react';

interface ToolCardProps {
  tool: ToolItem;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const Icon = tool.icon;

  return (
    <Link 
      to={tool.route}
      className="block group relative bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/20 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
    >
      {tool.isNew && (
        <span className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
          全新功能 !
        </span>
      )}
      
      <div className="mb-4">
        <Icon className={`w-12 h-12 ${tool.color}`} />
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
        {tool.title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
        {tool.description}
      </p>

      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
         <ArrowRight className="w-5 h-5 text-primary" />
      </div>
    </Link>
  );
};

export default ToolCard;