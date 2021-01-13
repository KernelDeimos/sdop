class Module extends Function {
  constructor (entry, opt_fn) {
    function modulef(...args) {
      return modulef.run(args);
    }
    Object.setPrototypeOf(modulef, Module.prototype);
    if ( typeof entry == 'function' ) {
      modulef.entry = { fn: entry };
    } else {
      entry = entry || {};
      if ( opt_fn ) entry.fn = opt_fn;
    }
    modulef.entry = entry;
    modulef.init();
    return modulef;
  }

  init () {
    if ( this.entry.init ) this.entry.init.bind(this)();
  }

  run (args) {
    if ( this.entry.fn ) {
      return this.entry.fn.bind(this)(...args);
    }
  }
}

module.exports = { Module: Module };
