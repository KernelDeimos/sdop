const { Module } = require('../constructs/Module');

module.exports = new Module({
  documentation: `
    Adds sdop.uuid.gen4()
  `
}, c => {
  var r = c.registry;
  r.put('Function', 'sdop.uuid.gen4', () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  });

  return c;
});
