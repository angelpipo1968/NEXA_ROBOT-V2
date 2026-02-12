
import React from 'react';

interface NexaLogoProps {
    className?: string;
    size?: number;
}

export const NexaLogo: React.FC<NexaLogoProps> = ({ className = '', size = 64 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} /> {/* Cyan-500 */}
                    <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} /> {/* Blue-500 */}
                </linearGradient>
                <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#d946ef', stopOpacity: 1 }} /> {/* Fuchsia-500 */}
                    <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} /> {/* Violet-500 */}
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* The X Shape - Two intersecting stylized strokes */}
            {/* Stroke 1 (Purple/Pink - Top Right to Bottom Left) */}
            <path
                d="M80 20 L20 80"
                stroke="url(#grad2)"
                strokeWidth="12"
                strokeLinecap="round"
                filter="url(#glow)"
                opacity="0.9"
            />

            {/* Stroke 2 (Cyan/Blue - Top Left to Bottom Right) - Overlaying slightly */}
            <path
                d="M20 20 L80 80"
                stroke="url(#grad1)"
                strokeWidth="12"
                strokeLinecap="round"
                filter="url(#glow)"
                style={{ mixBlendMode: 'screen' }}
            />

            {/* Center Intersection Highlight */}
            <circle cx="50" cy="50" r="5" fill="white" fillOpacity="0.5" filter="url(#glow)" />
        </svg>
    );
};
