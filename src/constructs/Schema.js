class Schema {
  constructor (rawSchema) {
    this.raw = rawSchema;
    this.resolved = null;
  }

  getResolved (c, portion) {
    var topLevel = ! portion;
    if ( topLevel && this.resolved ) return this.resolved;

    var r = c.registry;
    portion = portion || this.raw;
    var clone = { ...portion };
    if ( clone.ref ) {
      let schema = r.get('Schema', clone.ref);
      if ( ! schema ) throw new Error(`missing schema: ${clone.ref}`);
      schema = schema.getResolved(c);
      return schema;
    }

    if ( clone.properties ) {
      clone.properties = { ...clone.properties };
      for ( let k in clone.properties ) {
        let resolved = this.getResolved(c, clone.properties[k]);
        clone.properties[k] = resolved;
      }
    }

    ['additionalProperties', 'items'].forEach(prop => {
      if ( clone[prop] ) {
        if ( Array.isArray(clone[prop]) ) {
          clone[prop] = [ ...clone[prop] ];
          for ( let i = 0 ; i < clone[prop].length ; i++ ) {
            clone[prop][i] = this.getResolved(c, clone[prop][i]);
          }
        } else {
          let resolved = this.getResolved(c, clone[prop]);
          clone[prop] = resolved;
        }
      }
    })
    if ( clone.additionalProperties ) {
      let resolved = this.getResolved(c, clone.additionalProperties);
      clone.additionalProperties = resolved;
    }

    if ( topLevel ) this.resolved = clone;
    return clone;
  }

  validate (c, obj, schema) {
    schema = schema || this.getResolved(c);

    var lib = {};
    lib.typeMatch = (name, obj) => {
      return false || // Fixes syntax highlighters
        ( name == 'object' ) ? typeof obj == 'object' && ! Array.isArray(obj) :
        ( name == 'array' ) ? Array.isArray(obj) :
        ( name == 'string' ) ? typeof obj == 'string' :
        false
    };
    // TODO: make this a general-purpose function
    lib.resultError = (message, subject) => ({
      valid: false,
      message: message,
      subject: subject,
      add: function (message) {
        return {
          ...this,
          message: `${message}: ${this.message}`
        };
      }
    });

    if ( schema.type && ! lib.typeMatch(schema.type, obj) )
      return lib.resultError(`type did not match ${schema.type}`, obj);

    if ( schema.type == 'object' ) {
      var required = schema.required || [];

      if ( schema.properties ) for ( let k in schema.properties ) {
        if ( ! required.includes(k) && ! obj.hasOwnProperty(k) ) continue;
        let result = this.validate(c, obj[k], schema.properties[k]);
        if ( ! result.valid )
          return result.add(`error in property '${k}'`);
      }

      var noAdditional = schema.additionalProperties === false;
      if ( noAdditional ) for ( let k in obj ) {
        if ( ! ( k in schema.properties ) ) return lib.resultError(
          `no additional properties allowed`, obj);
        //
      } else if ( schema.additionalProperties ) for ( let k in obj ) {
        let result = this.validate(c, obj[k], schema.additionalProperties);
        if ( ! result.valid )
          return result.add(`error in additional property '${k}'`);
      }
    }

    return { valid: true };
  }
}

module.exports = {
  Schema: Schema,
};
