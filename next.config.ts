import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*',
            },
        ],
    },
    webpack: (config, { isServer }) => {
        // Add existing JSON rule
        config.module.rules.push({
            test: /\.json$/,
            type: 'json',
        });

        // Add ONNX handling
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                'onnxruntime-node': false,
            };
        }

        return config;
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',  // Set a reasonable limit
            allowedOrigins: ['localhost:3000']  // Add your allowed origins
        }
    },
};

export default nextConfig;