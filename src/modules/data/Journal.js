const { Module } = require('../../constructs/Module');
const { Journal } = require('../../constructs/Journal');

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
  r.put('Registrar', 'Journal', {
    put: [
      {
        name: 'JournalPut.construct',
        fn: c => {
          c.value = new Journal(c.value);
          return c;
        }
      },
      {
        name: 'JournalPut.createRegistrar',
        fn: c => {
          var r = c.registry;
          var journal = c.value;
          var cPutJournal = c;
          r.put('Registrar', c.name, {
            put: [
              {
                name: 'CollectionPut.createRegistrar',
                fn: c => {
                  var r = c.registry;
                  var cPutCollection = c;
                  var collectionConfig = { ...c.value };
                  r.put('Registrar', c.name, {
                    put: [
                      ...(c.util.opt_fn_array(collectionConfig.put)),
                      {
                        name: 'CollectionPut.filePut',
                        fn: c => {
                          var r = c.registry;
                          if ( collectionConfig.transient ) return c;
                          journal.put(
                            cPutCollection.name, c.name, c.value);
                          return c;
                        }
                      }
                    ]
                  })
                  return c;
                }
              }
            ]
          })
          return c;
        }
      },
    ],
  });
});
