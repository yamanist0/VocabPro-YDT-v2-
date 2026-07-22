let vocabulary = [];

let audioCtx = null;
function playSound(isCorrect) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if(isCorrect) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }
}

async function loadData() {
    try {
        const response = await fetch('data/vocabulary.json');
        vocabulary = await response.json();
        document.getElementById('total-words').textContent = vocabulary.length;
        document.getElementById('c1-c2').textContent = vocabulary.filter(v => v.level === 'C1' || v.level === 'C2').length;
        if(document.getElementById('progress-total')) {
            document.getElementById('progress-total').textContent = vocabulary.length;
        }
        renderVocab(vocabulary);
        updateStats();
        console.log('%c[YDT v2] Tam sürüm verisi yüklendi.', 'color:#c8102e');
    } catch(e) {
        console.error("Vocabulary load failed", e);
    }
}

function loadLearned() {
    return JSON.parse(localStorage.getItem('ydt_learned_v2') || '[]');
}

function saveLearned(arr) {
    localStorage.setItem('ydt_learned_v2', JSON.stringify(arr));
    updateStats();
}

function updateStats() {
    const learned = loadLearned();
    document.getElementById('learned-words').textContent = learned.length;
    const percent = vocabulary.length > 0 ? Math.round((learned.length / vocabulary.length) * 100) : 0;
    document.getElementById('progress-percent').textContent = percent;
    document.getElementById('progress-learned').textContent = learned.length;
    document.getElementById('progress-bar').style.width = percent + '%';
    document.getElementById('quiz-avg').textContent = localStorage.getItem('ydt_quiz_avg_v2') || '—';
}

function renderVocab(filtered) {
    const grid = document.getElementById('vocab-grid');
    grid.innerHTML = '';
    const learned = loadLearned();
    filtered.forEach(item => {
        const isLearned = learned.includes(item.id);
        const card = document.createElement('div');
        card.className = `word-card bg-white border rounded-3xl p-5 cursor-pointer ${isLearned ? 'ring-1 ring-emerald-200' : ''}`;
        card.innerHTML = `
            <div class="flex justify-between mb-3">
                <div>
                    <span class="font-semibold text-xl">${item.word}</span>
                    <span class="ml-2 level-badge level-${item.level.toLowerCase()}">${item.level}</span>
                </div>
                ${isLearned ? '<i class="fa-solid fa-check-circle text-emerald-500"></i>' : ''}
            </div>
            <div class="text-emerald-700 text-sm font-medium mb-2">${item.turkishMeaning.join(', ')}</div>
            <div class="text-xs text-zinc-500 line-clamp-2">${item.definition}</div>
        `;
        card.onclick = () => showModal(item);
        grid.appendChild(card);
    });
}

function filterVocab() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const level = document.getElementById('level-filter').value;
    let filtered = vocabulary;
    if (search) filtered = filtered.filter(v => v.word.toLowerCase().includes(search) || v.turkishMeaning.join(' ').toLowerCase().includes(search));
    if (level) filtered = filtered.filter(v => v.level === level);
    renderVocab(filtered);
}

let currentModal = null;
function showModal(word) {
    currentModal = word;
    const modalHTML = `
        <div onclick="this.remove()" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-6">
            <div onclick="event.stopImmediatePropagation()" class="bg-white w-full max-w-lg rounded-3xl p-8">
                <div class="flex justify-between">
                    <div>
                        <div class="text-4xl font-semibold">${word.word}</div>
                        <span class="level-badge level-${word.level.toLowerCase()}">${word.level}</span>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-3xl">&times;</button>
                </div>
                <div class="mt-6">
                    <div class="text-xs text-zinc-500">TANIM</div>
                    <div class="mt-1">${word.definition}</div>
                </div>
                <div class="mt-5">
                    <div class="text-xs text-emerald-700">TÜRKÇE</div>
                    <div class="font-medium text-lg">${word.turkishMeaning.join(', ')}</div>
                </div>
                <div class="mt-5 bg-zinc-50 p-4 rounded-2xl">
                    <div class="text-xs text-zinc-500">ÖRNEK</div>
                    <div class="italic">"${word.example}"</div>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ==================== FLASHCARD ====================
let flashIndex = 0;
function showFlashcard(i) {
    if(vocabulary.length === 0) return;
    flashIndex = i;
    localStorage.setItem('ydt_flashcard_index', flashIndex);
    const w = vocabulary[i];
    document.getElementById('flashcard-word').textContent = w.word;
    document.getElementById('flashcard-pos').textContent = w.pos.join(', ');
    document.getElementById('flashcard-definition').textContent = w.definition;
    document.getElementById('flashcard-turkish').textContent = w.turkishMeaning.join(', ');
    document.getElementById('flashcard-example').innerHTML = `"${w.example}"`;
    document.getElementById('flashcard-counter').textContent = `${i+1} / ${vocabulary.length}`;
    document.getElementById('flashcard').classList.remove('flipped');
}
function flipFlashcard() { document.getElementById('flashcard').classList.toggle('flipped'); }
function nextFlashcard() { showFlashcard(flashIndex + 1 >= vocabulary.length ? 0 : flashIndex + 1); }
function prevFlashcard() { showFlashcard(flashIndex - 1 < 0 ? vocabulary.length - 1 : flashIndex - 1); }
function markAsKnown(knows) {
    if(vocabulary.length === 0) return;
    
    const card = document.getElementById('flashcard');
    
    if(knows) {
        playSound(true);
        card.classList.add('flash-green');
    } else {
        playSound(false);
        card.classList.add('flash-red', 'shake');
    }
    
    const learned = loadLearned();
    const id = vocabulary[flashIndex].id;
    if (knows && !learned.includes(id)) {
        learned.push(id);
        saveLearned(learned);
    }
    
    setTimeout(() => {
        card.classList.remove('flash-green', 'flash-red', 'shake');
        nextFlashcard();
    }, 500);
}

// ==================== DOĞRU / YANLIŞ ====================
let tfQuestions = [], tfIndex = 0, tfScore = 0, tfWrongs = [];

function startTrueFalse() {
    if(vocabulary.length < 12) {
        alert("En az 12 kelime gerekli.");
        return;
    }
    tfQuestions = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 12);
    tfIndex = 0; tfScore = 0; tfWrongs = [];
    document.getElementById('tf-start').classList.add('hidden');
    document.getElementById('tf-active').classList.remove('hidden');
    document.getElementById('tf-result').classList.add('hidden');
    showTFQuestion();
}

function showTFQuestion() {
    const q = tfQuestions[tfIndex];
    document.getElementById('tf-current').textContent = tfIndex + 1;
    document.getElementById('tf-total').textContent = tfQuestions.length;
    document.getElementById('tf-score').textContent = tfScore;
    document.getElementById('tf-word').textContent = q.word;

    const showCorrect = Math.random() > 0.5;
    let meaning = q.turkishMeaning.join(', ');
    if (!showCorrect) {
        const wrong = vocabulary.filter(v => v.id !== q.id)[Math.floor(Math.random() * (vocabulary.length - 1))].turkishMeaning.join(', ');
        meaning = wrong;
    }
    window.currentTF = { ...q, shown: meaning, correctMeaning: showCorrect };
    document.getElementById('tf-meaning').textContent = meaning;
}

function answerTF(userSaidTrue) {
    const data = window.currentTF;
    const isRight = (userSaidTrue && data.correctMeaning) || (!userSaidTrue && !data.correctMeaning);
    
    playSound(isRight);
    
    const container = document.getElementById('tf-active').querySelector('.bg-white');
    
    if (isRight) {
        tfScore++;
        container.classList.add('flash-green');
    } else {
        tfWrongs.push(data);
        container.classList.add('shake', 'flash-red');
    }

    // Beklet ve geç
    setTimeout(() => {
        container.classList.remove('flash-green', 'shake', 'flash-red');
        tfIndex++;
        if (tfIndex < tfQuestions.length) {
            showTFQuestion();
        } else {
            endTF();
        }
    }, 600);
}

function endTF() {
    document.getElementById('tf-active').classList.add('hidden');
    document.getElementById('tf-result').classList.remove('hidden');
    document.getElementById('tf-final-score').textContent = `${tfScore} / ${tfQuestions.length}`;
    document.getElementById('tf-review-text').textContent = tfWrongs.length > 0 
        ? `${tfWrongs.length} yanlışın var. İlerleme kaydedildi.` 
        : "Mükemmel! Hiç yanlış yapmadın.";

    const learned = loadLearned();
    tfWrongs.forEach(item => { if (!learned.includes(item.id)) learned.push(item.id); });
    saveLearned(learned);
}

function restartTF() {
    console.log("Restarting TF, hiding results");
    document.getElementById('tf-result').classList.add('hidden');
    document.getElementById('tf-start').classList.remove('hidden');
}

// ==================== QUIZ MERKEZİ GÜÇLENDİRİLMİŞ ====================
let activeQuizType = '';
let quizScore = 0;
let quizIndex = 0;
let quizQuestions = [];
// Eşleştirme için stateler
let matchWords = [];
let matchMeanings = [];
let matchedCount = 0;

function startQuiz(type) {
    if(vocabulary.length < 10) return alert("Bu test için en az 10 kelime gerekli!");
    activeQuizType = type;
    quizScore = 0;
    quizIndex = 0;
    matchedCount = 0;
    
    // Rastgele 10 soru seç
    quizQuestions = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 10);
    
    document.getElementById('quiz-menu').classList.add('hidden');
    document.getElementById('quiz-active').classList.remove('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    
    if(type === 'multiple' || type === 'fill') {
        document.getElementById('quiz-progress-text').style.display = 'block';
        showQuizQuestion();
    } else if(type === 'matching') {
        document.getElementById('quiz-progress-text').style.display = 'none';
        generateMatching();
    }
}

function quitQuiz() {
    document.getElementById('quiz-active').classList.add('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    document.getElementById('quiz-menu').classList.remove('hidden');
}

function showQuizQuestion() {
    const area = document.getElementById('quiz-content-area');
    document.getElementById('quiz-progress-text').textContent = `Soru ${quizIndex + 1} / 10`;
    
    const q = quizQuestions[quizIndex];
    
    // Rastgele yanlış şıklar seç
    const wrongOptions = vocabulary.filter(v => v.id !== q.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [q, ...wrongOptions].sort(() => 0.5 - Math.random());
    
    if(activeQuizType === 'multiple') {
        area.innerHTML = `
            <div class="text-sm text-zinc-500 mb-2">ÇOKTAN SEÇMELİ</div>
            <div class="text-4xl font-semibold mb-6">${q.word}</div>
            <div class="flex flex-col gap-y-3">
                ${options.map(opt => `
                    <button onclick="handleQuizAnswer(this, ${opt.id === q.id})" class="text-left w-full p-5 border rounded-2xl font-medium hover:bg-zinc-50 transition-colors">
                        ${opt.turkishMeaning.join(', ')}
                    </button>
                `).join('')}
            </div>
        `;
    } else if(activeQuizType === 'fill') {
        // Kelimeyi cümleden çıkar
        const regex = new RegExp(`\\b${q.word}\\b`, 'gi');
        let exampleText = q.example;
        if(exampleText.match(regex)) {
             exampleText = exampleText.replace(regex, '______');
        } else {
             // Eğer birebir eşleşmezse (örn -ed takısı) kelimeyle değiştir
             exampleText = `The word missing means: ${q.turkishMeaning[0]}...`;
        }

        area.innerHTML = `
            <div class="text-sm text-zinc-500 mb-2">BOŞLUK DOLDURMA</div>
            <div class="text-2xl font-medium italic mb-6 bg-zinc-50 p-6 rounded-2xl leading-relaxed">"${exampleText}"</div>
            <div class="grid grid-cols-2 gap-4">
                ${options.map(opt => `
                    <button onclick="handleQuizAnswer(this, ${opt.id === q.id})" class="w-full py-5 border rounded-2xl font-semibold text-lg hover:border-[#c8102e] hover:text-[#c8102e] transition-colors">
                        ${opt.word}
                    </button>
                `).join('')}
            </div>
        `;
    }
}

function generateMatching() {
    // 5 eşleşme seç
    const pool = quizQuestions.slice(0, 5);
    matchWords = [...pool].sort(() => 0.5 - Math.random());
    matchMeanings = [...pool].sort(() => 0.5 - Math.random());
    
    window.selectedMatchWord = null;
    window.selectedMatchMeaning = null;

    const area = document.getElementById('quiz-content-area');
    area.innerHTML = `
        <div class="text-sm text-zinc-500 mb-4 text-center">Doğru İngilizce ve Türkçe kelimeleri eşleştir</div >
        <div class="grid grid-cols-2 gap-x-8">
            <div class="flex flex-col gap-y-3" id="match-col-1">
                ${matchWords.map(w => `
                    <div id="word-${w.id}" onclick="selectMatch('word', ${w.id})" class="match-item p-4 border rounded-2xl text-center cursor-pointer font-semibold hover:bg-zinc-50">
                        ${w.word}
                    </div>
                `).join('')}
            </div>
            <div class="flex flex-col gap-y-3" id="match-col-2">
                ${matchMeanings.map(m => `
                    <div id="meaning-${m.id}" onclick="selectMatch('meaning', ${m.id})" class="match-item p-4 border rounded-2xl text-center cursor-pointer font-medium hover:bg-zinc-50">
                        ${m.turkishMeaning[0]}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function selectMatch(type, id) {
    if(type === 'word') {
        if(window.selectedMatchWord) document.getElementById(`word-${window.selectedMatchWord}`).classList.remove('ring-2', 'ring-[#c8102e]');
        window.selectedMatchWord = id;
        document.getElementById(`word-${id}`).classList.add('ring-2', 'ring-[#c8102e]');
    } else {
        if(window.selectedMatchMeaning) document.getElementById(`meaning-${window.selectedMatchMeaning}`).classList.remove('ring-2', 'ring-[#c8102e]');
        window.selectedMatchMeaning = id;
        document.getElementById(`meaning-${id}`).classList.add('ring-2', 'ring-[#c8102e]');
    }
    
    if(window.selectedMatchWord && window.selectedMatchMeaning) {
        setTimeout(evaluateMatch, 200);
    }
}

function evaluateMatch() {
    const wId = window.selectedMatchWord;
    const mId = window.selectedMatchMeaning;
    const elW = document.getElementById(`word-${wId}`);
    const elM = document.getElementById(`meaning-${mId}`);
    
    if(wId === mId) {
        playSound(true);
        elW.className = 'p-4 border rounded-2xl text-center font-semibold bg-emerald-100 text-emerald-800 opacity-50 select-none flash-green';
        elM.className = 'p-4 border rounded-2xl text-center font-medium bg-emerald-100 text-emerald-800 opacity-50 select-none flash-green';
        elW.onclick = null;
        elM.onclick = null;
        matchedCount++;
        quizScore += 2; // Eşleşme başı 2 puan = 10 puan toplam
        
        if(matchedCount >= 5) {
            setTimeout(endQuiz, 1000);
        }
    } else {
        playSound(false);
        elW.classList.remove('ring-2', 'ring-[#c8102e]');
        elM.classList.remove('ring-2', 'ring-[#c8102e]');
        elW.classList.add('bg-rose-100', 'shake', 'flash-red');
        elM.classList.add('bg-rose-100', 'shake', 'flash-red');
        setTimeout(() => {
            elW.classList.remove('bg-rose-100', 'shake', 'flash-red');
            elM.classList.remove('bg-rose-100', 'shake', 'flash-red');
        }, 500);
    }
    window.selectedMatchWord = null;
    window.selectedMatchMeaning = null;
}

function handleQuizAnswer(btn, isCorrect) {
    // Disable all buttons instantly
    const buttons = btn.parentElement.querySelectorAll('button');
    buttons.forEach(b => b.onclick = null);
    
    playSound(isCorrect);
    
    if(isCorrect) {
        btn.classList.add('bg-emerald-600', 'text-white', 'border-emerald-600', 'flash-green');
        quizScore++;
    } else {
        btn.classList.add('bg-rose-600', 'text-white', 'border-rose-600', 'shake', 'flash-red');
        // Doğru cevabı bul ve vurgula
        buttons.forEach(b => {
             if(b.getAttribute('onclick').includes(', true)')) {
                 b.classList.add('ring-4', 'ring-emerald-400', 'bg-emerald-50');
             }
        });
    }
    
    setTimeout(() => {
        quizIndex++;
        if(quizIndex < 10) showQuizQuestion();
        else endQuiz();
    }, 1200);
}

function endQuiz() {
    document.getElementById('quiz-active').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');
    
    const maxScore = 10;
    document.getElementById('quiz-final-score').textContent = `${Math.round((quizScore / maxScore) * 100)}%`;
    
    // Save to average
    let avg = localStorage.getItem('ydt_quiz_avg_v2');
    if(!avg) avg = Math.round((quizScore / maxScore) * 100);
    else avg = Math.round((parseInt(avg) + Math.round((quizScore / maxScore) * 100)) / 2);
    
    localStorage.setItem('ydt_quiz_avg_v2', avg);
    updateStats();
}

// ==================== İLERLEME ====================
function resetProgress() {
    if (confirm("Tüm ilerlemeyi silmek istiyor musun?")) {
        localStorage.removeItem('ydt_learned_v2');
        localStorage.removeItem('ydt_quiz_avg_v2');
        updateStats();
    }
}

// ==================== NAV ====================
function showSection(sec) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('section-' + sec).classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('nav-active'));
    document.getElementById('tab-' + sec).classList.add('nav-active');

    if (sec === 'flashcards') {
        let savedIndex = parseInt(localStorage.getItem('ydt_flashcard_index') || '0');
        if(savedIndex >= vocabulary.length || isNaN(savedIndex)) savedIndex = 0;
        showFlashcard(savedIndex);
    }
    if (sec === 'progress') updateStats();
}

window.onload = loadData;
