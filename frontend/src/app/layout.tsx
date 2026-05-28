import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'VedaAI - AI Assessment Creator',
  description: 'Create professional, AI-powered assessments and question papers in seconds. Powered by VedaAI.',
  keywords: ['AI', 'Assessment', 'Question Paper', 'Education', 'VedaAI'],
  authors: [{ name: 'VedaAI' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: inter.style.fontFamily }}>
        <Sidebar>{children}</Sidebar>
      </body>
    </html>
  );
}
