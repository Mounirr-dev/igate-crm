@echo off
setlocal
cd /d "%~dp0"

echo.
echo ================================================
echo   NexCRM - Installation et demarrage
echo ================================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
  echo [ERREUR] Node.js n'est pas installe !
  echo Telecharger sur : https://nodejs.org
  pause
  exit /b 1
)
echo [OK] Node.js detecte

:: Check PostgreSQL
set "PGPATH=C:\Program Files\PostgreSQL\17\bin"
set "PATH=%PATH%;%PGPATH%"

psql --version >nul 2>&1
if errorlevel 1 (
  echo [ERREUR] PostgreSQL introuvable. Ajout du PATH...
  set "PATH=%PATH%;C:\Program Files\PostgreSQL\16\bin"
  set "PATH=%PATH%;C:\Program Files\PostgreSQL\15\bin"
)

echo.
echo ================================================
echo   ETAPE 1 : Configuration base de donnees
echo ================================================
echo.
echo Connexion a PostgreSQL en tant qu'admin...
echo Entrez le mot de passe postgres quand demande.
echo.

psql -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='nexcrm';" | findstr 1 >nul
if errorlevel 1 (
  psql -U postgres -c "CREATE USER nexcrm WITH PASSWORD 'nexcrm2026';"
  if errorlevel 1 (
    echo [ERREUR] Creation utilisateur PostgreSQL echouee
    pause
    exit /b 1
  )
)

psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='nexcrm_db';" | findstr 1 >nul
if errorlevel 1 (
  psql -U postgres -c "CREATE DATABASE nexcrm_db OWNER nexcrm;"
  if errorlevel 1 (
    echo [ERREUR] Creation base PostgreSQL echouee
    pause
    exit /b 1
  )
)

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE nexcrm_db TO nexcrm;"
if errorlevel 1 (
  echo [ERREUR] Attribution privileges base echouee
  pause
  exit /b 1
)

psql -U postgres -d nexcrm_db -c "GRANT ALL ON SCHEMA public TO nexcrm;"
if errorlevel 1 (
  echo [ERREUR] Attribution privileges schema echouee
  pause
  exit /b 1
)

psql "postgresql://nexcrm:nexcrm2026@localhost:5432/nexcrm_db" -c "SELECT 1;" >nul
if errorlevel 1 (
  echo [ERREUR] Connexion a nexcrm_db impossible avec l'utilisateur nexcrm
  pause
  exit /b 1
)

echo [OK] Base de donnees configuree

echo.
echo ================================================
echo   ETAPE 2 : Installation Backend
echo ================================================
echo.
cd backend
call npm install
if errorlevel 1 (
  echo [ERREUR] Installation backend echouee
  pause
  exit /b 1
)
echo [OK] Dependances backend installees

echo.
echo Migration base de donnees...
call npx prisma db push --accept-data-loss
if errorlevel 1 (
  echo [ERREUR] Migration echouee. Verifiez PostgreSQL.
  pause
  exit /b 1
)
echo [OK] Schema cree

echo.
echo Creation des donnees de test...
call npx prisma db seed
echo [OK] Donnees seed creees

echo.
echo ================================================
echo   ETAPE 3 : Installation Frontend
echo ================================================
echo.
cd ..\frontend
call npm install
if errorlevel 1 (
  echo [ERREUR] Installation frontend echouee
  pause
  exit /b 1
)
echo [OK] Dependances frontend installees

echo.
echo ================================================
echo   INSTALLATION TERMINEE !
echo ================================================
echo.
echo Pour demarrer l'application :
echo.
echo   1. Ouvrez un terminal dans : backend
echo      Commande : npm run dev
echo.
echo   2. Ouvrez un autre terminal dans : frontend
echo      Commande : npm run dev
echo.
echo   3. Ouvrez votre navigateur :
echo      http://localhost:5173
echo.
echo ================================================
echo   COMPTES DE CONNEXION :
echo ================================================
echo.
echo   Platform Owner : owner@nexcrm.com / owner123
echo   Company Admin  : admin@ecolea.ma / admin123
echo   Directeur      : dir@ecolea.ma / dir123
echo   Commercial     : com@ecolea.ma / crm123
echo   Comptabilite   : compta@ecolea.ma / compta123
echo.
echo   Formulaire public : http://localhost:5173/form/ecolea
echo ================================================
echo.
cd ..
pause
