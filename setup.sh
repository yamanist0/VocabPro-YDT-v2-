#!/bin/bash
echo "=========================================="
echo "YDT Kelime Uygulaması Bağımlılıkları Kuruluyor..."
echo "Bu işlem PDF ayrıştırma pipeline'ını çalıştırmak"
echo "için gereklidir. Frontend için şart değildir."
echo "=========================================="

# Python3 ve pip kontrolü
if ! command -v python3 &> /dev/null
then
    echo "Python3 bulunamadı! Lütfen Python'ı yükleyin."
    exit 1
fi

if ! command -v pip3 &> /dev/null
then
    echo "pip3 bulunamadı! Lütfen pip'i yükleyin. (sudo apt install python3-pip)"
    exit 1
fi

echo "Bağımlılıklar indiriliyor..."
pip3 install pypdf googletrans==4.0.0-rc1

echo "Kurulum tamamlandı!"
