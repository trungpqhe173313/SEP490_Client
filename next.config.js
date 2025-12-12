const nextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dq5o0yoex/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              img-src 'self' https://res.cloudinary.com data:;
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline';
              font-src 'self' data:;
              connect-src 'self' *;
              frame-ancestors 'none';
              base-uri 'self';
              object-src 'none';
            `.replace(/\s{2,}/g, " "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
