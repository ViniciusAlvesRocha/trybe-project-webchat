const { getIndexOfMessage } = require('../helpers');
const { messages } = require('../server');

const deleteAllMessages = (idUser) => messages.filter((message) => message.idUser !== idUser);

module.exports = {
  deleteAllMessages,
};