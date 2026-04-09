@echo off
cd /d "%~dp0"
title Reinstalando dependencias...

echo Borrando node_modules...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "apps\web\.next" rmdir /s /q "apps\web\.next"
if exist ".turbo" rmdir /s /q ".turbo"

echo Instalando (puede tardar 2-3 minutos)...
call npm install --legacy-peer-deps

echo Generando cliente Prisma...
cd packages\database
node ..\..\node_modules\.bin\prisma generate
cd ..\..

echo.
echo Listo! Ahora ejecuta ABRIR CRM.bat
echo.
pause
