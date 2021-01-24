const { Module } = require('../constructs/Module');
const { Middleware } = require('nicepattern');

module.exports = new Module({}, c => {
  var r = c.registry;
  r.put('Registrar', 'Middleware', {
    put: c => {
      c.value = new Middleware(
        c.value.preFunc || [],
        c.value.postFunc || [],
        r.get('Function', 'sdop.uuid.gen4')(),
      );
      return c;
    },
  });
  return c;
});
