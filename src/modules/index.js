module.exports = [
  'Registrar',
  'Convert',
].map(name => require(`./${name}`));
