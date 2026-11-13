@echo off
chcp 65001 >nul
title 职途 JobPilot 启动器
cd /d "%~dp0"

echo ==========================================
echo    职途 JobPilot · AI 求职陪跑 Agent
echo ==========================================
echo.

REM 1. 检查 Node.js
where node >nul 2>nul
if errorlevel 1 (
  echo [提示] 未检测到 Node.js 运行环境。
  echo 请先在打开的网页中下载 LTS 版，一路「下一步」安装完成后，重新双击本文件。
  echo.
  start https://nodejs.org/zh-cn
  pause
  exit /b 1
)

REM 2. 首次运行自动安装依赖
if not exist node_modules (
  echo [1/2] 首次运行，正在安装依赖（约 1-3 分钟，需联网）...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo [错误] 依赖安装失败，请检查网络后重新双击本文件。
    pause
    exit /b 1
  )
  echo.
)

REM 3. 启动应用并自动打开浏览器
echo [2/2] 正在启动应用，浏览器稍后自动打开...
echo.
echo ------------------------------------------
echo  使用说明：
echo   · 浏览器地址 http://localhost:3210
echo   · 关闭本黑色窗口 = 停止应用
echo   · 内置 AI 模型已配置，开箱即用
echo ------------------------------------------
echo.

start "" /min cmd /c "timeout /t 8 /nobreak >nul && start http://localhost:3210"

call npm run dev

pause
