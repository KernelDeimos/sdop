module.exports = [
  'Registrar',
  'Convert',
  'Reduce',
  'Middleware',
  'Sequence',
  'Function',
  'Module',
  'TextTypes',
  'UUID',
  'data/Journal',
].map(name => require(`./${name}`));
