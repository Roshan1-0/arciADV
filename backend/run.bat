@echo off
echo Starting backend server using virtual environment...
cd /d "%~dp0"
..\.venv\Scripts\python -m uvicorn main:app --reload --port 8000
