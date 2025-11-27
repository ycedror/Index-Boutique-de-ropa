import React, { useState, useRef, useEffect } from 'react';
import { generateFashionTransformation } from './services/gemini';
import { Button } from './components/Button';
import { ImageCard } from './components/ImageCard';
import { AppStatus } from './types';

// Default prompt based on user request
const DEFAULT_PROMPT = "Cambia la modelo por una modelo de talla más grande (Plus Size). Respeta estrictamente el estampado y el diseño de la ropa, es lo más importante. Transforma la imagen para que parezca una selfie tomada frente a un espejo, mostrando el teléfono si es natural. Cambia el fondo a una boutique de ropa minimalista y elegante.";

const STORAGE_KEYS = {
  PROMPT: 'modamatch_prompt',
  ORIGINAL_IMAGE: 'modamatch_original_image'
};

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  
  // Initialize state from localStorage if available
  const [originalImage, setOriginalImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ORIGINAL_IMAGE);
    } catch (e) {
      console.warn('Error reading image from localStorage:', e);
      return null;
    }
  });

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const [prompt, setPrompt] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.PROMPT) || DEFAULT_PROMPT;
    } catch (e) {
      console.warn('Error reading prompt from localStorage:', e);
      return DEFAULT_PROMPT;
    }
  });

  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist prompt to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMPT, prompt);
    } catch (e) {
      console.warn('Failed to save prompt to localStorage:', e);
    }
  }, [prompt]);

  // Persist original image to localStorage
  useEffect(() => {
    try {
      if (originalImage) {
        localStorage.setItem(STORAGE_KEYS.ORIGINAL_IMAGE, originalImage);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ORIGINAL_IMAGE);
      }
    } catch (e) {
      console.warn('Failed to save image to localStorage (likely quota exceeded):', e);
    }
  }, [originalImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen es demasiado grande. Por favor usa una imagen menor a 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setGeneratedImage(null);
        setError(null);
        setStatus(AppStatus.IDLE);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const result = await generateFashionTransformation(originalImage, prompt);
      setGeneratedImage(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al procesar la imagen.");
      setStatus(AppStatus.ERROR);
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white text-lg">
              <i className="fas fa-tshirt"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">ModaMatch AI</h1>
              <p className="text-xs text-slate-500">Editor de Catálogo Inteligente</p>
            </div>
          </div>
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-rose-600">
            <i className="fas fa-question-circle mr-1"></i> Ayuda
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        
        {/* Intro / Instructions */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Transforma tu Catálogo</h2>
          <p className="text-slate-600">
            Sube la foto de tu prenda y utiliza nuestra IA para visualizarla en diferentes tallas y entornos, manteniendo la fidelidad del diseño.
          </p>
        </div>

        {/* Input Control Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* Upload Button */}
            <div className="w-full md:w-1/3">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-rose-500 hover:text-rose-500 hover:bg-rose-50 transition-all group"
              >
                <i className="fas fa-cloud-upload-alt text-3xl mb-2 group-hover:scale-110 transition-transform"></i>
                <span className="font-medium">Subir Imagen Original</span>
                <span className="text-xs mt-1">JPG, PNG (Max 5MB)</span>
              </button>
            </div>

            {/* Prompt Editor */}
            <div className="w-full md:w-2/3 flex flex-col gap-3">
              <label className="text-sm font-bold text-slate-700 flex justify-between">
                <span>Instrucción de Transformación</span>
                <span className="text-rose-500 text-xs font-normal bg-rose-50 px-2 py-0.5 rounded-full">Gemini 2.5 Flash Powered</span>
              </label>
              <textarea 
                className="w-full p-3 rounded-lg border border-slate-200 text-slate-700 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-sm leading-relaxed resize-none bg-slate-50"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerate} 
                  disabled={!originalImage}
                  isLoading={status === AppStatus.PROCESSING}
                  icon="fa-wand-magic-sparkles"
                >
                  {status === AppStatus.PROCESSING ? 'Transformando...' : 'Generar Transformación'}
                </Button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2 border border-red-100">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
        </div>

        {/* Comparison View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto">
          {/* Original */}
          <div className="flex flex-col h-full">
            <ImageCard 
              title="Original" 
              imageSrc={originalImage}
              placeholderText="La imagen original aparecerá aquí"
            />
          </div>

          {/* Result */}
          <div className="flex flex-col h-full">
             <ImageCard 
              title="Resultado Generado (IA)" 
              imageSrc={generatedImage}
              isGenerated={true}
              placeholderText="El resultado transformado aparecerá aquí"
              onDownload={generatedImage ? () => downloadImage(generatedImage!, 'modamatch-result.png') : undefined}
            />
             {status === AppStatus.PROCESSING && !generatedImage && (
               <div className="mt-4 text-center text-sm text-slate-500 animate-pulse">
                 <i className="fas fa-spinner fa-spin mr-2"></i>
                 Analizando patrón de ropa y generando nueva imagen...
               </div>
             )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} ModaMatch AI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;