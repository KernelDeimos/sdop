const { Module } = sdop_require('Module');

module.exports = new Module({}, c => {
  var r = c.registry;
  r.put('DSL', 'sdop.internal.SelectDSL', {
    and: c => {
      c.value = c.args.reduce((acc, v) => acc && v, true);
      return c;
    },
    or: c => {
      c.value = c.args.reduce((acc, v) => acc || v, false);
      return c;
    },
    not: c => {
      c.value = ! c.args[0];
      return c;
    },
    get: c => {
      c.value = c.value[c.args[0]];
      return c;
    },
    scope: {
      preFunc: c => {
        c.value = c.value[c.args[0]];
        return c;
      },
      postFunc: c => {
        c.value = c.args[1];
        return c;
      }
    },
    pass: c => c,
    true: c => { c.value = true; return c; },
    false: c => { c.value = false; return c; },
  });
  return c;
});
