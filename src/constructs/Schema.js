class Schema {
  constructor (rawSchema) {
    this.raw = rawSchema;
    this.resolved = null;
  }

  getResolved (c, portion) {
    // Note: resolving also handles allOf, but anyOf and oneOf are not
    //       processed until validation.

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

    if ( clone.allOf ) {
      for ( let schema of clone.allOf ) {
        clone = this.combine_(clone, schema);
      }
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
        ( name == 'function' ) ? typeof obj == 'function' :
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

    // Before anything, check for anyOf or oneOf
    var trySubSchemas = (schema, list) => list.map(subSchema => {
      var combinedSchema = this.combine_(schema, subSchema);
      let result = this.validate(c, obj, combinedSchema);
      return result.valid;
    }).reduce((acc, b) => b ? acc + 1 : acc, 0);

    var rmprop = (obj, prop) => {
      var o = { ...obj };
      delete o[prop];
      return o;
    };

    if ( schema.anyOf ) {
      if ( trySubSchemas(rmprop(schema, 'anyOf'), schema.anyOf) < 1 ) {
        return lib.resultError(`anyOf didn't match anything`, obj);
      }
    }
    if ( schema.oneOf ) {
      let v = trySubSchemas(rmprop(schema, 'oneOf'), schema.oneOf);
      if ( v != 1 ) {
        return lib.resultError(`oneOf matched ${v} items`, obj);
      }
    }

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

  combine_ (portionA, portionB) {
    if ( portionA.ref || portionB.ref ) {
      throw new Error('internal error: attempt to combine unresolved schemas');
    }

    var schema = { ...portionA };
    // Simple overrides
    // TODO: some of these are not proper implementations. For example 'type'
    //       can have a list of options that should be reduced when combining.
    //       Although, I'm also not sure if I'm going to add support for that
    //       considering anyOf already handles the case.

    var supportedSimple = [
      'type', 'item',
      'items', // TODO: combining these is non-trivial; overriding for now
    ]

    for ( let k of supportedSimple ) {
      if ( portionB[k] ) schema[k] = portionB[k];
    }

    // Recursive combines
    if ( portionB.properties ) {
      if ( ! schema.properties ) schema.properties = {};
      else schema.properties = { ...schema.properties };
      for ( let k in portionB.properties ) {
        if ( ! schema.properties[k] )
          schema.properties[k] = portionB.properties[k];
        else schema.properties[k] =
          this.combine_(schema.properties[k], portionB.properties[k]);
      }
    }
    if ( portionB.additionalProperties ) {
      if ( ! schema.additionalProperties )
        schema.additionalProperties = portionB.additionalProperties;
      else schema.additionalProperties =
        this.combine_(schema.additionalProperties,
          portionB.additionalProperties);
    }

    return schema;
  }
}

module.exports = {
  Schema: Schema,
};
