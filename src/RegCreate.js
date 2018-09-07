import colors from 'colors';

const titleRegSet = title => (title ? `${title}` : '.*');
const notHaveRegSet = notHave => notHave.reduce((acc, cur) => acc + (cur ? `(?!.*${cur})` : ''), '');
const orHaveRegSet = orHave => (orHave.length !== 0 ? `(${orHave.join('|')})` : '');

const RegInit = (config) => {
  if (typeof (config) !== 'object' && typeof (config) !== 'undefined') throw new Error('input type must be string or object');
  if (Array.isArray(config)) throw new Error('input type must be string or object');

  const searchConfig = {
    title: '',
    notHave: [],
    orHave: [],
  };

  Object.assign(searchConfig, config);
  return new RegExp(`^\\[${titleRegSet(searchConfig.title)}\\]${notHaveRegSet(searchConfig.notHave)}.*${orHaveRegSet(searchConfig.orHave)}.*$`, 'i');
};

export default RegInit;
