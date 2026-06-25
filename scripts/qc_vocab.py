import json
import time
import sys
import email.message
import types

# Fix for cgi
cgi_mod = types.ModuleType("cgi")
def parse_header(line):
    m = email.message.Message()
    m['content-type'] = line
    p = m.get_params()
    return m.get_content_type(), dict(p) if p else {}
cgi_mod.parse_header = parse_header
sys.modules['cgi'] = cgi_mod

from googletrans import Translator

def qc_vocab():
    print("Starting Quality Control on vocabulary.json...")
    with open('data/vocabulary.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    translator = Translator()
    cleaned = []
    
    removed_tr_context = 0
    fixed_translation = 0
    total = len(data)
    
    # We shouldn't drop the original 70 curated words, only checking id > 70
    # Actually, let's just check all of them just in case, but rely heavily on example sentences.
    
    for i, item in enumerate(data):
        w = item['word']
        ex = item.get('example', '')
        meanings = item.get('turkishMeaning', [])
        mean_str = " ".join(meanings)
        
        # If it's part of the original manually curated 70, it's mostly safe, but let's check it anyway.
        is_safe = False
        if ex:
            try:
                # Detect language of the example sentence
                det = translator.detect(ex)
                if det.lang == 'tr':
                    # The example is a Turkish sentence! The word is a Turkish word extracted by mistake.
                    print(f"[{i}/{total}] Removing {w} because example is Turkish: {ex[:30]}...")
                    removed_tr_context += 1
                    continue
            except Exception as e:
                pass
                
        # Check if the Turkish meaning is actually English!
        try:
            det_mean = translator.detect(mean_str)
            if det_mean.lang == 'en':
                # Re-translate enforcing English to Turkish
                res = translator.translate(w, src='en', dest='tr').text.lower()
                print(f"[{i}/{total}] Fixing translation for {w} (was {mean_str}, now {res})")
                item['turkishMeaning'] = [res]
                fixed_translation += 1
        except Exception:
            pass
            
        cleaned.append(item)
        
    # Reassign IDs sequentially
    for i, item in enumerate(cleaned):
        item['id'] = i + 1
        
    with open('data/vocabulary_clean.json', 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)
        
    print("-" * 40)
    print(f"Initial Count: {total}")
    print(f"Removed Turkish context words: {removed_tr_context}")
    print(f"Fixed English translations: {fixed_translation}")
    print(f"Final Count: {len(cleaned)}")
    print("Saved to data/vocabulary_clean.json")

if __name__ == "__main__":
    qc_vocab()
