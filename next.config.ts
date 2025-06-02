
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'codeskulptor-demos.commondatastorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
      "9000-firebase-studio-1747029849971.cluster-qhrn7lb3szcfcud6uanedbkjnm.cloudworkstations.dev",
      "6000-firebase-studio-1747029849971.cluster-qhrn7lb3szcfcud6uanedbkjnm.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;
