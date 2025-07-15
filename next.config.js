/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
    images: {
        loader: "default",
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*",
            },
        ],
    },
};

module.exports = nextConfig;
