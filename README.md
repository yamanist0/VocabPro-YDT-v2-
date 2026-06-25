<div align="center">
  <img src="icon.ico" width="80" alt="VocabPro YDT Icon" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unsorted_dictionary.svg/1200px-Unsorted_dictionary.svg.png'; this.width=80;" />
  <h1>VocabPro YDT <small>v2</small></h1>
  <p><strong>An interactive, gamified vocabulary learning platform for language exams.</strong></p>
  
  <br>
  
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/HTML5-E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Web_Audio_API-8A2BE2.svg?style=for-the-badge&logo=w3c&logoColor=white" alt="Web Audio" />
</div>

---

### 📖 Overview
**VocabPro YDT** is a vanilla JavaScript-based web application designed to help students master English vocabulary (specifically targeting exams like the Turkish YDT). It features a rich, interactive UI with flashcards, multiple gamified quiz modes, auditory feedback, and persistent local progress tracking.

---

### ✨ Key Features

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3>🃏 Interactive Flashcards</h3>
      Flippable cards displaying definitions, Turkish meanings, examples, and part-of-speech. Includes a "Know / Don't Know" marking system to track learning progress.
    </td>
    <td width="50%" valign="top">
      <h3>🎮 Advanced Quiz Engine</h3>
      Test your knowledge through multiple dynamic modes: <strong>True/False</strong>, <strong>Multiple Choice</strong>, <strong>Fill-in-the-blanks</strong>, and a custom <strong>Matching Game</strong>.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🔊 Procedural Audio Feedback</h3>
      Utilizes the native <code>AudioContext</code> API to generate pure oscillator waveforms (sine for correct, sawtooth for incorrect) for instant, gamified auditory feedback without external audio files.
    </td>
    <td width="50%" valign="top">
      <h3>📈 Progress Tracking</h3>
      Uses <code>localStorage</code> to persistently save learned words, calculate completion percentages, and track average quiz scores across sessions.
    </td>
  </tr>
</table>

---

### 📂 Project Structure

Based on the repository layout, the project is organized as follows:

```text
YDT/
├── assets/             # Images, fonts, and static assets
├── css/
│   └── main.css        # Main stylesheet (Tailwind utilities & custom animations)
├── data/
│   └── vocabulary.json # Core dataset containing word definitions and levels
├── docs/               # Project documentation
├── js/
│   └── app.js          # Core application logic, quiz engine, and audio generation
├── scripts/            # Helper scripts for deployment or building
├── icon.ico            # Application favicon
├── index.html          # Main application entry point
├── setup.sh            # Environment setup script
├── start.bat           # Windows startup script
└── start.sh            # Unix/Linux startup script
