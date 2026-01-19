# Simple MVSI Codemod Runner
param(
    [string]$Action = "menu"
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$CodeModsDir = Join-Path $ProjectRoot "codemods"
$PagesDir = Join-Path $ProjectRoot "pages"

Write-Host "MVSI Codemod Runner" -ForegroundColor Cyan

function Backup-Files {
    $Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $BackupDir = Join-Path $ProjectRoot "backup-$Timestamp"
    
    Write-Host "Creating backup in: $BackupDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Copy-Item -Path $PagesDir -Destination $BackupDir -Recurse -Force
    Write-Host "Backup created" -ForegroundColor Green
}

function Run-Codemod {
    param(
        [string]$CodemodName,
        [string]$Description
    )
    
    Write-Host "Running: $Description" -ForegroundColor Yellow
    $CodemodPath = Join-Path $CodeModsDir "$CodemodName.js"
    
    if (Test-Path $CodemodPath) {
        npx jscodeshift -t $CodemodPath "$PagesDir\*.js" --parser tsx
        Write-Host "Completed: $CodemodName" -ForegroundColor Green
    } else {
        Write-Host "Codemod not found: $CodemodName.js" -ForegroundColor Red
    }
}

# Check if jscodeshift is available
try {
    npx jscodeshift --version | Out-Null
} catch {
    Write-Host "Installing jscodeshift..." -ForegroundColor Yellow
    npm install --save-dev jscodeshift @types/jscodeshift
}

switch ($Action.ToLower()) {
    "backup" {
        Backup-Files
    }
    "functional-to-class" {
        Backup-Files
        Run-Codemod "functional-to-class" "Convert functional to class components"
    }
    "all" {
        Backup-Files
        Run-Codemod "fix-react-imports" "Fix React imports"
        Run-Codemod "functional-to-class" "Convert functional to class components"
        Run-Codemod "add-mui-prop-types" "Add Material-UI prop types"
        Run-Codemod "hooks-to-lifecycle" "Convert hooks to lifecycle methods"
        Run-Codemod "fix-nextjs-imports" "Fix Next.js imports"
        Write-Host "All codemods completed!" -ForegroundColor Green
    }
    "menu" {
        Write-Host "`nOptions:" -ForegroundColor Cyan
        Write-Host "1. functional-to-class"
        Write-Host "2. all"
        Write-Host "3. backup"
        Write-Host "4. exit"
        
        $Choice = Read-Host "Select option (1-4)"
        
        switch ($Choice) {
            "1" { 
                Backup-Files
                Run-Codemod "functional-to-class" "Convert functional to class components"
            }
            "2" { 
                Backup-Files
                Run-Codemod "fix-react-imports" "Fix React imports"
                Run-Codemod "functional-to-class" "Convert functional to class components"
                Run-Codemod "add-mui-prop-types" "Add Material-UI prop types"
                Run-Codemod "hooks-to-lifecycle" "Convert hooks to lifecycle methods"
                Run-Codemod "fix-nextjs-imports" "Fix Next.js imports"
                Write-Host "All codemods completed!" -ForegroundColor Green
            }
            "3" { Backup-Files }
            "4" { Write-Host "Goodbye!" -ForegroundColor Green; exit 0 }
            default { Write-Host "Invalid option" -ForegroundColor Red }
        }
    }
    default {
        Write-Host "Usage: .\run-codemods-simple.ps1 [backup|functional-to-class|all|menu]" -ForegroundColor Yellow
    }
}
