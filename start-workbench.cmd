@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel%==0 (
  node tools\workbench-server.mjs
  goto :end
)

set "CODEX_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%CODEX_NODE%" (
  "%CODEX_NODE%" tools\workbench-server.mjs
  goto :end
)

echo Node.js was not found. Install Node.js 20 or later, then run this file again.
pause

:end
endlocal
