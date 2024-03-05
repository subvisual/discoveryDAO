declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      NEXT_PUBLIC_W3C_PID: string;
      NEXT_PUBLIC_WC_PROJECT_ID: string;
      NEXT_PUBLIC_ENABLE_TESTNETS: string;
    }
  }
}

export {};
