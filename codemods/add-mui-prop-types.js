module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find Material-UI component imports
  const muiImports = root.find(j.ImportDeclaration, {
    source: { value: (val) => val.includes('@material-ui/core') }
  });

  if (muiImports.length === 0) {
    return root.toSource();
  }

  // Get all imported MUI components
  const muiComponents = [];
  muiImports.forEach(path => {
    path.node.specifiers.forEach(spec => {
      if (spec.imported) {
        muiComponents.push(spec.imported.name);
      }
    });
  });

  // Find class components that use MUI components
  root.find(j.ClassDeclaration).forEach(classPath => {
    const renderMethod = classPath.get('body').find(j.MethodDefinition, {
      key: { name: 'render' }
    });

    if (!renderMethod.length) return;

    // Find JSX elements using MUI components
    const muiUsage = renderMethod.find(j.JSXElement, {
      openingElement: { name: { name: (name) => muiComponents.includes(name) } }
    });

    if (muiUsage.length > 0) {
      // Check if PropTypes is already imported
      const hasPropTypesImport = root.find(j.ImportDeclaration, {
        source: { value: 'prop-types' }
      }).length > 0;

      if (!hasPropTypesImport) {
        // Add PropTypes import
        const propTypeImport = j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier('PropTypes'))],
          j.literal('prop-types')
        );
        
        root.get().node.program.body.unshift(propTypeImport);
      }

      // Add static propTypes to class
      const propTypes = [];
      muiUsage.forEach(usagePath => {
        const componentName = usagePath.node.openingElement.name.name;
        
        // Basic prop types for common MUI components
        const basicPropTypes = {
          'Button': ['onClick', 'children', 'variant', 'color', 'disabled'],
          'Typography': ['variant', 'color', 'children', 'component'],
          'Paper': ['elevation', 'children', 'style', 'className'],
          'Grid': ['container', 'item', 'spacing', 'direction', 'children'],
          'TextField': ['label', 'value', 'onChange', 'variant', 'margin'],
          'AppBar': ['position', 'color', 'children'],
          'Toolbar': ['children'],
          'IconButton': ['onClick', 'children', 'color', 'size']
        };

        const props = basicPropTypes[componentName] || ['children'];
        
        props.forEach(prop => {
          propTypes.push(
            j.property(
              'init',
              j.identifier(prop),
              j.memberExpression(
                j.identifier('PropTypes'),
                j.identifier('any')
              )
            )
          );
        });
      });

      // Add or update static propTypes
      const existingPropTypes = classPath.get('body').find(j.ClassProperty, {
        key: { name: 'propTypes' }
      });

      if (existingPropTypes.length > 0) {
        // Update existing propTypes
        existingPropTypes.get().node.value = j.objectExpression(propTypes);
      } else {
        // Add new propTypes property
        const propTypesProperty = j.classProperty(
          j.identifier('propTypes'),
          j.objectExpression(propTypes)
        );
        propTypesProperty.static = true;
        
        classPath.get('body').node.body.push(propTypesProperty);
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
