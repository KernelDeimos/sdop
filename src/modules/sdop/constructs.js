const { Module } = require('../../constructs/Module');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('sdop.model.Class', 'sdop.constructs.Module', {
    call: {
      args: [
        { name: 'context', type: 'scope' },
      ],
      ports: [
        {
          language: 'javascript',
          fn: function (context) {
            if ( this.entry.fn ) {
              return this.entry.fn(context);
            }
            if ( this.entry.id && context.registry ) {
              let r = context.registry;
              r.put('Module', this.entry.id, this);
            }
          }
        },
      ],
      // This is an example; eventually this will be inferred from real code:
      at: [
        ['if', {
          condition: ['in', ['iget', 'entry'], 'fn'],
          alt: [
            ['return',
              ['call', {
                fn: ['dot', ['iget', 'entry'], 'fn'],
                arg: ['aget', 'args']
              }]
            ]
          ]
        }]
        ['if', {
          condition: ['and',
            ['in', ['iget', 'entry'], 'id'],
            ['in', ['aget', 'context'], 'registry']
          ],
          at: [
            ['let', {
              symbols: {
                r: ['dot', ['aget', 'context'], 'registry']
              },
              at: [
                ['call', {
                  fn: ['dot', ['vget', 'r'], 'put'],
                  args: ['list',
                    ['string', 'Module'],
                    ['dot', ['iget', 'entry'], 'id'],
                    ['i'],
                  ]
                }]
              ]
            }]
          ]
        }]
      ]
    },
    constructors: [
      {
        args: ['entry', 'fn'],

      }
    ]
  })

  return c;
});
