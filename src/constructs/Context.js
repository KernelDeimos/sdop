class Context {
  static create (ctx) {
    ctx = ctx || {};
    var lib = {};
    lib.sub = (vals) => {
      vals = vals || {};
      var newCtx = { ...ctx, ...vals };
      return Context.create(newCtx);
    };
    var p = new Proxy(ctx, {
      get (obj, prop) {
        if ( typeof prop == 'string' && prop.startsWith('$') ) {
          return lib[prop.slice(1)];
        }
        return obj[prop];
      }
    });
    return p;
  }
}

module.exports = { Context: Context };
