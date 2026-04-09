@echo off
cd /d "%~dp0"
title Biogrow - Database Setup

echo.
echo  Biogrow Platform - Database Setup
echo  ===================================
echo.

cd packages\database

echo [1/2] Creando tablas en Neon...
node ..\..\node_modules\.bin\prisma.cmd db push --accept-data-loss
echo.

echo [2/2] Cargando datos iniciales...
node ..\..\node_modules\.bin\prisma.cmd db seed
echo.

cd ..\..
echo  Base de datos lista!
echo.
pause
