const { Module } = sdop_require('Module');

module.exports = new Module({}, c => {
  var r = c.registry;
  r.put('Registrar', 'Function');
  return c;
});
