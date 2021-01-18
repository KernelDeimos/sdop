const { Sequence } = require('nicepattern');

module.exports = c => {
  var r = c.registry;
  r.put('Registrar', 'Sequence', {
    put: (c) => {
      if ( c.value instanceof Sequence ) return c.value;
      var arry = c.util.opt_fn_array('main', c.value);
      c.value = new Sequence(arry);
      return c;
    }
  });
};
