'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';
import { CivilLLMLogo } from '@/components/icons/BotIcons';

// ============================================
// Types
// ============================================

interface Document {
    id: string;
    title: string;
    filename: string;
    codeNumber?: string;
    version?: string;
    year?: number;
    status: 'PENDING' | 'PROCESSING' | 'INDEXED' | 'FAILED';
    chunkCount: number;
    domainId?: string;
    createdAt: string;
}

interface BotTab {
    id: string;
    name: string;
    icon: string;
    color: string;
    bgColor: string;
    description: string;
    category: 'primary' | 'specialty';
}

// All bots excluding "Best" and "General"
const BOT_TABS: BotTab[] = [
    // Primary Experts
    { id: 'rcc', name: 'RCC', icon: '🧱', color: '#2563eb', bgColor: '#eff6ff', description: 'Reinforced concrete design, IS 456 codes', category: 'primary' },
    { id: 'steel', name: 'Steel', icon: '🔩', color: '#64748b', bgColor: '#f8fafc', description: 'Structural steel design, IS 800 codes', category: 'primary' },
    { id: 'site', name: 'Site', icon: '🏗️', color: '#f97316', bgColor: '#fff7ed', description: 'Site execution, curing, quality control', category: 'primary' },
    { id: 'surveying', name: 'Surveying', icon: '📐', color: '#22c55e', bgColor: '#f0fdf4', description: 'Land surveying, setting out, leveling', category: 'primary' },
    // Specialty Experts
    { id: 'geotechnical', name: 'Geotechnical', icon: '⛏️', color: '#a16207', bgColor: '#fefce8', description: 'Soil mechanics, foundations, earth works', category: 'specialty' },
    { id: 'masonry', name: 'Masonry', icon: '🧱', color: '#dc2626', bgColor: '#fef2f2', description: 'Brick, block masonry, mortar mixes', category: 'specialty' },
    { id: 'mep', name: 'MEP', icon: '⚡', color: '#06b6d4', bgColor: '#ecfeff', description: 'Mechanical, Electrical, Plumbing systems', category: 'specialty' },
    { id: 'roads', name: 'Roads & Highways', icon: '🛣️', color: '#d97706', bgColor: '#fffbeb', description: 'Road design, pavement, IRC codes', category: 'specialty' },
    { id: 'water', name: 'Water & Sanitation', icon: '💧', color: '#0d9488', bgColor: '#f0fdfa', description: 'Water supply, drainage, sewerage', category: 'specialty' },
    { id: 'qs', name: 'QS & Estimation', icon: '📊', color: '#ec4899', bgColor: '#fdf2f8', description: 'Quantity surveying, BOQ, costing', category: 'specialty' },
    { id: 'nbc', name: 'NBC', icon: '📗', color: '#10b981', bgColor: '#ecfdf5', description: 'National Building Code compliance', category: 'specialty' },
];

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('rcc');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [allDocCounts, setAllDocCounts] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [uploadForm, setUploadForm] = useState({
        file: null as File | null,
        title: '',
        codeNumber: '',
        version: '',
        year: '',
        jurisdiction: 'National',
    });

    const activeBot = BOT_TABS.find(b => b.id === activeTab)!;

    // Auth guard — redirect non-admins
    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/login');
            return;
        }
        const role = (session.user as { role?: string })?.role;
        if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
            router.push('/chat');
        }
    }, [session, status, router]);

    // Fetch documents for the active tab
    const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/documents?domainId=${activeTab}`);
            const data = await res.json();
            setDocuments(data.documents || []);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    // Fetch all domain counts for the tab badges
    const fetchAllCounts = useCallback(async () => {
        try {
            const res = await fetch('/api/documents');
            const data = await res.json();
            const docs: Document[] = data.documents || [];
            const counts: Record<string, number> = {};
            BOT_TABS.forEach(b => {
                counts[b.id] = docs.filter(d => d.domainId === b.id).length;
            });
            setAllDocCounts(counts);
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        if (session) fetchDocuments();
    }, [fetchDocuments, session]);

    useEffect(() => {
        if (session) fetchAllCounts();
    }, [fetchAllCounts, session]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadForm({ ...uploadForm, file, title: file.name.replace(/\.(pdf|txt|md)$/i, '') });
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadForm.file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadForm.file);
            formData.append('title', uploadForm.title);
            formData.append('codeNumber', uploadForm.codeNumber);
            formData.append('version', uploadForm.version);
            formData.append('year', uploadForm.year);
            formData.append('jurisdiction', uploadForm.jurisdiction);
            formData.append('domainId', activeTab);

            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setShowUploadModal(false);
                setUploadForm({
                    file: null,
                    title: '',
                    codeNumber: '',
                    version: '',
                    year: '',
                    jurisdiction: 'National',
                });
                fetchDocuments();
                fetchAllCounts();
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (docId: string) => {
        try {
            const res = await fetch(`/api/documents?id=${docId}`, { method: 'DELETE' });
            if (res.ok) {
                setDeleteConfirm(null);
                fetchDocuments();
                fetchAllCounts();
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { bg: string; color: string; label: string }> = {
            INDEXED: { bg: '#dcfce7', color: '#166534', label: '● Indexed' },
            PROCESSING: { bg: '#fef9c3', color: '#854d0e', label: '◌ Processing' },
            PENDING: { bg: '#f3f4f6', color: '#374151', label: '○ Pending' },
            FAILED: { bg: '#fee2e2', color: '#991b1b', label: '✕ Failed' },
        };
        const s = map[status] || map.PENDING;
        return (
            <span style={{
                display: 'inline-block',
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 20,
                background: s.bg,
                color: s.color,
            }}>
                {s.label}
            </span>
        );
    };

    // Show loading while checking auth
    if (status === 'loading') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9fafb' }}>
                <div style={{ textAlign: 'center' }}>
                    <span className="spinner" />
                    <p style={{ marginTop: 12, color: '#6b7280' }}>Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render anything if not admin (redirect happening)
    const role = (session?.user as { role?: string })?.role;
    if (!session || (role !== 'ADMIN' && role !== 'SUPERADMIN')) {
        return null;
    }

    const primaryBots = BOT_TABS.filter(b => b.category === 'primary');
    const specialtyBots = BOT_TABS.filter(b => b.category === 'specialty');

    return (
        <div className={styles.adminPage}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <Link href="/" className={styles.logo}>
                    <CivilLLMLogo size={28} />
                    <span className={styles.logoText}>CivilLLM</span>
                </Link>

                <nav className={styles.nav}>
                    <Link href="/admin" className={`${styles.navItem} ${styles.active}`}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="14" height="14" rx="2" />
                            <path d="M3 8h14M8 8v9" />
                        </svg>
                        RAG Documents
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link href="/chat" className={styles.navItem}>
                        ← Back to Chat
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.pageTitle}>RAG Document Management</h1>
                        <p className={styles.pageSubtitle}>Upload and manage knowledge base documents for each bot</p>
                    </div>
                </header>

                {/* Primary Experts Tabs */}
                <div style={{ marginBottom: 4 }}>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingLeft: 4 }}>
                        Primary Experts
                    </h4>
                    <div style={{
                        display: 'flex',
                        gap: 4,
                        flexWrap: 'wrap',
                    }}>
                        {primaryBots.map(bot => (
                            <button
                                key={bot.id}
                                onClick={() => setActiveTab(bot.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '8px 14px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: activeTab === bot.id ? 'white' : '#6b7280',
                                    background: activeTab === bot.id ? bot.color : '#f3f4f6',
                                    border: 'none',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <span style={{ fontSize: 15 }}>{bot.icon}</span>
                                {bot.name}
                                {(allDocCounts[bot.id] || 0) > 0 && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: 18,
                                        height: 18,
                                        padding: '0 5px',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: activeTab === bot.id ? bot.color : 'white',
                                        background: activeTab === bot.id ? 'white' : '#9ca3af',
                                        borderRadius: 9,
                                    }}>
                                        {allDocCounts[bot.id]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Specialty Experts Tabs */}
                <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 12, paddingLeft: 4 }}>
                        Specialty Experts
                    </h4>
                    <div style={{
                        display: 'flex',
                        gap: 4,
                        flexWrap: 'wrap',
                    }}>
                        {specialtyBots.map(bot => (
                            <button
                                key={bot.id}
                                onClick={() => setActiveTab(bot.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '8px 14px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: activeTab === bot.id ? 'white' : '#6b7280',
                                    background: activeTab === bot.id ? bot.color : '#f3f4f6',
                                    border: 'none',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <span style={{ fontSize: 15 }}>{bot.icon}</span>
                                {bot.name}
                                {(allDocCounts[bot.id] || 0) > 0 && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: 18,
                                        height: 18,
                                        padding: '0 5px',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: activeTab === bot.id ? bot.color : 'white',
                                        background: activeTab === bot.id ? 'white' : '#9ca3af',
                                        borderRadius: 9,
                                    }}>
                                        {allDocCounts[bot.id]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active Bot Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    marginBottom: 16,
                    background: activeBot.bgColor,
                    borderRadius: 14,
                    border: `1px solid ${activeBot.color}20`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}>
                            {activeBot.icon}
                        </div>
                        <div>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                                {activeBot.name} Documents
                            </h2>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>
                                {activeBot.description}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 16px',
                            background: activeBot.color,
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: `0 2px 8px ${activeBot.color}40`,
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 2v12M2 8h12" />
                        </svg>
                        Upload
                    </button>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                    <div style={{ padding: '14px 16px', background: 'white', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{documents.length}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Total Documents</div>
                    </div>
                    <div style={{ padding: '14px 16px', background: 'white', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#166534' }}>
                            {documents.filter(d => d.status === 'INDEXED').length}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Indexed</div>
                    </div>
                    <div style={{ padding: '14px 16px', background: 'white', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#854d0e' }}>
                            {documents.filter(d => d.status === 'PROCESSING' || d.status === 'PENDING').length}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Processing</div>
                    </div>
                </div>

                {/* Documents Table */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            {activeBot.icon} {activeBot.name} Knowledge Base
                        </h2>
                    </div>

                    <div className={styles.tableContainer}>
                        {isLoading ? (
                            <div className={styles.loading}>
                                <span className="spinner"></span>
                                Loading documents...
                            </div>
                        ) : documents.length === 0 ? (
                            <div className={styles.empty}>
                                <div style={{ fontSize: 40, marginBottom: 4 }}>{activeBot.icon}</div>
                                <p style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                                    No documents for {activeBot.name}
                                </p>
                                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
                                    Upload PDF documents to build this bot&apos;s knowledge base
                                </p>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    style={{
                                        padding: '8px 16px',
                                        background: activeBot.color,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Upload First Document
                                </button>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Document</th>
                                        <th>Code</th>
                                        <th>Version</th>
                                        <th>Status</th>
                                        <th>Chunks</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map(doc => (
                                        <tr key={doc.id}>
                                            <td>
                                                <div className={styles.docInfo}>
                                                    <span className={styles.docTitle}>{doc.title}</span>
                                                    <span className={styles.docFilename}>{doc.filename}</span>
                                                </div>
                                            </td>
                                            <td>{doc.codeNumber || '-'}</td>
                                            <td>{doc.version || '-'}</td>
                                            <td>{getStatusBadge(doc.status)}</td>
                                            <td>{doc.chunkCount}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    {deleteConfirm === doc.id ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleDelete(doc.id)}
                                                                style={{ padding: '4px 10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                style={{ padding: '4px 10px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(doc.id)}
                                                            style={{ padding: '4px 10px', background: 'white', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </main>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className={styles.modalOverlay} onClick={() => setShowUploadModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Upload to {activeBot.icon} {activeBot.name}</h2>
                            <button className={styles.closeBtn} onClick={() => setShowUploadModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleUpload} className={styles.modalBody}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 12px',
                                background: activeBot.bgColor,
                                borderRadius: 8,
                                marginBottom: 16,
                                fontSize: 12,
                                fontWeight: 600,
                                color: activeBot.color,
                            }}>
                                {activeBot.icon} This document will be exclusive to {activeBot.name}
                            </div>

                            <div className={styles.uploadArea}>
                                <input type="file" id="file" accept=".pdf,.txt,.md" onChange={handleFileChange} className={styles.fileInput} />
                                <label htmlFor="file" className={styles.fileLabel}>
                                    {uploadForm.file ? (
                                        <>
                                            <span className={styles.fileName}>{uploadForm.file.name}</span>
                                            <span className={styles.fileSize}>{(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M20 5v20M10 15l10-10 10 10" />
                                                <path d="M5 25v10h30V25" />
                                            </svg>
                                            <span>Click to select PDF, TXT, or MD file</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Document Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={uploadForm.title}
                                    onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    placeholder="e.g., IS 456:2000 - Plain and Reinforced Concrete"
                                    required
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className="form-group">
                                    <label className="form-label">Code Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={uploadForm.codeNumber}
                                        onChange={e => setUploadForm({ ...uploadForm, codeNumber: e.target.value })}
                                        placeholder="e.g., IS 456"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Version/Year</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={uploadForm.version}
                                        onChange={e => setUploadForm({ ...uploadForm, version: e.target.value })}
                                        placeholder="e.g., 2000"
                                    />
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 20px',
                                        background: activeBot.color,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        opacity: !uploadForm.file || isUploading ? 0.5 : 1,
                                    }}
                                    disabled={!uploadForm.file || isUploading}
                                >
                                    {isUploading ? 'Uploading...' : `Upload to ${activeBot.name}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
