import type { Metadata } from 'next';
import { sora } from '@/app/_ui/fonts';
import '@rainbow-me/rainbowkit/styles.css';
import './_ui/global.css';
import { Footer, Topbar } from '@/app/_ui/components';
import { Providers } from './_providers';

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
      <body className={`${sora.className}`}>
        <Providers>
          <div className="flex min-h-screen flex-col bg-background-pattern bg-cover bg-no-repeat antialiased">
            <Topbar />
            <div className="grow bg-background-pattern-overlay bg-cover py-20">
              <div id="idos"></div>
              <div className="mx-auto max-w-7xl">{children}</div>
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
