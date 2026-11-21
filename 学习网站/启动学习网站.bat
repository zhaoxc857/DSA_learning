@echo off
chcp 65001 >nul
set PYTHONUTF8=1
cd /d "%~dp0"
title DS-Algorithm Study Site

set "PY_CMD="
where python >nul 2>nul
if not errorlevel 1 set "PY_CMD=python"
if not "%PY_CMD%"=="" goto :found_py
where py >nul 2>nul
if not errorlevel 1 set "PY_CMD=py -3"
if not "%PY_CMD%"=="" goto :found_py

echo [ERROR] Python 3 not found in PATH.
echo Please install Python 3 and check "Add Python to PATH".
echo Tip: You can also double-click index.html directly for offline browsing mode.
pause
exit /b 1

:found_py
if exist "data\manifest.js" goto :start_server
echo [INFO] First launch: building offline content bundles...
%PY_CMD% build_content.py
if errorlevel 1 goto :build_failed

:start_server
%PY_CMD% server.py %*
if errorlevel 1 goto :server_failed
exit /b 0

:build_failed
echo [ERROR] Failed to run build_content.py. Please check the error above.
pause
exit /b 1

:server_failed
echo.
echo [INFO] Server exited with an error. If port 8765 is in use, try:
echo        server.py --port 8766
pause
exit /b 1
