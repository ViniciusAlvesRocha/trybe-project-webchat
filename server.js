// Faça seu código aqui

const express = require('express');
const http = require('http');
const { indexOf } = require('lodash');
const { deleteCallback } = require('mongodb/lib/operations/common_functions');
const path = require('path');
const { disconnect } = require('process');
const { v4 } = require('uuid');
const { Server } = require('socket.io');

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const io = new Server(server);

const { getDate } = require('./helpers');

console.log(getDate());

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
const users = [];
const messages = [];

const updateListUser = ({ id, nickname }) => {
  const userFinded = users.find((user) => user.id === id);
  users.splice(users.indexOf(userFinded), 1, { id, nickname });
};

/*  const message = {
      id,
      userId: socket.id,
      msg: `${getDate()} ${msg.nickname}: ${msg.chatMessage}`,
    }; */

const updateListMessages = ({ id, nickname }) => {
  messages.forEach((message) => {
    if (message.userId === id) {
      let msg = message.msg.split(' ');
      msg[2] = `${ nickname }:`;
      message.msg = msg.join(' ');
    }
  });
}

const createMessage = (message) => {
  messages.push(message);
};

const disconnectIo = (socket) => {
  socket.on('disconnect', () => {
    console.log(`usuário ${socket.id} desconectou`);
    const userFinded = users.find(({ id }) => id === socket.id);
    users.splice(users.indexOf(userFinded), 1);
    console.log(users);
    io.emit('addUser', users);
  });
};

io.on('connection', (socket) => {
  console.log(`usuário ${socket.id} conectado`);

  socket.on('addUser', (nickname) => {
    socket.emit('user.id-messages', { userId: socket.id, serverMessages: messages });
    users.push({ id: socket.id, nickname });
    console.log(users);
    io.emit('addUser', users);
  });

  socket.on('message', (msg) => {
    const id = v4();
    const message = {
      id,
      userId: socket.id,
      msg: `${getDate()} ${msg.nickname}: ${msg.chatMessage}`,
    };
    createMessage(message);
    io.emit('message', message);
  });

  socket.on('updateNickname', (message) => {
    console.log('updateNickname:::', message);
    const { nickname } = message;
    updateListUser({ id: socket.id, nickname });
    updateListMessages({ id: socket.id, nickname });
    io.emit('updateNickname', { id: socket.id, nickname });
  });
  disconnectIo(socket);
});

server.listen(PORT, () => console.log(`Escutando na porta ${PORT}`));

module.exports = {
  messages,
};