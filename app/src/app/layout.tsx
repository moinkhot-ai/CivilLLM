import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const nunito = Nunito({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
    weight: ['300', '400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#1e40af',
};

export const metadata: Metadata = {
    title: 'CivilLLM - Civil Engineering AI Assistant',
    description: 'Think better. Build better. AI-powered assistance for civil engineering with code-grounded answers and precise source citations.',
    keywords: ['civil engineering', 'AI assistant', 'IS codes', 'structural engineering', 'construction'],
    authors: [{ name: 'CivilLLM Team' }],
    openGraph: {
        title: 'CivilLLM - Civil Engineering AI Assistant',
        description: 'AI-powered assistance for civil engineering with code-grounded answers',
        type: 'website',
        locale: 'en_IN',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={nunito.variable} suppressHydrationWarning>
            <body className={nunito.className} suppressHydrationWarning>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
