const { SDOP } = process.argv[2]
  ? require('../index')
  : require('../bootstrap');

const { Context } = sdop_require('Context');
const { Cursor } = sdop_require('Cursor');
const { dedent, ipdent } = require('chindent');

if (process.argv[2]) {
} else {
}

// dedent-js has an unfortunate edge-case
// const dedent = require('dedent-js');
// const dedent = str => {
//   let minIndent = -1;
//   var lines = str.split('\n');
//   lines.forEach(line => {
//     var indent = 0;
//     while ( line[0] == ' ' ) {
//       indent++;
//       line = line.slice(1);
//     }
//     if ( indent < minIndent || minIndent < 0 ) minIndent = indent;
//   })
//   while ( lines[0] == '' ) lines = lines.slice(1);
//   return lines.map(line => line.slice(minIndent)).join('\n');
// };
const redent = (str, space) => str.split('\n').map(v => space + v).join('\n');
// const ipdent = (str, space) => (
//   s => [s.slice(0, 1), ...s.slice(1).map(v => space + v)]
// )(str.split('\n')).join('\n');

var fs = require('fs');

var c = SDOP.init();
var r = c.registry;

class ES6Genner {
  generateFromTemplate(t, data) {
    var output = '';

    t = dedent(t);

    var easyData = data;
    if (
      easyData.length == 1 && typeof easyData[0] == 'object' &&
      ! Array.isArray(easyData[0])
    ) {
      easyData = easyData[0];
    }
    /*
      STOPPED AT:
        When applying generated code from a template command, it can't
        just be appeneded to the output. It may be a block or list of
        statements, in which case it needs to be in-place indented based
        on the indentation at that point in the template.

        This does not apply to 'expr' commands, which can always just be
        appended to the output.
    */
    var tmplAPI = {
      expr: node => {
        if ( typeof node === 'string' ) node = ['string', node];
        // Don't need to handle whitespace for expression generators
        output += this.generateFromNode(node);
      },
      block: at => {
        var code = this.generateFromAT(at);
        var indent = output.slice(1 + output.lastIndexOf('\n'));
        output += ipdent(code, indent);
      },
      args: lis => {
        console.log('????', lis)
        var out = lis.map(n => this.generateFromNode(n)).join(', ');
        output += out;
      },
      str: text => {
        output += text;
      }
    };
    var ctxAPI = {
      // TODO: Actually make this do something useful
      scope: name => {
        if ( name == 'instance' ) output += 'this';
        else throw new Error('scope is a useless function right now');
      }
    };
    var stringAction = str => {
      output += str;
    }
    var cmdAction = cmd => {
      cmd = cmd.split(' ');
      let fn = cmd.shift();
      if ( fn in ctxAPI ) ctxAPI[fn](...cmd);
      else {
        console.log('data', data, easyData);
        console.log('key', cmd);
        let input = cmd.reduce((data, key) => data[key], easyData);
        console.log('val', input);
        if ( ! tmplAPI[fn] ) throw new Error(`unknown template function: ${fn}`);
        tmplAPI[fn](input);
      }
    }

    while ( true ) {
      let i = t.indexOf('#');
      if ( i == -1 ) break;
      if ( t[i-1] == '\\' || t[i+1] != '(' ) {
        stringAction(t.slice(0, i + 1));
        t = t.slice(i + 1);
        continue;
      }
      stringAction(t.slice(0,i));
      t = t.slice(i + 2);
      let endI = t.indexOf(')');
      let cmd = t.slice(0, endI);
      t = t.slice(endI + 1);
      cmdAction(cmd);
    }
    if ( t ) stringAction(t);

    return output;
  }
  generateFromAT(at, cur) {
    cur = cur || new Cursor();
    for ( let node of at ) {
      cur.writeBlock(this.generateFromNode(node));
    }
    return cur.buffer;
  }
  generateFromNode(node) {
    console.log('...', node);
    let genfn = r.get('sdop.target.es6.Template', `sdop.lang.${node[0]}`);
    if ( ! genfn ) throw new Error(`couldn't find generator for: ${node[0]}`);
    let cur = new Cursor();
    // TODO: Why did Context object not work here?
    let c = {
      writeBlock: t => {
        let code = this.generateFromTemplate(t, node.slice(1));
        console.log('code', code);
        cur.writeBlock(code);
      },
      writeLine: t => {
        let code = this.generateFromTemplate(t, node.slice(1));
        console.log('line', code);
        cur.writeLine(code);
      },
      write: t => {
        let code = this.generateFromTemplate(t, node.slice(1));
        cur.write(code);
      },
      writeAt: (at) => {
        this.generateFromAT(at, cur);
      },
      incr: () => { cur.incr(); },
      decr: () => { cur.decr(); },
      value: node.slice(1)
    };
    genfn(c);
    return cur.buffer;
  }
}



// TODO: Figure out the right way to do this
var getCode = (fn, lang) => {
  if ( fn.ports ) {
    for ( let port of fn.ports ) {
      var outer = port.fn.toString();
      var inner = outer.slice(outer.indexOf('{') + 1).slice(0, -1);
      if ( port.language == lang ) return inner;
    }
  }

  // TODO: this should come from the registry
  if ( lang == 'es6' ) {
    var genner = new ES6Genner();
    return genner.generateFromAT(fn.at);
  }
  return '/* error */';
};

r.put('Convert', 'sdop.model.Class', 'sdop.target.es6.Class', c => {
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
          cls.constructor += redent(dedent(`
            for ( let k in args[${i}] ) {
              callable[k] = args[${i}][k];
            }
          `), '  ') + '\n';
        } else {
          cls.constructor += `  callable[${JSON.stringify(spec[i])}] = args[${i}];\n`;
        }
      }
      cls.constructor += '}\n'
    }
  }

  if ( c.value.call ) {
    cls.extends = 'Function';
    cls.constructor = dedent(`
      function callable(...args) {
        return callable.__sdop_call(...args);
      }
      Object.setPrototypeOf(callable, ${cls.name}.prototype);
    `) + '\n' + cls.constructor + dedent(`
      return callable;
    `) + '\n';
    cls.methods.push({
      args: c.value.call.args.map(a => a.name),
      name: '__sdop_call',
      code: getCode(c.value.call, 'es6')
    });
  }

  c.value = cls;
  return c;
});

var buildClass = cls => {
  var methods = '';
  for ( let method of cls.methods ) {
    methods += dedent(`
      ${method.name} (${method.args.join(', ')}) {
        ${ipdent(dedent(method.code), 8)}
      }
    `) + '\n';
  }
  return dedent(`
    class ${cls.name}${cls.extends ? ' extends ' + cls.extends : ''} {
      constructor(...args) {
        ${ipdent(cls.constructor, 8)}
      }
      ${ipdent(methods, 6)}
    }
  `);
}


// generateFromNode = node => {
//   node[0]
// };

var main = async () => {
  let m = r.get('sdop.target.es6.Class', 'sdop.constructs.Module');
  console.log(m);
  console.log(buildClass(m));

  var text = buildClass(m) + '\n';
  text += 'module.exports = { Module: Module }\n';
  if ( ! process.argv[2] )
    fs.writeFileSync('./src/constructs/Module.js', text);
}

var test = () => {
  var s = `
    if ( #(expr condition) ) {
      #(block at)
    }
  `;
  var t = s;

  let esc = false;

  let stringAction = str => {
    console.log('string action:', str);
  }
  let cmdAction = str => {
    console.log('command:', str);
  }

  while ( true ) {
    console.log('t', '|'+t+'|')
    let i = t.indexOf('#');
    if ( i == -1 ) break;
    if ( t[i-1] == '\\' || t[i+1] != '(' ) {
      stringAction(t.slice(0, i + 1));
      t = t.slice(i + 1);
      continue;
    }
    stringAction(t.slice(0,i));
    t = t.slice(i + 2);
    let endI = t.indexOf(')');
    let cmd = t.slice(0, endI);
    t = t.slice(endI + 1);
    cmdAction(cmd);
  }
  if ( t ) stringAction(t);

}

var test2 = () => {
  let m = r.get('sdop.model.Class', 'sdop.constructs.Module');
  console.log(m.call.at)
  let at = m.call.at;

  var genner = new ES6Genner();
  console.log(m.call);
  var code = genner.generateFromAT(at);
  console.log(code);
};

main();
// test2();
