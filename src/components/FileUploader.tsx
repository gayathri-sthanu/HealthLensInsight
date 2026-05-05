import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export default function FileUploader({ onFileSelect, onAnalyze, isLoading }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6" id="uploader-container">
      <div
        className={`relative group border-2 border-dashed rounded-3xl p-12 transition-all duration-300 ease-in-out ${
          dragActive 
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" 
            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800 bg-white dark:bg-slate-900/50"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        id="drop-zone"
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,image/*"
          onChange={handleChange}
          disabled={isLoading}
        />
        
        {!selectedFile ? (
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <div className="w-16 h-16 mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 font-sans">
              Drop your health report here
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-6 max-w-xs">
              Support PDF and Images (JPG, PNG). We'll analyze your metrics instantly.
            </p>
            <div className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Browse Files
            </div>
          </label>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
              File Ready
            </h3>
            <div className="flex items-center gap-2 mb-8 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
              <FileText size={16} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                {selectedFile.name}
              </span>
              <button 
                onClick={clearFile}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
            
            <button
              onClick={onAnalyze}
              className="group flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0"
              id="analyze-report-btn"
            >
              Analyze Report
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Upload size={20} />
              </motion.span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-center space-y-4">
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
          *Insights generated by AI may not be 100% accurate. Always consult a qualified physician.
        </p>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <div className="flex flex-col items-center gap-6 max-w-sm text-center">
              <div className="relative w-20 h-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-3xl"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-4 border-blue-500 rounded-3xl"
                />
                <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                  <Activity size={32} className="animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2">
                <LoadingSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingSwitcher() {
  const [index, setIndex] = useState(0);
  const texts = ["Reading your report...", "Identifying key metrics...", "Generating insights..."];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-lg font-bold text-slate-900 dark:text-white"
      >
        {texts[index]}
      </motion.p>
    </AnimatePresence>
  );
}

import { Activity } from 'lucide-react';
