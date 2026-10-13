
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

/* OUR COVENANT OF LOVE INTERACTION */

(() => {
  const overlay = document.getElementById("covenantOverlay");
  const closeButton = document.getElementById("covenantClose");
  const question = document.getElementById("covenantQuestion");
  const signStep = document.getElementById("covenantSignStep");
  const yesButton = document.getElementById("covenantYes");
  const noButton = document.getElementById("covenantNo");
  const canvas = document.getElementById("sushmitaSignCanvas");
  const clearButton = document.getElementById("covenantClear");
  const sealButton = document.getElementById("covenantSeal");

  if (!overlay || !canvas || !question || !signStep) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let drawing = false;
  let hasInk = false;

  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#68464b";

  // Show the pop-up on each page visit.
  window.setTimeout(() => {
    overlay.hidden = false;
  }, 700);

  function closePopup() {
    overlay.hidden = true;
  }

  closeButton?.addEventListener("click", closePopup);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closePopup();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) closePopup();
  });

  yesButton?.addEventListener("click", () => {
    question.hidden = true;
    signStep.hidden = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk = false;
    noButton.style.position = "";
  });

  // Playful "Not yet" button that moves within its button area.
  noButton?.addEventListener("click", () => {
    const area = noButton.parentElement;
    if (!area) return;

    const areaRect = area.getBoundingClientRect();
    const buttonWidth = noButton.offsetWidth;
    const buttonHeight = noButton.offsetHeight;

    area.style.minHeight = "125px";
    noButton.style.position = "absolute";
    noButton.style.zIndex = "2";

    const maxX = Math.max(0, areaRect.width - buttonWidth - 12);
    const maxY = Math.max(0, areaRect.height - buttonHeight - 12);

    noButton.style.left = `${6 + Math.random() * maxX}px`;
    noButton.style.top = `${6 + Math.random() * maxY}px`;
  });

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height
    };
  }

  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    drawing = true;
    hasInk = true;
    canvas.setPointerCapture(event.pointerId);

    const point = pointFromEvent(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;

    event.preventDefault();
    const point = pointFromEvent(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  });

  function stopDrawing() {
    drawing = false;
    ctx.beginPath();
  }

  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);
  canvas.addEventListener("lostpointercapture", stopDrawing);

  clearButton?.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk = false;
  });

 
sealButton?.addEventListener("click", async () => {
  if (!hasInk) {
    alert("Please add your signature first, my love. ♡");
    return;
  }

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbydfKfJhq6y5jrZI3lZLJtRlrdF3bIzu1SWb0p21h6ja1-wvwKrvp969vaevrUORFyD/exec";

  const originalText = sealButton.textContent;
  sealButton.disabled = true;
  sealButton.textContent = "Sending your promise ♡";

  try {
    const imageData = canvas.toDataURL("image/png");

    // Submit as text/plain to avoid a JSON CORS preflight.
    // no-cors means the browser cannot read Google's response.
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8"
      },
      body: JSON.stringify({
        signature: imageData
      })
    });

    // The request was dispatched, but email delivery is
    // NOT confirmed because no-cors hides the server response.
    const status = document.createElement("p");
    status.className = "covenant-footnote";
    status.setAttribute("role", "status");
    status.textContent =
      "Your signature was submitted to Google. Please check the recipient's Gmail before closing this page. ♡";

    let previousStatus = document.getElementById(
      "signatureSubmissionStatus"
    );

    if (!previousStatus) {
      previousStatus = status;
      previousStatus.id = "signatureSubmissionStatus";
      sealButton.parentElement.insertAdjacentElement(
        "afterend",
        previousStatus
      );
    } else {
      previousStatus.textContent = status.textContent;
    }

    // Keep the signature visible on this page.
    const covenant = document.getElementById("ourCovenant");
    const signatureImage = document.getElementById(
      "savedSushmitaSignature"
    );
    const date = document.getElementById("covenantDate");

    if (signatureImage) {
      signatureImage.src = imageData;
      signatureImage.style.display = "block";

      if (signatureImage.nextElementSibling) {
        signatureImage.nextElementSibling.hidden = true;
      }
    }

    if (date) {
      date.textContent = "Our promise, made on " +
        new Intl.DateTimeFormat("en", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(new Date());
    }

    overlay.hidden = true;

    if (covenant) {
      covenant.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
    }
  } catch (error) {
    console.error("Signature submission failed:", error);
    alert(
      "We couldn't submit the signature. Please check your connection and try again. ♡"
    );
  } finally {
    sealButton.disabled = false;
    sealButton.textContent = originalText;
  }
});


    // Download a transparent PNG for manual GitHub upload.
    const imageData = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = imageData;
    downloadLink.download = "sushmita-signature.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    // Show the covenant section on this page immediately.
    const covenant = document.getElementById("ourCovenant");
    const signatureImage = document.getElementById("savedSushmitaSignature");
    const date = document.getElementById("covenantDate");

    if (signatureImage) {
      signatureImage.src = imageData;
      signatureImage.style.display = "block";
      signatureImage.nextElementSibling.hidden = true;
    }

    if (date) {
      date.textContent = "Our promise, made on " +
        new Intl.DateTimeFormat("en", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(new Date());
    }

    closePopup();

    if (covenant) {
      covenant.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });

  // Set a date even before she signs.
  const date = document.getElementById("covenantDate");
  if (date) {
    date.textContent = "A little promise, made with love ♡";
  }
})();
