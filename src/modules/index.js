module.exports = [
  'Registrar',
  'schema/index',
  'Convert',
  'Reduce',
  'Middleware',
  'Sequence',
  'Function',
  'Module',
  'Topic',
  'TextTypes',
  'UUID',
  'model/index',
  'data/Journal',
].map(name => require(`./${name}`));
