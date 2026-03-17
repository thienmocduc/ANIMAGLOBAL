@echo off
cd /d "C:\Users\Admin\Documents\Animaglobal"
git add .
git diff --cached --quiet || git commit -m "auto: %date% %time%"
git push
