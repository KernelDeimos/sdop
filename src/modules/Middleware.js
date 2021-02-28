const { Module } = sdop_require('Module');
const { Middleware, CompositeMiddleware } = require('nicepattern');

module.exports = new Module({}, c => {
  var r = c.registry;
  r.put('Registrar', 'Middleware', {
    put: c => {
      // Array creates a composite middleware
      if ( Array.isArray(c.value) ) {
        var mw = new CompositeMiddleware(
          c.value.map(id => r.get('Middleware', id))
        );
        c.value = mw;
        return c;
      }

      c.value = new Middleware(
        c.value.preFunc || [],
        c.value.postFunc || [],
        r.get('Function', 'sdop.uuid.gen4')(),
      );
      return c;
    },
  });
  return c;
});
