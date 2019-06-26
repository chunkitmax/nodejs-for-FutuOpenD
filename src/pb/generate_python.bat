@echo off
chcp 65001
for /r %~dp0 %%h in (*.proto) do (
echo 轉換：%%h
protoc.exe -I=%~dp0 --python_out=%~dp0 %%h
)
pause