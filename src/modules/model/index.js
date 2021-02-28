const { Module } = sdop_require('Module');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('Schema', 'sdop.model.ArgumentList', {
    type: 'array',
    default: [],
    items: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        type: {
          type: 'string',
          default: 'any'
        }
      },
      required: ['name']
    }
  });

  r.put('Schema', 'sdop.model.Statement', {
    type: 'array',
    items: [
      { type: 'string' },
      // remaining items can be anything
    ]
  })

  r.put('Schema', 'sdop.model.StatementList', {
    type: 'array',
    default: [],
    items: {
      ref: 'sdop.model.Statement'
    }
  });

  r.put('Schema', 'sdop.model.Function', {
    anyOf: [
      {
        type: 'object',
        properties: {
          args: {
            ref: 'sdop.model.ArgumentList',
          },
          // WHEN: alternative to args for only one input
          // input: { type: 'string' },
          output: { type: 'string' },
          ports: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                language: { type: 'string' },
                fn: { type: 'function' },
                at: {
                  ref: 'sdop.model.StatementList'
                }
              }
            }
          },
          at: {
            ref: 'sdop.model.StatementList'
          }
        }
      },
      {
        type: 'function'
      }
    ]
  });

  r.put('Schema', 'sdop.model.Middleware', {
    type: 'object',
    properties: {
      preFunc: { ref: 'sdop.model.Function' },
      postFunc: { ref: 'sdop.model.Function' },
    }
  });

  r.put('Schema', 'sdop.model.Method', {
    ref: 'sdop.model.Function'
  });

  r.put('Schema', 'sdop.model.Property', {
    type: 'object',
    properties: {
      type: { type: 'string' },
      // WHEN: Uncomment when 'adapt' is needed
      // adapt: {
      //   type: 'array',
      //   default: [],
      //   items: {
      //     ref: 'sdop.model.Function'
      //   }
      // }
    }
  });

  r.put('Schema', 'sdop.model.Class', {
    type: 'object',
    properties: {
      call: { ref: 'sdop.model.Method' },
      methods: {
        type: 'object',
        additionalProperties: { ref: 'sdop.model.Method' }
      },
      // NOTE: this is a property named 'properties'
      properties: {
        type: 'object',
        additionalProperties: { ref: 'sdop.model.Property' }
      }
    }
  });

  // TODO: 54E39681-E0ED-460F-80E0-EB6FA029D54D: make this adapt work
  r.put('Adapt', 'sdop.model.Function', c => {
    if ( typeof c.value == 'function' ) {
      var str = c.value.toString();
      var argsSlice;
      if ( str.indexOf('(') == -1 || str.indexOf('=') < str.indexOf('(') ) {
        argsSlice = [0, str.indexOf('=')];
      } else {
        let a = str.indexOf('(') + 1;
        argsSlice = [
          a,
          str.slice(a).indexOf(')') + str.slice(0, a).length];
      }

      // Thanks StackOverflow #1007981 for the regexes
      // TODO: move comment stripping logic somewhere else
      args = str.slice(...argsSlice)
        .replace(/[/][/].*$/mg,'') // strip single-line comments
        .replace(/\s+/g, '') // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
        .split(',')
        .map(v => v.trim()).map(v => ({ name: v, type: 'any' }));

      c.value = {
        args: args,
        ports: [{
          language: 'javascript',
          fn: eval(str)
        }]
      };
    }
    return c;
  })

  r.put('Convert', 'sdop.model.Function', 'Function', c => {
    if ( c.value.ports ) {
      for ( let port of c.value.ports ) {
        if ( port.language != 'javascript' ) continue;
        c.value = port.fn;
        return c;
      }
    }
    // Allowing unrecognized data through can produce a false negative
    // for adapt errors.
    c.value = null;
    return c;
  })

  r.put('Registrar', 'sdop.model.Class');

  require('./DSL')(c);

  return c;
});
