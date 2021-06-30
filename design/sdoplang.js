module.exports = [
  {
    title: 'Example 1',
    body: `
      use sdop.model
      put Class Registry {
        reasons {
          registrarMustExist 'a registrar must exit to perform this operation'
        }
        properties {
          registrars_ map(string, any, {
            get index => super(index) == null ? registrarMustExist : @
          })
          // or, equivalently
          registrars_ map(string, any, {
            indexError registrarMustExist
          })
        }
        methods {
          put registrarId:string ...args:any -> :maybe(reason) {
            return? := registrar registrars_[registrarId]
            registrar.put(...args)
          }
          get registrarId:string, ...args:any -> :either(reason, instance) {
            return? := registrar registrars_[registrarId]
            return registrar.get(...args)
          }
        }
      }

    `,
  }
];
