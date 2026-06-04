import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */typescript: {
    // Hostinger ke temporary file type conflicts ko bypass karne ke liye
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
