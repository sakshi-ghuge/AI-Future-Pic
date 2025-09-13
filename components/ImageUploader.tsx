import React, { useRef } from 'react';
import { UploadIcon, CameraIcon } from './icons';
import { useTranslations } from '../contexts/SettingsContext';

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void;
  onUseCamera: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, onUseCamera }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-xl bg-slate-800 hover:border-sky-500 transition-colors duration-300">
      <UploadIcon />
      <h2 className="mt-4 text-xl font-semibold text-slate-200">{t('uploadTitle')}</h2>
      <p className="mt-1 text-slate-400">{t('uploadSubtitle')}</p>
      <p className="text-xs text-slate-500 mt-1">{t('uploadRecommended')}</p>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
       <div className="mt-6 flex items-center gap-4">
        <button
            onClick={handleButtonClick}
            className="px-6 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all"
        >
            {t('selectImage')}
        </button>
        <span className="text-slate-500">{t('or')}</span>
        <button
            onClick={onUseCamera}
            className="flex items-center px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition-all"
        >
            <CameraIcon />
            <span className="ml-2">{t('useCamera')}</span>
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;