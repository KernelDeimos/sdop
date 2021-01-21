module.exports = [
  'Registrar',
  'Convert',
  'Reduce',
  'Sequence',
  'Function',
  'Module',
  'TextTypes',
  'data/Journal',
].map(name => require(`./${name}`));
