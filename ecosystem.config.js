// PM2 生产环境配置文件
module.exports = {
  apps: [{
    name: 'stevn-blog',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 80,
      JWT_SECRET: 'your-super-secure-jwt-secret-change-this-in-production',
      SESSION_SECRET: 'your-super-secure-session-secret-change-this-in-production'
    }
  }]
};