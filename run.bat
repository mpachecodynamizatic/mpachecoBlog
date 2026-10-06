@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 exit /b 1
)

echo Abriendo http://localhost:8080/blog-repo/ en unos segundos...
start "" cmd /c "timeout /t 6 /nobreak >nul & start http://localhost:8080/blog-repo/"

call npm run dev
endlocal
