const { Module } = require('../../constructs/Module');
const { DSL } = require('../../constructs/DSL');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('Schema', 'DSL', {
    type: 'object',
    properties: {
      functions: {
        type: 'object',
        additionalProperties: {
          ref: 'sdop.model.Function'
        }
      }
    }
  })

  r.put('Adapt', 'DSL', c => {
    var fnAdapt = r.get('Adapt', 'sdop.model.Function');
    for ( let k in c.value.functions ) {
      if ( typeof c.value.functions[k] == 'function' ) {
        c.value.functions[k] =
          fnAdapt({ ...c, value: c.value.functions[k] }).value;
      }
    }
    return c;
  })

  r.put('Registrar', 'DSL', {
    put: [
      {
        name: 'DSL.construct',
        fn: c => {
          c.value = new DSL(c.value);
          return c;
        }
      }
    ]
  })
});
