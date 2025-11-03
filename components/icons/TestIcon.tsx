
import React from 'react';

const TestIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3m-6.75 5.25a5.25 5.25 0 0110.5 0v2.25a2.25 2.25 0 01-2.25 2.25H8.25a2.25 2.25 0 01-2.25-2.25V11.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18.75a.75.75 0 00.75.75h10.5a.75.75 0 00.75-.75V11.25a5.25 5.25 0 00-12 0v7.5z" />
    </svg>
);

export default TestIcon;
