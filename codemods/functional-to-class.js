module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Convert functional components to class components
  const functionalComponents = root.find(j.FunctionDeclaration, {
    id: { type: 'Identifier' }
  });

  functionalComponents.forEach(path => {
    const componentName = path.node.id.name;
    const functionBody = path.node.body.body;
    
    // Find useState hooks
    const useStateCalls = path.find(j.CallExpression, {
      callee: { name: 'useState' }
    });

    // Find useEffect hooks
    const useEffectCalls = path.find(j.CallExpression, {
      callee: { name: 'useEffect' }
    });

    // Build state object from useState calls
    const stateProperties = [];
    useStateCalls.forEach(useStateCall => {
      const variableDeclarator = useStateCall.parentPath.parentPath.node;
      if (variableDeclarator.type === 'VariableDeclarator' && 
          variableDeclarator.id.type === 'ArrayPattern') {
        const stateName = variableDeclarator.id.elements[0].name;
        const setStateName = variableDeclarator.id.elements[1].name;
        stateProperties.push({
          name: stateName,
          setState: setStateName
        });
      }
    });

    // Create class declaration
    const classDeclaration = j.classDeclaration(
      j.identifier(componentName),
      j.classBody([
        // Constructor
        j.methodDefinition(
          'constructor',
          j.identifier('constructor'),
          [],
          j.blockStatement([
            j.expressionStatement(
              j.callExpression(
                j.memberExpression(
                  j.identifier('super'),
                  j.identifier('call')
                ),
                [j.identifier('props')]
              )
            ),
            j.expressionStatement(
              j.assignmentExpression(
                '=',
                j.memberExpression(
                  j.thisExpression(),
                  j.identifier('state')
                ),
                j.objectExpression(
                  stateProperties.map(prop => 
                    j.property(
                      'init',
                      j.identifier(prop.name),
                      j.literal(null)
                    )
                  )
                )
              )
            )
          ])
        ),
        
        // ComponentDidMount from useEffect
        ...useEffectCalls.map(useEffectCall => {
          const callback = useEffectCall.node.arguments[0];
          if (useEffectCall.node.arguments.length === 1 || 
              (useEffectCall.node.arguments[1] && 
               useEffectCall.node.arguments[1].elements.length === 0)) {
            return j.methodDefinition(
              'method',
              j.identifier('componentDidMount'),
              [],
              j.blockStatement(callback.body ? [callback] : [])
            );
          }
          return null;
        }).filter(Boolean),

        // Render method
        j.methodDefinition(
          'method',
          j.identifier('render'),
          [],
          j.blockStatement(functionBody)
        )
      ])
    );

    // Add extends React.Component
    classDeclaration.superClass = j.memberExpression(
      j.identifier('React'),
      j.identifier('Component')
    );

    // Replace function declaration with class declaration
    j(path).replaceWith(
      j.exportDefaultDeclaration(classDeclaration)
    );

    // Replace setState calls with this.setState
    root.find(j.CallExpression, {
      callee: { name: (name) => stateProperties.some(prop => prop.setState === name) }
    }).forEach(path => {
      const setStateName = path.node.callee.name;
      const stateProp = stateProperties.find(prop => prop.setState === setStateName);
      
      if (stateProp) {
        path.node.callee = j.memberExpression(
          j.memberExpression(
            j.thisExpression(),
            j.identifier('setState')
          ),
          j.identifier('call')
        );
      }
    });

    // Replace state access with this.state
    stateProperties.forEach(prop => {
      root.find(j.Identifier, { name: prop.name })
        .forEach(path => {
          if (!path.parentPath.node.object || 
              path.parentPath.node.object.name !== 'this') {
            j(path).replaceWith(
              j.memberExpression(
                j.memberExpression(
                  j.thisExpression(),
                  j.identifier('state')
                ),
                j.identifier(prop.name)
              )
            );
          }
        });
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
