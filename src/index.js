const { Registry } = require('./constructs/Registry');
const { Module } = require('./constructs/Module');
var modules = require('./modules/index');

class SDOP {
  static init() {
    var r = new Registry();
    var c = { registry: r };
    modules.forEach(fn => fn(c));
    return c;
  }
  static fn_seq (f, reference) {
    //
  }
}

module.exports = {
  SDOP: SDOP,
  Module: Module,
};
