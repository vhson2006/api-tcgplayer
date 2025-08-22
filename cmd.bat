@echo off 

setlocal & cd /d "%~dp0"
set "_rb_dir=D:\moon_cake\moon_api_nest"

pushd "%_rb_dir%" & for /L %%i in (1 1 42)do (
     npm run migration:revert
     timeout 2
    )
    
popd

:: Run from here your next command if need

endlocal 