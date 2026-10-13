
const revealItems = document.querySelectorAll(".reveal");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// ========================================
// 1. REVEAL ANIMATIONS
// ========================================

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

// ========================================
// 2. LAST NOTE AND BACKGROUND MUSIC
// ========================================

const surpriseButton = document.getElementById("surpriseButton");
const hiddenNote = document.getElementById("hiddenNote");
const audio = document.getElementById("ourSong");

if (surpriseButton && hiddenNote) {
  surpriseButton.addEventListener("click", async () => {
    const opening = hiddenNote.hidden;

    hiddenNote.hidden = !opening;

    surpriseButton.setAttribute("aria-expanded", String(opening));

    surpriseButton.innerHTML = opening
      ? 'Keep this note close <span aria-hidden="true">♡</span>'
      : 'Open one last note <span aria-hidden="true">♡</span>';

    if (opening) {
      if (audio && audio.paused) {
        try {
          await audio.play();
        } catch (error) {
          console.error("Unable to play the song:", error);
        }
      }

      window.setTimeout(() => {
        hiddenNote.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "center"
        });
      }, 80);
    }
  });
}

// ========================================
// 3. GENTLE TILT ON DESKTOP
// ========================================

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

// ========================================
// 4. OUR COVENANT OF LOVE
// ========================================

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

  const covenant = document.getElementById("ourCovenant");
  const signatureImage = document.getElementById(
    "savedSushmitaSignature"
  );
  const dateElement = document.getElementById("covenantDate");

  // Your deployed Google Apps Script endpoint.
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbydfKfJhq6y5jrZI3lZLJtRlrdF3bIzu1SWb0p21h6ja1-wvwKrvp969vaevrUORFyD/exec";

  if (!overlay || !canvas || !question || !signStep) {
    console.warn("Covenant elements could not be found.");
    return;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error("Signature canvas is not supported.");
    return;
  }

  let drawing = false;
  let hasInk = false;
  let submitting = false;

  // Signature appearance.
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#68464b";

  // ========================================
  // POPUP OPEN/CLOSE
  // ========================================

  window.setTimeout(() => {
    overlay.hidden = false;
  }, 700);

  function closePopup() {
    overlay.hidden = true;
  }

  closeButton?.addEventListener("click", closePopup);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closePopup();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) {
      closePopup();
    }
  });

  // ========================================
  // YES: OPEN SIGNATURE PAD
  // ========================================

  yesButton?.addEventListener("click", () => {
    question.hidden = true;
    signStep.hidden = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    hasInk = false;

    if (noButton) {
      noButton.style.position = "";
      noButton.style.left = "";
      noButton.style.top = "";
    }

    // Reset the previous status when starting a new signature.
    const oldStatus = document.getElementById(
      "signatureSubmissionStatus"
    );

    if (oldStatus) {
      oldStatus.remove();
    }
  });

  // ========================================
  // NOT YET BUTTON
  // ========================================

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

  // ========================================
  // SIGNATURE DRAWING
  // ========================================

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height
    };
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (submitting) return;

    event.preventDefault();

    drawing = true;
    hasInk = true;

    canvas.setPointerCapture(event.pointerId);

    const point = pointFromEvent(event);

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);

    // Draw a dot for a tap without movement.
    ctx.lineTo(point.x + 0.1, point.y);
    ctx.stroke();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drawing || submitting) return;

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

  // ========================================
  // CLEAR SIGNATURE
  // ========================================

  clearButton?.addEventListener("click", () => {
    if (submitting) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    hasInk = false;
    drawing = false;
  });

  // ========================================
  // STATUS MESSAGE
  // ========================================

  function showStatus(message, isError = false) {
    let status = document.getElementById(
      "signatureSubmissionStatus"
    );

    if (!status) {
      status = document.createElement("p");

      status.id = "signatureSubmissionStatus";
      status.className = "covenant-footnote";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");

      sealButton?.parentElement?.insertAdjacentElement(
        "afterend",
        status
      );
    }

    status.textContent = message;

    status.style.color = isError ? "#a33b3b" : "";
  }

  // ========================================
  // SEAL OUR PROMISE: EMAIL SIGNATURE
  // ========================================

  sealButton?.addEventListener("click", async () => {
    if (submitting) return;

    if (!hasInk) {
      alert("Please add your signature first, my love. ♡");
      return;
    }

    const imageData = canvas.toDataURL("image/png");

    // Keep the request reasonably small.
    if (imageData.length > 700000) {
      showStatus(
        "Your signature image is too large. Please clear it and sign again.",
        true
      );
      return;
    }

    submitting = true;

    const originalText = sealButton.textContent;

    sealButton.disabled = true;

    if (clearButton) clearButton.disabled = true;
    if (yesButton) yesButton.disabled = true;

    sealButton.textContent = "Sending your promise ♡";

    showStatus("Sending your signature... please wait ♡");

    try {
      /*
       * Google Apps Script may redirect the request.
       * no-cors allows a simple POST, but the browser cannot
       * read the response or confirm that Gmail sent the email.
       */
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

      /*
       * IMPORTANT:
       * A resolved no-cors fetch does NOT prove that the
       * script processed the request or delivered an email.
       */
      showStatus(
        "The submission request was sent. Please check your Gmail to confirm that the signature arrived. ♡"
      );

      // Display the signature in the current browser session.
      if (signatureImage) {
        signatureImage.src = imageData;
        signatureImage.style.display = "block";

        const fallback = signatureImage.nextElementSibling;

        if (fallback) {
          fallback.hidden = true;
        }
      }

      // Update the date on this page.
      if (dateElement) {
        dateElement.textContent =
          "Our promise, made on " +
          new Intl.DateTimeFormat("en", {
            day: "numeric",
            month: "long",
            year: "numeric"
          }).format(new Date());
      }

      closePopup();

      if (covenant) {
        covenant.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start"
        });
      }
    } catch (error) {
      console.error("Signature submission failed:", error);

      showStatus(
        "We couldn't send the request. Please check your internet connection and try again. ♡",
        true
      );
    } finally {
      submitting = false;

      sealButton.disabled = false;
      sealButton.textContent = originalText;

      if (clearButton) clearButton.disabled = false;
      if (yesButton) yesButton.disabled = false;
    }
  });

  // ========================================
  // INITIAL COVENANT DATE
  // ========================================

  if (dateElement) {
    dateElement.textContent = "A little promise, made with love ♡";
  }
})();
