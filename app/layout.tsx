import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { LayoutShell } from '@/components/LayoutShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#09090b',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'VERA — Programmable Trust Layer | Audited Milestone Escrows',
  description:
    'Every rupee traceable. Audited before it moves. VERA binds capital to verified physical progress with tamper-evident escrows and public audit trails.',
  keywords: [
    'trust layer',
    'milestone escrow',
    'audit ledger',
    'cryptographic proof',
    'donation transparency',
    'SHA-256 evidence',
    'AI OCR verification',
  ],
  authors: [{ name: 'VERA Core Architecture' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased bg-[#09090B] text-[#EDEDED] font-sans selection:bg-[#00F59B] selection:text-[#09090B]`}
      data-theme="dark"
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#ededed] relative">
        <LayoutShell>
          <main className="flex-1 w-full">
            {children}
          </main>
        </LayoutShell>
      </body>
    </html>
  );
}
