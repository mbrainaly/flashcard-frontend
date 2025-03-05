/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                canvas: false,
                encoding: false
            }
        }
        return config
    },
    // Ignore TypeScript errors during build
    typescript: {
        ignoreBuildErrors: true,
    },
    // Ignore ESLint errors during build
    eslint: {
        ignoreDuringBuilds: true,
    }
}

module.exports = nextConfig