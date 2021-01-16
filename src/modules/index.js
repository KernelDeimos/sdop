module.exports = [
  'Registrar',
  'Convert',
  'Reduce',
  'TextTypes',
  'data/Journal',
].map(name => require(`./${name}`));
