@echo off

:: This script starts the Laravel and Vite development servers
:: and then opens the application in your default browser.

:: --- Step 1: Start Laravel Development Server ---
:: The 'start' command opens a new command prompt window.
:: '/b' runs the command without waiting for it to finish.
:: 'cmd /k' keeps the new command prompt window open after the command executes.
echo Starting Laravel development server...
start "Laravel Server" cmd /k "php artisan serve"

:: --- Step 2: Start Vite Development Server ---
echo Starting Vite development server...
:: Change to your project directory if necessary.
:: For example: cd C:\path\to\your\project
start "Vite Server" cmd /k "npm run dev"

:: --- Step 3: Wait for servers to start ---
:: We'll wait 5 seconds to give the servers a moment to initialize.
echo Waiting 5 seconds for servers to start...
timeout /t 5 /nobreak

:: --- Step 4: Open URL in default browser ---
echo Opening application in default browser...
start http://localhost:3000

:: All done!
echo All tasks are complete. The servers are running in separate windows.
pause
