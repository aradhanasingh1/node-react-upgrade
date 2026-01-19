module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find useEffect hooks with empty dependency array
  root.find(j.CallExpression, {
    callee: { name: 'useEffect' }
  }).forEach(path => {
    const args = path.node.arguments;
    
    if (args.length === 2 && 
        args[1].type === 'ArrayExpression' && 
        args[1].elements.length === 0) {
      
      // This is useEffect with empty deps array -> componentDidMount
      const callback = args[0];
      
      // Find the parent function/class
      const parentFunction = path.parentPath.parentPath.parentPath;
      
      if (parentFunction.node.type === 'ClassDeclaration') {
        // Replace with componentDidMount method
        const componentDidMountMethod = j.methodDefinition(
          'method',
          j.identifier('componentDidMount'),
          [],
          j.blockStatement(callback.body ? [callback] : [])
        );
        
        // Insert into class body
        const classBody = parentFunction.get('body');
        classBody.node.body.push(componentDidMountMethod);
        
        // Remove the original useEffect call and its variable declaration
        const varDeclarator = path.parentPath.parentPath.node;
        if (varDeclarator.type === 'VariableDeclarator') {
          j(path.parentPath.parentPath).remove();
        }
      }
    }
  });

  // Find useState hooks and convert to class state
  root.find(j.VariableDeclaration).forEach(path => {
    const declarations = path.node.declarations;
    
    declarations.forEach(decl => {
      if (decl.type === 'VariableDeclarator' && 
          decl.init && 
          decl.init.type === 'CallExpression' && 
          decl.init.callee.name === 'useState') {
        
        const pattern = decl.id;
        if (pattern.type === 'ArrayPattern') {
          const stateName = pattern.elements[0].name;
          const setStateName = pattern.elements[1].name;
          
          // Find parent class
          const parentClass = path.parentPath.parentPath;
          
          if (parentClass.node.type === 'ClassDeclaration') {
            // Check if state property already exists
            const existingState = parentClass.get('body').find(j.ClassProperty, {
              key: { name: 'state' }
            });
            
            if (existingState.length === 0) {
              // Add state property to constructor
              const constructor = parentClass.get('body').find(j.MethodDefinition, {
                key: { name: 'constructor' }
              });
              
              if (constructor.length > 0) {
                const constructorBody = constructor.get('body');
                
                // Add this.state assignment
                const stateAssignment = j.expressionStatement(
                  j.assignmentExpression(
                    '=',
                    j.memberExpression(
                      j.thisExpression(),
                      j.identifier('state')
                    ),
                    j.objectExpression([
                      j.property(
                        'init',
                        j.identifier(stateName),
                        decl.init.arguments[0] || j.literal(null)
                      )
                    ])
                  )
                );
                
                constructorBody.node.body.push(stateAssignment);
              }
            }
            
            // Replace setState calls
            root.find(j.CallExpression, {
              callee: { name: setStateName }
            }).forEach(setStatePath => {
              setStatePath.node.callee = j.memberExpression(
                j.memberExpression(
                  j.thisExpression(),
                  j.identifier('setState')
                ),
                j.identifier('call')
              );
            });
            
            // Replace state access
            root.find(j.Identifier, { name: stateName })
              .forEach(identifierPath => {
                // Don't replace if it's the declaration or in setState call
                if (!identifierPath.parentPath.node.object || 
                    identifierPath.parentPath.node.object.name !== 'this') {
                  j(identifierPath).replaceWith(
                    j.memberExpression(
                      j.memberExpression(
                        j.thisExpression(),
                        j.identifier('state')
                      ),
                      j.identifier(stateName)
                    )
                  );
                }
              });
          }
        }
      }
    });
  });

  return root.toSource({
    quote: 'single',
    trailingComma: true,
    tabWidth: 2,
    useTabs: false
  });
};

module.exports.type = 'js';
