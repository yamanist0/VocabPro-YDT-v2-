@echo off
echo ==========================================
echo YDT Kelime Uygulamasi Baslatiliyor...
echo Tarayicinizda sorunsuz calismasi icin
echo yerel bir sunucu baslatiliyor (CORS bypass)
echo ==========================================
start http://localhost:8000
python -m http.server 8000
