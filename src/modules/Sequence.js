const { Sequence } = require('nicepattern');

module.exports = c => {
  var r = c.registry;
  r.put('Registrar', 'Sequence', {
    put: (c) => {
      var r = c.registry;
      if ( c.value instanceof Sequence ) return c.value;
      if ( typeof c.value == 'object' && ! Array.isArray(c.value) ) {
        let arry = c.util.opt_fn_array('main', c.value.fn);
        let seq = new Sequence(arry);
        if ( c.value.middlewares ) {
          for ( let mwid of c.value.middlewares ) {
            let mw = r.get('Middleware', mwid);
            seq = mw.apply(seq);
          }
        }
        c.value = seq;
      } else {
        let arry = c.util.opt_fn_array('main', c.value);
        c.value = new Sequence(arry);
      }
      return c;
    }
  });
};
