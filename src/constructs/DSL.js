class DSL {
  constructor (definition) {
    this.raw = definition;
  }

  toLibrary (c) {
    var r = c.registry;
    var lib = {};
    var fnConv = r.get('Convert', 'sdop.model.Function', 'Function');
    for ( let fName in this.raw.functions ) {
      let modelFn = this.raw.functions[fName];
      let fn = fnConv({ ...c, value: modelFn }).value;
      lib[fName] = (...args) => fn({ ...c, args: args }).value;
    }
    return lib;
  }

  toAST (fn) {
    // TODO
  }
}

module.exports = { DSL: DSL };
