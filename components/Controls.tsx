import React, { useState, useEffect, useRef } from 'react';
import { MicIcon } from './icons';
import { useTranslations } from '../contexts/SettingsContext';

interface ControlsProps {
    age: number;
    onAgeChange: (age: number) => void;
    profession: string;
    onProfessionChange: (profession: string) => void;
    background: string;
    onBackgroundChange: (background: string) => void;
}

const professions = [
    'None', 'Astronaut', 'Doctor', 'Firefighter', 'Police Officer', 'Teacher', 
    'Chef', 'Artist', 'Musician', 'Scientist', 'Engineer', 'Pilot', 'Farmer', 
    'Software Developer', 'Writer', 'Photographer', 'Journalist', 'Architect',
    'Lawyer', 'Athlete'
];

let recognition: any | null = null;
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

const Controls: React.FC<ControlsProps> = ({ age, onAgeChange, profession, onProfessionChange, background, onBackgroundChange }) => {
    const t = useTranslations();
    const [searchTerm, setSearchTerm] = useState(profession);
    const [isListening, setIsListening] = useState(false);
    const [isListeningBackground, setIsListeningBackground] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const translatedProfessions = professions.map(p => p === 'None' ? t('professionNone') : p);

    useEffect(() => { setSearchTerm(profession === 'None' ? t('professionNone') : profession) }, [profession, t]);

    const handleVoiceSearch = () => {
        if (!recognition) {
            alert(t('speechRecognitionNotSupported'));
            return;
        }
        if (isListening) {
            recognition.stop();
            setIsListening(false);
            return;
        }
        if (isListeningBackground) {
            recognition.stop();
            setIsListeningBackground(false);
        }
        recognition.start();
        setIsListening(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onProfessionChange(transcript);
        };
        recognition.onspeechend = () => {
            recognition.stop();
            setIsListening(false);
        };
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
    };

    const handleBackgroundVoiceSearch = () => {
        if (!recognition) {
            alert(t('speechRecognitionNotSupported'));
            return;
        }
        if (isListeningBackground) {
            recognition.stop();
            setIsListeningBackground(false);
            return;
        }
         if (isListening) {
            recognition.stop();
            setIsListening(false);
        }
        recognition.start();
        setIsListeningBackground(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onBackgroundChange(transcript);
        };
        recognition.onspeechend = () => {
            recognition.stop();
            setIsListeningBackground(false);
        };
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error for background', event.error);
            setIsListeningBackground(false);
        };
    };

    const filteredProfessions = translatedProfessions.filter(p => 
        p.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 p-6 bg-slate-800 rounded-lg border border-slate-700">
            {/* Age Slider */}
            <div className="flex flex-col gap-2">
                <label htmlFor="age" className="font-semibold text-slate-300">
                    {t('targetAge')}: <span className="font-bold text-sky-400">{age}</span>
                </label>
                <input
                    id="age"
                    type="range"
                    min="1"
                    max="100"
                    value={age}
                    onChange={(e) => onAgeChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Profession Input */}
            <div className="flex flex-col gap-2" ref={wrapperRef}>
                <label htmlFor="profession" className="font-semibold text-slate-300">
                    {t('professionLabel')}
                </label>
                <div className="relative">
                    <input
                        id="profession"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchTerm(value);
                            onProfessionChange(value === t('professionNone') ? 'None' : value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder={t('professionPlaceholder')}
                        autoComplete="off"
                        className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none pr-10"
                    />
                    <button
                        onClick={handleVoiceSearch}
                        type="button"
                        aria-label={t('searchByVoice')}
                        title={t('searchByVoice')}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-sky-400"
                        disabled={!recognition}
                    >
                       <MicIcon isListening={isListening} />
                    </button>
                    {showSuggestions && filteredProfessions.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                           {filteredProfessions.map((p, index) => (
                               <li 
                                   key={p} 
                                   onClick={() => {
                                       onProfessionChange(professions[index]); // Use original English value for logic
                                       setShowSuggestions(false);
                                   }}
                                   className="px-4 py-2 text-white hover:bg-sky-600 cursor-pointer"
                                >
                                   {p}
                               </li>
                           ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Advanced Settings */}
            <details className="md:col-span-2">
                <summary className="cursor-pointer font-semibold text-slate-300 hover:text-sky-400 transition-colors">
                    {t('advancedSettings')}
                </summary>
                <div className="mt-4 flex flex-col gap-2">
                    <label htmlFor="background" className="font-semibold text-slate-300 text-sm">
                        {t('backgroundLabel')}
                    </label>
                    <div className="relative">
                        <input
                            id="background"
                            type="text"
                            value={background}
                            onChange={(e) => onBackgroundChange(e.target.value)}
                            placeholder={t('backgroundPlaceholder')}
                            className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none pr-10"
                        />
                         <button
                            onClick={handleBackgroundVoiceSearch}
                            type="button"
                            aria-label={t('setBackgroundByVoice')}
                            title={t('setBackgroundByVoice')}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-sky-400"
                            disabled={!recognition}
                        >
                           <MicIcon isListening={isListeningBackground} />
                        </button>
                    </div>
                </div>
            </details>
        </div>
    );
};

export default Controls;