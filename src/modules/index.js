module.exports = [
  'Registrar',
  'Convert',
  'TextTypes',
].map(name => require(`./${name}`));
