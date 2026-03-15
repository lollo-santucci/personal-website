import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Manrope } from 'next/font/google';
import '@/styles/globals.css';
import SkipToContent from '@/components/SkipToContent';
import { TransitionProvider } from '@/lib/transition/transition-context';

const pixbobBold = localFont({
  src: '../../public/assets/fonts/pixbob-bold.ttf',
  display: 'swap',
  variable: '--font-pixbob-bold',
});

const pixbobRegular = localFont({
  src: '../../public/assets/fonts/pixbob-regular.ttf',
  display: 'swap',
  variable: '--font-pixbob-regular',
});

const pixbobLite = localFont({
  src: '../../public/assets/fonts/pixbob-lite.ttf',
  display: 'swap',
  variable: '--font-pixbob-lite',
});

const manrope = Manrope({
  weight: '300',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const defaultDescription = 'Freelance full-stack developer and ML/AI engineer';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Lorenzo Santucci',
    template: '%s | Lorenzo Santucci',
  },
  description: defaultDescription,
  openGraph: {
    type: 'website',
    siteName: 'Lorenzo Santucci',
    title: { default: 'Lorenzo Santucci', template: '%s | Lorenzo Santucci' },
    description: defaultDescription,
  },
  alternates: { canonical: '/' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pixbobBold.variable} ${pixbobRegular.variable} ${pixbobLite.variable} ${manrope.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <SkipToContent />
        <TransitionProvider>
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
