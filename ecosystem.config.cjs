module.exports = {
  apps: [
    {
      name: 'bsc',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/deploy/bsc-app',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      error_file: '/home/deploy/logs/bsc-error.log',
      out_file: '/home/deploy/logs/bsc-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
