import React from 'react';

interface ImageCardProps {
  title: string;
  imageSrc: string | null;
  placeholderText?: string;
  onDownload?: () => void;
  isGenerated?: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({ 
  title, 
  imageSrc, 
  placeholderText = "Select an image", 
  onDownload,
  isGenerated = false
}) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">{title}</h3>
        {imageSrc && onDownload && (
          <button 
            onClick={onDownload}
            className="text-slate-400 hover:text-rose-500 transition-colors text-sm"
            title="Download Image"
          >
            <i className="fas fa-download"></i>
          </button>
        )}
      </div>
      
      <div className="relative flex-1 min-h-[400px] bg-slate-50 flex items-center justify-center group overflow-hidden">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-center p-6 text-slate-400">
            <div className="mb-4 text-4xl opacity-20">
              <i className={`fas ${isGenerated ? 'fa-wand-magic-sparkles' : 'fa-image'}`}></i>
            </div>
            <p className="text-sm font-medium">{placeholderText}</p>
          </div>
        )}
        
        {isGenerated && imageSrc && (
          <div className="absolute bottom-4 right-4 bg-rose-500 text-white text-xs px-2 py-1 rounded shadow-lg">
            <i className="fas fa-check mr-1"></i> Generated
          </div>
        )}
      </div>
    </div>
  );
};