module.exports = [
  {
    title: 'Expect function for context returns',
    example: `
      function (c) {
        var r = c.registry;
        // Throw an error if someDelegateFn doesn't return a context
        c = c.expect(c.someDelegateFn(c), c);
        return c;
      }
    `
  },
  {
    title: 'Error state for context',
    example: `
      function (c) {
        return c.error('oops');
      }
    `
  }
];
