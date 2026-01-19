@echo off
echo MVSI Codemod Runner
echo =====================

if "%1"=="backup" goto backup
if "%1"=="functional-to-class" goto functional-to-class
if "%1"=="all" goto all
if "%1"=="" goto menu
goto usage

:backup
echo Creating backup...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%-%HH%%Min%%Sec%"

mkdir "backup-%timestamp%" 2>nul
xcopy "pages" "backup-%timestamp%\pages" /E /I /H /Y
echo Backup created: backup-%timestamp%
goto end

:functional-to-class
call :backup
echo Running functional-to-class codemod...
node node_modules\jscodeshift\bin\jscodeshift.js -t codemods/functional-to-class.js pages/*.js --parser tsx
echo Functional-to-class codemod completed!
goto end

:all
call :backup
echo Running all codemods...
echo Step 1: Fix React imports...
node node_modules\jscodeshift\bin\jscodeshift.js -t codemods/fix-react-imports.js pages/*.js --parser tsx
echo Step 2: Convert functional to class...
node node_modules\jscodeshift\bin\jscodeshift.js -t codemods/functional-to-class.js pages/*.js --parser tsx
echo Step 3: Add Material-UI prop types...
node node_modules\jscodeshift\bin\jscodeshift.js -t codemods/add-mui-prop-types.js pages/*.js --parser tsx
echo Step 4: Convert hooks to lifecycle...
node node_modules\jscodeshift\bin\jscodeshift.js -t codemods/hooks-to-lifecycle.js pages/*.js --parser tsx
echo Step 5: Fix Next.js imports...
node node_modules\jscodeshift\bin\jscodeshift.js -t codemods/fix-nextjs-imports.js pages/*.js --parser tsx
echo All codemods completed!
goto end

:menu
echo.
echo Available options:
echo 1. backup
echo 2. functional-to-class
echo 3. all
echo 4. exit
echo.
set /p choice="Select option (1-4): "

if "%choice%"=="1" goto backup
if "%choice%"=="2" goto functional-to-class
if "%choice%"=="3" goto all
if "%choice%"=="4" goto end
echo Invalid option
goto menu

:usage
echo Usage: run-codemods.bat [backup^|functional-to-class^|all]
echo Or run without arguments for interactive menu
goto end

:end
echo Done!
