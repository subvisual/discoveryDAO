// import { Nohemi } from 'next/font/google';

// export const sora = Sora({
//   subsets: ['latin'],
//   weight: ['400', '600', '700'],
// });

import localFont from 'next/font/local';

export const nohemi = localFont({
  src: [
    {
      path: './Nohemi-Thin.woff',
      weight: '100',
      style: 'normal',
    },
    {
      path: './Nohemi-ExtraLight.woff',
      weight: '200',
      style: 'normal',
    },
    {
      path: './Nohemi-Light.woff',
      weight: '300',
      style: 'normal',
    },
    {
      path: './Nohemi-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: './Nohemi-Medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: './Nohemi-SemiBold.woff',
      weight: '600',
      style: 'normal',
    },
    {
      path: './Nohemi-Bold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: './Nohemi-ExtraBold.woff',
      weight: '800',
      style: 'normal',
    },
    {
      path: './Nohemi-Black.woff',
      weight: '900',
      style: 'normal',
    },
  ],
});
