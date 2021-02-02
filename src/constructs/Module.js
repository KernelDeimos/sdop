class Module extends Function {
  constructor (entry, opt_fn) {
    function modulef(...args) {
      return modulef.run(args);
    }
    Object.setPrototypeOf(modulef, Module.prototype);
    if ( typeof entry == 'function' ) {
      entry = { fn: entry };
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
    if ( this.entry.id && args[0] && args[0].registry ) {
      let r = args[0].registry;
      r.put('Module', this.entry.id, this);
    }
  }
}

module.exports = { Module: Module };
