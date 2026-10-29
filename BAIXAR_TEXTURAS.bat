@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js LTS 24 pelo site https://nodejs.org e abra este arquivo novamente.
  pause
  exit /b 1
)
if not exist node_modules\sharp\package.json (
  call npm ci
  if errorlevel 1 goto failed
)
echo Baixando os 24 materiais reais do Poly Haven. Isto pode demorar e ocupar centenas de MB.
echo Powered by Poly Haven - https://polyhaven.com
call npm run assets:polyhaven -- --resolution=2k --all
if errorlevel 1 goto failed
echo Download e preparacao concluidos. Consulte public\assets\polyhaven\instalacao.json.
echo Reabra o jogo para aplicar os materiais locais. Os modelos de caminhao nao fazem parte deste download.
pause
exit /b 0
:failed
echo Houve falha. Os materiais completos anteriores foram preservados.
echo Consulte public\assets\polyhaven\instalacao.json e a mensagem acima.
pause
exit /b 1
