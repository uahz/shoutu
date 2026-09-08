@echo off
chcp 65001 >nul
REM 《守土》Windows exe 一键打包
cd /d "%~dp0"
python -m pip install -r requirements.txt
python -m PyInstaller --noconfirm --onefile --windowed ^
  --name Shoutu ^
  --icon icon.ico ^
  --add-data "index.html;." ^
  main.py
echo.
echo 构建完成: dist\Shoutu.exe
pause
