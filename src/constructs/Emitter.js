// Emitter class that's more similar to FOAM's topic interface, allows
// tokens in the event path to have arbitrary formatting. Node's builtin
// events module does not support this, as it requires a consistent
// convention such as dotted paths for hierarchical events.

class Emitter {
  constructor () {
    this.listeners = [];
    this.anchoredListeners = {};
  }
  pub (...parts) {
    var listeners = this.listeners;
    for ( let lis of listeners ) {
      lis(...parts);
    }

    var node = this;

    while ( node = node.anchoredListeners[parts.shift()] ) {
      for ( let lis of node.listeners ) {
        lis(...parts);
      }
    }
  }
  sub (...anchorsAndListenFn) {
    var anchors = anchorsAndListenFn.slice(0, -1);
    var listenFn = anchorsAndListenFn.slice(-1)[0];
    var node = this;
    for ( let a of anchors ) {
      if ( ! node.anchoredListeners[a] )
        node.anchoredListeners[a] = {
          listeners: [],
          anchoredListeners: {}
        };
      node = node.anchoredListeners[a];
    }
    node.listeners.push(listenFn);
  }
}

module.exports = { Emitter: Emitter };
