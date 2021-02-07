class DSL {
  constructor (definition) {
    this.raw = definition;
  }

  toLibrary (c) {
    var r = c.registry;
    var lib = {};
    var fnConv = r.get('Convert', 'sdop.model.Function', 'Function');
    for ( let fName in this.raw.functions ) {
      let mw = this.raw.functions[fName];
      // TODO: maybe schema has a tagging feature
      let preFunc = fnConv({ ...c, value: mw.preFunc }).value;
      let postFunc = fnConv({ ...c, value: mw.postFunc }).value;
      lib[fName] = (...args) => {
        var ctxFn = c => {
          c = { ...c, args: args };
          c = preFunc(c);
          c = { ...c, args: args.map(a => {
            if ( typeof a == 'function' && a.wrappedByDSL ) {
              return a(c).value;
            }
            return a;
          }) };
          return postFunc(c);
        };
        ctxFn.wrappedByDSL = true;
        return ctxFn;
      };
    }
    return lib;
  }

  toAST (fn) {
    // TODO
  }
}

module.exports = { DSL: DSL };
