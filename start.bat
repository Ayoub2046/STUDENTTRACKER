@echo off
cd /d "%~dp0"
echo Starting AYUB Academic OS...
echo.
echo Starting Server (port 5000)...
start "AYUB Server" cmd /c "cd server && npx tsx src/index.ts"
echo Starting Client (port 5173)...
start "AYUB Client" cmd /c "cd client && npx vite --host"
echo.
echo Server: http://localhost:5000
echo Client: http://localhost:5173
echo.
pause
