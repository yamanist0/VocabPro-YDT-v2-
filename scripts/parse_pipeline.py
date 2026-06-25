import pypdf
import re
import json
import os
import collections
import time

import sys
import email.message
import types
cgi_mod = types.ModuleType("cgi")
def parse_header(line):
    m = email.message.Message()
    m['content-type'] = line
    p = m.get_params()
    return m.get_content_type(), dict(p) if p else {}
cgi_mod.parse_header = parse_header
sys.modules['cgi'] = cgi_mod

from googletrans import Translator

def process_pdf(pdf_path="ydt.pdf"):
    print(f"Opening {pdf_path}...")
    reader = pypdf.PdfReader(pdf_path)
    total_pages = len(reader.pages)
    
    word_freq = collections.Counter()
    word_pages = collections.defaultdict(set)
    word_example = {}
    
    print(f"Total Pages Detected: {total_pages}")
    print("Reading and parsing all pages...")
    
    for i in range(total_pages):
        try:
            text = reader.pages[i].extract_text()
            if not text: continue
            
            # Use simple sentences split
            sentences = re.split(r'(?<=[.!?]) +', text.replace('\\n', ' '))
            for sent in sentences:
                sent_clean = sent.strip()
                words = re.findall(r'\b[a-zA-Z]{5,}\b', sent_clean.lower())
                
                for w in words:
                    word_freq[w] += 1
                    word_pages[w].add(i + 1)
                    if w not in word_example and 20 < len(sent_clean) < 150:
                        word_example[w] = sent_clean
        except Exception:
            pass

    print("Analyzing frequency and extracting high-value vocabulary target space...")
    
    banned = {'would','could','about','their','there','other','which','these','those','where','because','should','after','before','under','between','through','during','while','allow','however','whether','therefore','although','another'}
    
    sorted_words = [w for w in word_freq.most_common(2000) if w[0] not in banned]
    selected = sorted_words[10:510] 
    
    vocabulary = []
    translator = Translator()
    
    print(f"Translating {len(selected)} words and constructing B1+ JSON objects...")
    
    for w, freq in selected:
        try:
            translation = translator.translate(w, src='en', dest='tr').text.lower()
        except Exception:
            translation = w
            
        if freq > 150: level = "B1"
        elif freq > 75: level = "B2"
        elif freq > 30: level = "C1"
        else: level = "C2"
        
        pos_str = "noun"
        if w.endswith('ed') or w.endswith('ing'): pos_str = "verb"
        elif w.endswith('ly'): pos_str = "adverb"
        elif w.endswith('ive') or w.endswith('ous') or w.endswith('al') or w.endswith('ic'): pos_str = "adjective"
        
        entry = {
            "word": w,
            "level": level,
            "partOfSpeech": [pos_str],
            "turkishMeaning": [translation],
            "example": word_example.get(w, f"The {w} played a key role."),
            "frequency": freq,
            "pages": sorted(list(word_pages[w]))[:15] # Top 15 pages to keep JSON clean
        }
        vocabulary.append(entry)
        
    output_path = "data/vocabulary.json"
    merged_count = 0
    if os.path.exists(output_path):
        with open(output_path, "r", encoding="utf-8") as f:
            base_vocab = json.load(f)
            
        existing_words = {x['word'].lower() for x in base_vocab}
        for item in vocabulary:
            if item['word'] not in existing_words:
                item['id'] = len(base_vocab) + 1
                base_vocab.append(item)
                merged_count += 1
                
        vocabulary = base_vocab
    else:
        for i, item in enumerate(vocabulary):
            item['id'] = i + 1
            
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(vocabulary, f, ensure_ascii=False, indent=2)
        
    print("FINAL PIPELINE REPORT:\\n" + "-"*30)
    print(f"Total Pages Processed: {total_pages}")
    print(f"New Extracted Entries: {merged_count}")
    print(f"Total DB Size: {len(vocabulary)}")

if __name__ == "__main__":
    process_pdf()
