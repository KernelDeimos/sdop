const { Registry } = require('./constructs/Registry');
var modules = {};
modules.registrar = require('./modules/Registrar');

class SDOP {
  static init() {
    var r = new Registry();
    var c = { registry: r };
    modules.registrar(c);
    return c;
  }
  static fn_seq (f, reference) {
    //
  }
}

module.exports = {
  SDOP: SDOP,
};
