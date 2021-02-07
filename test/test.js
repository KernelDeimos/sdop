var expect = require('chai').expect;
const { SDOP } = require('../src/index.js');
const fs = require('fs').promises;

describe('SDOP', () => {
  describe('Registrar (module, high-level-test)', () => {
    var c = SDOP.init();
    var r = c.registry;

    it('should register a registrar', () => {
      r.put('Registrar', 'Tester', {
        put: c => {
          c.value.testPut = true;
          return c;
        },
        get: c => {
          c.value.testGet = true;
          return c;
        },
      });

      expect(r.get('Registrar', 'Tester')).to.exist;
    });

    it('should report a previously put object', () => {
      r.put('Tester', 'Name', {
        hello: 'world',
      });
      expect(r.get('Tester', 'Name')).to.exist;
      expect(r.get('Tester', 'Name')).to.include.all.keys('hello');
    });

    it('should apply custom operations', () => {
      expect(r.get('Tester', 'Name')).to.include.all.keys('testPut', 'testGet');
    });
  });
  describe('Convert (module, high-level-test)', () => {
    var c = SDOP.init();
    var r = c.registry;

    it('should be loaded', () => {
      expect(r.get('Registrar', 'Convert')).to.exist;
    });

    r.put('Registrar', 'TypeA');
    r.put('Registrar', 'TypeB');
    r.put('Registrar', 'TypeC');

    r.put('TypeA', 'TestValue', { notConverted: 'hello' });

    it('should put without errors', () => {
      r.put('Convert', 'TypeA', 'TypeB', c => {
        c.value = { converted: c.value.notConverted };
        return c;
      })
    })

    var value = null;
    it('should produce target type', () => {
      value = r.get('TypeB', 'TestValue');
      expect(value).to.exist;
    })
    it('should convert to target type', () => {
      expect(value).to.include.keys('converted');
      expect(value).not.to.include.keys('notConverted');
    })
    it('should not throw an exception on missing sources', () => {
      value = r.get('TypeC', 'TestValue');
      expect(value).not.to.exist;
    })
  });
  describe('TextTypes (module, high-level-test)', () => {
    var c = SDOP.init();
    var r = c.registry;

    it('should work', () => {
      r.put('sdop.text.Markdown', 'Test', 'Hello there');
      var result = r.get('sdop.text.Markdown', 'Test');
      expect(result.text).to.eql('Hello there');
    });
  });

  describe('Reduce (module, high-level-test)', () => {
    var c = SDOP.init();
    var r = c.registry;

    r.put('Registrar', 'TypeA');
    r.put('Registrar', 'TypeB');
    r.put('Registrar', 'TypeC');
    r.put('Registrar', 'TypeD');

    r.put('TypeA', 'TestValue', { a: 'hello' });
    r.put('TypeB', 'TestValue', { b: 'yes' });
    r.put('TypeC', 'TestValue', { c: 'this is dog' });

    r.put('TypeA', 'AnotherTest', { a: 'hello' });

    it('should put without errors', () => {
      r.put('Reduce', ['TypeA','TypeB','TypeC'], 'TypeD', c => {
        c.value = `${c.value[0].a}, ${c.value[1].b}; ${c.value[2].c}.`;
        return c;
      })
    })
    var value = null;
    it('should produce target type', () => {
      value = r.get('TypeD', 'TestValue');
      expect(value).to.exist;
    })
    it('should convert to target type', () => {
      expect(value).to.eql('hello, yes; this is dog.');
    })
    it('should not throw an exception on missing sources', () => {
      value = r.get('TypeD', 'AnotherTest');
      expect(value).not.to.exist;
    })
  })

  describe('Journal (module, high-level-test)', () => {
    var c = SDOP.init();
    var r = c.registry;

    // Ensure file
    it('needs some setup', async () => {
      try {
        await fs.unlink('./test/outputs/test.jrl');
      } catch {}
      try {
        await fs.writeFile('./test/outputs/test.jrl', '', { flag: 'wx' });
      } catch {}
    });

    it('should create a journal', () => {
      r.put('Journal', 'TestJournal', {
        file: './test/outputs/test.jrl'
      });
    });

    it('should create a collection', () => {
      r.put('TestJournal', 'TestCollection');
    });

    it('should replay empty file', async () => {
      await r.get('Journal', 'TestJournal', {}).replay(r);
    });

    it('should put to a collection', async () => {
      await r.put('TestCollection', 'a', { v: 1 });
      await r.put('TestCollection', 'b', { v: 2 });
    });

    it('should get from a collection', async () => {
      var v = r.get('TestCollection', 'a');
      expect(v).to.eql({ v: 1 });
    });

    it('should replay populated file', async () => {
      var c = SDOP.init();
      var r = c.registry;
      r.put('Journal', 'TestJournal', {
        file: './test/outputs/test.jrl'
      });
      r.put('TestJournal', 'TestCollection');
      await r.get('Journal', 'TestJournal', {}).replay(r);
      var val = r.get('TestCollection', 'a');
      expect(val).to.eql({ v: 1 });
    });

  });

  describe('Middleware (module, high-level-test)', () => {
    var c = SDOP.init();
    var r = c.registry;
    var testlist = [];
    it('should put', () => {
      r.put('Middleware', 'TestA', {
        preFunc: () => {
          testlist.push('A');
        },
        postFunc: () => {
          testlist.push('B');
        },
      });
      r.put('Middleware', 'TestB', {
        preFunc: () => {
          testlist.push('X');
        },
        postFunc: () => {
          testlist.push('Y');
        },
      });
    })
    it('should put sequence', () => {
      r.put('Sequence', 'TestSeq', {
        middlewares: ['TestB', 'TestA'],
        fn: [
          {
            name: 'PartA',
            fn: () => { testlist.push('1'); }
          },
          {
            name: 'PartB',
            fn: () => { testlist.push('2'); }
          }
        ]
      });
    })
    it('should run new sequence in order', () => {
      var s = r.get('Sequence', 'TestSeq');
      s();
      expect(testlist).to.eql(['A','X','1','2','Y','B']);
    })
  });
  describe('Schema (module, high-level-test)', () => {
    var c = SDOP.init();
    var r = c.registry;
    it('should work', () => {
      var schema = r.get('Schema', 'sdop.model.Class');
      expect(!! schema.getResolved(c)).to.eql(true);
    });
    describe('validation', () => {
      var c = SDOP.init();
      var r = c.registry;
      r.put('Schema', 'TestSchemaChild', {
        type: 'object',
        properties: {
          myString: { type: 'string' }
        }
      });
      r.put('Schema', 'TestSchema', {
        type: 'object',
        properties: {
          myArray: { type: 'array' },
          myTest: { ref: 'TestSchemaChild' }
        }
      });
      var schema = r.get('Schema', 'TestSchema');
      it('should generate correct resolved schema', () => {
        expect(schema.getResolved()).to.eql({
          type: 'object',
          properties: {
            myArray: { type: 'array' },
            myTest: {
              type: 'object',
              properties: {
                myString: { type: 'string' }
              }
            }
          }
        });
      });
      var cases = [
        {
          name: 'simple success case',
          valid: true,
          input: { myArray: [1,2,3], myTest: { myString: 'Hello' } }
        },
        {
          name: 'missing non-required property',
          valid: true,
          input: { myArray: [], myTest: {} }
        },
        {
          name: 'object when expecting an array',
          valid: false,
          input: { myArray: { a: 1 }, myTest: { myString: 'Hello' } }
        },
      ];
      for ( let tc of cases ) {
        let result = schema.validate(c, tc.input);
        it(`should ${tc.valid ? 'pass' : 'fail'} for: ${tc.name}`, () => {
          expect(result.valid, result.message).to.eql(tc.valid);
        })
      }
    });
    describe('registration', () => {
      var c = SDOP.init();
      var r = c.registry;
      r.put('Schema', 'Test', {
        type: 'object',
        properties: {
          myString: { type: 'string' }
        }
      });
      r.put('Registrar', 'Test');
      it('should validate schemas on put', () => {
        expect(() => {
          r.put('Test', 'A', { myString: 'Haiya' })
        }).to.not.throw();
        expect(() => {
          r.put('Test', 'B', { myString: 1234 })
        }).to.throw();
      })
    })
  });

  describe('DSL (module, high-level-test)', () => {
    it('should support long-form native port', () => {
      var c = SDOP.init();
      var r = c.registry;
      r.put('DSL', 'Test', {
        functions: {
          and: {
            args: [{ name: 'c', type: 'scope' }],
            ports: [
              {
                language: 'javascript',
                fn: c => {
                  c.value = c.args.reduce((acc, v) => acc && v, true);
                  return c;
                }
              }
            ]
          }
        }
      });
      var dsl = r.get('DSL', 'Test');
      var lib = dsl.toLibrary(c);
      expect(lib.and(true, true)).to.equal(true);
    });
    it('should support short-form native port', () => {
      var c = SDOP.init();
      var r = c.registry;
      r.put('DSL', 'Test', {
        functions: {
          and: c => {
            c.value = c.args.reduce((acc, v) => acc && v, true);
            return c;
          }
        }
      });
      var dsl = r.get('DSL', 'Test');
      var lib = dsl.toLibrary(c);
      expect(lib.and(true, true)).to.equal(true);
    });
  });
});
