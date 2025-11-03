import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useSound } from '../hooks/useSound';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// IMPORTANT: Set your admin password in the Vercel Environment Variables.
// The variable name must be VITE_TEST_PAGE_PASSWORD
// @ts-ignore
const CORRECT_PASSWORD = import.meta.env.VITE_TEST_PAGE_PASSWORD || 'admin'; // Fallback for local dev

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslations();
    const { playSound } = useSound();

    // Reset state when modal is closed
    useEffect(() => {
        if (isOpen) {
            playSound('modalOpen');
        }
        if (!isOpen) {
            setTimeout(() => {
                setPassword('');
                setError('');
            }, 300); // Delay reset to allow for closing animation
        }
    }, [isOpen, playSound]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        playSound('buttonClick');
        if (!CORRECT_PASSWORD) {
            setError('Password is not set in environment variables.');
            playSound('error');
            return;
        }
        if (password === CORRECT_PASSWORD) {
            onSuccess();
        } else {
            setError(t('passwordModal.error'));
            playSound('error');
            setPassword(''); // Clear input on error
        }
    };
    
    // Handle clicks outside the modal content to close it
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleOverlayClick}
            aria-labelledby="password-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div 
                ref={modalRef}
                className="w-full max-w-sm p-8 space-y-6 content-card main-content"
            >
                <div className="text-center">
                    <h2 id="password-modal-title" className="text-2xl font-bold page-title">
                        {t('passwordModal.title')}
                    </h2>
                    <p className="text-gray-200 mt-2">{t('passwordModal.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password-input" className="sr-only">Password</label>
                        <input
                            id="password-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="form-input text-center"
                            required
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="flex items-start text-sm text-red-300">
                             <span className="text-lg text-red-400 mr-2">❌</span>
                             <p>{error}</p>
                        </div>
                    )}

                    <div className="flex gap-4 pt-2">
                         <button
                            type="button"
                            onClick={() => { playSound('buttonClick'); onClose(); }}
                            className="w-full btn-game"
                        >
                            {t('passwordModal.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="w-full btn-game"
                        >
                            {t('passwordModal.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
