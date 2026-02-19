'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';
import { CivilLLMLogo } from '@/components/icons/BotIcons';

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

export default function AdminPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        file: null as File | null,
        title: '',
        codeNumber: '',
        version: '',
        year: '',
        jurisdiction: 'National',
        domainId: 'site',
    });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/documents');
            const data = await res.json();
            setDocuments(data.documents || []);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadForm({ ...uploadForm, file, title: file.name.replace('.pdf', '') });
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
            formData.append('domainId', uploadForm.domainId);

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
                    domainId: 'site',
                });
                fetchDocuments();
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'INDEXED': return 'badge-success';
            case 'PROCESSING': return 'badge-warning';
            case 'PENDING': return 'badge-neutral';
            case 'FAILED': return 'badge-error';
            default: return 'badge-neutral';
        }
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
                    <Link href="/admin/qa" className={styles.navItem}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" />
                            <path d="M10 14v-4M10 6h.01" />
                        </svg>
                        QA Queue
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
                        <h1 className={styles.pageTitle}>Admin Dashboard</h1>
                        <p className={styles.pageSubtitle}>Manage documents, review flagged answers, and monitor system health</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowUploadModal(true)}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 2v12M2 8h12" />
                        </svg>
                        Upload Document
                    </button>
                </header>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📄</div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{documents.length}</div>
                            <div className={styles.statLabel}>Total Documents</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>✅</div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>
                                {documents.filter(d => d.status === 'INDEXED').length}
                            </div>
                            <div className={styles.statLabel}>Indexed</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>⏳</div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>
                                {documents.filter(d => d.status === 'PROCESSING').length}
                            </div>
                            <div className={styles.statLabel}>Processing</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🚩</div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>0</div>
                            <div className={styles.statLabel}>Flagged Answers</div>
                        </div>
                    </div>
                </div>

                {/* Documents Table */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recent Documents</h2>
                        <Link href="/admin/documents" className={styles.sectionLink}>
                            View all →
                        </Link>
                    </div>

                    <div className={styles.tableContainer}>
                        {isLoading ? (
                            <div className={styles.loading}>
                                <span className="spinner"></span>
                                Loading documents...
                            </div>
                        ) : documents.length === 0 ? (
                            <div className={styles.empty}>
                                <p>No documents uploaded yet.</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowUploadModal(true)}
                                >
                                    Upload your first document
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
                                            <td>
                                                <span className={`badge ${getStatusColor(doc.status)}`}>
                                                    {doc.status}
                                                </span>
                                            </td>
                                            <td>{doc.chunkCount}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button className="btn btn-ghost btn-sm">View</button>
                                                    <button className="btn btn-ghost btn-sm">Reindex</button>
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
                            <h2>Upload Document</h2>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setShowUploadModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className={styles.modalBody}>
                            <div className={styles.uploadArea}>
                                <input
                                    type="file"
                                    id="file"
                                    accept=".pdf"
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
                                            <span>Click to select PDF or drag and drop</span>
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

                            <div className="form-group">
                                <label className="form-label">Domain</label>
                                <select
                                    className="form-input"
                                    value={uploadForm.domainId}
                                    onChange={e => setUploadForm({ ...uploadForm, domainId: e.target.value })}
                                >
                                    <option value="site">Site Bot</option>
                                    <option value="rcc">RCC Bot</option>
                                    <option value="steel">Steel Bot</option>
                                    <option value="safety">Safety Bot</option>
                                </select>
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
                                    className="btn btn-primary"
                                    disabled={!uploadForm.file || isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <span className="spinner spinner-sm"></span>
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload & Process'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
