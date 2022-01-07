// const { messages } = require('../server');
const connection = require('./connection');

// const deleteAllMessages = (idUser) => messages.filter((message) => message.idUser !== idUser);

const modelCreateMessage = async (message) => {
  console.log(message);
  const db = await connection();
  await db.collection('messages').insertOne(message);
};

/* const updateMessages = async (nickname) => {
  const db = await connection();
  const messages = await db.collection('messages').
}; */

const findAll = async () => {
  const db = await connection();
  const messagesFinded = await db.collection('messages').find({}).toArray();
  return messagesFinded.map((message) => (message));
}

module.exports = {
  // deleteAllMessages,
  modelCreateMessage,
  findAll,
};