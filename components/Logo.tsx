
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'white' | 'primary';
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", variant = 'primary' }) => {
  // Use new Indigo 600 color (#4f46e5) instead of Red
  const color = variant === 'white' ? '#ffffff' : '#4f46e5';
  const fill = variant === 'white' ? '#ffffff' : '#4f46e5';
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexagon Background */}
      <path 
        d="M50 10L85 30V70L50 90L15 70V30L50 10Z" 
        fill={fill} 
        fillOpacity="0.1" 
        stroke={color} 
        strokeWidth="3"
        strokeOpacity="0.5"
      />
      
      {/* "K" Letter Shape */}
      <path 
        d="M35 30V70" 
        stroke={color} 
        strokeWidth="8" 
        strokeLinecap="round" 
      />
      <path 
        d="M65 30L35 50L65 70" 
        stroke={color} 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Optional decorative dot */}
      <circle cx="50" cy="50" r="3" fill={color} />
    </svg>
  );
};
