const { Module } = require('../constructs/Module');

module.exports = new Module({
  documentation: `
    Allows adding modules to the registry. Useful for optional modules.
  `
}, c => {
  var r = c.registry;
  r.put('Registrar', 'Module');
  return c;
});
