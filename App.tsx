import React, { useState, useCallback, useEffect } from 'react';
import { transformImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import Controls from './components/Controls';
import CameraCapture from './components/CameraCapture';
import SettingsPanel from './components/SettingsPanel';
import { MagicWandIcon, SettingsIcon } from './components/icons';
import { useTranslations, useSettings } from './contexts/SettingsContext';
import type { LoadingState } from './types';

export default function App(): React.ReactElement {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const [age, setAge] = useState<number>(30);
  const [profession, setProfession] = useState<string>('None');
  const [background, setBackground] = useState<string>('');

  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const t = useTranslations();
  const { fontSize } = useSettings();

  useEffect(() => {
    document.documentElement.className = '';
    if (fontSize === 'large') {
      document.documentElement.classList.add('text-large');
    }
  }, [fontSize]);

  const resetState = (clearAll = false) => {
      setSelectedFile(null);
      setPreviewUrl(null);
      setGeneratedImage(null);
      setError(null);
      setLoadingState('idle');
      setShowCamera(false);
      if (clearAll) {
        setAge(30);
        setProfession('None');
        setBackground('');
      }
  };

  const handleFileSelect = useCallback((file: File | null) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(t('errorInvalidImage'));
        return;
      }
      resetState();
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setShowCamera(false);
    }
  }, [t]);

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError(t('errorSelectImage'));
      return;
    }

    setLoadingState('loading');
    setError(null);
    setGeneratedImage(null);

    try {
      const base64Data = await fileToBase64(selectedFile);
      
      let prompt = `Make the person in this photo look like they are ${age} years old.`;
      
      if (profession && profession.toLowerCase() !== 'none' && profession.trim() !== '') {
        prompt += ` Dress them in the attire of a ${profession}.`;
      }

      if (background && background.trim() !== '') {
        prompt += ` Place them in a background of: ${background}.`;
      } else {
        prompt += ' Preserve the original background as much as possible.';
      }
      
      prompt += ' Maintain a realistic photographic style.';
      
      const resultImage = await transformImage(base64Data, selectedFile.type, prompt);
      setGeneratedImage(resultImage);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('errorTransformation'));
    } finally {
      setLoadingState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        <header className="relative text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
            {t('title')}
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            {t('subtitle')}
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-0 right-0 p-2 text-slate-400 hover:text-sky-400 transition-colors"
            aria-label={t('settingsTitle')}
          >
            <SettingsIcon />
          </button>
        </header>

        {showCamera && <CameraCapture onCapture={handleFileSelect} onCancel={() => setShowCamera(false)} />}
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
        
        <main>
          <div className="bg-slate-800/50 rounded-2xl shadow-xl p-6 border border-slate-700">
            {!selectedFile && !showCamera && (
              <ImageUploader onFileSelect={handleFileSelect} onUseCamera={() => setShowCamera(true)} />
            )}

            {error && (
              <div className="mt-4 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                <p>{error}</p>
              </div>
            )}
            
            {selectedFile && previewUrl && (
                <>
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => resetState(true)}
                      className="mb-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      {t('startOver')}
                    </button>
                  </div>

                  <ResultDisplay 
                      originalImage={previewUrl}
                      generatedImage={generatedImage}
                      loadingState={loadingState}
                  />

                  <Controls 
                    age={age}
                    onAgeChange={setAge}
                    profession={profession}
                    onProfessionChange={setProfession}
                    background={background}
                    onBackgroundChange={setBackground}
                  />

                  <div className="mt-8 flex justify-center">
                      <button
                          onClick={handleGenerate}
                          disabled={loadingState !== 'idle'}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 font-bold text-lg rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                      >
                          <MagicWandIcon />
                          {t('generateImage')}
                      </button>
                  </div>
                </>
            )}
          </div>
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>{t('footer')}</p>
        </footer>
      </div>
    </div>
  );
}