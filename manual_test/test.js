const { SDOP } = require('../src/index.js');

var c = SDOP.init();
var r = c.registry;

r.put('Registrar', 'Tester', {
  put: c => {
    c.value.greeting = 'Hello, World';
    return c;
  },
  get: c => {
    return {
      wrapped: c
    }
  },
})

r.put('Tester', 'Name', {
  yeah: true,
})

console.log(r.get('Tester', 'Name'));

console.log(r);
