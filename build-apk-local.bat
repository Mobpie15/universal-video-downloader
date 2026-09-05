@echo off
echo ===================================================
echo   PIETools Universal Downloader - Local APK Builder
echo ===================================================
echo.

echo [1/3] Building Web Production Assets...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Web build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Syncing Capacitor Android Project...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Capacitor sync failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Checking for Java / JDK...
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [NOTICE] Java (JDK 17+) was not detected on your system.
    echo To compile the .apk locally:
    echo 1. Install OpenJDK 17 (e.g., from https://adoptium.net/ or winget install Microsoft.OpenJDK.17)
    echo 2. Set JAVA_HOME in your environment variables.
    echo.
    echo Alternatively, push this repo to GitHub and GitHub Actions will automatically
    echo compile and generate the downloadable .apk file for you!
    echo.
    pause
    exit /b 0
)

echo Compiling Android Debug APK with Gradle...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo [SUCCESS] APK built successfully!
    echo File located at:
    echo android\app\build\outputs\apk\debug\app-debug.apk
    echo ===================================================
) else (
    echo [ERROR] Gradle build failed. Check error log above.
)

cd ..
pause
