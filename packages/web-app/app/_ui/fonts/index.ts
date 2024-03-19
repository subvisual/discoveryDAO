import localFont from 'next/font/local';

export const nohemi = localFont({
  src: [
    {
      path: './nohemi-light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './nohemi-medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
});
