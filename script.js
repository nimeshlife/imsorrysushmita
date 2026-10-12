
const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// Reveal animations
if ("IntersectionObserver" in window && !reducedMotion) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -25px 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

// Last note and background music
const surpriseButton = document.getElementById("surpriseButton");
const hiddenNote = document.getElementById("hiddenNote");
const audio = document.getElementById("ourSong");

if (surpriseButton && hiddenNote) {
  surpriseButton.addEventListener("click", async () => {
    const opening = hiddenNote.hidden;

    // Preserve the original note toggle behavior
    hiddenNote.hidden = !opening;

    surpriseButton.setAttribute("aria-expanded", String(opening));

    surpriseButton.innerHTML = opening
      ? 'Keep this note close <span aria-hidden="true">♡</span>'
      : 'Open one last note <span aria-hidden="true">♡</span>';

    if (opening) {
      // Play the song only when opening the note.
      // Do not restart it if it is already playing.
      if (audio && audio.paused) {
        try {
          await audio.play();
        } catch (error) {
          console.error("Unable to play the song:", error);
        }
      }

      // Preserve the original smooth scrolling behavior
      window.setTimeout(() => {
        hiddenNote.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "center"
        });
      }, 80);
    }
  });
}

// Gentle tilt on desktop only;
// disabled for touch and reduced-motion users.
if (
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !reducedMotion
) {
  document.querySelectorAll(".memory-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const base = card.classList.contains("tilt-right") ? 1.2 : -1.2;

      card.style.transform =
        `rotate(${base + x * 1.6}deg) translateY(${-y * 3}px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = card.classList.contains("tilt-right")
        ? "rotate(1.7deg) translateY(24px)"
        : "rotate(-2deg)";
    });
  });
}
