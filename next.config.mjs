/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'www.signfix.com.au'
            }
        ],
    },
    async headers() {
        return [
            {
                source: "/login",
                headers: [
                    {
                        key: "Cross-Origin-Embedder-Policy",
                        value: "unsafe-none",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
