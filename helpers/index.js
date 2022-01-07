const getDate = () => {
  const date = new Date();
  const DD = () => date.getDay();
  const MM = () => date.getMonth();
  const yyyy = () => date.getFullYear();
  const HH = () => date.getHours();
  const mm = () => date.getMinutes();
  const ss = () => date.getSeconds();
  return `${DD()}-${MM()}-${yyyy()} ${HH()}:${mm()}:${ss()}`;
};

module.exports = {
  getDate,
};