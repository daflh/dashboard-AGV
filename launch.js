const path = require('path');
const concurrently = require('concurrently');

const FRONTEND_PORT = 5000;
const BACKEND_PORT = 5001;

const argv = process.argv;
const config = {
  isDevelopment: true
};

if (argv.length > 2) {
  if (argv.includes('--prod') || argv.includes('-p')) {
    config.isDevelopment = false;
  }
}

const services = [
  {
    name: 'frontend',
    cwd: path.join(__dirname, 'frontend'),
    command: config.isDevelopment ? 'npm run dev' : 'npm run preview',
    env: {
      'PORT': FRONTEND_PORT
    }
  },
  {
    name: 'backend',
    cwd: path.join(__dirname, 'backend'),
    command: config.isDevelopment ? 'npm run dev' : 'npm start',
    env: {
      'PORT': BACKEND_PORT
    }
  }
]

const { commands, result } = concurrently(services, {
  prefixColors: ['auto'],
});

result.catch(() => {
  // pass
});
