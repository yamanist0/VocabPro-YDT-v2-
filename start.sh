#!/bin/bash
echo "=========================================="
echo "YDT Kelime Uygulamasi Baslatiliyor..."
echo "Tarayicinizda sorunsuz calismasi ve CORS engelini"
echo "asmak icin yerel HTTP sunucusu baslatiliyor."
echo "=========================================="

# Ekranı tarayıcıda otomatik açmayı dener
if command -v xdg-open > /dev/null
then
  xdg-open http://localhost:8000 &
elif command -v gnome-open > /dev/null
then
  gnome-open http://localhost:8000 &
else
  echo -e "\n---> Lütfen tarayıcınızda şu adresi açın: http://localhost:8000 \n"
fi

# Sunucuyu başlat (Python 3)
python3 -m http.server 8000
