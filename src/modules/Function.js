const { Module } = require('../constructs/Module');

module.exports = new Module({}, c => {
  var r = c.registry;
  r.put('Registrar', 'Function');
  return c;
});
