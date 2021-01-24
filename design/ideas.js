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
  },
  {
    title: 'Query language',
    example: `
      // Function
      r.select(a => a.and(
        a.eq(a.get('obj1', 'a'), a.get('obj2', 'a')),
        a.scope('obj2', a.eq('a', 'b'))
      ))

      // String
      r.select(normie\`( obj1.a == obj2.a ) && ( obj2.a == obj2.b )\`)
      r.select(lispish\`&& (== (. obj1 a) (. obj2 a)) (with obj2 (== a b))\`)
    `
  },
  {
    title: 'Registry select',
    example: `
      // Multiple Registrars
      r.select(a =>
        a.eq( a.get('TypeA', 'a') , a.get('TypeB','a') ),
        { limit: 100 })

      // Single Registrar
      r.get('Registrar', 'TypeA')
        .select(a => a.eq(a.get('a'),a.get('b')), { limit: 100 })
    `
  }
];
