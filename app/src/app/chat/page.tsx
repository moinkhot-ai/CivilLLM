'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DOMAINS, FEATURED_DOMAINS, PRIMARY_DOMAINS, OTHER_DOMAINS, type Message } from '@/types';
import { copyToClipboard } from '@/lib/utils';
import { CivilLLMLogo, BotIcons, getIconById } from '@/components/icons/BotIcons';

// All models including Best for dropdown
const ALL_MODELS = [
    { id: 'best', displayName: 'Best', description: 'Auto-selects the best expert', icon: 'best', category: 'featured' as const },
    { id: 'general', displayName: 'General', description: 'General civil engineering (MoE)', icon: 'general', category: 'featured' as const },
    ...PRIMARY_DOMAINS.map(d => ({ ...d, icon: d.id })),
    ...OTHER_DOMAINS.map(d => ({ ...d, icon: d.id })),
];


// Mobile-responsive CSS
const responsiveCSS = `
  .chat-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height for mobile */
    background: #f9fafb;
    font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .sidebar {
    display: flex;
    flex-direction: column;
    background: #111827;
    padding: 20px;
    color: white;
    overflow-y: auto;
  }
  
  .mobile-header {
    display: none;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    padding-top: max(12px, env(safe-area-inset-top));
    background: #111827;
    color: white;
  }
  
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: transparent;
    border: 1px solid #374151;
    border-radius: 8px;
    color: white;
    font-size: 20px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  
  .mobile-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }
  
  .mobile-logo-icon { font-size: 20px; }
  .mobile-logo-text { font-size: 16px; font-weight: 700; color: white; }
  
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 40;
    -webkit-tap-highlight-color: transparent;
  }
  
  .sidebar-overlay.open { display: block; }
  
  /* Tablet breakpoint */
  @media (max-width: 1024px) {
    .chat-layout {
      grid-template-columns: 240px 1fr;
    }
    
    .model-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12px !important;
    }
    
    .model-card-best {
      grid-column: span 2 !important;
    }
  }
  
  /* Mobile breakpoint */
  @media (max-width: 768px) {
    .chat-layout {
      grid-template-columns: 1fr;
    }
    
    .sidebar {
      position: fixed;
      left: -280px;
      top: 0;
      bottom: 0;
      width: 280px;
      z-index: 50;
      transition: left 0.3s ease;
      padding-top: max(20px, env(safe-area-inset-top));
    }
    
    .sidebar.open {
      left: 0;
    }
    
    .mobile-header {
      display: flex;
    }
    
    /* CRITICAL: Make main area a flex container with fixed height */
    .main-area {
      display: flex !important;
      flex-direction: column !important;
      height: 100dvh !important;
      max-height: 100dvh !important;
      overflow: hidden !important;
    }
    
    /* Messages container should scroll, not push content */
    .messages-container {
      flex: 1 !important;
      overflow-y: auto !important;
      min-height: 0 !important;
      padding: 12px !important;
    }
    
    /* Model selection should not overflow - start from top */
    .messages-container > div {
      height: auto !important;
      padding: 12px 0 !important;
      justify-content: flex-start !important;
    }
    
    /* Model selection specific */
    .model-selection {
      padding: 16px 8px !important;
    }
    
    /* 2-column compact grid on mobile */
    .model-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 8px !important;
      padding: 0 4px !important;
      max-width: 100% !important;
    }
    
    .model-card-best {
      grid-column: span 2 !important;
      padding: 10px !important;
    }
    
    /* Hide recommended badge on mobile */
    .model-card-best > div:first-child {
      display: none !important;
    }
    
    /* Smaller icon for Best card on mobile */
    .model-card-best > span {
      font-size: 28px !important;
      margin-bottom: 4px !important;
    }
    
    .welcome-title {
      font-size: 20px !important;
      margin-bottom: 4px !important;
    }
    
    /* Smaller subtitle */
    .welcome-title + p {
      font-size: 13px !important;
      margin-bottom: 12px !important;
    }
    
    /* Composer stays at bottom - never scroll */
    .composer-wrapper {
      flex-shrink: 0 !important;
      padding: 8px 12px !important;
      padding-bottom: max(8px, env(safe-area-inset-bottom)) !important;
    }
    
    .composer-inner {
      margin: 0 !important;
      padding: 8px !important;
    }
    
    /* Better touch targets on mobile */
    button {
      min-height: 44px;
    }
    
    /* Compact model cards */
    .model-grid button {
      padding: 8px !important;
      border-radius: 10px !important;
    }
    
    .model-grid button h3 {
      font-size: 12px !important;
      margin-bottom: 0 !important;
    }
    
    /* Hide description on mobile */
    .model-grid button p {
      display: none !important;
    }
    
    /* Much smaller emoji icons on mobile */
    .model-grid button span {
      font-size: 24px !important;
      margin-bottom: 4px !important;
    }
  }
  
  /* Small mobile - even more compact */
  @media (max-width: 480px) {
    .welcome-title {
      font-size: 18px !important;
    }
    
    .model-grid {
      gap: 6px !important;
    }
    
    .model-grid button {
      padding: 6px !important;
    }
    
    .model-grid button span {
      font-size: 20px !important;
      margin-bottom: 2px !important;
    }
    
    .model-grid button h3 {
      font-size: 11px !important;
    }
    
    .composer-inner {
      padding: 6px !important;
    }
    
    .messages-container {
      padding: 8px !important;
    }
  }
`;



function ChatContent() {
    const { data: session } = useSession();
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showMoreBots, setShowMoreBots] = useState(false);
    const [chatHistory] = useState([
        { id: '1', title: 'Curing period for M25 concrete', date: '2 hours ago', domain: 'rcc' },
        { id: '2', title: 'Lap length calculations', date: 'Yesterday', domain: 'rcc' },
        { id: '3', title: 'Cover requirements for slabs', date: '3 days ago', domain: 'site' },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const currentModel = selectedDomain ? ALL_MODELS.find(d => d.id === selectedDomain) : null;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const detectDomain = (query: string): string => {
        const q = query.toLowerCase();
        // RCC Bot
        if (q.includes('rcc') || q.includes('concrete') || q.includes('rebar') || q.includes('reinforcement') || q.includes('curing') || q.includes('is 456') || q.includes('lap length') || q.includes('cover')) {
            return 'rcc';
        }
        // Steel Bot
        if (q.includes('steel') || q.includes('is 800') || q.includes('structural steel') || q.includes('weld') || q.includes('bolt') || q.includes('i-beam') || q.includes('ismc') || q.includes('ismb')) {
            return 'steel';
        }
        // Surveying Bot
        if (q.includes('survey') || q.includes('leveling') || q.includes('theodolite') || q.includes('total station') || q.includes('setting out') || q.includes('benchmark') || q.includes('contour')) {
            return 'surveying';
        }
        // Geotechnical Bot
        if (q.includes('soil') || q.includes('foundation') || q.includes('bearing capacity') || q.includes('pile') || q.includes('geotechnical') || q.includes('spt') || q.includes('excavation')) {
            return 'geotechnical';
        }
        // Masonry Bot
        if (q.includes('brick') || q.includes('masonry') || q.includes('block') || q.includes('mortar') || q.includes('plastering') || q.includes('pointing')) {
            return 'masonry';
        }
        // MEP Bot
        if (q.includes('mep') || q.includes('plumbing') || q.includes('electrical') || q.includes('hvac') || q.includes('sanitary') || q.includes('drainage pipe') || q.includes('wiring')) {
            return 'mep';
        }
        // Roads Bot
        if (q.includes('road') || q.includes('highway') || q.includes('pavement') || q.includes('bitumen') || q.includes('irc') || q.includes('asphalt') || q.includes('camber')) {
            return 'roads';
        }
        // Water Bot
        if (q.includes('water supply') || q.includes('sewage') || q.includes('sewerage') || q.includes('stp') || q.includes('wtp') || q.includes('overhead tank') || q.includes('pipeline')) {
            return 'water';
        }
        // QS Bot
        if (q.includes('quantity') || q.includes('estimation') || q.includes('boq') || q.includes('rate') || q.includes('measurement') || q.includes('costing') || q.includes('tender')) {
            return 'qs';
        }
        // NBC Bot
        if (q.includes('nbc') || q.includes('building code') || q.includes('fire') || q.includes('safety') || q.includes('ppe') || q.includes('hazard') || q.includes('compliance')) {
            return 'nbc';
        }
        // Default to site
        return 'site';
    };

    const handleSelectModel = (modelId: string) => {
        console.log('Model selected:', modelId);
        setSelectedDomain(modelId);
        setSidebarOpen(false);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const question = inputValue.trim();
        if (!question || isLoading) return;

        let domainToUse = selectedDomain || 'best';
        if (domainToUse === 'best') {
            domainToUse = detectDomain(question);
            setSelectedDomain('best');
        }

        setInputValue('');
        if (inputRef.current) inputRef.current.style.height = 'auto';

        setMessages(prev => [...prev, {
            id: `user-${Date.now()}`,
            conversationId: 'demo',
            role: 'user',
            content: question,
            createdAt: new Date(),
        }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    domainId: domainToUse === 'best' ? detectDomain(question) : domainToUse,
                    conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
                }),
            });
            const data = await response.json();
            setMessages(prev => [...prev, {
                id: `assistant-${Date.now()}`,
                conversationId: 'demo',
                role: 'assistant',
                content: response.ok ? data.answer : (data.error || 'Sorry, something went wrong.'),
                createdAt: new Date(),
            }]);
        } catch {
            setMessages(prev => [...prev, { id: `error-${Date.now()}`, conversationId: 'demo', role: 'assistant', content: 'Network error.', createdAt: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async (content: string, id: string) => {
        if (await copyToClipboard(content)) { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); }
    };

    const filteredHistory = chatHistory.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const showModelSelection = !selectedDomain && messages.length === 0;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />

            {/* Mobile Header */}
            <div className="mobile-header">
                <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
                <Link href="/" className="mobile-logo">
                    <CivilLLMLogo size={24} />
                    <span className="mobile-logo-text">CivilLLM</span>
                </Link>
                <div style={{ width: 40 }} />
            </div>

            {/* Sidebar Overlay */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

            <div className="chat-layout">
                {/* Sidebar */}
                <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                            <CivilLLMLogo size={28} />
                            <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>CivilLLM</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            style={{ display: 'none', background: 'none', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer' }}
                            className="close-sidebar-btn"
                        >×</button>
                    </div>

                    <button
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, background: 'white', color: '#111827', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                        onClick={() => { setMessages([]); setSelectedDomain(null); setSidebarOpen(false); }}
                    >
                        + New Chat
                    </button>

                    <div style={{ margin: '16px 0' }}>
                        {showSearch ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#1f2937', border: '1px solid #4b5563', borderRadius: 10 }}>
                                <input
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 14 }}
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18 }} onClick={() => { setShowSearch(false); setSearchQuery(''); }}>×</button>
                            </div>
                        ) : (
                            <button
                                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', background: '#1f2937', border: '1px solid #374151', borderRadius: 10, color: '#9ca3af', fontSize: 14, cursor: 'pointer' }}
                                onClick={() => setShowSearch(true)}
                            >
                                🔍 Search
                            </button>
                        )}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', marginTop: 8 }}>
                        <h4 style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, padding: '0 8px' }}>Recent Chats</h4>
                        {filteredHistory.map(chat => (
                            <button key={chat.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', padding: 12, background: 'none', border: 'none', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}>
                                <span style={{ fontSize: 14 }}>{DOMAINS.find(d => d.id === chat.domain)?.icon || '💬'}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                                    <span style={{ fontSize: 13, color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.title}</span>
                                    <span style={{ fontSize: 11, color: '#6b7280' }}>{chat.date}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #374151' }}>
                        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: 12, color: '#d1d5db', textDecoration: 'none', borderRadius: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: '#2563eb', borderRadius: '50%', fontSize: 14, fontWeight: 700, color: 'white' }}>
                                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span style={{ flex: 1, fontSize: 14 }}>Profile</span>
                        </Link>
                    </div>
                </aside>

                {/* Main */}
                <main className="main-area" style={{ display: 'flex', flexDirection: 'column', background: 'white', overflow: 'hidden' }}>
                    {(selectedDomain || messages.length > 0) && (
                        <header style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ position: 'relative' }}>
                                <button
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer' }}
                                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                                >
                                    {currentModel?.icon || '✨'} {currentModel?.displayName || 'Best'} ▼
                                </button>
                                {showModelDropdown && (
                                    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, minWidth: 280, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
                                        {ALL_MODELS.map(d => (
                                            <button
                                                key={d.id}
                                                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', padding: '12px 16px', background: d.id === selectedDomain ? '#eff6ff' : 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                                                onClick={() => { setSelectedDomain(d.id); setShowModelDropdown(false); }}
                                            >
                                                <span style={{ fontSize: 18 }}>{d.icon}</span>
                                                <div>
                                                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{d.displayName}</div>
                                                    <div style={{ fontSize: 14, color: '#4b5563', marginTop: 4 }}>{d.description}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </header>
                    )}

                    <div className="messages-container" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                        {showModelSelection ? (
                            <div className="model-selection" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px' }}>
                                <h1 className="welcome-title" style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 8, letterSpacing: '-0.02em' }}>Start a New Chat</h1>
                                <p style={{ fontSize: 16, color: '#4b5563', marginBottom: 32, fontWeight: 500 }}>Choose an AI expert or just start typing</p>

                                {/* Featured Bots - Best & General */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 600, width: '100%', marginBottom: 24 }}>
                                    {/* Best Card */}
                                    <button
                                        type="button"
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20,
                                            background: selectedDomain === 'best' || !selectedDomain ? 'linear-gradient(135deg, #eff6ff, #f3e8ff)' : 'white',
                                            border: selectedDomain === 'best' || !selectedDomain ? '2px solid #8b5cf6' : '2px solid #e5e7eb',
                                            borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative'
                                        }}
                                        onClick={() => handleSelectModel('best')}
                                    >
                                        <div style={{ position: 'absolute', top: -10, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>✨ RECOMMENDED</div>
                                        <div style={{ marginTop: 8, marginBottom: 12 }}>{getIconById('best', 48)}</div>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1f2937', marginBottom: 6, letterSpacing: '-0.01em' }}>Best</h3>
                                        <p style={{ fontSize: 14, color: '#7c3aed', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>Auto-selects the right expert</p>
                                    </button>

                                    {/* General Card */}
                                    <button
                                        type="button"
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20,
                                            background: selectedDomain === 'general' ? '#eff6ff' : 'white',
                                            border: selectedDomain === 'general' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                                            borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s ease'
                                        }}
                                        onClick={() => handleSelectModel('general')}
                                    >
                                        <div style={{ marginBottom: 12 }}>{getIconById('general', 48)}</div>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1f2937', marginBottom: 6, letterSpacing: '-0.01em' }}>General</h3>
                                        <p style={{ fontSize: 14, color: '#2563eb', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>General civil engineering</p>
                                    </button>
                                </div>

                                {/* Primary Bots Section */}
                                <div style={{ width: '100%', maxWidth: 700, marginBottom: 16 }}>
                                    <h2 style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 14, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Primary Experts</h2>
                                    <div className="model-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                        {PRIMARY_DOMAINS.map(d => (
                                            <button
                                                type="button"
                                                key={d.id}
                                                style={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16,
                                                    background: selectedDomain === d.id ? '#eff6ff' : 'white',
                                                    border: selectedDomain === d.id ? `2px solid ${d.color}` : '2px solid #e5e7eb',
                                                    borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => handleSelectModel(d.id)}
                                            >
                                                <div style={{ marginBottom: 10 }}>{getIconById(d.id, 40)}</div>
                                                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 6, letterSpacing: '-0.01em' }}>{d.displayName.replace(' Bot', '')}</h3>
                                                <p style={{ fontSize: 12, color: d.color || '#6b7280', margin: 0, lineHeight: 1.4, textAlign: 'center', fontWeight: 500, opacity: 0.9 }}>{d.description?.split(',')[0]}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Show More Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowMoreBots(!showMoreBots)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        width: '100%', maxWidth: 700, padding: '12px 20px', marginBottom: 16,
                                        background: showMoreBots ? '#f3f4f6' : 'white', border: '1px solid #e5e7eb',
                                        borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#374151',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <span>{showMoreBots ? 'Show fewer experts' : `Show ${OTHER_DOMAINS.length} more experts`}</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: showMoreBots ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>
                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                {/* Other Bots Section - Expandable */}
                                <div style={{
                                    width: '100%', maxWidth: 700,
                                    overflow: 'hidden',
                                    maxHeight: showMoreBots ? '500px' : '0px',
                                    opacity: showMoreBots ? 1 : 0,
                                    transition: 'all 0.3s ease'
                                }}>
                                    <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specialty Experts</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                        {OTHER_DOMAINS.map(d => (
                                            <button
                                                type="button"
                                                key={d.id}
                                                style={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 14,
                                                    background: selectedDomain === d.id ? '#eff6ff' : 'white',
                                                    border: selectedDomain === d.id ? `2px solid ${d.color}` : '1px solid #e5e7eb',
                                                    borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => handleSelectModel(d.id)}
                                            >
                                                <div style={{ marginBottom: 8 }}>{getIconById(d.id, 32)}</div>
                                                <h3 style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 2, textAlign: 'center' }}>{d.displayName.replace(' Bot', '')}</h3>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%', padding: 32 }}>
                                <div style={{ marginBottom: 16 }}>{getIconById(selectedDomain || 'best', 64)}</div>
                                <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>How can I help you today?</h2>
                                <p style={{ fontSize: 16, color: '#4b5563', marginBottom: 24 }}>
                                    {selectedDomain === 'best' ? "I'll automatically route your question to the right expert" : `Ask me anything about ${currentModel?.displayName.toLowerCase()}`}
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                                    {['Curing period for M25?', 'Cover for RCC slab?', 'Lap length for 16mm bars'].map(p => (
                                        <button key={p} style={{ padding: '10px 18px', fontSize: 14, color: '#374151', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, cursor: 'pointer' }} onClick={() => setInputValue(p)}>{p}</button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                                {messages.map(m => (
                                    <div key={m.id} style={{ marginBottom: 24 }}>
                                        <div style={m.role === 'user' ? { display: 'flex', justifyContent: 'flex-end' } : {}}>
                                            <div style={m.role === 'user' ? { maxWidth: '80%', padding: 16, fontSize: 15, color: '#111827', background: '#fef3c7', borderRadius: '16px 16px 4px 16px' } : { padding: 16, fontSize: 15, lineHeight: 1.7, color: '#1f2937', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 16 }}>
                                                {m.role === 'user' ? m.content : (
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            h3: ({ children }) => <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginTop: 16, marginBottom: 8 }}>{children}</h3>,
                                                            h2: ({ children }) => <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginTop: 20, marginBottom: 10 }}>{children}</h2>,
                                                            strong: ({ children }) => <strong style={{ fontWeight: 600, color: '#111827' }}>{children}</strong>,
                                                            p: ({ children }) => <p style={{ marginBottom: 12, lineHeight: 1.7 }}>{children}</p>,
                                                            ul: ({ children }) => <ul style={{ marginLeft: 20, marginBottom: 12, listStyleType: 'disc' }}>{children}</ul>,
                                                            ol: ({ children }) => <ol style={{ marginLeft: 20, marginBottom: 12, listStyleType: 'decimal' }}>{children}</ol>,
                                                            li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                                                            code: ({ children }) => <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: 4, fontSize: 14, fontFamily: 'monospace' }}>{children}</code>,
                                                            pre: ({ children }) => <pre style={{ background: '#1f2937', color: '#f9fafb', padding: 16, borderRadius: 8, overflow: 'auto', marginBottom: 12 }}>{children}</pre>,
                                                        }}
                                                    >
                                                        {m.content}
                                                    </ReactMarkdown>
                                                )}
                                            </div>
                                        </div>
                                        {m.role === 'assistant' && (
                                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                <button style={{ padding: '4px 8px', fontSize: 12, background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }} onClick={() => handleCopy(m.content, m.id)}>{copiedId === m.id ? '✓' : '📋'} Copy</button>
                                                <button style={{ padding: '4px 8px', fontSize: 12, background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>👍</button>
                                                <button style={{ padding: '4px 8px', fontSize: 12, background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>👎</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div style={{ display: 'flex', gap: 4, padding: 16 }}>
                                        <span style={{ width: 8, height: 8, background: '#9ca3af', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                                        <span style={{ width: 8, height: 8, background: '#9ca3af', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
                                        <span style={{ width: 8, height: 8, background: '#9ca3af', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    <div className="composer-wrapper" style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6' }}>
                        <div className="composer-inner" style={{ display: 'flex', alignItems: 'flex-end', gap: 12, maxWidth: 800, margin: '0 auto', padding: 12, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 16 }}>
                            <textarea
                                ref={inputRef}
                                style={{ flex: 1, padding: 8, fontFamily: 'inherit', fontSize: 15, color: '#111827', background: 'none', border: 'none', outline: 'none', resize: 'none', minHeight: 24, maxHeight: 120 }}
                                value={inputValue}
                                onChange={e => { setInputValue(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; }}
                                placeholder={selectedDomain ? "Type your message..." : "Type a message (Best mode will auto-select)..."}
                                rows={1}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                            />
                            <button
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: (!inputValue.trim() || isLoading) ? '#d1d5db' : '#2563eb', border: 'none', borderRadius: 10, color: 'white', cursor: (!inputValue.trim() || isLoading) ? 'not-allowed' : 'pointer' }}
                                onClick={() => handleSubmit()}
                                disabled={!inputValue.trim() || isLoading}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>}>
            <ChatContent />
        </Suspense>
    );
}
