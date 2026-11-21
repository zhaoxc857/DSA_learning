@echo off
chcp 65001 >nul
set PYTHONUTF8=1
cd /d "%~dp0"

set "PY_CMD="
where python >nul 2>nul
if not errorlevel 1 set "PY_CMD=python"
if not "%PY_CMD%"=="" goto :found_py
where py >nul 2>nul
if not errorlevel 1 set "PY_CMD=py -3"
if not "%PY_CMD%"=="" goto :found_py

echo [ERROR] Python 3 not found in PATH.
echo Please install Python 3 and check "Add Python to PATH".
pause
exit /b 1

:found_py
if "%~1"=="" goto :show_help
%PY_CMD% judge.py %*
exit /b %errorlevel%

:show_help
%PY_CMD% judge.py --help
echo.
%PY_CMD% judge.py --list
echo.
pause
exit /b 0
