'use client';

import React, { useId } from 'react';

interface IconProps {
    size?: number;
    className?: string;
}

// ============================================
// MAIN LOGO
// ============================================

// Premium CivilLLM Logo - Modern abstract "C" with engineering precision
export const CivilLLMLogo: React.FC<IconProps> = ({ size = 32, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
            <defs>
                <linearGradient id={`logoGradPrimary-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id={`logoGradAccent-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="22" fill={`url(#logoGradPrimary-${id})`} />
            <path
                d="M32 16C32 16 28 12 22 12C14.268 12 8 18.268 8 26C8 33.732 14.268 40 22 40C28 40 32 36 32 36"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M28 20C28 20 26 18 22 18C17.582 18 14 21.582 14 26C14 30.418 17.582 34 22 34C26 34 28 32 28 32"
                stroke={`url(#logoGradAccent-${id})`}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
            />
            <circle cx="36" cy="18" r="4" fill={`url(#logoGradAccent-${id})`} />
        </svg>
    );
};

// ============================================
// FEATURED BOTS
// ============================================

// Best Bot - AI Magic/Auto-selection (Star with sparkles)
export const BestBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`bestGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="26" fill={`url(#bestGrad-${id})`} opacity="0.15" />
            <circle cx="32" cy="32" r="20" fill={`url(#bestGrad-${id})`} />
            <path d="M32 18L34.5 26.5H43L36.5 32L39 41L32 36L25 41L27.5 32L21 26.5H29.5L32 18Z" fill="#fbbf24" />
            <circle cx="48" cy="16" r="3" fill="#fbbf24" />
            <circle cx="52" cy="24" r="2" fill="#f97316" />
            <circle cx="12" cy="20" r="2" fill="#fbbf24" />
        </svg>
    );
};

// General Bot - Brain/Neural Network (MoE model)
export const GeneralBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`genGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="24" fill={`url(#genGrad-${id})`} />
            {/* Brain outline */}
            <path d="M24 20C20 20 18 24 18 28C18 30 19 32 20 33C18 35 17 38 18 41C19 44 22 46 26 46C28 46 30 45 32 44C34 45 36 46 38 46C42 46 45 44 46 41C47 38 46 35 44 33C45 32 46 30 46 28C46 24 44 20 40 20C38 20 36 21 34 22C32 21 30 20 28 20C26 20 25 20 24 20Z" fill="white" opacity="0.9" />
            {/* Neural connections */}
            <circle cx="26" cy="28" r="3" fill={`url(#genGrad-${id})`} />
            <circle cx="38" cy="28" r="3" fill={`url(#genGrad-${id})`} />
            <circle cx="32" cy="38" r="3" fill={`url(#genGrad-${id})`} />
            <line x1="26" y1="28" x2="38" y2="28" stroke={`url(#genGrad-${id})`} strokeWidth="2" />
            <line x1="26" y1="28" x2="32" y2="38" stroke={`url(#genGrad-${id})`} strokeWidth="2" />
            <line x1="38" y1="28" x2="32" y2="38" stroke={`url(#genGrad-${id})`} strokeWidth="2" />
        </svg>
    );
};

// ============================================
// PRIMARY BOTS
// ============================================

// RCC Bot - Concrete Pillar with Rebar
export const RCCBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`rccGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
            </defs>
            <rect x="16" y="8" width="32" height="48" rx="2" fill="#9ca3af" />
            <rect x="20" y="12" width="24" height="40" fill="#d1d5db" />
            <rect x="24" y="8" width="3" height="48" fill={`url(#rccGrad-${id})`} />
            <rect x="32" y="8" width="3" height="48" fill={`url(#rccGrad-${id})`} />
            <rect x="40" y="8" width="3" height="48" fill={`url(#rccGrad-${id})`} />
            <rect x="16" y="16" width="32" height="3" fill={`url(#rccGrad-${id})`} />
            <rect x="16" y="28" width="32" height="3" fill={`url(#rccGrad-${id})`} />
            <rect x="16" y="40" width="32" height="3" fill={`url(#rccGrad-${id})`} />
        </svg>
    );
};

// Steel Bot - I-Beam
export const SteelBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`steelGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#475569" />
                </linearGradient>
            </defs>
            <rect x="8" y="8" width="48" height="10" rx="1" fill={`url(#steelGrad-${id})`} />
            <rect x="8" y="46" width="48" height="10" rx="1" fill={`url(#steelGrad-${id})`} />
            <rect x="26" y="18" width="12" height="28" fill={`url(#steelGrad-${id})`} />
            <circle cx="16" cy="13" r="3" fill="#1f2937" />
            <circle cx="48" cy="13" r="3" fill="#1f2937" />
            <circle cx="16" cy="51" r="3" fill="#1f2937" />
            <circle cx="48" cy="51" r="3" fill="#1f2937" />
        </svg>
    );
};

// Site Bot - Construction Crane
export const SiteBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`siteGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
            </defs>
            <rect x="8" y="52" width="48" height="6" rx="2" fill="#374151" />
            <rect x="28" y="12" width="8" height="44" fill={`url(#siteGrad-${id})`} />
            <rect x="12" y="12" width="40" height="6" fill={`url(#siteGrad-${id})`} />
            <rect x="44" y="18" width="4" height="20" fill="#fbbf24" />
            <rect x="42" y="38" width="8" height="8" rx="1" fill="#374151" />
            <path d="M12 12L20 6H28V12H12Z" fill="#fbbf24" />
            <circle cx="20" cy="56" r="3" fill="#1f2937" />
            <circle cx="44" cy="56" r="3" fill="#1f2937" />
        </svg>
    );
};

// Surveying Bot - Theodolite/Total Station
export const SurveyingBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`surveyGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
            </defs>
            {/* Tripod */}
            <path d="M32 36L16 56" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
            <path d="M32 36L48 56" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
            <path d="M32 36L32 56" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
            {/* Instrument body */}
            <rect x="22" y="20" width="20" height="16" rx="2" fill={`url(#surveyGrad-${id})`} />
            {/* Telescope */}
            <rect x="14" y="24" width="36" height="8" rx="2" fill="#374151" />
            <circle cx="50" cy="28" r="4" fill="#1f2937" />
            <circle cx="14" cy="28" r="3" fill="#60a5fa" />
            {/* Eyepiece */}
            <rect x="28" y="12" width="8" height="8" rx="1" fill={`url(#surveyGrad-${id})`} />
        </svg>
    );
};

// ============================================
// OTHER BOTS
// ============================================

// Geotechnical Bot - Soil Layers/Foundation
export const GeotechnicalBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`geoGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a16207" />
                    <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
            </defs>
            {/* Soil layers */}
            <rect x="8" y="40" width="48" height="8" fill="#92400e" />
            <rect x="8" y="48" width="48" height="8" fill="#78350f" />
            <rect x="8" y="32" width="48" height="8" fill="#a16207" />
            {/* Foundation */}
            <rect x="18" y="16" width="28" height="16" fill="#9ca3af" />
            <rect x="14" y="12" width="36" height="6" fill="#6b7280" />
            {/* Pile */}
            <rect x="28" y="28" width="8" height="28" fill={`url(#geoGrad-${id})`} />
            {/* Soil particles */}
            <circle cx="16" cy="36" r="2" fill="#d97706" />
            <circle cx="48" cy="44" r="2" fill="#92400e" />
            <circle cx="24" cy="52" r="2" fill="#78350f" />
        </svg>
    );
};

// Masonry Bot - Brick Wall
export const MasonryBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`masonryGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
            </defs>
            {/* Brick rows */}
            <rect x="8" y="8" width="22" height="10" rx="1" fill={`url(#masonryGrad-${id})`} />
            <rect x="34" y="8" width="22" height="10" rx="1" fill={`url(#masonryGrad-${id})`} />
            <rect x="8" y="22" width="14" height="10" rx="1" fill={`url(#masonryGrad-${id})`} />
            <rect x="26" y="22" width="14" height="10" rx="1" fill={`url(#masonryGrad-${id})`} />
            <rect x="44" y="22" width="12" height="10" rx="1" fill={`url(#masonryGrad-${id})`} />
            <rect x="8" y="36" width="22" height="10" rx="1" fill={`url(#masonryGrad-${id})`} />
            <rect x="34" y="36" width="22" height="10" rx="1" fill={`url(#masonryGrad-${id})`} />
            <rect x="8" y="50" width="14" height="10" rx="1" fill={`url(#masonryGrad-${id})`} />
            <rect x="26" y="50" width="14" height="10" rx="1" fill={`url(#masonryGrad-${id})`} />
            <rect x="44" y="50" width="12" height="10" rx="1" fill={`url(#masonryGrad-${id})`} />
            {/* Mortar lines */}
            <rect x="8" y="18" width="48" height="4" fill="#d1d5db" />
            <rect x="8" y="32" width="48" height="4" fill="#d1d5db" />
            <rect x="8" y="46" width="48" height="4" fill="#d1d5db" />
        </svg>
    );
};

// MEP Bot - Mechanical/Electrical/Plumbing
export const MEPBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`mepGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
            </defs>
            {/* Pipe */}
            <rect x="8" y="26" width="48" height="12" rx="2" fill={`url(#mepGrad-${id})`} />
            <rect x="20" y="18" width="8" height="28" rx="2" fill={`url(#mepGrad-${id})`} />
            {/* Electrical bolt */}
            <path d="M44 12L38 26H46L40 42" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {/* Valve */}
            <circle cx="24" cy="32" r="6" fill="#1f2937" />
            <rect x="20" y="12" width="8" height="6" fill="#6b7280" />
            {/* Fan/HVAC */}
            <circle cx="52" cy="52" r="8" fill={`url(#mepGrad-${id})`} />
            <path d="M52 48L52 56M48 52L56 52" stroke="white" strokeWidth="2" />
        </svg>
    );
};

// Roads & Highways Bot - Road with markings
export const RoadsBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`roadsGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
            </defs>
            {/* Road base */}
            <path d="M8 56L20 8H44L56 56H8Z" fill="#374151" />
            {/* Road surface */}
            <path d="M12 52L22 12H42L52 52H12Z" fill="#4b5563" />
            {/* Center line markings */}
            <rect x="30" y="16" width="4" height="8" fill={`url(#roadsGrad-${id})`} />
            <rect x="30" y="28" width="4" height="8" fill={`url(#roadsGrad-${id})`} />
            <rect x="30" y="40" width="4" height="8" fill={`url(#roadsGrad-${id})`} />
            {/* Edge lines */}
            <path d="M18 48L24 16" stroke="white" strokeWidth="2" />
            <path d="M46 48L40 16" stroke="white" strokeWidth="2" />
        </svg>
    );
};

// Water & Sanitation Bot - Water drop/pipe
export const WaterBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`waterGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#0f766e" />
                </linearGradient>
            </defs>
            {/* Water drop */}
            <path d="M32 8C32 8 16 28 16 40C16 49 23 56 32 56C41 56 48 49 48 40C48 28 32 8 32 8Z" fill={`url(#waterGrad-${id})`} />
            {/* Highlight */}
            <ellipse cx="26" cy="38" rx="4" ry="6" fill="white" opacity="0.4" />
            {/* Waves inside */}
            <path d="M20 44C22 42 26 42 28 44C30 46 34 46 36 44C38 42 42 42 44 44" stroke="white" strokeWidth="2" opacity="0.6" />
        </svg>
    );
};

// QS & Estimation Bot - Calculator/Document
export const QSBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`qsGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#db2777" />
                </linearGradient>
            </defs>
            {/* Calculator body */}
            <rect x="12" y="8" width="40" height="48" rx="4" fill={`url(#qsGrad-${id})`} />
            {/* Display */}
            <rect x="16" y="12" width="32" height="12" rx="2" fill="#1f2937" />
            <text x="42" y="22" fill="#22c55e" fontSize="10" fontFamily="monospace">₹</text>
            {/* Buttons */}
            <rect x="16" y="28" width="8" height="6" rx="1" fill="white" opacity="0.9" />
            <rect x="28" y="28" width="8" height="6" rx="1" fill="white" opacity="0.9" />
            <rect x="40" y="28" width="8" height="6" rx="1" fill="white" opacity="0.9" />
            <rect x="16" y="38" width="8" height="6" rx="1" fill="white" opacity="0.9" />
            <rect x="28" y="38" width="8" height="6" rx="1" fill="white" opacity="0.9" />
            <rect x="40" y="38" width="8" height="6" rx="1" fill="white" opacity="0.9" />
            <rect x="16" y="48" width="8" height="6" rx="1" fill="white" opacity="0.9" />
            <rect x="28" y="48" width="20" height="6" rx="1" fill="#22c55e" />
        </svg>
    );
};

// NBC Bot - Building Code/Shield with checkmark
export const NBCBotIcon: React.FC<IconProps> = ({ size = 48, className }) => {
    const id = useId();
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
            <defs>
                <linearGradient id={`nbcGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                </linearGradient>
            </defs>
            {/* Shield */}
            <path d="M32 4L8 14V30C8 44 18 54 32 60C46 54 56 44 56 30V14L32 4Z" fill={`url(#nbcGrad-${id})`} />
            <path d="M32 8L12 16V30C12 42 20 50 32 56C44 50 52 42 52 30V16L32 8Z" fill="#86efac" opacity="0.3" />
            {/* Document icon */}
            <rect x="22" y="20" width="20" height="26" rx="2" fill="white" />
            <rect x="26" y="26" width="12" height="2" fill={`url(#nbcGrad-${id})`} />
            <rect x="26" y="32" width="12" height="2" fill={`url(#nbcGrad-${id})`} />
            <rect x="26" y="38" width="8" height="2" fill={`url(#nbcGrad-${id})`} />
        </svg>
    );
};

// ============================================
// ICON MAPPING
// ============================================

export const BotIcons: Record<string, React.FC<IconProps>> = {
    best: BestBotIcon,
    general: GeneralBotIcon,
    rcc: RCCBotIcon,
    steel: SteelBotIcon,
    site: SiteBotIcon,
    surveying: SurveyingBotIcon,
    geotechnical: GeotechnicalBotIcon,
    masonry: MasonryBotIcon,
    mep: MEPBotIcon,
    roads: RoadsBotIcon,
    water: WaterBotIcon,
    qs: QSBotIcon,
    nbc: NBCBotIcon,
};

// Helper to get icon component by ID
export const getIconById = (id: string, size: number = 48): React.ReactNode => {
    const IconComponent = BotIcons[id];
    if (IconComponent) {
        return <IconComponent size={size} />;
    }
    return <BestBotIcon size={size} />;
};
