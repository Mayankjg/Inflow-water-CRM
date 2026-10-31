const nextConfig = {
  // Keep the dev server's hot-reload output separate from production builds.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
};

export default nextConfig;
