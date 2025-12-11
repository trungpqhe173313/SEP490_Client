const fs = require("fs");
const path = require("path");

/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;
