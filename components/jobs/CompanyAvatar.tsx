'use client';

import { useState } from 'react';

interface CompanyAvatarProps {
  companyName: string | null | undefined;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function CompanyAvatar({
  companyName,
  logoUrl,
  size = 'md',
}: CompanyAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const name = companyName?.trim() ?? '';
  const initial = name[0]?.toUpperCase() ?? 'C';

  const colors = [
    { bg: '#EFF6FF', text: '#1E40AF' },
    { bg: '#F0FDF4', text: '#166534' },
    { bg: '#FFF7ED', text: '#9A3412' },
    { bg: '#FDF4FF', text: '#6B21A8' },
    { bg: '#FFF1F2', text: '#9F1239' },
    { bg: '#F0FDFA', text: '#134E4A' },
  ];
  const color = name
    ? colors[name.charCodeAt(0) % colors.length]
    : colors[0];

  const dimensions = { sm: 32, md: 48, lg: 64 }[size];
  const sizeClass = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
  }[size];

  if (logoUrl && !imgError) {
    return (
      <div className={`${sizeClass} rounded-xl overflow-hidden shrink-0 select-none bg-white`}>
        <img
          src={logoUrl}
          alt={name || 'Company logo'}
          width={dimensions}
          height={dimensions}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-xl flex items-center justify-center font-bold shrink-0 select-none`}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {initial}
    </div>
  );
}
