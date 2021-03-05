const { Module } = sdop_require('Module');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('sdop.model.Class', 'sdop.constructs.Module', {
    properties: {
      id: { type: 'string' },
      fn: { type: 'function' },
    },
    constructors: [
      ['fn'],
      ['.', 'fn'],
    ],
    call: {
      args: [
        { name: 'context', type: 'scope' },
      ],
      ports: [
        {
          language: 'javascript',
          fn: function (context) {
            if ( this.id && context.registry ) {
              let r = context.registry;
              r.put('Module', this.id, this);
            }
            if ( this.fn ) {
              return this.fn(context);
            }
          }
        },
      ],
      at: [
        ['if', {
          condition: ['and',
            ['ihas', 'id'],
            ['in', ['aget', 'context'], 'registry']],
          at: [
            ['let', {
              symbols: {
                r: ['get', ['aget', 'context'], 'registry'],
              },
              at: [
                ['call_stmt', {
                  fn: ['get', ['vget', 'r'], 'put'],
                  args: [
                    ['string', 'Module'],
                    ['iget', 'id'],
                    ['instance'],
                  ]
                }]
              ]
            }]
          ]
        }],
        ['if', {
          condition: ['ihas', 'fn'],
          at: [
            ['return',
              ['call', {
                fn: ['iget', 'fn'],
                args: [['aget', 'context']]
              }]
            ]
          ]
        }]
      ]
      // at: [
      //   ['if', {
      //     condition: ['ihas', 'id'],
      //     at: [
      //       ['iset', 'a', ['iget', 'id']]
      //     ]
      //   }]
      // ],
    },
  })

  r.put('sdop.model.Class', 'sdop.constructs.Cursor', {
    properties: {
      buffer: {
        type: 'string'
      },
      indentLevel: {
        type: 'int'
      },
      indentChars: {
        type: 'string',
        default: '  '
      }
    },
    methods: {
      incr: { ports: [ {
        language: 'javascript',
        fn: function () { this.indentLevel++; }
      } ] },
      decr: { ports: [ {
        language: 'javascript',
        fn: function () { this.indentLevel--; }
      } ] },
      addBlock: { ports: [ {
        language: 'javascript',
        fn: function () {}
      } ] }
    }
  })

  return c;
});
