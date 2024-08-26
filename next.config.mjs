/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_SECRET: 'your-secret-key-here', 
    NEXTAUTH_GITHUB_CLIENT_ID:'Ov23lignxIYtPLkuAsgE',
    NEXTAUTH_GITHUB_CLIENT_SECRET:'07669a2f9271632ab700f2b6c493bfd8de0f2bc3',
    MONGODB_URI:'mongodb://127.0.0.1:27017'
  }
};

export default nextConfig;
