@echo off
REM Windows wrapper for running bash hooks
REM Tries: Git Bash > WSL > native cmd fallback

setlocal enabledelayedexpansion

set "HOOK_NAME=%~1"
set "SCRIPT_DIR=%~dp0"
set "HOOK_PATH=%SCRIPT_DIR%%HOOK_NAME%"

REM Try Git Bash first (most common on Windows dev machines)
where bash >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    bash "%HOOK_PATH%"
    exit /b %ERRORLEVEL%
)

REM Try WSL
where wsl >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    wsl bash "%HOOK_PATH%"
    exit /b %ERRORLEVEL%
)

REM Fallback to native Windows implementation
if "%HOOK_NAME%"=="session-start.sh" (
    call "%SCRIPT_DIR%session-start.cmd"
    exit /b %ERRORLEVEL%
)

REM Unknown hook, output minimal JSON
echo {"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"Locus skills available. Read skills/using-locus/SKILL.md to get started."}}
