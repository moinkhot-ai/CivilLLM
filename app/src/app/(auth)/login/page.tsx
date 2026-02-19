'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../auth.module.css';
import { CivilLLMLogo } from '@/components/icons/BotIcons';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/chat';
    const error = searchParams.get('error');

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormError('');

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setFormError('Invalid email or password');
            } else {
                router.push(callbackUrl);
            }
        } catch {
            setFormError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl });
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authBackground}>
                <div className={styles.authGradient}></div>
                <div className={styles.authGrid}></div>
            </div>

            <div className={styles.authContainer}>
                <Link href="/" className={styles.authLogo}>
                    <CivilLLMLogo size={36} />
                    <span className={styles.logoText}>CivilLLM</span>
                </Link>

                <div className={styles.authCard}>
                    <div className={styles.authHeader}>
                        <h1 className={styles.authTitle}>Welcome back</h1>
                        <p className={styles.authSubtitle}>Sign in to continue to CivilLLM</p>
                    </div>

                    {error && (
                        <div className={styles.authAlert}>
                            {error === 'OAuthAccountNotLinked'
                                ? 'This email is already registered with a different method.'
                                : 'An error occurred during sign in.'}
                        </div>
                    )}

                    {formError && <div className={styles.authAlert}>{formError}</div>}

                    <button type="button" onClick={handleGoogleSignIn} className={styles.socialButton}>
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className={styles.divider}><span>or continue with email</span></div>

                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={`form-input ${formError ? 'form-input-error' : ''}`}
                                placeholder="you@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <div className={styles.labelRow}>
                                <label htmlFor="password" className="form-label">Password</label>
                                <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className={`form-input ${formError ? 'form-input-error' : ''}`}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className={`btn btn-primary ${styles.submitButton}`} disabled={isLoading}>
                            {isLoading ? (<><span className="spinner spinner-sm"></span>Signing in...</>) : 'Sign in'}
                        </button>
                    </form>

                    <p className={styles.authFooter}>
                        Don't have an account?{' '}
                        <Link href="/signup" className={styles.authLink}>Sign up for free</Link>
                    </p>
                </div>

                <p className={styles.disclaimer}>
                    By signing in, you agree to our{' '}
                    <Link href="/terms">Terms of Service</Link> and{' '}
                    <Link href="/privacy">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
