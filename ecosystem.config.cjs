module.exports = {
  apps: [
    {
      name: 'webnasir',
      script: 'node_modules/.bin/tsx',
      args: 'server.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
