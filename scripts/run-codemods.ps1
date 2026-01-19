# MVSI Project Codemod Runner (PowerShell Version)
# This script runs various codemods tailored for the MVSI microservices platform

param(
    [string]$Action = "menu",
    [string]$Codemod = "",
    [string]$Target = ""
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    White = "White"
}

# Project root directory
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$CodeModsDir = Join-Path $ProjectRoot "codemods"
$PagesDir = Join-Path $ProjectRoot "pages"
$SrcDir = Join-Path $ProjectRoot "src"

Write-Host "🔧 MVSI Codemod Runner" -ForegroundColor $Colors.Blue
Write-Host "=============================" -ForegroundColor $Colors.Blue

# Create codemods directory if it doesn't exist
if (!(Test-Path $CodeModsDir)) {
    New-Item -ItemType Directory -Path $CodeModsDir -Force | Out-Null
}

# Function to run a specific codemod
function Run-Codemod {
    param(
        [string]$CodemodName,
        [string]$TargetPattern,
        [string]$Description
    )
    
    Write-Host "`n🔄 Running: $Description" -ForegroundColor $Colors.Yellow
    Write-Host "   Target: $TargetPattern" -ForegroundColor $Colors.Yellow
    
    $CodemodPath = Join-Path $CodeModsDir "$CodemodName.js"
    
    if (Test-Path $CodemodPath) {
        $Result = npx jscodeshift -t $CodemodPath $TargetPattern --parser tsx
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Completed: $CodemodName" -ForegroundColor $Colors.Green
        } else {
            Write-Host "❌ Failed: $CodemodName" -ForegroundColor $Colors.Red
        }
    } else {
        Write-Host "❌ Codemod not found: $CodemodName.js" -ForegroundColor $Colors.Red
        Write-Host "💡 Creating template codemod..." -ForegroundColor $Colors.Yellow
        New-CodemodTemplate $CodemodName
    }
}

# Function to create codemod template
function New-CodemodTemplate {
    param([string]$CodemodName)
    
    $Template = @"
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
"@
    
    $TemplatePath = Join-Path $CodeModsDir "$CodemodName.js"
    $Template | Out-File -FilePath $TemplatePath -Encoding UTF8
}

# Function to show menu
function Show-Menu {
    Write-Host "`nAvailable Codemods for MVSI:" -ForegroundColor $Colors.Blue
    Write-Host "1. Convert functional components to class components"
    Write-Host "2. Add Material-UI prop types"
    Write-Host "3. Update React imports (remove React from functional components)"
    Write-Host "4. Convert hooks to class lifecycle methods"
    Write-Host "5. Add TypeScript interfaces to JS files"
    Write-Host "6. Fix Next.js page imports"
    Write-Host "7. Run all MVSI-specific codemods"
    Write-Host "8. Custom codemod (specify file)"
    Write-Host "9. Exit"
    Write-Host ""
}

# Function to run all MVSI codemods
function Invoke-AllCodemods {
    Write-Host "`n🚀 Running all MVSI codemods..." -ForegroundColor $Colors.Yellow
    
    # Run in order of dependency
    Run-Codemod "fix-react-imports" "$PagesDir\*.js" "Fix React imports in pages"
    Run-Codemod "functional-to-class" "$PagesDir\*.js" "Convert functional to class components"
    Run-Codemod "add-mui-prop-types" "$PagesDir\*.js" "Add Material-UI prop types"
    Run-Codemod "hooks-to-lifecycle" "$PagesDir\*.js" "Convert hooks to lifecycle methods"
    Run-Codemod "fix-nextjs-imports" "$PagesDir\*.js" "Fix Next.js imports"
    
    Write-Host "`n🎉 All MVSI codemods completed!" -ForegroundColor $Colors.Green
    Write-Host "💡 Review the changes and run tests before committing." -ForegroundColor $Colors.Yellow
}

# Function to backup files before codemods
function Backup-Files {
    $Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $BackupDir = Join-Path $ProjectRoot "backup-$Timestamp"
    
    Write-Host "`n💾 Creating backup in: $BackupDir" -ForegroundColor $Colors.Yellow
    
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Copy-Item -Path $PagesDir -Destination $BackupDir -Recurse -Force
    
    if (Test-Path $SrcDir) {
        Copy-Item -Path $SrcDir -Destination $BackupDir -Recurse -Force
    }
    
    Write-Host "✅ Backup created" -ForegroundColor $Colors.Green
}

# Check if jscodeshift is available
function Test-Jscodeshift {
    try {
        $Version = npx jscodeshift --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
    } catch {
        # Continue to install
    }
    
    Write-Host "❌ jscodeshift not found. Installing..." -ForegroundColor $Colors.Red
    npm install --save-dev jscodeshift @types/jscodeshift
    return $false
}

# Main execution
function Main {
    # Check if jscodeshift is installed
    if (!(Test-Jscodeshift)) {
        Write-Host "Please try again after installation completes." -ForegroundColor $Colors.Yellow
        return
    }

    # Create backup before running codemods
    Backup-Files

    if ($Action -eq "menu") {
        # Interactive menu
        while ($true) {
            Show-Menu
            $Choice = Read-Host "Select an option (1-9)"
            
            switch ($Choice) {
                "1" {
                    Run-Codemod "functional-to-class" "$PagesDir\*.js" "Convert functional components to class components"
                }
                "2" {
                    Run-Codemod "add-mui-prop-types" "$PagesDir\*.js" "Add Material-UI prop types"
                }
                "3" {
                    Run-Codemod "fix-react-imports" "$PagesDir\*.js" "Update React imports"
                }
                "4" {
                    Run-Codemod "hooks-to-lifecycle" "$PagesDir\*.js" "Convert hooks to lifecycle methods"
                }
                "5" {
                    Run-Codemod "add-typescript-interfaces" "$PagesDir\*.js" "Add TypeScript interfaces"
                }
                "6" {
                    Run-Codemod "fix-nextjs-imports" "$PagesDir\*.js" "Fix Next.js imports"
                }
                "7" {
                    Invoke-AllCodemods
                }
                "8" {
                    $CustomCodemod = Read-Host "Enter codemod filename (without .js)"
                    $TargetPattern = Read-Host "Enter target pattern (e.g., pages\*.js)"
                    Run-Codemod $CustomCodemod $TargetPattern "Custom codemod: $CustomCodemod"
                }
                "9" {
                    Write-Host "👋 Goodbye!" -ForegroundColor $Colors.Green
                    exit 0
                }
                default {
                    Write-Host "❌ Invalid option. Please try again." -ForegroundColor $Colors.Red
                }
            }
        }
    } else {
        # Command line arguments
        switch ($Action.ToLower()) {
            "all" {
                Invoke-AllCodemods
            }
            "backup" {
                Backup-Files
            }
            "functional-to-class" {
                Run-Codemod -CodemodName "functional-to-class" -TargetPattern "$PagesDir\*.js" -Description "Convert functional to class components"
            }
            default {
                Write-Host 'Usage: .\run-codemods.ps1 [all|backup|functional-to-class]' -ForegroundColor $Colors.Yellow
                Write-Host 'Or run without arguments for interactive menu' -ForegroundColor $Colors.Yellow
            }
        }
    }
}

# Execute main function
Main
