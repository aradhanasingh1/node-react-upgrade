module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Fix Next.js specific imports and exports
  const fileName = fileInfo.path.split('/').pop().split('.')[0];
  
  // Fix document imports in _document.js files
  if (fileName === '_document') {
    // Check if Document, Html, Head, Main, NextScript are imported
    const nextImports = root.find(j.ImportDeclaration, {
      source: { value: 'next/document' }
    });

    if (nextImports.length === 0) {
      // Add proper Next.js document imports
      const importDeclaration = j.importDeclaration(
        [
          j.importSpecifier(j.identifier('Document')),
          j.importSpecifier(j.identifier('Html')),
          j.importSpecifier(j.identifier('Head')),
          j.importSpecifier(j.identifier('Main')),
          j.importSpecifier(j.identifier('NextScript'))
        ],
        j.literal('next/document')
      );
      
      root.get().node.program.body.unshift(importDeclaration);
    }
  }

  // Fix app imports in _app.js files
  if (fileName === '_app') {
    // Check if Component is imported from next/app
    const nextAppImports = root.find(j.ImportDeclaration, {
      source: { value: 'next/app' }
    });

    if (nextAppImports.length === 0) {
      // Add proper Next.js app imports
      const importDeclaration = j.importDeclaration(
        [j.importSpecifier(j.identifier('AppProps'))],
        j.literal('next/app')
      );
      
      root.get().node.program.body.unshift(importDeclaration);
    }
  }

  // Fix page exports - ensure they're default exports
  if (!fileName.startsWith('_') && fileName !== 'index') {
    // Find named exports that should be default exports
    root.find(j.ExportNamedDeclaration).forEach(path => {
      const declaration = path.node.declaration;
      
      if (declaration && 
          (declaration.type === 'FunctionDeclaration' || 
           declaration.type === 'ClassDeclaration')) {
        
        // Convert to default export
        const defaultExport = j.exportDefaultDeclaration(declaration);
        j(path).replaceWith(defaultExport);
      }
    });
  }

  // Fix Material-UI imports to use consistent naming
  root.find(j.ImportDeclaration, {
    source: { value: '@material-ui/core' }
  }).forEach(path => {
    // Ensure consistent import structure
    const specifiers = path.node.specifiers;
    const sortedSpecifiers = specifiers.sort((a, b) => {
      const nameA = a.imported ? a.imported.name : a.local.name;
      const nameB = b.imported ? b.imported.name : b.local.name;
      return nameA.localeCompare(nameB);
    });
    
    path.node.specifiers = sortedSpecifiers;
  });

  // Add missing imports for commonly used components
  const usedComponents = new Set();
  
  // Find all JSX elements
  root.find(j.JSXElement).forEach(path => {
    const componentName = path.node.openingElement.name.name;
    usedComponents.add(componentName);
  });

  // Check if used components are imported
  const muiImport = root.find(j.ImportDeclaration, {
    source: { value: '@material-ui/core' }
  });

  if (muiImport.length > 0) {
    const importedComponents = new Set();
    muiImport.get().node.specifiers.forEach(spec => {
      if (spec.imported) {
        importedComponents.add(spec.imported.name);
      }
    });

    // Add missing imports
    const missingComponents = Array.from(usedComponents).filter(comp => 
      importedComponents.has(comp)
    );

    // Common MUI components that might be missing
    const commonMUI = ['Button', 'Typography', 'Paper', 'Grid', 'TextField', 
                      'AppBar', 'Toolbar', 'IconButton', 'Drawer', 'List', 
                      'ListItem', 'ListItemText', 'ListItemIcon'];

    commonMUI.forEach(comp => {
      if (usedComponents.has(comp) && !importedComponents.has(comp)) {
        muiImport.get().node.specifiers.push(
          j.importSpecifier(j.identifier(comp))
        );
      }
    });
  }

  return root.toSource({
    quote: 'single',
    trailingComma: true,
    tabWidth: 2,
    useTabs: false
  });
};

module.exports.type = 'js';
