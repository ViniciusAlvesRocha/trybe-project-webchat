// Faça seu código aqui

const express = require('express');
const http = require('http');
const { indexOf } = require('lodash');
const { deleteCallback } = require('mongodb/lib/operations/common_functions');
const path = require('path');
const { disconnect } = require('process');
const { v4 } = require('uuid');
const { Server } = require('socket.io');
const { modelCreateMessage, findAll } = require('./models/modelMessage');

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
let messages;
const findAllMessages = async () => {
  messages = await findAll();
  console.log(messages);
};

findAllMessages();

const updateListUser = (nickname) => {
  const userFinded = users.find((user) => user === nickname);
  users.splice(users.indexOf(userFinded), 1, nickname);
};

/*  const message = {
      id,
      userId: socket.id,
      msg: `${getDate()} ${msg.nickname}: ${msg.chatMessage}`,
    }; */

const getNicknameFromMessage = (message) => (message.split(' ')[1].replace(':', ''));

const updateListMessages = ({ olderNickname, newNickname }) => {
  messages.forEach((message) => {
    if (getNicknameFromMessage(message) === olderNickname) {
      let msg = message.msg.split(' ');
      msg[2] = `${ newNickname }:`;
      message = msg.join(' ');
    }
  });
}

const createMessage = async (msg) => {
  console.log('linha 58', msg.message);
  const { nickname, message } = msg;
  messages.push(message);
  const messageCreated = await modelCreateMessage({ nickname, message});
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

  socket.on('addUser', (_e) => {
    socket.id = socket.id.substring(0, 16);
    socket.emit('user.id-messages', { nickname: socket.id, serverMessages: messages });
    users.push(socket.id);
    console.log(users);
    io.emit('addUser', users);
  });

  socket.on('message', ({ chatMessage, nickname }) => {
    // console.log('object :::::::::::', chatMessage);
    const message = `${getDate()} ${nickname}: ${chatMessage}`;
    createMessage({ nickname: socket.id, message: message });
    io.emit('message', message);
  });

  socket.on('updateNickname', ({ nickname, olderNickname }) => {
    console.log('updateNickname:::', nickname);
    updateListUser(nickname);
    updateListMessages({ olderNickname: socket.id, newNickname: nickname });
    socket.id = nickname;
    io.emit('updateNickname', { nickname: socket.id, olderNickname});
  });
  disconnectIo(socket);
});

server.listen(PORT, () => console.log(`Escutando na porta ${PORT}`));

/* module.exports = {
  messages,
}; */