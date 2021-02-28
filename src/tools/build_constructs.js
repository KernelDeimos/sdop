const { SDOP } = process.argv[2]
  ? require('../index')
  : require('../bootstrap');
if (process.argv[2]) {
} else {
}
const dedent = require('dedent-js');
const redent = (str, space) => str.split('\n').map(v => space + v).join('\n');
const ipdent = (str, space) => (
  s => [s.slice(0, 1), ...s.slice(1).map(v => space + v)]
)(str.split('\n')).join('\n');

var fs = require('fs');

var c = SDOP.init();
var r = c.registry;

r.put('Registrar', 'sdop.target.js.ES6Class');

// TODO: Figure out the right way to do this
var getCode = (fn, lang) => {
  if ( fn.ports ) {
    for ( let port of fn.ports ) {
      var outer = port.fn.toString();
      var inner = outer.slice(outer.indexOf('{') + 1).slice(0, -1);
      if ( port.language == lang ) return inner;
      return inner;
    }
  }
  return '/* error */';
};

r.put('Convert', 'sdop.model.Class', 'sdop.target.js.ES6Class', c => {
  var cls = {};
  cls.name = c.name.split('.').slice(-1)[0];

  cls.methods = [];

  cls.constructor = '';
  if ( c.value.constructors ) {
    for ( let spec of c.value.constructors ) {
      // TODO: add type checking for applicability test
      cls.constructor += `if ( args.length == ${spec.length} ) {\n`
      for ( let i = 0 ; i < spec.length ; i++ ) {
        if ( spec[i] == '.' ) {
          cls.constructor += redent(dedent`
            for ( let k in args[${i}] ) {
              callable[k] = args[${i}][k];
            }
          `, '  ') + '\n';
        } else {
          cls.constructor += `  callable[${JSON.stringify(spec[i])}] = args[${i}];\n`;
        }
      }
      cls.constructor += '}\n'
    }
  }

  if ( c.value.call ) {
    cls.extends = 'Function';
    cls.constructor = dedent`
      function callable(...args) {
        return callable.__sdop_call(...args);
      }
      Object.setPrototypeOf(callable, ${cls.name}.prototype);
    ` + '\n' + cls.constructor + dedent`
      return callable;
    ` + '\n';
    cls.methods.push({
      args: c.value.call.args.map(a => a.name),
      name: '__sdop_call',
      code: getCode(c.value.call)
    });
  }

  c.value = cls;
  return c;
});

var buildClass = cls => {
  var methods = '';
  for ( let method of cls.methods ) {
    methods += dedent`
      ${method.name} (${method.args.join(', ')}) {
        ${ipdent(dedent(method.code), '  ')}
      }
    ` + '\n';
  }
  return dedent`
    class ${cls.name}${cls.extends ? ' extends ' + cls.extends : ''} {
      constructor(...args) {
        ${ipdent(cls.constructor, '    ')}
      }
      ${ipdent(methods, '  ')}
    }
  `;
}

var main = async () => {
  let m = r.get('sdop.target.js.ES6Class', 'sdop.constructs.Module');
  console.log(m);
  console.log(buildClass(m));

  var text = buildClass(m) + '\n';
  text += 'module.exports = { Module: Module }\n';
  if ( ! process.argv[2] )
    fs.writeFileSync('./src/constructs/Module.js', text);
}

main();
