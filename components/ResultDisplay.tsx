import React, { useState } from 'react';
import type { LoadingState } from '../types';
import { LoadingSpinner, DownloadIcon, ShareIcon } from './icons';
import { downloadImage } from '../utils/fileUtils';
import { useTranslations } from '../contexts/SettingsContext';

interface ResultDisplayProps {
  originalImage: string;
  generatedImage: string | null;
  loadingState: LoadingState;
}

const ShareAndDownloadButtons: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const t = useTranslations();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    const handleShare = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'generated-image.png', { type: blob.type });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: t('shareTitle'),
                    text: t('shareText'),
                    files: [file],
                });
            } else {
                throw new Error('Web Share API not supported for files.');
            }
        } catch (error) {
            console.error("Share failed:", error);
            setFeedbackMessage(t('shareError'));
            setTimeout(() => setFeedbackMessage(null), 3000);
        }
    };

    const handleDownload = (format: 'png' | 'jpeg') => {
        downloadImage(imageUrl, `generated-image.${format}`, format);
        setIsMenuOpen(false);
    };

    return (
        <div className="flex items-center gap-2 relative">
            {feedbackMessage && <div className="text-sm text-sky-300 mr-2">{feedbackMessage}</div>}
            
            {navigator.share && (
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg shadow-md transition-all text-sm"
                    title={t('share')}
                >
                    <ShareIcon />
                </button>
            )}

            <div className="relative">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md transition-all text-sm"
                >
                    <DownloadIcon />
                    {t('saveImage')}
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-10">
                        <a onClick={() => handleDownload('png')} className="block px-4 py-2 text-sm text-slate-200 hover:bg-sky-600 cursor-pointer">{t('saveAsPNG')}</a>
                        <a onClick={() => handleDownload('jpeg')} className="block px-4 py-2 text-sm text-slate-200 hover:bg-sky-600 cursor-pointer">{t('saveAsJPG')}</a>
                    </div>
                )}
            </div>
        </div>
    );
};


const ImageCard: React.FC<{ title: string; imageUrl: string | null; isLoading: boolean; isOriginal?: boolean; }> = ({ title, imageUrl, isLoading, isOriginal = false }) => {
    const t = useTranslations();
    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex justify-between items-center w-full">
                <h3 className={`text-xl font-semibold ${isOriginal ? 'text-sky-400' : 'text-slate-300'}`}>{title}</h3>
                {!isOriginal && imageUrl && <ShareAndDownloadButtons imageUrl={imageUrl} />}
            </div>
            <div className="aspect-square w-full bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700 flex items-center justify-center relative">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <LoadingSpinner />
                        <span>{t('generating')}</span>
                    </div>
                ) : imageUrl ? (
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-slate-500">{t('awaitingGeneration')}</div>
                )}
            </div>
        </div>
    );
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImage, generatedImage, loadingState }) => {
  const t = useTranslations();
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      <ImageCard 
        title={t('original')} 
        imageUrl={originalImage} 
        isLoading={false} 
        isOriginal={true}
      />
      <ImageCard 
        title={t('generated')} 
        imageUrl={generatedImage} 
        isLoading={loadingState === 'loading'} 
      />
    </div>
  );
};

export default ResultDisplay;