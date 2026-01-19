module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Remove React import from functional components that don't need it
  root.find(j.ImportDeclaration, {
    source: { value: 'react' }
  }).forEach(path => {
    const specifiers = path.node.specifiers;
    
    // Check if React is used in JSX
    const usesReactJSX = root.find(j.JSXElement).length > 0;
    
    // Check if React is used in function calls
    const usesReactCall = root.find(j.CallExpression, {
      callee: { name: 'React' }
    }).length > 0;

    if (!usesReactJSX && !usesReactCall) {
      // Remove React import if only Component is imported and it's a class component
      const componentSpecifier = specifiers.find(s => 
        s.imported && s.imported.name === 'Component'
      );
      
      if (componentSpecifier && specifiers.length === 1) {
        // Check if file contains class components
        const hasClassComponents = root.find(j.ClassDeclaration).length > 0;
        
        if (hasClassComponents) {
          // Keep only Component import
          path.node.specifiers = [componentSpecifier];
        } else {
          // Remove entire import
          j(path).remove();
        }
      } else if (!componentSpecifier) {
        // Remove React import entirely
        j(path).remove();
      }
    }
  });

  // Add Component import to class components that don't have it
  root.find(j.ClassDeclaration, {
    superClass: {
      object: { name: 'React' },
      property: { name: 'Component' }
    }
  }).forEach(path => {
    // Check if Component is already imported
    const hasComponentImport = root.find(j.ImportDeclaration, {
      source: { value: 'react' }
    }).some(importPath => 
      importPath.node.specifiers.some(s => 
        s.imported && s.imported.name === 'Component'
      )
    );

    if (!hasComponentImport) {
      // Find existing React import or create new one
      const reactImport = root.find(j.ImportDeclaration, {
        source: { value: 'react' }
      });

      if (reactImport.length > 0) {
        // Add Component to existing import
        reactImport.get().node.specifiers.push(
          j.importSpecifier(j.identifier('Component'))
        );
      } else {
        // Create new import
        const importDeclaration = j.importDeclaration(
          [j.importSpecifier(j.identifier('Component'))],
          j.literal('react')
        );
        
        // Insert at the top
        root.get().node.program.body.unshift(importDeclaration);
      }
    }
  });

  return root.toSource({
    quote: 'single',
    trailingComma: true,
    tabWidth: 2,
    useTabs: false
  });
};

module.exports.type = 'js';
