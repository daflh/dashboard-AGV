const path = require('path');
const concurrently = require('concurrently');

const WEB_PORT = 8000;

const argv = process.argv;
const config = {
  isDevelopment: true
};

if (argv.length > 2) {
  if (argv.includes('--prod') || argv.includes('-p')) {
    config.isDevelopment = false;
  }
}

console.log(`Running in ${config.isDevelopment ? 'development' : 'production'} mode`);

const services = [
  // only run frontend (as seperate server) in development mode
  ...config.isDevelopment ? [{
    name: 'frontend',
    cwd: path.join(__dirname, 'frontend'),
    command: 'npm run dev',
    env: {
      'PORT': WEB_PORT,
      'VITE_BACKEND_PORT': WEB_PORT + 1 // auto-increment backend port by 1
    }
  }] : [],
  {
    name: 'backend',
    cwd: path.join(__dirname, 'backend'),
    command: config.isDevelopment ? 'npm run dev' : 'npm start',
    env: {
      'PORT': config.isDevelopment ? WEB_PORT + 1 : WEB_PORT,
      'NODE_ENV': config.isDevelopment ? 'development' : 'production'
    }
  }
];

const { commands, result } = concurrently(services, {
  prefixColors: ['auto'],
});

result.catch(() => {
  // pass
});
