class Whitespace {
  constructor (config) {
    this.lib = config
      ? require('chindent')(config)
      : require('chindent')
      ;
    for ( let k in this.lib ) if ( this.lib.hasOwnProperty(k) ) {
      this[k] = this.lib[k];
    }
  }
}

module.exports = { Whitespace: Whitespace };
