import type { Metadata } from 'next';
import { sora } from '@/app/_ui/fonts';
import '@rainbow-me/rainbowkit/styles.css';
import './_ui/global.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Citizend',
    default: 'Citizend',
  },
  description:
    'A polkador-native token launch platform, by and for the community',
  keywords: [
    'Launchpad',
    'Web3',
    'Defi',
    'Citizend',
    'Polkadot',
    'Token',
    'Sale',
    'IDO',
    'Citizend Community Sale',
    'Citizend Launchpad',
    'Citizend IDO',
    'Citizend Token Sale',
    'Citizend Token Launch',
  ],
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.className} min-h-screen bg-background-pattern bg-cover bg-no-repeat antialiased`}
      >
        {children}
        <div id="idos"></div>
      </body>
    </html>
  );
}
