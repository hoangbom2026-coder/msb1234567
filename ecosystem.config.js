module.exports = {
  apps: [
    {
      name: 'mbs-backend',
      cwd: '/var/www/backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: 'mbs-admin',
      cwd: '/var/www/admin',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0 --port 3001',
      env: {
        NODE_ENV: 'development',
      },
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: 'mbs-frontend',
      cwd: '/var/www/frontend',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
      },
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
