import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import startServices from './startServices';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const app = express();
const httpServer = createServer(app);

// serve pre-built frontend files in production
if (IS_PRODUCTION) {
  const prebuiltFrontendPath = path.resolve(__dirname, '../../frontend/dist');

  if (fs.existsSync(prebuiltFrontendPath)) {
    app.use(express.static(prebuiltFrontendPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(prebuiltFrontendPath, 'index.html'));
    });
    console.log('Serving prebuilt frontend');
  } else {
    console.error('Error: Please build the frontend first');
    process.exit(1);
  }
}

httpServer.listen(PORT, () => {
  console.log(`${IS_PRODUCTION ? 'Web' : 'Backend'} server is running on port ${PORT}`);
});

startServices(httpServer);
