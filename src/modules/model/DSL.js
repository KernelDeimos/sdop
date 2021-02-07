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
          anyOf: [
            { ref: 'sdop.model.Function' },
            { ref: 'sdop.model.Middleware' },
          ]
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
        continue;
      }
      var mw = c.value.functions[k];
      if ( mw.preFunc && mw.postFunc ) {
        mw = { ...mw };
        if ( typeof mw.preFunc == 'function' )
          mw.preFunc = fnAdapt({ ...c, value: mw.preFunc }).value;
        if ( typeof mw.postFunc == 'function' )
          mw.postFunc = fnAdapt({ ...c, value: mw.postFunc }).value;
        c.value.functions[k] = mw;
      }
    }
    for ( let k in c.value.functions ) {
      let modelFn = c.value.functions[k];
      if ( modelFn.preFunc && modelFn.postFunc ) continue;
      c.value.functions[k] = {
        preFunc: fnAdapt({ ...c, value: c => c }).value,
        postFunc: c.value.functions[k],
      };
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
