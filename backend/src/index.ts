import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import MapService from './services/MapService';
import SocketService from './services/SocketService';

const MAP_NAME = 'basement'; // should not be hard-coded

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;

const mapService = new MapService(MAP_NAME);
const socketService = new SocketService(io, mapService);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
