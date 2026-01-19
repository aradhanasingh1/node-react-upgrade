# MVSI Project Codemods

This directory contains custom codemods specifically designed for the MVSI microservices platform.

## Available Codemods

### 1. `functional-to-class.js`
Converts functional React components to class components.

**Transforms:**
- `useState()` hooks → `this.state` object
- `useEffect()` → `componentDidMount()`
- Function declarations → Class declarations
- `setState()` calls → `this.setState()`
- State access → `this.state.property`

### 2. `fix-react-imports.js`
Optimizes React imports for class components.

**Transforms:**
- Removes unused React imports
- Adds Component import where needed
- Cleans up import statements

### 3. `add-mui-prop-types.js`
Adds PropTypes for Material-UI components.

**Transforms:**
- Detects MUI component usage
- Adds static `propTypes` to classes
- Imports PropTypes if needed

### 4. `hooks-to-lifecycle.js`
Converts React hooks to class lifecycle methods.

**Transforms:**
- `useEffect(() => {}, [])` → `componentDidMount()`
- `useState()` → constructor state initialization

### 5. `fix-nextjs-imports.js`
Fixes Next.js specific imports and exports.

**Transforms:**
- Adds proper `_document.js` imports
- Adds proper `_app.js` imports
- Ensures default exports for pages
- Organizes Material-UI imports

## Usage

### Interactive Mode
```bash
npm run codemod
```

### Command Line Options
```bash
# Run all codemods
npm run codemod:all

# Create backup before running
npm run codemod:backup

# Run specific codemod
npm run codemod:functional-to-class

# Install jscodeshift if not installed
npm run codemod:install
```

### Manual Usage
```bash
npx jscodeshift -t codemods/functional-to-class.js pages/*.js
```

## Project Structure

```
MVSI/
├── codemods/
│   ├── README.md                    # This file
│   ├── functional-to-class.js       # Convert functional to class
│   ├── fix-react-imports.js        # Optimize React imports
│   ├── add-mui-prop-types.js       # Add PropTypes for MUI
│   ├── hooks-to-lifecycle.js       # Convert hooks to lifecycle
│   └── fix-nextjs-imports.js      # Fix Next.js imports
├── scripts/
│   └── run-codemods.sh            # Main runner script
└── package.json                   # Added codemod scripts
```

## Safety Features

### Automatic Backups
- Creates timestamped backups before running codemods
- Stores in `backup-YYYYMMDD-HHMMSS/` directory
- Backs up both `pages/` and `src/` directories

### Dry Run Mode
Add `--dry` flag to preview changes:
```bash
npx jscodeshift -t codemods/functional-to-class.js pages/*.js --dry
```

### Specific Targeting
Target specific files or patterns:
```bash
# Only dashboard and enhanced pages
npx jscodeshift -t codemods/functional-to-class.js pages/dashboard.js pages/enhanced.js

# All JS files in pages directory
npx jscodeshift -t codemods/functional-to-class.js pages/*.js
```

## MVSI Specific Features

### Material-UI Integration
- Recognizes MUI components (`Button`, `Typography`, `Paper`, etc.)
- Adds appropriate PropTypes for each component
- Handles complex components like `Grid` with container/item props

### Next.js Compatibility
- Handles special files (`_app.js`, `_document.js`)
- Maintains Next.js file-based routing structure
- Preserves page exports

### Class Component Focus
- Optimized for converting functional components to classes
- Maintains existing class components
- Preserves method bindings and state management

## Development

### Creating New Codemods
1. Create new file in `codemods/` directory
2. Use the template structure from `run-codemods.sh`
3. Test with `--dry` flag first
4. Add to the main script menu

### Testing Codemods
```bash
# Test on a single file
npx jscodeshift -t codemods/your-codemod.js pages/test.js --dry

# Compare before/after
git diff pages/test.js
```

## Troubleshooting

### Common Issues
1. **Parser Errors**: Ensure files are valid JavaScript/TypeScript
2. **Import Issues**: Check that jscodeshift is installed
3. **Permission Errors**: Make sure scripts are executable

### Recovery
If codemods cause issues:
1. Restore from backup: `cp -r backup-YYYYMMDD-HHMMSS/pages/* pages/`
2. Use `git checkout` to revert changes
3. Run with `--dry` flag to preview

## Best Practices

1. **Always backup** before running codemods
2. **Test incrementally** - run one codemod at a time
3. **Review changes** before committing
4. **Use version control** to track transformations
5. **Run tests** after each transformation

## Contributing

When adding new codemods:
1. Follow the existing naming convention
2. Add documentation to this README
3. Update the main script menu
4. Test with MVSI project structure
5. Handle edge cases (mixed JS/TS, class/functional components)
