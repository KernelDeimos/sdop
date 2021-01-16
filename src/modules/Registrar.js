const { Module } = require('../constructs/Module');
const { Sequence } = require('nicepattern');

module.exports = new Module({
  documentation: `
    This is the bootstrapping registrar. It enables the registration of other
    registrars, but has to use the special putRegistrar method on the registry
    since it put('Registrar', ...) doesn't work until this is registered.

    ... or if that explanation wasn't confusing enough:
    Adds to a Registry a Registrar called Registrar which registers registrars.
  `,
}, c => {
  var c_ = c; // "super c"
  var r = c.registry;

  var defaultGetSequence

  var defaultGet = new Sequence([
    {
      name: 'DefaultGet.args',
      fn: c => {
        if ( c.args.length < 1 ) throw new Error('get requires an argument');
        c.name = c.args[0];
        return c;
      }
    },
    {
      name: 'DefaultGet.value',
      fn: c => {
        c.value = c.self.data[c.name];
        return c;
      }
    },
    {
      name: 'DefaultGet.return',
      fn: function (c) {
        if ( ! c ) {
          console.error('Common fault: undefined context at DefaultGet.return');
          console.log(this.sequence);
        }
        return c.value;
      }
    },
  ]);

  var defaultPut = new Sequence([
    {
      name: 'DefaultPut.args',
      fn: c => {
        if ( c.args.length < 1 ) throw new Error('put requires an argument');
        c.name = c.args[0];
        c.value = c.args[1] || {};
        return c;
      }
    },
    {
      name: 'DefaultPut.store',
      fn: c => {
        c.self.data[c.name] = c.value;
        return c;
      }
    }
  ]);

  var registrarGet = new Sequence([
    {
      name: 'Registrar.args',
      fn: c => {
        if ( c.args.length < 1 ) throw new Error('registrar get missing args');
        c.name = c.args[0];
        return c;
      }
    },
    {
      name: 'Registrar.get',
      fn: c => {
        c.value = c.registry.getRegistrar(c.name);
        return c;
      }
    },
    {
      name: 'Registrar.return',
      fn: c => c.value
    }
  ]);

  var registrarPut = new Sequence([
    {
      name: 'Registrar.args',
      fn: c => {
        if ( c.args.length < 1 ) throw new Error('registrar put missing args');
        c.name = c.args[0];
        c.value = c.args[1] || {}; // optional
        return c;
      }
    },
    {
      name: 'Registrar.adapt',
      fn: context => {
        var impl = context.value;
        var get_ = defaultGet.clone();
        var put_ = defaultPut.clone();

        // TODO: DRY get and put
        if ( impl.get ) {
          if ( Array.isArray(impl.get) ) {
            for ( let fn of impl.get ) {
              get_.insertAfter('DefaultGet.value', fn);
            }
          }
          else if ( typeof impl.get == 'function' ) {
            get_.insertAfter('DefaultGet.value', {
              name: 'custom',
              fn: impl.get.bind(impl)
            })
          }
          else {
            throw new Error('not yet supported');
          }
        }
        if ( impl.put ) {
          if ( Array.isArray(impl.put) ) {
            for ( let fn of impl.put ) {
              put_.insertBefore('DefaultPut.store', fn);
            }
          }
          else if ( typeof impl.put == 'function' ) {
            put_.insertBefore('DefaultPut.store', {
              name: 'custom',
              fn: impl.put.bind(impl)
            });
          }
          else {
            throw new Error('not yet supported');
          }
        }

        context.value = {
          data: {},
          impl: impl,
          init: function () {
            if ( this.impl.init ) this.impl.init({ ...context, self: this });
          },
          get_: get_,
          put_: put_,
          get: function (...args) {
            return get_({ ...context, self: this, args: args, });
          },
          put: function (...args) {
            return put_({ ...context, self: this, args: args, });
          },
        };

        return context;
      }
    },
    {
      name: 'Registrar.init',
      fn: context => {
        context.value.init(context);
        return context;
      }
    },
    {
      name: 'Registrar.put',
      fn: context => {
        r.putRegistrar(context.name, context.value);
        return context;
      }
    },
    {
      name: 'Registrar.return',
      fn: context => context.value
    }
  ]);

  r.putRegistrar('Registrar', {
    name: 'Registrar',
    get: (...args) => {
      var c = { ...c_, args: args };
      return registrarGet(c);
    },
    put: (...args) => {
      var c = { ...c_, args: args };
      return registrarPut(c);
    },
  });
});
