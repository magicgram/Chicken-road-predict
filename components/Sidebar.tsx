import React from 'react';
import type { User } from '../types';
import CloseIcon from './icons/CloseIcon';
import UserIcon from './icons/UserIcon';
import TestIcon from './icons/TestIcon';
import DashboardIcon from './icons/DashboardIcon';
import LanguageIcon from './icons/LanguageIcon';
import LogoutIcon from './icons/LogoutIcon';
import { useTranslations } from '../hooks/useTranslations';
import { useSound } from '../hooks/useSound';
import NexusPlayLogoIcon from './icons/NexusPlayLogoIcon';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onShowTestPage: () => void;
    onShowDashboard: () => void;
    onProfilePictureChange: (url: string) => void;
    onShowLanguageModal: () => void;
    onLogout: () => void;
    user: User | null;
}

const NavLink: React.FC<{ onClick: () => void; icon: React.ReactNode; text: string }> = ({ onClick, icon, text }) => {
    const { playSound } = useSound();
    return (
        <a 
            onClick={() => { playSound('buttonClick'); onClick(); }} 
            className="group relative flex items-center w-full p-3 space-x-4 text-base text-gray-200 rounded-lg hover:bg-black/20 focus:outline-none focus:bg-black/20 transition-colors duration-200 cursor-pointer"
        >
            {icon}
            <span>{text}</span>
        </a>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onShowTestPage, onShowDashboard, user, onProfilePictureChange, onShowLanguageModal, onLogout }) => {
    const { t } = useTranslations();
    const { playSound } = useSound();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                onProfilePictureChange(result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div 
            className={`fixed inset-0 z-40 ${isOpen ? '' : 'pointer-events-none'}`}
            aria-hidden={!isOpen}
            role="dialog"
            aria-modal="true"
        >
            {/* Overlay */}
            <div 
                className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>
            
            {/* Close Button on top right of screen */}
             <button 
                onClick={onClose} 
                className={`absolute top-5 right-5 text-gray-200 hover:text-white hover:scale-110 transform transition-all duration-300 ease-out z-50 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                aria-label="Close menu"
            >
                <CloseIcon className="h-8 w-8" />
            </button>

            {/* Panel */}
            <div className={`relative flex flex-col w-72 max-w-[calc(100vw-40px)] h-full bg-slate-700/80 border-r-4 border-slate-800 shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                <div className="flex flex-col h-full">
                    {/* User Info */}
                    <div className="flex items-center p-4 pt-16 space-x-3 border-b-2 border-slate-800">
                         <input
                            type="file"
                            id="profile-pic-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={!user}
                        />
                        <label htmlFor="profile-pic-upload" onClick={() => user && playSound('buttonClick')} className={`relative p-0.5 rounded-full border-2 border-yellow-400 flex-shrink-0 ${user ? 'cursor-pointer' : 'cursor-default'}`}>
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                                {user?.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" onContextMenu={(e) => e.preventDefault()} />
                                ) : (
                                    <UserIcon className="h-8 w-8 text-yellow-400"/>
                                )}
                            </div>
                        </label>
                        <div className="overflow-hidden">
                            <p className="font-bold text-base text-white font-['Orbitron'] tracking-wide truncate">
                                {user ? `${t('sidebar.player')} ${user.id}` : t('sidebar.welcome')}
                            </p>
                            <p className="text-xs text-yellow-300">Chicken Run Predictor</p>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 space-y-3 p-4">
                        {user && (
                           <NavLink 
                                onClick={onShowDashboard}
                                icon={<DashboardIcon className="h-6 w-6 text-gray-300 group-hover:text-yellow-300 transition-colors" />}
                                text={t('sidebar.dashboard')}
                           />
                        )}
                        <NavLink 
                            onClick={onShowTestPage}
                            icon={<TestIcon className="h-6 w-6 text-gray-300 group-hover:text-yellow-300 transition-colors" />}
                            text={t('sidebar.testPostback')}
                        />
                        <NavLink 
                            onClick={onShowLanguageModal}
                            icon={<LanguageIcon className="h-6 w-6 text-gray-300 group-hover:text-yellow-300 transition-colors" />}
                            text={t('sidebar.languages')}
                        />
                         {user && (
                           <NavLink 
                                onClick={onLogout}
                                icon={<LogoutIcon className="h-6 w-6 text-gray-300 group-hover:text-red-400 transition-colors" />}
                                text={t('sidebar.logout')}
                           />
                        )}
                    </nav>
                    
                    {/* Branding Footer */}
                    <div className="p-4">
                        <div className="flex items-center justify-end gap-2">
                            <NexusPlayLogoIcon className="h-5 w-5" />
                            <span 
                                className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#A076F9] to-[#65A4FF]"
                            >
                                NexusPlay
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;