import type { Metadata } from 'next';
import { Playfair_Display, Montserrat, Cairo } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/hooks/useLanguage';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ayman & Alaa - Wedding Invitation | أيمن و آلاء - دعوة الزفاف',
  description: 'Join us in celebrating the wedding of Ayman & Alaa on December 20, 2026 at Grand Royal Hall, Cairo, Egypt. | انضم إلينا للاحتفال بزفاف أيمن وآلاء في 20 ديسمبر 2026.',
  keywords: ['wedding', 'invitation', 'Ayman', 'Alaa', 'Cairo', 'Egypt', 'زفاف', 'دعوة'],
  openGraph: {
    title: 'Ayman & Alaa - Wedding Invitation',
    description: 'December 20, 2026 | Grand Royal Hall, Cairo',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Tajawal Arabic font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${playfair.variable} ${montserrat.variable} ${cairo.variable}`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
