import React, { useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useSound } from '../hooks/useSound';
import { languages } from '../i18n/translations';

interface LanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
    const { t, setLanguage, language } = useTranslations();
    const { playSound } = useSound();
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            playSound('modalOpen');
        }
    }, [isOpen, playSound]);

    // Handle clicks outside the modal content to close it
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };
    
    const handleLanguageSelect = (langCode: string) => {
        playSound('buttonClick');
        setLanguage(langCode);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleOverlayClick}
            aria-labelledby="language-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div 
                ref={modalRef}
                className="w-full max-w-sm p-6 flex flex-col max-h-[85vh] content-card main-content"
            >
                <div className="text-center flex-shrink-0">
                    <h2 id="language-modal-title" className="text-2xl font-bold page-title">
                        {t('languageModal.title')}
                    </h2>
                </div>

                <div className="mt-6 space-y-3 overflow-y-auto pr-2 -mr-2">
                    {Object.entries(languages).map(([code, { name, flag }]) => (
                        <button
                            key={code}
                            onClick={() => handleLanguageSelect(code)}
                            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-left font-semibold text-lg ${
                                language === code
                                ? 'bg-yellow-500/80 text-white shadow-md ring-2 ring-white'
                                : 'bg-black/30 hover:bg-black/50 text-gray-200'
                            }`}
                        >
                            <span className="mr-4 text-2xl">{flag}</span>
                            <span>{name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LanguageModal;