const { Module } = sdop_require('Module');

module.exports = new Module({
  documentation: `
    Registers registrars for text types.
  `,
}, c => {
  var r = c.registry;
  var textPut = c => {
    if ( typeof c.value == 'string' ) {
      c.value = { text: c.value };
    }
    else if ( (typeof c.value != 'object') || Array.isArray(c.value) ) {
      throw new Error('not supported');
    }
    return c;
  };

  var textConfig = () => ({ put: textPut });

  r.put('Registrar', 'sdop.text.Plain', textConfig());
  r.put('Registrar', 'sdop.text.String', textConfig());
  r.put('Registrar', 'sdop.text.Markdown', textConfig());
  r.put('Registrar', 'sdop.text.HTML', textConfig());
  r.put('Registrar', 'sdop.text.JSON', textConfig());
  r.put('Registrar', 'sdop.text.CSS', textConfig());
  r.put('Registrar', 'sdop.text.Javascript', textConfig());
});
