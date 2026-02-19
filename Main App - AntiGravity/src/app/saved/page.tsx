'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './saved.module.css';
import { formatRelativeTime, copyToClipboard } from '@/lib/utils';
import { CivilLLMLogo } from '@/components/icons/BotIcons';

interface SavedAnswer {
    id: string;
    messageId: string;
    content: string;
    sources: object[];
    note?: string;
    savedAt: string;
}

export default function SavedAnswersPage() {
    const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([
        // Mock data for demo
        {
            id: '1',
            messageId: 'msg-1',
            content: 'According to IS 456:2000, the minimum curing period for ordinary concrete including M25 grade is 7 days for water curing when using Ordinary Portland Cement (OPC).',
            sources: [{
                docId: 'is456-2000',
                title: 'IS 456:2000',
                clause: 'Clause 13.5',
                page: 29,
            }],
            savedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
            id: '2',
            messageId: 'msg-2',
            content: 'The minimum nominal cover for reinforcement in slabs as per IS 456:2000 depends on the exposure condition: Mild - 20mm, Moderate - 30mm, Severe - 45mm.',
            sources: [{
                docId: 'is456-2000',
                title: 'IS 456:2000',
                clause: 'Clause 26.4.2',
                page: 47,
            }],
            savedAt: new Date(Date.now() - 86400000).toISOString(),
        },
    ]);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = async (content: string, id: string) => {
        const success = await copyToClipboard(content);
        if (success) {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const handleRemove = (id: string) => {
        setSavedAnswers(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>
                    <CivilLLMLogo size={28} />
                    <span className={styles.logoText}>CivilLLM</span>
                </Link>
                <nav className={styles.nav}>
                    <Link href="/chat" className={styles.navLink}>Chat</Link>
                    <Link href="/saved" className={`${styles.navLink} ${styles.active}`}>Saved</Link>
                    <Link href="/login" className="btn btn-primary btn-sm">Sign In</Link>
                </nav>
            </header>

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.titleSection}>
                        <h1 className={styles.title}>Saved Answers</h1>
                        <p className={styles.subtitle}>
                            Your bookmarked responses for quick reference
                        </p>
                    </div>

                    {savedAnswers.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>📑</div>
                            <h2>No saved answers yet</h2>
                            <p>Save answers from the chat to access them here anytime.</p>
                            <Link href="/chat" className="btn btn-primary">
                                Start Chatting
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.answersGrid}>
                            {savedAnswers.map(answer => (
                                <div key={answer.id} className={styles.answerCard}>
                                    <div className={styles.answerContent}>
                                        <p>{answer.content}</p>
                                    </div>

                                    {answer.sources && answer.sources.length > 0 && (
                                        <div className={styles.answerSources}>
                                            {(answer.sources as { title: string; clause?: string }[]).map((source, idx) => (
                                                <span key={idx} className="badge badge-primary">
                                                    {source.title} {source.clause}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className={styles.answerFooter}>
                                        <span className={styles.answerTime}>
                                            {formatRelativeTime(answer.savedAt)}
                                        </span>
                                        <div className={styles.answerActions}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handleCopy(answer.content, answer.id)}
                                            >
                                                {copiedId === answer.id ? '✓ Copied' : 'Copy'}
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} ${styles.removeBtn}`}
                                                onClick={() => handleRemove(answer.id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
