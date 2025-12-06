import React from 'react';

interface ElixaLogoProps {
  className?: string;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  size?: number | string;
}

export const ElixaLogo: React.FC<ElixaLogoProps> = ({
  className = '',
  color,
  gradientFrom,
  gradientTo,
  size = 48,
}) => {
  const useGradient = gradientFrom && gradientTo;
  const gradientId = `elixa-gradient-${Math.random().toString(36).substr(2, 9)}`;
  const fillColor = useGradient ? `url(#${gradientId})` : (color || '#1E90FF');

  return (
    <svg
      viewBox="0 0 140 180"
      width={size}
      height={typeof size === 'number' ? (size * 180) / 140 : size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {useGradient && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
      )}
      
      {/* Main flask body */}
      <path
        d="M30 165 
           C10 165 10 145 15 130
           L40 85
           L40 70
           L55 70
           L55 55
           L85 55
           L85 70
           L100 70
           L100 85
           L125 130
           C130 145 130 165 110 165
           Z"
        fill={fillColor}
      />
      
      {/* Flask neck/stopper */}
      <rect x="52" y="45" width="36" height="18" rx="4" fill={fillColor} />
      
      {/* Liquid level inside flask (white cutout) */}
      <path
        d="M25 148
           Q50 135 70 145
           Q90 155 115 145
           L115 160
           Q115 163 110 163
           L30 163
           Q25 163 25 158
           Z"
        fill="white"
      />
      
      {/* Bubbles inside flask */}
      <circle cx="60" cy="98" r="6" fill="white" />
      <circle cx="78" cy="120" r="9" fill="white" />
      
      {/* LEFT SIDE CIRCUIT BRANCHES */}
      
      {/* Far left branch - diagonal going up-left */}
      <path
        d="M35 80 L18 55 L10 48"
        stroke={fillColor}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="42" r="12" fill={fillColor} />
      
      {/* Left-center branch - going up from neck */}
      <path
        d="M55 50 L42 25"
        stroke={fillColor}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="38" cy="18" r="12" fill={fillColor} />
      
      {/* Center-left node - small one */}
      <path
        d="M62 45 L55 22"
        stroke={fillColor}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="53" cy="15" r="9" fill={fillColor} />
      
      {/* Center branch - going straight up */}
      <path
        d="M70 45 L70 18"
        stroke={fillColor}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="70" cy="10" r="12" fill={fillColor} />
      
      {/* Right-center branch - going up-right */}
      <path
        d="M85 50 L98 25"
        stroke={fillColor}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="102" cy="18" r="12" fill={fillColor} />
      
      {/* RIGHT SIDE CIRCUIT BRANCHES */}
      
      {/* Upper right branch */}
      <path
        d="M105 75 L120 65"
        stroke={fillColor}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="128" cy="60" r="10" fill={fillColor} />
      
      {/* Lower right branch */}
      <path
        d="M110 90 L125 85"
        stroke={fillColor}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="132" cy="82" r="8" fill={fillColor} />
    </svg>
  );
};

export default ElixaLogo;
