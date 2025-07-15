/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,

    distDir: "build",

    images: {
        loader: "default",
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*",
            },
        ],
    },
    experimental: {
        esmExternals: false, // Required for some ESM packages like FullCalendar
    },
};

module.exports = nextConfig;
