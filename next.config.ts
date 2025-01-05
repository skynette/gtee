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
    webpack: (config: any, { isServer }: { isServer: boolean }) => {
        // Add JSON rule
        config.module.rules.push({
            test: /\.json$/,
            type: 'json',
        });

        // Ignore server directory
        config.watchOptions = {
            ignored: ['**/server/**', ...(config.watchOptions?.ignored || [])]
        };

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