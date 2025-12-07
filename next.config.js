// next.config.js
module.exports = {
  // 如果是静态站点
  output: 'export',
  
  // 确保正确处理文件扩展名
  webpack: (config, { isServer }) => {
    return config;
  }
};
