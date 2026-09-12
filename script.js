const audio = document.getElementById("bgAudio");
const mysteryAudio = document.getElementById("mysteryAudio");

const AUDIO_POSITION_KEY = "fnafThankYouPosition";
let mysteryAudioStarted = false;

function safePlay() {
  if (!audio) return;
  audio.volume = 0.35;
  audio.play().catch(() => {});
}

// Guarda a posição da música para que ela continue do mesmo ponto
// quando o jogador passar da tela do convite para a ficha.
function saveAudioPosition() {
  if (audio && !audio.paused && Number.isFinite(audio.currentTime)) {
    sessionStorage.setItem(AUDIO_POSITION_KEY, String(audio.currentTime));
  }
}

function restoreAudioPosition() {
  if (!audio) return;
  const saved = parseFloat(sessionStorage.getItem(AUDIO_POSITION_KEY));
  if (Number.isFinite(saved) && saved >= 0) {
    const restore = () => {
      try {
        if (saved < audio.duration) audio.currentTime = saved;
      } catch (_) {}
    };
    if (audio.readyState >= 1) restore();
    else audio.addEventListener("loadedmetadata", restore, { once: true });
  }
}

restoreAudioPosition();
safePlay();

// Se o navegador bloquear autoplay na nova página, o primeiro toque/clique
// continua a música exatamente do ponto salvo.
document.addEventListener("pointerdown", safePlay, { once: true });
document.addEventListener("keydown", safePlay, { once: true });

// Salva continuamente a posição enquanto a música toca.
if (audio) {
  audio.addEventListener("timeupdate", saveAudioPosition);
  window.addEventListener("pagehide", saveAudioPosition);
  window.addEventListener("beforeunload", saveAudioPosition);
}

const noBtn = document.getElementById("noBtn");

if (noBtn) {
  const turnIntoYes = () => {
    noBtn.textContent = "SIM, EU ACEITO";
    noBtn.classList.add("gold-btn");
    noBtn.classList.remove("text-btn");
  };

  noBtn.addEventListener("mouseenter", turnIntoYes);
  noBtn.addEventListener("focus", turnIntoYes);
}

const audioToggle = document.getElementById("audioToggle");

if (audioToggle) {
  const updateAudioButton = () => {
    audioToggle.textContent = audio && !audio.paused ? "❚❚ ÁUDIO" : "♪ ÁUDIO";
  };
  updateAudioButton();
  if (audio) audio.addEventListener("play", updateAudioButton);
  if (audio) audio.addEventListener("pause", updateAudioButton);

  audioToggle.addEventListener("click", async () => {
    if (audio.paused) {
      await audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    updateAudioButton();
  });
}

const moreBtn = document.getElementById("moreBtn");
const overlay = document.getElementById("letterOverlay");
const envelope = document.getElementById("envelope");
const paper = document.getElementById("paper");
const closeLetter = document.getElementById("closeLetter");
const closePaper = document.getElementById("closePaper");

function openOverlay() {
  if (!overlay) return;
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");
}

function closeOverlay() {
  if (!overlay) return;
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden", "true");
  if (envelope) {
    envelope.classList.remove("open");
    envelope.style.opacity = "";
    envelope.style.pointerEvents = "";
  }
  if (paper) {
    paper.classList.remove("show");
    paper.setAttribute("aria-hidden", "true");
  }
}

function switchToMysteryAudio() {
  // A música de mistério só deve começar uma vez por visita à página.
  // Fechar e abrir a carta novamente não reinicia a música.
  if (mysteryAudioStarted) {
    if (mysteryAudio && mysteryAudio.paused) {
      mysteryAudio.play().catch(() => {});
    }
    return;
  }

  if (audio) {
    audio.pause();
    saveAudioPosition();
  }

  if (!mysteryAudio) return;

  mysteryAudio.volume = 0.35;
  mysteryAudio.currentTime = 0;
  mysteryAudioStarted = true;
  mysteryAudio.play().catch(() => {});
}

if (moreBtn) {
  moreBtn.addEventListener("click", () => {
    switchToMysteryAudio();
    openOverlay();
  });
}

if (closeLetter) closeLetter.addEventListener("click", closeOverlay);
if (closePaper) closePaper.addEventListener("click", closeOverlay);

function revealPaper() {
  if (!envelope || !paper) return;
  envelope.classList.add("open");
  setTimeout(() => {
    envelope.style.opacity = "0";
    envelope.style.pointerEvents = "none";
    paper.classList.add("show");
    paper.setAttribute("aria-hidden", "false");
  }, 650);
}

if (envelope) {
  envelope.addEventListener("click", revealPaper);
  envelope.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      revealPaper();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeOverlay();
});
