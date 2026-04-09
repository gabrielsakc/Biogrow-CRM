@echo off
cd /d "%~dp0"
title Biogrow Platform — Dev

echo.
echo  Biogrow Platform - Dev Server
echo  ==============================
echo.

:: Push DB schema if first time
if not exist "packages\database\node_modules" (
    echo  Installing dependencies...
    call pnpm install
    echo.
)

echo  Pushing database schema...
cd packages\database
call pnpm dlx prisma db push --skip-generate
cd ..\..
echo.

:: Seed the database
echo  Seeding database...
cd packages\database
call pnpm dlx prisma db seed
cd ..\..
echo.

:: Clear Next.js cache
if exist "apps\web\.next" (
    echo  Clearing .next cache...
    rmdir /s /q "apps\web\.next"
    echo  Done.
    echo.
)

echo  Starting dev server at http://localhost:3000
echo.

call pnpm dev

pause
