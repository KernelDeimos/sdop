const { Module } = sdop_require('Module');

module.exports = new Module({}, c => {
  var r = c.registry;

  r.put('Registrar', 'sdop.target.es6.Class');
  r.put('Registrar', 'sdop.target.es6.Template');

  // CONTROL FLOW CONSTRUCTS
  r.put('sdop.target.es6.Template', 'sdop.lang.if', c => {
    c.writeBlock(`
      if ( #(expr condition) ) {
        #(block at)
      }
    `);
    return c;
  });
  r.put('sdop.target.es6.Template', 'sdop.lang.let', c => {
    console.log('...', c.value);
    var operands = c.value[0];
    c.writeLine(`(() => {`);
    c.incr();
    for ( let k in operands.symbols ) {
      c.writeLine(`let ${k} = #(expr symbols ${k});`);
    }
    c.writeAt(operands.at);
    c.decr();
    c.writeLine(`})();`);
  })
  r.put('sdop.target.es6.Template', 'sdop.lang.return', c => {
    c.writeLine(`return #(expr 0);`);
  })

  // EXPRESSION CONSTRUCTS
  r.put('sdop.target.es6.Template', 'sdop.lang.call', c => {
    c.write(`#(expr fn)(#(args args))`);
    return c;
  });
  r.put('sdop.target.es6.Template', 'sdop.lang.call_stmt', c => {
    c.writeLine(`#(expr fn)(#(args args));`);
    return c;
  });

  // LOGIC OPERATORS
  r.put('sdop.target.es6.Template', 'sdop.lang.and', c => {
    c.write(`#(expr 0) && #(expr 1)`);
    return c;
  });

  // STANDARD VARIABLES
  r.put('sdop.target.es6.Template', 'sdop.lang.vset', c => {
    c.write(`#(str 0) = #(expr 1)`);
    return c;
  });
  r.put('sdop.target.es6.Template', 'sdop.lang.vget', c => {
    c.write(`#(str 0)`);
    return c;
  });
  r.put('sdop.target.es6.Template', 'sdop.lang.aset', c => {
    c.write(`#(str 0) = #(expr 1)`);
    return c;
  });
  r.put('sdop.target.es6.Template', 'sdop.lang.aget', c => {
    c.write(`#(str 0)`);
    return c;
  });

  // INSTANCE VARIABLES
  r.put('sdop.target.es6.Template', 'sdop.lang.iget', c => {
    c.write(`#(scope instance).#(str 0)`);
    return c;
  });
  r.put('sdop.target.es6.Template', 'sdop.lang.iset', c => {
    c.write(`#(scope instance).#(str 0) = #(expr 1)`);
    return c;
  });
  r.put('sdop.target.es6.Template', 'sdop.lang.ihas', c => {
    c.write(`( !! #(scope instance).#(str 0) )`);
    return c;
  });
  r.put('sdop.target.es6.Template', 'sdop.lang.instance', c => {
    c.write(`#(scope instance)`);
    return c;
  });

  // MAP STRUCTURES
  r.put('sdop.target.es6.Template', 'sdop.lang.dot', c => {
    c.write(`#(expr 0)[#(expr 1)]`);
    return c;
  });
  r.put('sdop.target.es6.Template', 'sdop.lang.get', c => {
    c.write(`#(expr 0).#(str 1)`);
    return c;
  });
  r.put('sdop.target.es6.Template', 'sdop.lang.in', c => {
    c.write(`( !! #(expr 0)[#(expr 1)] )`);
    return c;
  });

  // LITERALS
  r.put('sdop.target.es6.Template', 'sdop.lang.string', c => {
    c.write(JSON.stringify(c.value[0]));
    return c;
  });
});
