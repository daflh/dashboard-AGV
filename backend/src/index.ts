import express from 'express';
import { createServer } from 'http';
import startServices from './startServices';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;

const app = express();
const httpServer = createServer(app);

httpServer.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

startServices(httpServer);
