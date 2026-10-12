const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -25px 0px" });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

const surpriseButton = document.getElementById("surpriseButton");
const hiddenNote = document.getElementById("hiddenNote");
surpriseButton.addEventListener("click", () => {
  const opening = hiddenNote.hidden;
  hiddenNote.hidden = !opening;
  surpriseButton.setAttribute("aria-expanded", String(opening));
  surpriseButton.innerHTML = opening
    ? 'Keep this note close <span aria-hidden="true">♡</span>'
    : 'Open one last note <span aria-hidden="true">♡</span>';
  if (opening) {
    window.setTimeout(() => hiddenNote.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" }), 80);
  }
});

const audio = document.getElementById("ourSong");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");
musicToggle.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
      musicToggle.setAttribute("aria-pressed", "true");
      musicLabel.textContent = "Pause our song";
    } catch (error) {
      musicLabel.textContent = "Add our-song.mp3";
      alert("Add your chosen song as music/our-song.mp3, then reload the page. Use an audio file you have permission to share.");
    }
  } else {
    audio.pause();
    musicToggle.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Our song";
  }
});

// Gentle tilt on desktop only; disabled for touch and reduced-motion users.
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion) {
  document.querySelectorAll(".memory-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const base = card.classList.contains("tilt-right") ? 1.2 : -1.2;
      card.style.transform = `rotate(${base + x * 1.6}deg) translateY(${-y * 3}px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = card.classList.contains("tilt-right") ? "rotate(1.7deg) translateY(24px)" : "rotate(-2deg)";
    });
  });
}
