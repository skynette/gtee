// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*',
            },
        ],
    },
    webpack: (config: { module: { rules: { test: RegExp; type: string; }[]; }; resolve: { fallback: any; }; }, { isServer }: any) => {
        // Add JSON rule
        config.module.rules.push({
            test: /\.json$/,
            type: 'json',
        });

        // Handle node modules and polyfills
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                path: false,
                stream: false,
                '@tensorflow/tfjs-node': false,
                'onnxruntime-node': false,
                '@xenova/transformers': false
            };
        }

        return config;
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
            allowedOrigins: ['localhost:3000']
        }
    },
};

module.exports = nextConfig;