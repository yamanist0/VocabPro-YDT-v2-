import json

def clean():
    with open('data/vocabulary.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Known English words that pop up when translating Turkish YDT exam text -> English
    bad_meanings_stems = {'following', 'question', 'sentence', 'passage', 'author', 'which', 'statement', 'correct', 'incorrect', 'false', 'true', 'paragraph', 'answer', 'option', 'choose'}
    
    # Common Turkish stems that slipped through purely ascii [a-zA-Z] regex filters
    tr_stems = {'soru','cevap','yanlis','dogru','hangi','asagi','yukari','secenek','secene','parca','olarak','veril','oldug','cizil','altind','tamamla','ifade','anlam','cumle','kadar', 'neden', 'gost', 'metne', 'gore', 'yazar', 'degil', 'yoktur', 'vardir'}
    
    # Turkish context markers for example sentences
    tr_context = ['aşağıdaki', 'doğrudur', 'hangisi', 'göre', 'olan', 'olduğu', 'seçenek', 'yanlıştır', 'yazar', 'pasaja', 'parçaya', 'anlamlı', 'anlamsız', 'uygun', 'cevap', 'soru', 'ifade']

    cleaned = []
    dropped = 0
    
    for item in data:
        w = item['word'].lower()
        m_list = item.get('turkishMeaning', [])
        m = m_list[0].lower() if m_list else ""
        ex = item.get('example', '').lower()
        
        # 1. Word didn't translate (likely a proper noun, unmappable term, or original Turkish)
        if w == m and len(w) > 3:
            dropped += 1
            print(f"Dropped {w} (translation identical)")
            continue
            
        # 2. Word is a known Turkish stem masked as english
        if any(stem in w for stem in tr_stems):
            dropped += 1
            print(f"Dropped {w} (Turkish stem)")
            continue
            
        # 3. The Turkish "Meaning" actually contains English words (Translator inverted language correctly converting tr->en)
        if any(b in m.split() for b in bad_meanings_stems):
            dropped += 1
            print(f"Dropped {w} (English meaning detected: {m})")
            continue
            
        # 4. Pure English grammar in meaning
        if any(x in m.split() for x in ['the', 'to', 'and', 'that', 'with', 'from', 'this']):
            dropped += 1
            print(f"Dropped {w} (English preposition in meaning: {m})")
            continue
            
        # 5. Example sentence has Turkish text (Pulled from a question rather than a passage)
        if any(c in ex for c in tr_context):
            dropped += 1
            print(f"Dropped {w} (Turkish context in example)")
            continue
            
        cleaned.append(item)
        
    print(f"Dropped total: {dropped}")
    print(f"Remaining clean records: {len(cleaned)}")
    
    # Reset IDs seamlessly
    for i, item in enumerate(cleaned):
        item['id'] = i + 1
        
    with open('data/vocabulary.json', 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    clean()
