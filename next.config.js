/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
    reactStrictMode: true,
    sassOptions: {
        includePaths: [path.join(__dirname, "styles")],
    },
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
