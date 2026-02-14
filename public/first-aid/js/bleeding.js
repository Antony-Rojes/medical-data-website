let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const audio = document.getElementById("audioPlayer");
const progressFill = document.querySelector(".progress-fill");
const stepLabel = document.querySelector(".step-label");
const stepIndicator = document.querySelector(".step-indicator");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");

function init() {
  updateProgress();
  updateStepCounter();
  updateStepIndicator(1);
  updateButtons();
  showSlide(0);
}

function updateProgress() {
  if (progressFill) {
    const progress = ((currentSlide + 1) / slides.length) * 100;
    progressFill.style.width = progress + "%";
  }
}

function updateStepCounter() {
  if (stepLabel) {
    stepLabel.textContent = `Step ${currentSlide + 1} of ${slides.length}`;
  }
}

function updateStepIndicator(step) {
  if (!stepIndicator) return;

  document.querySelectorAll(".step-circle").forEach(circle => {
    circle.classList.remove("active");
  });
  document.querySelectorAll(".step-line").forEach(line => {
    line.classList.remove("active");
  });

  document.querySelectorAll(".step-circle")[step - 1].classList.add("active");

  for (let i = 0; i < step - 1; i++) {
    document.querySelectorAll(".step-line")[i].classList.add("active");
  }
}

function updateButtons() {
  if (prevBtn) {
    prevBtn.disabled = currentSlide === 0;
  }

  if (nextBtn) {
    if (currentSlide === slides.length - 1) {
      nextBtn.textContent = "Return to Dashboard";
      nextBtn.disabled = false;
    } else {
      nextBtn.textContent = "Next";
      nextBtn.disabled = false;
    }
  }
}

function playAudio() {
  const audioSrc = slides[currentSlide].getAttribute("data-audio");
  if (!audioSrc) return;

  audio.src = audioSrc;
  audio.volume = 0;
  audio.load();

  audio.play().then(() => {
    let volume = 0;
    const fadeIn = setInterval(() => {
      if (volume < 1) {
        volume += 0.1;
        audio.volume = Math.min(volume, 1);
      } else {
        clearInterval(fadeIn);
      }
    }, 50);
  }).catch(() => {
    document.body.addEventListener("click", () => {
      audio.play();
    }, { once: true });
  });
}

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove("active"));

  setTimeout(() => {
    slides[index].classList.add("active");
    playAudio();
    updateProgress();
    updateStepCounter();
    updateStepIndicator(index + 1);
    updateButtons();

    const card = document.querySelector(".card");
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 150);
}

function nextSlide() {
  if (currentSlide < slides.length - 1) {
    currentSlide++;
    showSlide(currentSlide);
  } else {
    window.location.href = "../index.html";
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    currentSlide--;
    showSlide(currentSlide);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    e.preventDefault();
    nextSlide();
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    e.preventDefault();
    prevSlide();
  }
});

window.addEventListener("DOMContentLoaded", init);

window.addEventListener("beforeunload", () => {
  if (audio && !audio.paused) {
    audio.pause();
  }
});
