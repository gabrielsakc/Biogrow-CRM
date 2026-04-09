@echo off
cd /d "%~dp0"
title Biogrow CRM

if exist "apps\web\.next" rmdir /s /q "apps\web\.next" >nul 2>&1

start /b cmd /c "timeout /t 20 /nobreak >nul && start "" http://localhost:3000/sign-in"

cd apps\web
node_modules\.bin\next.cmd dev
