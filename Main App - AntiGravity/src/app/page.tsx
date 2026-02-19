'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DOMAINS, QUICK_PROMPTS } from '@/types';
import { CivilLLMLogo } from '@/components/icons/BotIcons';

// Responsive CSS (can't do media queries in inline styles)
const responsiveCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif; }
  
  /* Mobile-first defaults */
  .nav-links { display: none; }
  .mobile-menu { display: block; min-width: 44px; min-height: 44px; }
  .hero-cta { flex-direction: column; width: 100%; }
  .hero-cta a { width: 100%; text-align: center; }
  .domain-grid { grid-template-columns: 1fr; }
  .feature-grid { grid-template-columns: 1fr; }
  .pricing-grid { grid-template-columns: 1fr; }
  .steps-grid { flex-direction: column; }
  .step-connector { display: none; }
  .footer-content { grid-template-columns: 1fr; }
  .footer-links { grid-template-columns: repeat(2, 1fr); }
  .cta-form { flex-direction: column; }
  
  /* Small mobile (320px-480px) */
  @media (max-width: 480px) {
    .hero-section h1 { font-size: 28px !important; }
    .domain-grid > div { padding: 16px !important; }
    .section-title { font-size: 24px !important; }
  }
  
  @media (min-width: 640px) {
    .hero-cta { flex-direction: row; width: auto; }
    .hero-cta a { width: auto; }
    .domain-grid { grid-template-columns: repeat(2, 1fr); }
    .feature-grid { grid-template-columns: repeat(2, 1fr); }
    .cta-form { flex-direction: row; }
  }
  
  @media (min-width: 768px) {
    .nav-links { display: flex; }
    .mobile-menu { display: none; }
    .pricing-grid { grid-template-columns: repeat(3, 1fr); }
    .steps-grid { flex-direction: row; }
    .step-connector { display: block; }
    .footer-content { grid-template-columns: 1fr 2fr; }
    .footer-links { grid-template-columns: repeat(4, 1fr); }
  }
  
  @media (min-width: 1024px) {
    .domain-grid { grid-template-columns: repeat(4, 1fr); }
    .feature-grid { grid-template-columns: repeat(3, 1fr); }
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 10px;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    min-height: 44px; /* Touch target */
    -webkit-tap-highlight-color: transparent;
  }
  .btn-primary { background: #2563eb; color: white; }
  .btn-primary:hover { background: #1d4ed8; }
  .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
  .btn-secondary:hover { background: #e5e7eb; }
  .btn-accent { background: #f97316; color: white; }
  .btn-accent:hover { background: #ea580c; }
  .btn-lg { padding: 16px 32px; font-size: 16px; }
`;

export default function LandingPage() {
    const [email, setEmail] = useState('');

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
            <div style={{ minHeight: '100vh', background: 'white' }}>
                {/* Header */}
                <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto', padding: '12px 20px' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                            <CivilLLMLogo size={32} />
                            <span style={{ fontSize: 20, fontWeight: 700, color: '#1e40af' }}>CivilLLM</span>
                        </Link>
                        <nav className="nav-links" style={{ alignItems: 'center', gap: 32 }}>
                            <Link href="#features" style={{ fontSize: 15, fontWeight: 500, color: '#4b5563', textDecoration: 'none' }}>Features</Link>
                            <Link href="#pricing" style={{ fontSize: 15, fontWeight: 500, color: '#4b5563', textDecoration: 'none' }}>Pricing</Link>
                            <Link href="/login" style={{ fontSize: 15, fontWeight: 500, color: '#4b5563', textDecoration: 'none' }}>Login</Link>
                            <Link href="/signup" className="btn btn-primary">Get Started Free</Link>
                        </nav>
                        <button className="mobile-menu" style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
                            <div style={{ width: 24, height: 2, background: '#374151', marginBottom: 5, borderRadius: 2 }} />
                            <div style={{ width: 24, height: 2, background: '#374151', marginBottom: 5, borderRadius: 2 }} />
                            <div style={{ width: 24, height: 2, background: '#374151', borderRadius: 2 }} />
                        </button>
                    </div>
                </header>

                {/* Hero */}
                <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 60px', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #fef3c7 100%)' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                    <div style={{ position: 'relative', maxWidth: 800, textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '8px 20px', fontSize: 14, fontWeight: 500, color: '#1e40af', background: '#dbeafe', borderRadius: 50, marginBottom: 24 }}>
                            🚀 AI-Powered Engineering Assistance
                        </span>
                        <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.1, color: '#111827', marginBottom: 24 }}>
                            Think better.<br />
                            <span style={{ background: 'linear-gradient(135deg, #2563eb, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Build better.</span>
                        </h1>
                        <p style={{ fontSize: 18, color: '#4b5563', lineHeight: 1.7, marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
                            Get instant, code-grounded answers for civil engineering. IS codes, NBC guidelines, and handbooks—all at your fingertips with precise source citations.
                        </p>
                        <div className="hero-cta" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
                            <Link href="/signup" className="btn btn-accent btn-lg">Start Free Trial</Link>
                            <Link href="/chat" className="btn btn-secondary btn-lg">Try Demo</Link>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
                            {[{ value: '95%', label: 'Accuracy' }, { value: '<4s', label: 'Response Time' }, { value: '100+', label: 'IS Codes' }].map((stat, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: '#2563eb' }}>{stat.value}</div>
                                    <div style={{ fontSize: 14, color: '#6b7280' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Domain Bots */}
                <section style={{ padding: '80px 20px', background: '#f9fafb' }} id="bots">
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 48 }}>
                            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Specialized AI Bots</h2>
                            <p style={{ fontSize: 18, color: '#6b7280' }}>Expert assistance for every aspect of civil engineering</p>
                        </div>
                        <div className="domain-grid" style={{ display: 'grid', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
                            {DOMAINS.map((domain) => (
                                <div key={domain.id} style={{ padding: 24, background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer' }}>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>{domain.icon}</div>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>{domain.displayName}</h3>
                                    <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>{domain.description}</p>
                                    <Link href={`/chat?domain=${domain.name}`} style={{ fontSize: 14, fontWeight: 500, color: '#2563eb', textDecoration: 'none' }}>
                                        Try {domain.displayName} →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section style={{ padding: '80px 20px' }} id="features">
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 48 }}>
                            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Why CivilLLM?</h2>
                            <p style={{ fontSize: 18, color: '#6b7280' }}>Built specifically for civil engineering professionals</p>
                        </div>
                        <div className="feature-grid" style={{ display: 'grid', gap: 24 }}>
                            {[
                                { icon: '⚡', title: 'Lightning Fast', desc: 'Get answers in under 4 seconds. Designed for use on-site where time matters.' },
                                { icon: '📚', title: 'Source Citations', desc: 'Every answer includes IS code references, clause numbers, and page citations.' },
                                { icon: '🎯', title: '95% Accuracy', desc: 'Rigorous QA testing ensures reliable, code-grounded responses you can trust.' },
                                { icon: '📱', title: 'Mobile First', desc: 'Optimized for on-site use with large tap targets and readable text outdoors.' },
                                { icon: '💾', title: 'Save & Share', desc: 'Save important answers for offline access and share with your team instantly.' },
                                { icon: '🔒', title: 'Enterprise Ready', desc: 'Team accounts, SSO, audit logs, and custom document ingestion for enterprises.' },
                            ].map((feature, i) => (
                                <div key={i} style={{ padding: 24, background: 'white', border: '1px solid #e5e7eb', borderRadius: 16 }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, fontSize: 24, background: '#eff6ff', borderRadius: 12, marginBottom: 16 }}>{feature.icon}</div>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>{feature.title}</h3>
                                    <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6 }}>{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #1e3a8a, #1e40af)', color: 'white' }}>
                    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 48 }}>
                            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>How It Works</h2>
                            <p style={{ fontSize: 18, color: '#93c5fd' }}>From question to answer in three simple steps</p>
                        </div>
                        <div className="steps-grid" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 24 }}>
                            {[
                                { num: '1', title: 'Ask Your Question', desc: 'Type or speak your engineering question in natural language.' },
                                { num: '2', title: 'AI Searches Codes', desc: 'Our AI searches IS codes, NBC, and handbooks for relevant clauses.' },
                                { num: '3', title: 'Get Cited Answer', desc: 'Receive a concise answer with exact source citations and excerpts.' },
                            ].map((step, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {i > 0 && <div className="step-connector" style={{ width: 60, height: 2, background: '#3b82f6', marginTop: 24, marginRight: 24 }} />}
                                    <div style={{ flex: 1, textAlign: 'center', maxWidth: 280 }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, fontSize: 20, fontWeight: 700, color: '#1e3a8a', background: '#fbbf24', borderRadius: '50%', marginBottom: 16 }}>{step.num}</div>
                                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{step.title}</h3>
                                        <p style={{ fontSize: 15, color: '#93c5fd', lineHeight: 1.6 }}>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sample Prompts */}
                <section style={{ padding: '80px 20px', background: '#f9fafb' }}>
                    <div style={{ maxWidth: 800, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 48 }}>
                            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Try These Questions</h2>
                            <p style={{ fontSize: 18, color: '#6b7280' }}>Common queries our users ask</p>
                        </div>
                        <div style={{ display: 'grid', gap: 12 }}>
                            {QUICK_PROMPTS.map((prompt) => (
                                <Link key={prompt.id} href={`/chat?q=${encodeURIComponent(prompt.text)}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, textDecoration: 'none', transition: 'all 0.2s' }}>
                                    <span style={{ fontSize: 15, color: '#374151' }}>{prompt.text}</span>
                                    <span style={{ fontSize: 18, color: '#2563eb' }}>→</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section style={{ padding: '80px 20px' }} id="pricing">
                    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 48 }}>
                            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Simple, Transparent Pricing</h2>
                            <p style={{ fontSize: 18, color: '#6b7280' }}>Start free, upgrade as you grow</p>
                        </div>
                        <div className="pricing-grid" style={{ display: 'grid', gap: 24, alignItems: 'start' }}>
                            {[
                                { name: 'Free', price: '₹0', period: '/month', features: ['Site Bot only', '20 queries/day', 'Basic citations', 'Email support'], cta: 'Get Started', href: '/signup', primary: false },
                                { name: 'Pro', price: '₹999', period: '/month', features: ['All 4 domain bots', 'Unlimited queries', 'Full source excerpts', 'Save & offline access', 'Priority support'], cta: 'Start Free Trial', href: '/signup?plan=pro', primary: true, badge: 'Most Popular' },
                                { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'Team management', 'Custom documents', 'SSO / SAML', 'Dedicated support', 'SLA guarantee'], cta: 'Contact Sales', href: '/contact', primary: false },
                            ].map((plan, i) => (
                                <div key={i} style={{ position: 'relative', padding: 32, background: 'white', border: plan.primary ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: 20, textAlign: 'center', transform: plan.primary ? 'scale(1.02)' : 'none', boxShadow: plan.primary ? '0 25px 50px -12px rgba(0,0,0,0.15)' : 'none' }}>
                                    {plan.badge && <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', fontSize: 12, fontWeight: 600, color: 'white', background: '#2563eb', borderRadius: 50 }}>{plan.badge}</span>}
                                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 16 }}>{plan.name}</h3>
                                    <div style={{ marginBottom: 24 }}>
                                        <span style={{ fontSize: 40, fontWeight: 700, color: '#111827' }}>{plan.price}</span>
                                        <span style={{ fontSize: 15, color: '#6b7280' }}>{plan.period}</span>
                                    </div>
                                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24, textAlign: 'left' }}>
                                        {plan.features.map((f, j) => (
                                            <li key={j} style={{ padding: '8px 0', fontSize: 15, color: '#4b5563', borderBottom: '1px solid #f3f4f6' }}>
                                                <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href={plan.href} className={`btn ${plan.primary ? 'btn-accent' : 'btn-secondary'}`} style={{ width: '100%' }}>{plan.cta}</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #111827, #1f2937)' }}>
                    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 16 }}>Ready to transform your engineering workflow?</h2>
                        <p style={{ fontSize: 18, color: '#9ca3af', marginBottom: 32 }}>Join thousands of engineers who trust CivilLLM for code-grounded answers.</p>
                        <form className="cta-form" style={{ display: 'flex', gap: 12 }} onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Enter your work email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, padding: 16, fontSize: 16, background: 'white', border: 'none', borderRadius: 10, outline: 'none' }} />
                            <button type="submit" className="btn btn-accent btn-lg">Get Early Access</button>
                        </form>
                    </div>
                </section>

                {/* Footer */}
                <footer style={{ padding: '60px 20px 32px', background: '#111827', color: '#9ca3af' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div className="footer-content" style={{ display: 'grid', gap: 32, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #374151' }}>
                            <div style={{ maxWidth: 250 }}>
                                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 12 }}>
                                    <CivilLLMLogo size={28} />
                                    <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>CivilLLM</span>
                                </Link>
                                <p style={{ fontSize: 14, color: '#6b7280' }}>Think better. Build better.</p>
                            </div>
                            <div className="footer-links" style={{ display: 'grid', gap: 24 }}>
                                {[
                                    { title: 'Product', links: [{ text: 'Features', href: '#features' }, { text: 'Pricing', href: '#pricing' }, { text: 'Demo', href: '/chat' }] },
                                    { title: 'Resources', links: [{ text: 'Documentation', href: '/docs' }, { text: 'API', href: '/api' }, { text: 'Help Center', href: '/help' }] },
                                    { title: 'Company', links: [{ text: 'About', href: '/about' }, { text: 'Contact', href: '/contact' }, { text: 'Careers', href: '/careers' }] },
                                    { title: 'Legal', links: [{ text: 'Privacy', href: '/privacy' }, { text: 'Terms', href: '/terms' }, { text: 'Disclaimer', href: '/disclaimer' }] },
                                ].map((col, i) => (
                                    <div key={i}>
                                        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 12 }}>{col.title}</h4>
                                        {col.links.map((link, j) => (
                                            <Link key={j} href={link.href} style={{ display: 'block', fontSize: 14, color: '#9ca3af', textDecoration: 'none', padding: '4px 0' }}>{link.text}</Link>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, textAlign: 'center' }}>
                            <p>© 2024 CivilLLM. All rights reserved.</p>
                            <p style={{ fontSize: 12, color: '#6b7280' }}>AI-generated content is for reference only. Always verify with official codes.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
