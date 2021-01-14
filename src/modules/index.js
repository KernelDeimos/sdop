module.exports = [
  'Registrar',
  'Convert',
  'Reduce',
  'TextTypes',
].map(name => require(`./${name}`));
