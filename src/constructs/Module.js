
class Module extends Function {
  constructor(...args) {
    
    function callable(...args) {
      return callable.__sdop_call(...args);
    }
    Object.setPrototypeOf(callable, Module.prototype);

    if ( args.length == 1 ) {
      callable["fn"] = args[0];
    }
    if ( args.length == 2 ) {
      
      for ( let k in args[0] ) {
        callable[k] = args[0][k];
      }
      
      callable["fn"] = args[1];
    }

    return callable;


  }
  
  __sdop_call (context) {
    
    if ( ( !! this.id ) && ( !! context["registry"] ) ) {
      (() => {
        let r = context.registry;
      r.put("Module", this.id, this);
      })();

    }

    if ( ( !! this.fn ) ) {
      return this.fn(context);

    }

  }


}

module.exports = { Module: Module }
