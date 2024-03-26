declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      NEXT_PUBLIC_WC_PROJECT_ID: string;
      NEXT_PUBLIC_ENABLE_TESTNETS: string;
      NEXT_PUBLIC_PROFILE_PROVIDER_BASE: string;
      NEXT_PUBLIC_IDOS_NODE_URL: string;
      NEXT_PUBLIC_IDOS_DB_ID: string;
      NEXT_PUBLIC_IDOS_CONTRACT_ADDRESS: `0x${string}`;
      NEXT_PUBLIC_IDOS_CHAIN_ID: string;
      NEXT_GRANTS_CONTRACT_ADDRESS: `0x${string}`;
      NEXT_ENCRYPTION_SECRET_KEY: string;
      NEXT_EVM_GRANTEE_PRIVATE_KEY: string;
    }
  }
}

export {};
