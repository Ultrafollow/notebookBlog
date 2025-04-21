/** @type {import('next').NextConfig} */
// const nextConfig = {
//   /* config options here */
//   experimental: {
//     turbo: {
//       rules: {
//         '*.svg': {
//           loaders: ['@svgr/webpack'],
//           as: '*.js',
//         },
//       },
//     },
//   },
// }
const nextConfig = {
  webpack: (config) => {
    // 添加 SVG 处理规则
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  },
  // 允许 Next.js 的 Image 组件处理 SVG
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  }
}
 
module.exports = (nextConfig)