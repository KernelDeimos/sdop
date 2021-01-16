const fs = require('fs').promises;

class Journal {
  constructor (config) {
    if ( ! config.file ) throw new Error('config.path is required');
    this.config = config;
    this.doneReplay = false;
  }
  async put (collection, id, object) {
    if ( ! this.doneReplay ) return;
    var inner = [collection, id, object].map(v => JSON.stringify(v)).join(', ');
    return await fs.appendFile(this.config.file,
      `p(${inner})\n`);
  }
  async rm (collection, id) {
    if ( ! this.doneReplay ) return;
    var inner = [collection, id].map(v => JSON.stringify(v)).join(', ');
    return await fs.appendFile(this.config.file,
      `r(${inner})\n`);
  }
  async replay (registry) {
    var data = await fs.readFile(this.config.file)

    var p = (coll, id, o) => {
      registry.put(coll, id, o);
    };
    var r = (coll, id) => {
      throw new Error('remove operation not yet supported');
    };

    eval(data.toString());

    this.doneReplay = true;
  }
}

module.exports = { Journal: Journal };
