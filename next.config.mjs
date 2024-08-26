/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET, 
    NEXTAUTH_GITHUB_CLIENT_ID:process.env.NEXTAUTH_GITHUB_CLIENT_ID,
    NEXTAUTH_GITHUB_CLIENT_SECRET:process.env.NEXTAUTH_GITHUB_CLIENT_SECRET,
    MONGODB_URI:process.env.MONGODB_URI,
    AUTH_RESEND_KEY:process.env.AUTH_RESEND_KEY
  }
};

export default nextConfig;
