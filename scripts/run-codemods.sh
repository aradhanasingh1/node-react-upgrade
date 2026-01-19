#!/bin/bash

# MVSI Project Codemod Runner
# This script runs various codemods tailored for the MVSI microservices platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CODEMODS_DIR="$PROJECT_ROOT/codemods"
PAGES_DIR="$PROJECT_ROOT/pages"
SRC_DIR="$PROJECT_ROOT/src"

echo -e "${BLUE}🔧 MVSI Codemod Runner${NC}"
echo -e "${BLUE}=============================${NC}"

# Create codemods directory if it doesn't exist
mkdir -p "$CODEMODS_DIR"

# Function to run a specific codemod
run_codemod() {
    local codemod_name=$1
    local target_pattern=$2
    local description=$3
    
    echo -e "\n${YELLOW}🔄 Running: $description${NC}"
    echo -e "${YELLOW}   Target: $target_pattern${NC}"
    
    if [ -f "$CODEMODS_DIR/$codemod_name.js" ]; then
        npx jscodeshift -t "$CODEMODS_DIR/$codemod_name.js" "$target_pattern" --parser tsx
        echo -e "${GREEN}✅ Completed: $codemod_name${NC}"
    else
        echo -e "${RED}❌ Codemod not found: $codemod_name.js${NC}"
        echo -e "${YELLOW}💡 Creating template codemod...${NC}"
        create_codemod_template "$codemod_name"
    fi
}

# Function to create codemod template
create_codemod_template() {
    local codemod_name=$1
    
    cat > "$CODEMODS_DIR/$codemod_name.js" << 'EOF'
const { getImportedName } = require('jscodeshift/src/collections/utils');

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Your transformation logic here
  // Example: Find and replace specific patterns
  
  return root.toSource({
    quote: 'single',
    trailingComma: true,
    tabWidth: 2,
    useTabs: false
  });
};

module.exports.type = 'js';
EOF
}

# Function to show menu
show_menu() {
    echo -e "\n${BLUE}Available Codemods for MVSI:${NC}"
    echo "1. Convert functional components to class components"
    echo "2. Add Material-UI prop types"
    echo "3. Update React imports (remove React from functional components)"
    echo "4. Convert hooks to class lifecycle methods"
    echo "5. Add TypeScript interfaces to JS files"
    echo "6. Fix Next.js page imports"
    echo "7. Run all MVSI-specific codemods"
    echo "8. Custom codemod (specify file)"
    echo "9. Exit"
    echo ""
}

# Function to run all MVSI codemods
run_all_codemods() {
    echo -e "\n${YELLOW}🚀 Running all MVSI codemods...${NC}"
    
    # Run in order of dependency
    run_codemod "fix-react-imports" "$PAGES_DIR/*.js" "Fix React imports in pages"
    run_codemod "functional-to-class" "$PAGES_DIR/*.js" "Convert functional to class components"
    run_codemod "add-mui-prop-types" "$PAGES_DIR/*.js" "Add Material-UI prop types"
    run_codemod "hooks-to-lifecycle" "$PAGES_DIR/*.js" "Convert hooks to lifecycle methods"
    run_codemod "fix-nextjs-imports" "$PAGES_DIR/*.js" "Fix Next.js imports"
    
    echo -e "\n${GREEN}🎉 All MVSI codemods completed!${NC}"
    echo -e "${YELLOW}💡 Review the changes and run tests before committing.${NC}"
}

# Function to backup files before codemods
backup_files() {
    local backup_dir="$PROJECT_ROOT/backup-$(date +%Y%m%d-%H%M%S)"
    echo -e "\n${YELLOW}💾 Creating backup in: $backup_dir${NC}"
    
    mkdir -p "$backup_dir"
    cp -r "$PAGES_DIR" "$backup_dir/"
    cp -r "$SRC_DIR" "$backup_dir/" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Backup created${NC}"
}

# Main execution
main() {
    # Check if jscodeshift is installed
    if ! command -v npx &> /dev/null || ! npx jscodeshift --version &> /dev/null; then
        echo -e "${RED}❌ jscodeshift not found. Installing...${NC}"
        npm install --save-dev jscodeshift @types/jscodeshift
    fi

    # Create backup before running codemods
    backup_files

    # Show menu
    while true; do
        show_menu
        read -p "Select an option (1-9): " choice
        
        case $choice in
            1)
                run_codemod "functional-to-class" "$PAGES_DIR/*.js" "Convert functional components to class components"
                ;;
            2)
                run_codemod "add-mui-prop-types" "$PAGES_DIR/*.js" "Add Material-UI prop types"
                ;;
            3)
                run_codemod "fix-react-imports" "$PAGES_DIR/*.js" "Update React imports"
                ;;
            4)
                run_codemod "hooks-to-lifecycle" "$PAGES_DIR/*.js" "Convert hooks to lifecycle methods"
                ;;
            5)
                run_codemod "add-typescript-interfaces" "$PAGES_DIR/*.js" "Add TypeScript interfaces"
                ;;
            6)
                run_codemod "fix-nextjs-imports" "$PAGES_DIR/*.js" "Fix Next.js imports"
                ;;
            7)
                run_all_codemods
                ;;
            8)
                read -p "Enter codemod filename (without .js): " custom_codemod
                read -p "Enter target pattern (e.g., pages/*.js): " target_pattern
                run_codemod "$custom_codemod" "$target_pattern" "Custom codemod: $custom_codemod"
                ;;
            9)
                echo -e "${GREEN}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid option. Please try again.${NC}"
                ;;
        esac
    done
}

# Check if arguments were provided
if [ $# -eq 0 ]; then
    main
else
    # Support command line arguments
    case $1 in
        "all")
            run_all_codemods
            ;;
        "backup")
            backup_files
            ;;
        "functional-to-class")
            run_codemod "functional-to-class" "$PAGES_DIR/*.js" "Convert functional to class components"
            ;;
        *)
            echo -e "${YELLOW}Usage: $0 [all|backup|functional-to-class]${NC}"
            echo -e "${YELLOW}Or run without arguments for interactive menu${NC}"
            ;;
    esac
fi
