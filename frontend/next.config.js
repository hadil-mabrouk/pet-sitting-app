/** @type {import('next').NextConfig} */
const backendOrigin = process.env.BACKEND_ORIGIN || "http://127.0.0.1:5000";

const nextConfig = {
  // Ensure Turbopack/Next picks the project root here (avoid lockfile root warnings)
  turbopack: { root: __dirname },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/:path*`, // Flask backend (overridable via BACKEND_ORIGIN)
      },
    ];
  },
};

module.exports = nextConfig;
