import React from 'react';
import { useSettings, useTranslations } from '../contexts/SettingsContext';
import { LanguagesIcon, FontSizeIcon } from './icons';
import type { Language, FontSize } from '../types';

interface SettingsPanelProps {
    onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
    const { language, setLanguage, fontSize, setFontSize } = useSettings();
    const t = useTranslations();

    const languages: { code: Language; name: string }[] = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'mr', name: 'मराठी' },
    ];

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
        >
            <div 
                className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <h2 id="settings-title" className="text-2xl font-bold text-center mb-6">{t('settingsTitle')}</h2>

                <div className="space-y-6">
                    {/* Language Setting */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 font-semibold text-slate-300">
                           <LanguagesIcon /> {t('language')}
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        >
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Font Size Setting */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 font-semibold text-slate-300">
                            <FontSizeIcon /> {t('fontSize')}
                        </label>
                        <div className="flex gap-2 p-1 bg-slate-900 rounded-md">
                           <button
                             onClick={() => setFontSize('normal')}
                             className={`w-full py-2 rounded ${fontSize === 'normal' ? 'bg-sky-600 text-white' : 'hover:bg-slate-700'}`}
                           >
                            {t('fontSizeNormal')}
                           </button>
                           <button
                             onClick={() => setFontSize('large')}
                             className={`w-full py-2 rounded ${fontSize === 'large' ? 'bg-sky-600 text-white' : 'hover:bg-slate-700'}`}
                           >
                            {t('fontSizeLarge')}
                           </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-8 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;