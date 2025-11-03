import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import PredictorPage from './components/PredictorPage';
import AccessGuide from './components/AccessGuide';
import SetupGuide from './components/PostbackGuide'; // Renamed logically, but file is PostbackGuide.tsx
import TestPage from './components/TestPage';
import Sidebar from './components/Sidebar';
import PasswordModal from './components/PasswordModal';
import { verificationService } from './services/verificationService';
import type { User } from './types';
import MenuIcon from './components/icons/MenuIcon';
import LogoutIcon from './components/icons/LogoutIcon';
import { LanguageProvider } from './context/LanguageContext';
import { SoundProvider } from './context/SoundContext';
import { useTranslations } from './hooks/useTranslations';
import { useSound } from './hooks/useSound';
import LanguageModal from './components/LanguageModal';
import SoundIcon from './components/icons/SoundIcon';
import SoundMutedIcon from './components/icons/SoundMutedIcon';

// Local storage keys
const ACTIVE_USER_KEY = 'minesPredictorActiveUser';
const USER_DATA_KEY_PREFIX = 'minesPredictorUser:';


const InfoIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6 text-white' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const AppContent: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [activeGuide, setActiveGuide] = useState<string | null>(null); // 'access', 'setup', or null
    const [showTestPage, setShowTestPage] = useState<boolean>(false);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
    const { t } = useTranslations();
    const { isMuted, toggleMute, playSound } = useSound();

    
    // State to track login attempts from localStorage
    const [loginAttempts, setLoginAttempts] = useState<Record<string, number>>(() => {
        try {
            const storedAttempts = localStorage.getItem('loginAttempts');
            return storedAttempts ? JSON.parse(storedAttempts) : {};
        } catch (e) {
            console.error("Failed to parse login attempts from localStorage", e);
            return {};
        }
    });

    const loadUserFromStorage = useCallback(async () => {
        const activeUserId = localStorage.getItem(ACTIVE_USER_KEY);
        if (activeUserId) {
            const storedUserJSON = localStorage.getItem(`${USER_DATA_KEY_PREFIX}${activeUserId}`);
            if (storedUserJSON) {
                const parsedUser: User = JSON.parse(storedUserJSON);
                
                if (parsedUser.awaitingDeposit) {
                    const result = await verificationService.verifyRedeposit(parsedUser.id, parsedUser.knownRedeposits);
                    if (result.success && result.newRedepositCount !== undefined) {
                        const updatedUser = { ...parsedUser, predictionCount: 0, awaitingDeposit: false, knownRedeposits: result.newRedepositCount };
                        localStorage.setItem(`${USER_DATA_KEY_PREFIX}${updatedUser.id}`, JSON.stringify(updatedUser));
                        setUser(updatedUser);
                        playSound('success');
                        alert(t('alert.depositSuccess'));
                    } else {
                        setUser(parsedUser);
                    }
                } else {
                    setUser(parsedUser);
                }
            }
        }
        setIsLoading(false);
    }, [t, playSound]);

    useEffect(() => {
        loadUserFromStorage();
    }, [loadUserFromStorage]);

    const handleLogin = async (userId: string) => {
        setIsLoading(true);
        setError(null);
        setInfoMessage(null);
        const result = await verificationService.verifyInitialLogin(userId);
        
        if (result.success && result.redepositCount !== undefined) {
            playSound('success');
            const apiRedepositCount = result.redepositCount;
            const userStorageKey = `${USER_DATA_KEY_PREFIX}${userId}`;
            const storedUserJSON = localStorage.getItem(userStorageKey);
            let userToActivate: User;

            if (storedUserJSON) {
                // User has logged in on this device before.
                const storedUser: User = JSON.parse(storedUserJSON);

                if (apiRedepositCount > storedUser.knownRedeposits) {
                    // Re-deposit detected! Reset prediction count.
                    userToActivate = { 
                        ...storedUser, 
                        predictionCount: 0, 
                        awaitingDeposit: false, 
                        knownRedeposits: apiRedepositCount 
                    };
                    alert(t('alert.newDepositConfirmed'));
                } else {
                    // No new deposit, just logging in again. Preserve prediction count.
                    userToActivate = {
                        ...storedUser,
                        awaitingDeposit: false, // Ensure this is reset on login
                        knownRedeposits: apiRedepositCount // Sync count just in case
                    };
                }
            } else {
                // First time this user is logging in on this device.
                userToActivate = { 
                    id: userId, 
                    predictionCount: 0, 
                    awaitingDeposit: false, 
                    knownRedeposits: apiRedepositCount 
                };
            }

            // Save the user's persistent state
            localStorage.setItem(userStorageKey, JSON.stringify(userToActivate));
            // Set the active user for the session
            localStorage.setItem(ACTIVE_USER_KEY, userId);
            // Update React state
            setUser(userToActivate);

            // On successful login, clear the attempt counter for this user
            const updatedAttempts = { ...loginAttempts };
            if (updatedAttempts[userId]) {
                delete updatedAttempts[userId];
                setLoginAttempts(updatedAttempts);
                localStorage.setItem('loginAttempts', JSON.stringify(updatedAttempts));
            }
        } else {
            playSound('error');
            // Check for the specific "not found" error from the backend.
            if (result.message && result.message.startsWith("No registration found yet!")) {
                const currentCount = loginAttempts[userId] || 0;
                const newCount = currentCount + 1;
                
                const updatedAttempts = { ...loginAttempts, [userId]: newCount };
                setLoginAttempts(updatedAttempts);
                localStorage.setItem('loginAttempts', JSON.stringify(updatedAttempts));

                if (newCount < 3) {
                    setError("error.notRegistered");
                } else {
                    setError("error.notFoundYet");
                }
            } else if (result.message && result.message.includes('successfully completed registration')) {
                setInfoMessage(result.message);
            } else {
                setError(result.message || "Login failed.");
            }
        }
        setIsLoading(false);
    };

    const handleLogout = () => {
        playSound('modalClose');
        // Only remove the active session key, not the user's data
        localStorage.removeItem(ACTIVE_USER_KEY);
        setUser(null);
        setIsMenuOpen(false); // Close menu on logout
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        // Save the updated user data to their specific storage key
        localStorage.setItem(`${USER_DATA_KEY_PREFIX}${updatedUser.id}`, JSON.stringify(updatedUser));
    };

    const handleProfilePictureChange = (url: string) => {
        if (user) {
            playSound('success');
            const updatedUser = { ...user, profilePictureUrl: url };
            updateUser(updatedUser);
        }
    };

    const toggleAccessGuide = () => {
        playSound(activeGuide === 'access' ? 'modalClose' : 'modalOpen');
        setIsMenuOpen(false); // Always close menu when interacting with guide
        if (activeGuide === 'access') {
            setActiveGuide(null);
        } else {
            setShowTestPage(false);
            setActiveGuide('access');
        }
    };
    
    const handleShowSetupGuide = () => {
        playSound('buttonClick');
        setShowTestPage(false);
        setActiveGuide('setup');
        setIsMenuOpen(false);
    }

    const handleShowTestPage = () => {
        playSound('buttonClick');
        setIsMenuOpen(false);
        setIsPasswordModalOpen(true);
    };
    
    const handlePasswordSuccess = () => {
        playSound('success');
        setIsPasswordModalOpen(false);
        setActiveGuide(null);
        setShowTestPage(true);
    };

    const handleShowDashboard = () => {
        playSound('buttonClick');
        setActiveGuide(null);
        setShowTestPage(false);
        setIsMenuOpen(false);
    };

    const handleShowLanguageModal = () => {
        playSound('buttonClick');
        setIsMenuOpen(false);
        setIsLanguageModalOpen(true);
    }
    
    if (isLoading && !user) { // Only show full-screen loader on initial load
        return (
            <div className="flex items-center justify-center min-h-screen">
                 <div className="static-clouds"></div>
                <div className="loading-spinner"></div>
            </div>
        );
    }
    
    const isPredictorPageActive = user && !activeGuide && !showTestPage;

    const renderContent = () => {
        if (showTestPage) return <TestPage onShowSetupGuide={handleShowSetupGuide} />;
        if (activeGuide === 'access') return <AccessGuide />;
        if (activeGuide === 'setup') return <SetupGuide />;
        if (!user) return <LoginPage onLogin={handleLogin} error={error} isLoading={isLoading} infoMessage={infoMessage} />;
        
        return <PredictorPage user={user} onUpdateUser={updateUser} />;
    };

    return (
        <div className={isPredictorPageActive ? '' : 'page-container'}>
            {!isPredictorPageActive && <div className="static-clouds"></div>}

            <PasswordModal 
                isOpen={isPasswordModalOpen}
                onClose={() => { playSound('modalClose'); setIsPasswordModalOpen(false); }}
                onSuccess={handlePasswordSuccess}
            />
            <LanguageModal
                isOpen={isLanguageModalOpen}
                onClose={() => { playSound('modalClose'); setIsLanguageModalOpen(false); }}
            />
            <Sidebar
                isOpen={isMenuOpen}
                onClose={() => { playSound('modalClose'); setIsMenuOpen(false); }}
                onShowTestPage={handleShowTestPage}
                onShowDashboard={handleShowDashboard}
                onProfilePictureChange={handleProfilePictureChange}
                onShowLanguageModal={handleShowLanguageModal}
                user={user}
                onLogout={handleLogout}
            />
            
            <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-20">
                {isPredictorPageActive && user ? (
                     <h1 className="font-bold text-lg" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.5)'}}>{t('predictor.welcome')} - {user.id}</h1>
                ) : (
                    <div /> // Placeholder to keep the menu button on the right
                )}
                <div className="flex items-center gap-4">
                    {isPredictorPageActive && (
                        <button 
                            onClick={() => { playSound('buttonClick'); toggleMute(); }}
                            className="header-btn"
                            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                        >
                            {isMuted ? <SoundMutedIcon /> : <SoundIcon />}
                        </button>
                    )}
                    <button 
                        onClick={toggleAccessGuide}
                        className="header-btn"
                        aria-label={activeGuide === 'access' ? `${t('header.hide')} ${t('header.guide')}` : t('header.guide')}
                    >
                        <InfoIcon />
                    </button>
                    <button
                        onClick={() => { playSound('modalOpen'); setIsMenuOpen(true); }}
                        className="header-btn"
                        aria-label="Open menu"
                    >
                        <MenuIcon />
                    </button>
                </div>
            </header>


            <main className="main-content w-full">
                {renderContent()}
            </main>
        </div>
    );
};


const App: React.FC = () => (
    <LanguageProvider>
        <SoundProvider>
            <AppContent />
        </SoundProvider>
    </LanguageProvider>
);


export default App;
