import { Server, Socket } from 'socket.io';

export const socket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('send_message', (data) => {
      console.log('Message received:', data);
      socket.broadcast.emit('receive_message', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
