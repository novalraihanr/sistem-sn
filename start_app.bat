@echo off

:: This script starts the Laravel and Next.js development servers
:: and then opens the application in your default browser.

:: --- Step 1: Start Laravel Development Server ---
echo Starting Laravel development server...
:: Change to the Laravel project directory.
cd dashboardpkl/
start "Laravel Server" cmd /k "php artisan serve"
cd ..

:: --- Step 2: Start Next.js Development Server ---
echo Starting Next.js development server...
:: Change to the Next.js project directory.
cd inventaris-sn/
start "Next.js Server" cmd /k "npm run dev"
cd ..

:: --- Step 3: Wait for servers to start ---
echo Waiting 5 seconds for servers to start...
timeout /t 5 /nobreak

:: --- Step 4: Open URL in default browser ---
echo Opening application in default browser...
start http://localhost:3000

:: All done!
echo All tasks are complete. The servers are running in separate windows.
pause