module.exports = [
  'Registrar',
  'Convert',
  'Reduce',
  'Sequence',
  'TextTypes',
  'data/Journal',
].map(name => require(`./${name}`));
