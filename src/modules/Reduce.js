const { Module } = require('../constructs/Module');

module.exports = new Module({
  documentation: `
    Registers a function to reduce a list of sources to a target.

    Example:
      r.put('Reduce', ['TypeA', 'TypeB'], 'TypeC', c => {
        var typeA = c.value[0];
        var typeB = c.value[1];
        c.value = do_something_do(typeA, typeB);
        return c;
      })
  `,
}, c => {
  var r = c.registry;
  r.put('Registrar', 'Reduce', {
    init: c => {
      c.self.put_.remove('DefaultPut.store');
      c.self.get_.remove('DefaultGet.value');
      c.self.fromToMap = {};
      return c;
    },
    put: [
      {
        name: 'ReducePut.args',
        fn: c => {
          if ( c.args.length < 3 ) throw new Error(
            `put to BinaryRegistrar has only ${c.args.length} arguments; ` +
            `expected 3.`);
          c.name = c.args.slice(0,2);
          c.value = c.args[2];
          return c;
        }
      },
      {
        name: 'ReducePut.validateArgs',
        fn: c => {
          if ( ! Array.isArray(c.name[0]) ) {
            throw new Error(`first identifier in Reduce should be a list`);
          }
          if ( ! (typeof c.value == 'function') ) {
            throw new Error(`reduce value should be a function`);
          }
          return c;
        }
      },
      {
        name: 'ReducePut.adaptFromNames',
        fn: c => {
          c.fromNames = c.name[0].map(entry => typeof entry == 'string'
            ? { id: entry }
            : entry
          );
          return c;
        }
      },
      {
        name: 'ReducePut.store',
        fn: c => {
          c.reduceSourceKey = JSON.stringify(c.fromNames.map(v => v.id));
          var node = c.self.fromToMap;
          if ( ! node[c.reduceSourceKey] ) node[c.reduceSourceKey] = {};
          node = node[c.reduceSourceKey];
          node[c.name[1]] = c.value;
          return c;
        }
      },
      {
        name: 'ReducePut.affect',
        fn: c => {
          var getter = c.registry.get('Registrar', c.name[1]).get_;

          var fromNames = c.fromNames;
          var toName = c.name[1];
          var reduceFn = c.value;

          getter.insertBefore('DefaultGet.return', {
            name: `Reduce(${c.reduceSourceKey})`,
            fn: c => {
              if ( c.value ) return c.value;
              var sources = [];
              for ( let fromName of fromNames ) {
                var val = c.registry.get(fromName.id, c.name);
                if ( ! val && ! fromName.optional ) {
                  return c;
                }
                sources.push(val);
              }
              // var sources = fromNames.map(name => c.registry.get(name, c.name));
              c.value = sources;
              return reduceFn(c);
            }
          });
          return c;
        }
      }
    ],
    get: [
      {
        name: 'ReduceGet.args',
        fn: c => {
          if ( c.args.length < 2 ) throw new Error('Reduce.get requires 2 args');
          c.name = c.args.slice(0,2);
          return c;
        }
      },
      {
        name: 'ReduceGet.value',
        fn: c => {
          c.reduceSourceKey = JSON.stringify(name[0]);
          c.value = c.self.fromToMap[c.reduceSourceKey] &&
            c.self.fromToMap[c.reduceSourceKey][c.name[1]];
          return c;
        }
      }
    ]
  })
});
