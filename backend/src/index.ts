import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import SocketService from './services/SocketService';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;

const socketService = new SocketService(io);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
