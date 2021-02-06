class Schema {
  constructor (rawSchema) {
    this.raw = rawSchema;
  }
  getResolved(c, portion) {
    var r = c.registry;
    portion = portion || this.raw;
    var clone = { ...portion };
    if ( clone.ref ) {
      let schema = r.get('Schema', clone.ref);
      if ( ! schema ) throw new Error(`missing schema: ${clone.ref}`);
      schema = schema.getResolved(c);
      return schema;
    }

    clone.properties = { ...clone.properties };
    if ( clone.properties ) for ( let k in clone.properties ) {
      let resolved = this.getResolved(c, clone.properties[k]);
      clone.properties[k] = resolved;
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

    return clone;
  }
}

module.exports = {
  Schema: Schema,
};
