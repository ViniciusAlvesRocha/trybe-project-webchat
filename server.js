// Faça seu código aqui

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const io = new Server(server);

const { getDate } = require('./helpers');

console.log(getDate());
// console.log(generateNickname());

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log(`usuário ${socket.id} conectado`);

  socket.on('message', (msg) => {
    io.emit('message', `${getDate()} ${msg.nickname}: ${msg.chatMessage}`);
  });

  socket.on('disconnect', () => {
    console.log(`usuário ${socket.id} desconectou`);
  });
});

server.listen(PORT, () => console.log(`Escutando na porta ${PORT}`));