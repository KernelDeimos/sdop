const { Module } = require('../../constructs/Module');

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

  r.put('Schema', 'sdop.model.Method', {
    type: 'object',
    properties: {
      args: {
        ref: 'sdop.model.ArgumentList',
      },
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
  });

  r.put('Schema', 'sdop.model.Property', {
    type: 'object',
    properties: {
      type: { type: 'string' },
    }
  });

  r.put('Schema', 'sdop.model.Class', {
    type: 'object',
    properties: {
      constructors: {
        type: 'array',
        items: { ref: 'sdop.model.Method' }
      },
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

  r.put('Registrar', 'sdop.model.Class');

  return c;
});
