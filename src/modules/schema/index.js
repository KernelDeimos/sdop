const { Module } = require('../../constructs/Module');
const { Schema } = require('../../constructs/Schema');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('Registrar', 'Schema', {
    get: [
      {
        name: 'Schema.constructor',
        fn: c => {
          if ( ! c.value ) return c;
          c.value = new Schema(c.value);
          return c;
        }
      }
    ]
  });

  // TODO: this may be moved elsewhere
  r.put('Registrar', 'Adapt');
  r.put('Schema', 'Adapt', {
    type: 'function'
  });

  return c;
});
