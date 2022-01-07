// Faça seu código aqui

const express = require('express');
const http = require('http');
const path = require('path');     
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

const getNicknameFromMessage = (message) => (message.split(' ')[1].replace(':', ''));

const updateListMessages = ({ olderNickname, newNickname }) => {
  messages.forEach((message) => {
    if (getNicknameFromMessage(message) === olderNickname) {
      const msg = message.msg.split(' ');
      msg[2] = `${newNickname}:`;
      return msg.join(' ');
    }
    return message;
  });
};

const createMessage = async (msg) => {
  const { message } = msg;
  messages.push(message);
  await modelCreateMessage(msg);
};

const disconnectIo = (socket) => {
  socket.on('disconnect', () => {
    console.log(`usuário ${socket.id.substring(0, 16)} desconectou`);
    const userFinded = users.find(({ id }) => id === socket.id.substring(0, 16));
    users.splice(users.indexOf(userFinded), 1);
    console.log(users);
    io.emit('addUser', users);
  });
};

io.on('connection', (socket) => {
  socket.on('addUser', (_e) => {
    socket.emit('user.id-messages', ({
      nickname: socket.id.substring(0, 16),
      serverMessages: messages }));
    users.push(socket.id.substring(0, 16));
    io.emit('addUser', users);
  });
  socket.on('message', ({ chatMessage, nickname }) => {
    const message = `${getDate()} ${nickname}: ${chatMessage}`;
    createMessage({ nickname: socket.id.substring(0, 16), message });
    io.emit('message', message);
  });
  socket.on('updateNickname', ({ nickname, olderNickname }) => {
    updateListUser(nickname);
    updateListMessages({ olderNickname: socket.id.substring(0, 16), newNickname: nickname });
    io.emit('updateNickname', { nickname, olderNickname });
  });
  disconnectIo(socket);
});

server.listen(PORT, () => console.log(`Escutando na porta ${PORT}`));

/* module.exports = {
  messages,
}; */