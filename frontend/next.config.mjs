/** @type {import('next').NextConfig} */
const nextConfig = {
  /* No strict CSP for now to ensure wallet connectivity */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://algorand.com; connect-src 'self' http://localhost:4001 https://*.algorand.network https://*.perawallet.app https://*.walletconnect.com https://*.walletconnect.org;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
