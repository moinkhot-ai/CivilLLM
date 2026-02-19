'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
}

const BOT_TABS: BotTab[] = [
    { id: 'site', name: 'Site Bot', icon: '🏗️', color: '#2563eb', bgColor: '#eff6ff', description: 'Site engineering standards & measurement codes' },
    { id: 'rcc', name: 'RCC Bot', icon: '🧱', color: '#ea580c', bgColor: '#fff7ed', description: 'Reinforced concrete codes & design standards' },
    { id: 'steel', name: 'Steel Bot', icon: '🔩', color: '#7c3aed', bgColor: '#f5f3ff', description: 'Structural steel design codes & specifications' },
    { id: 'safety', name: 'Safety Bot', icon: '⚠️', color: '#dc2626', bgColor: '#fef2f2', description: 'Safety regulations & building codes' },
];

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('site');
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
        fetchDocuments();
    }, [fetchDocuments]);

    useEffect(() => {
        fetchAllCounts();
    }, [fetchAllCounts]);

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
            formData.append('domainId', activeTab); // Auto-assign to active bot

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
                        Dashboard
                    </Link>
                    <Link href="/admin/documents" className={styles.navItem}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4 4v12a2 2 0 002 2h8a2 2 0 002-2V8l-4-4H6a2 2 0 00-2 2z" />
                            <path d="M12 4v4h4" />
                        </svg>
                        Documents
                    </Link>
                    <Link href="/admin/users" className={styles.navItem}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="10" cy="6" r="3" />
                            <path d="M4 18v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                        </svg>
                        Users
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

                {/* Bot Tabs */}
                <div style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 24,
                    borderBottom: '2px solid #e5e7eb',
                    paddingBottom: 0,
                }}>
                    {BOT_TABS.map(bot => (
                        <button
                            key={bot.id}
                            onClick={() => setActiveTab(bot.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '12px 20px',
                                fontSize: 14,
                                fontWeight: 600,
                                color: activeTab === bot.id ? bot.color : '#6b7280',
                                background: activeTab === bot.id ? bot.bgColor : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === bot.id ? `3px solid ${bot.color}` : '3px solid transparent',
                                borderRadius: '8px 8px 0 0',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                            }}
                        >
                            <span style={{ fontSize: 18 }}>{bot.icon}</span>
                            {bot.name}
                            {(allDocCounts[bot.id] || 0) > 0 && (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 20,
                                    height: 20,
                                    padding: '0 6px',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: 'white',
                                    background: activeTab === bot.id ? bot.color : '#9ca3af',
                                    borderRadius: 10,
                                }}>
                                    {allDocCounts[bot.id]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Active Bot Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    marginBottom: 20,
                    background: activeBot.bgColor,
                    borderRadius: 16,
                    border: `1px solid ${activeBot.color}20`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}>
                            {activeBot.icon}
                        </div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
                                {activeBot.name} Documents
                            </h2>
                            <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
                                {activeBot.description}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 20px',
                            background: activeBot.color,
                            color: 'white',
                            border: 'none',
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: `0 2px 8px ${activeBot.color}40`,
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 2v12M2 8h12" />
                        </svg>
                        Upload to {activeBot.name}
                    </button>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                    <div style={{
                        padding: '16px 20px',
                        background: 'white',
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{documents.length}</div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>Total Documents</div>
                    </div>
                    <div style={{
                        padding: '16px 20px',
                        background: 'white',
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#166534' }}>
                            {documents.filter(d => d.status === 'INDEXED').length}
                        </div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>Indexed</div>
                    </div>
                    <div style={{
                        padding: '16px 20px',
                        background: 'white',
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#854d0e' }}>
                            {documents.filter(d => d.status === 'PROCESSING' || d.status === 'PENDING').length}
                        </div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>Processing</div>
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
                                <div style={{ fontSize: 48, marginBottom: 8 }}>{activeBot.icon}</div>
                                <p style={{ fontSize: 15, fontWeight: 500, color: '#374151' }}>
                                    No documents uploaded for {activeBot.name}
                                </p>
                                <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>
                                    Upload PDF documents to build this bot&apos;s knowledge base
                                </p>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    style={{
                                        padding: '10px 20px',
                                        background: activeBot.color,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 8,
                                        fontSize: 14,
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
                                                                style={{
                                                                    padding: '4px 12px',
                                                                    background: '#dc2626',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: 6,
                                                                    fontSize: 12,
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                style={{
                                                                    padding: '4px 12px',
                                                                    background: '#f3f4f6',
                                                                    color: '#374151',
                                                                    border: 'none',
                                                                    borderRadius: 6,
                                                                    fontSize: 12,
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(doc.id)}
                                                            style={{
                                                                padding: '4px 12px',
                                                                background: 'white',
                                                                color: '#dc2626',
                                                                border: '1px solid #fee2e2',
                                                                borderRadius: 6,
                                                                fontSize: 12,
                                                                fontWeight: 500,
                                                                cursor: 'pointer',
                                                            }}
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
                            <button
                                className={styles.closeBtn}
                                onClick={() => setShowUploadModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className={styles.modalBody}>
                            {/* Domain indicator */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 12px',
                                background: activeBot.bgColor,
                                borderRadius: 8,
                                marginBottom: 16,
                                fontSize: 13,
                                fontWeight: 600,
                                color: activeBot.color,
                            }}>
                                {activeBot.icon} This document will be exclusive to {activeBot.name}
                            </div>

                            <div className={styles.uploadArea}>
                                <input
                                    type="file"
                                    id="file"
                                    accept=".pdf,.txt,.md"
                                    onChange={handleFileChange}
                                    className={styles.fileInput}
                                />
                                <label htmlFor="file" className={styles.fileLabel}>
                                    {uploadForm.file ? (
                                        <>
                                            <span className={styles.fileName}>{uploadForm.file.name}</span>
                                            <span className={styles.fileSize}>
                                                {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
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
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowUploadModal(false)}
                                >
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
