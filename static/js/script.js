/**
 * HARSH PORTFOLIO - MAIN SCRIPT
 * Version: 1.0 (Final Optimized)
 */

// 1. PRELOADER & ENTRANCE ANIMATIONS
function hidePreloader() {
    const loader = document.getElementById('preloader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';

            // Entrance Animations using Anime.js
            if (typeof anime !== 'undefined') {
                anime({
                    targets: 'section',
                    translateY: [30, 0],
                    opacity: [0, 1],
                    delay: anime.stagger(200),
                    easing: 'easeOutExpo',
                    duration: 1000
                });
            }
        }, 700);
    }
}

// Window load event for preloader
window.addEventListener('load', hidePreloader);
// Safety timeout: If window load takes too long, hide loader after 3 seconds
setTimeout(hidePreloader, 3000);


// 2. DYNAMIC TYPEWRITER EFFECT
const typewriterTarget = document.querySelector(".typewriter-text");
if (typewriterTarget) {
    const words = ["Academician- Assistant Professor","Researcher","SOFTWARE DEVELOPER", "AI-ML & Cyber Security Enthusiast"];
    let wordIdx = 0, charIdx = 0, isDeleting = false;

    function typeEffect() {
        const currentWord = words[wordIdx];

        // Update text
        typewriterTarget.textContent = isDeleting
            ? currentWord.substring(0, charIdx--)
            : currentWord.substring(0, charIdx++);

        let typeSpeed = isDeleting ? 50 : 100;

        // Logic for switching words
        if (!isDeleting && charIdx === currentWord.length + 1) {
            isDeleting = true;
            typeSpeed = 1500; // Pause at the end of word
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            typeSpeed = 500; // Small delay before typing next word
        }

        setTimeout(typeEffect, typeSpeed);
    }
    // Start the effect
    typeEffect();
}


// 3. PARTICLES BACKGROUND
if (document.getElementById('particles-js') && typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
        particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } },
            color: { value: "#b74b4d" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#b74b4d", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 1.5, direction: "none", out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: false } }
        },
        retina_detect: true
    });
}


// 4. SECURITY (Disable Right-Click & Inspect Element)
document.addEventListener("contextmenu", (e) => e.preventDefault());

document.addEventListener("keydown", (e) => {
    // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
    if (e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u" || e.key === "S" || e.key === "s"))) {
        e.preventDefault();
        return false;
    }
});

// Disable Text Selection & Dragging
document.addEventListener("selectstart", (e) => e.preventDefault());
document.addEventListener("dragstart", (e) => e.preventDefault());


// 5. CONTACT FORM (AJAX)
const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const messageBox = document.getElementById("form-message");

        fetch(this.action, {
            method: this.method,
            body: formData,
            headers: { 'Accept': 'application/json' }
        }).then(response => {
            if (response.ok) {
                this.reset();
                if (messageBox) messageBox.textContent = "Thank you! Message sent.";
                alert("Thank you! Your message has been sent.");
            } else {
                if (messageBox) messageBox.textContent = "Oops! Error occurred.";
            }
        }).catch(() => {
            if (messageBox) messageBox.textContent = "Network error. Try again.";
        });
    });
}

const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorOutline = document.querySelector("[data-cursor-outline]");

window.addEventListener("mousemove", function (e) {
  const posX = e.clientX;
  const posY = e.clientY;

  cursorDot.style.left = `${posX}px`;
  cursorDot.style.top = `${posY}px`;

  // Outline thoda delay ke saath peeche chalega (smooth feel)
  cursorOutline.animate({
    left: `${posX}px`,
    top: `${posY}px`
  }, { duration: 500, fill: "forwards" });
});

// Hover Effect on Links/Buttons
document.querySelectorAll('a, button').forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursorOutline.classList.add('cursor-hover');
    });
    link.addEventListener('mouseleave', () => {
        cursorOutline.classList.remove('cursor-hover');
    });
});

document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const position = btn.getBoundingClientRect();
        const x = e.pageX - position.left - position.width / 2;
        const y = e.pageY - position.top - position.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
    });
    btn.addEventListener('mouseout', () => {
        btn.style.transform = `translate(0px, 0px)`;
    });
});