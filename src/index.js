const { Registry } = require('./constructs/Registry');
const { Module } = require('./constructs/Module');
const { Util } = require('./constructs/Util');
var modules = require('./modules/index');

class SDOP {
  static init() {
    var r = new Registry();
    var c = {
      registry: r,
      util: new Util(),
    };
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
