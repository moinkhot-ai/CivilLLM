'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CivilLLMLogo } from '@/components/icons/BotIcons';

export default function ProfilePage() {
    const [user, setUser] = useState({
        name: 'Guest User',
        email: 'guest@example.com',
        role: 'USER',
        preferredDomain: 'best',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...user });

    const handleSave = () => {
        setUser(formData);
        setIsEditing(false);
        // In real app, this would call an API to update user
    };

    const domains = [
        { id: 'best', name: 'Best (Auto)' },
        { id: 'site', name: 'Site Bot' },
        { id: 'rcc', name: 'RCC Bot' },
        { id: 'steel', name: 'Steel Bot' },
        { id: 'safety', name: 'Safety Bot' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
            {/* Header */}
            <header style={{
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                    <CivilLLMLogo size={32} />
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#1e40af' }}>CivilLLM</span>
                </Link>
                <Link href="/chat" style={{
                    padding: '8px 16px',
                    background: '#2563eb',
                    color: 'white',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500
                }}>
                    Back to Chat
                </Link>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Profile</h1>
                <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32 }}>Manage your account settings and preferences</p>

                {/* Profile Card */}
                <div style={{
                    background: 'white',
                    borderRadius: 16,
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                }}>
                    {/* Avatar Section */}
                    <div style={{
                        padding: 32,
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20
                    }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 32,
                            fontWeight: 700,
                            color: 'white'
                        }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{user.name}</h2>
                            <p style={{ fontSize: 14, color: '#6b7280' }}>{user.email}</p>
                            <span style={{
                                display: 'inline-block',
                                marginTop: 8,
                                padding: '4px 12px',
                                background: user.role === 'ADMIN' ? '#fef3c7' : '#eff6ff',
                                color: user.role === 'ADMIN' ? '#92400e' : '#1e40af',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600
                            }}>
                                {user.role}
                            </span>
                        </div>
                    </div>

                    {/* Settings */}
                    <div style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Settings</h3>

                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            fontSize: 15,
                                            border: '1px solid #d1d5db',
                                            borderRadius: 8,
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            fontSize: 15,
                                            border: '1px solid #d1d5db',
                                            borderRadius: 8,
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Preferred Domain</label>
                                    <select
                                        value={formData.preferredDomain}
                                        onChange={e => setFormData({ ...formData, preferredDomain: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            fontSize: 15,
                                            border: '1px solid #d1d5db',
                                            borderRadius: 8,
                                            outline: 'none',
                                            background: 'white'
                                        }}
                                    >
                                        {domains.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                    <button
                                        onClick={handleSave}
                                        style={{
                                            padding: '10px 20px',
                                            background: '#2563eb',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 8,
                                            fontSize: 14,
                                            fontWeight: 500,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(false); setFormData({ ...user }); }}
                                        style={{
                                            padding: '10px 20px',
                                            background: '#f3f4f6',
                                            color: '#374151',
                                            border: 'none',
                                            borderRadius: 8,
                                            fontSize: 14,
                                            fontWeight: 500,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                    borderBottom: '1px solid #f3f4f6'
                                }}>
                                    <div>
                                        <div style={{ fontSize: 14, color: '#6b7280' }}>Preferred Domain</div>
                                        <div style={{ fontSize: 15, color: '#111827', marginTop: 2 }}>
                                            {domains.find(d => d.id === user.preferredDomain)?.name || 'Best (Auto)'}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    style={{
                                        marginTop: 16,
                                        padding: '10px 20px',
                                        background: '#f3f4f6',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Edit Profile
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Danger Zone */}
                <div style={{
                    marginTop: 24,
                    background: 'white',
                    borderRadius: 16,
                    border: '1px solid #fecaca',
                    padding: 24
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>Danger Zone</h3>
                    <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                        style={{
                            padding: '10px 20px',
                            background: 'white',
                            color: '#dc2626',
                            border: '1px solid #dc2626',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        Delete Account
                    </button>
                </div>
            </main>
        </div>
    );
}
