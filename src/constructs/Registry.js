class Registry {
  constructor() {
    this.registrars_ = {};
  }
  put (registrarId, ...args) {
    var registrar = this.registrars_[registrarId];
    if ( ! registrar ) throw new Error(`missing model ${registrarId}`);
    return registrar.put(...args);
  }
  putm (registrarId, map) {}
  get (registrarId, ...args) {
    var registrar = this.registrars_[registrarId];
    if ( ! registrar ) throw new Error(`missing model ${registrarId}`);
    return registrar.get(...args);
  }
  putRegistrar (name, obj) {
    this.registrars_[name] = obj;
  }
  getRegistrar (name) {
    return this.registrars_[name];
  }
}

module.exports = {
  Registry: Registry,
};
