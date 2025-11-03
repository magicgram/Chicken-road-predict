import React from 'react';

const NexusPlayLogoIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="nexus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#A076F9' }} />
                <stop offset="100%" style={{ stopColor: '#65A4FF' }} />
            </linearGradient>
        </defs>
        <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="url(#nexus-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12L20 7.5" stroke="url(#nexus-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12V21" stroke="url(#nexus-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12L4 7.5" stroke="url(#nexus-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default NexusPlayLogoIcon;
