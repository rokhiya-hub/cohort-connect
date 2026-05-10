@echo off
echo ====================================
echo  Starting Cohort Connect Services
echo ====================================

echo [1/3] Starting Frontend (React + Vite)...
start "Frontend - Port 5173" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [2/3] Starting Backend (Node + Express)...
start "Backend - Port 5000" cmd /k "cd /d %~dp0backend && npm run dev"

echo [3/3] Starting Manim Service (Flask)...
start "Manim Service - Port 5001" cmd /k "cd /d %~dp0manim-service && pip install -r requirements.txt && python app.py"

echo.
echo All services launched in separate windows.
echo   Frontend  : http://localhost:5173
echo   Backend   : http://localhost:5000
echo   Manim     : http://localhost:5001
echo.
pause
