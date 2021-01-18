const { Module } = require('../constructs/Module');

module.exports = new Module({
  documentation: `
    Registers a function to convert from TypeA to TypeB.

    Example:
      r.put('Convert', 'TypeA', 'TypeB', c => {
        c.value = do_something_to(c.value);
        return c;
      })
  `,
}, c => {
  var r = c.registry;
  r.put('Registrar', 'Convert', {
    init: c => {
      c.self.put_.remove('DefaultPut.store');
      c.self.get_.remove('DefaultGet.value');
      c.self.fromToMap = {};
      return c;
    },
    put: [
      {
        name: 'ConvertPut.args',
        fn: c => {
          if ( c.args.length < 3 ) throw new Error('Convert.put requires 3 args');
          c.fromName = c.args[0];
          c.toName = c.args[1];
          c.value = c.args[2];
          return c;
        }
      },
      {
        name: 'ConvertPut.store',
        fn: c => {
          var node = c.self.fromToMap;
          if ( ! node[c.fromName] ) node[c.fromName] = {};
          node = node[c.fromName];
          node[c.toName] = c.value;
          return c;
        }
      },
      {
        name: 'ConvertPut.affect',
        fn: c => {
          let getter = c.registry.get('Registrar', c.toName).get_;
          let c_ = c;
          getter.insertBefore('DefaultGet.return', {
            name: `Convert(${c.fromName})`,
            fn: c => {
              if ( c.value ) return c;
              c.value = c.registry.get(c_.fromName, c.name);
              if ( c.value ) return c_.value(c);
              return c;
            }
          });
          return c;
        }
      },
    ],
    get: [
      {
        name: 'ConvertGet.args',
        fn: c => {
          if ( c.args.length < 2 ) throw new Error('Convert.get requires 2 args');
          c.fromName = c.args[0];
          c.toName = c.args[1];
          return c;
        }
      },
      {
        name: 'ConvertGet.value',
        fn: c => {
          c.value = c.self.fromToMap[c.fromName] &&
            c.self.fromToMap[c.fromName][c.toName];
          return c;
        }
      }
    ]
  });
});
