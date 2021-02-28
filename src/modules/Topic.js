const { Module } = sdop_require('Module');
const { Emitter } = require('../constructs/Emitter');

module.exports = new Module({
  documentation: `
    TODO
  `,
}, c => {
  var r = c.registry;
  r.put('Registrar', 'Topic', {
    init: c => {
      c.self.put_.remove('DefaultPut.store');
      c.self.get_.remove('DefaultGet.value');
      c.self.emitter = new Emitter();
      c.self.topicIdMap = {};
      return c;
    },
    put: [
      {
        name: 'TopicPut.args',
        fn: c => {
          c.parts = [];
          for ( let a of c.args ) {
            if ( Array.isArray(a) ) c.parts.push(
              JSON.stringify([...a].sort()));
            else c.parts.push(a);
          }
          return c;
        }
      },
      {
        name: 'Topic.affect',
        fn: c => {
          c.self.emitter.pub(...c.parts);
          return c;
        }
      },
    ],
    get: [
      {
        // DRY: same as args for 'put'
        name: 'TopicGet.args',
        fn: c => {
          var args = c.args.slice(0, -1);
          c.listenFn = c.args.slice(-1)[0];
          c.parts = [];
          for ( let a of args ) {
            if ( Array.isArray(a) ) c.parts.push(
              JSON.stringify([...a].sort()));
            else c.parts.push(a);
          }
          return c;
        }
      },
      {
        name: 'Topic.affect',
        fn: c => {
          c.self.emitter.sub(...c.parts, c.listenFn);
          return c;
        }
      },
    ]
  });
});
