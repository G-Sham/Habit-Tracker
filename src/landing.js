import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "firebase/auth";
import {
    doc,
    setDoc
} from "firebase/firestore";
import { auth, db } from "./services/firebase";

/* =========================================
   HACKER TEXT EFFECT
   ========================================= */
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const headers = document.querySelectorAll("h1");

headers.forEach(h1 => {
    let interval = null;

    h1.onmouseover = event => {
        let iterations = 0;
        const target = event.currentTarget;
        const finalValue = target.dataset.value || target.innerText;

        clearInterval(interval);

        interval = setInterval(() => {
            target.innerHTML = finalValue
                .split("")
                .map((letter, index) => {
                    const char = index < iterations
                        ? finalValue[index]
                        : letters[Math.floor(Math.random() * 26)];

                    // Highlight "YOUR" in cyan if present
                    if (index >= 9 && index <= 12 && finalValue.includes("YOUR")) {
                        return `<span id="your">${char}</span>`;
                    }

                    return char;
                })
                .join("");

            if (iterations >= finalValue.length) {
                clearInterval(interval);
            }

            iterations += 1 / 3;
        }, 35);
    };
});

/* =========================================
   SCROLL LOGIC & TRACKER PILE
   ========================================= */
let isFullyStacked = false;

// Responsive configuration for card stacking
function getResponsiveConfig() {
    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth <= 992 && window.innerWidth > 480;

    if (isMobile) {
        const centerX = window.innerWidth / 2;
        return {
            startWidth: 150,
            targetWidth: 280,
            slots: [
                { x: centerX - 140, y: 120, z: 3 }, // Front (centered)
                { x: centerX - 135, y: 130, z: 2 }, // Middle (slight offset)
                { x: centerX - 130, y: 140, z: 1 }  // Back
            ]
        };
    } else if (isTablet) {
        return {
            startWidth: 400,
            targetWidth: 600,
            slots: [
                { x: 100, y: 150, z: 3 },
                { x: 115, y: 162, z: 2 },
                { x: 130, y: 174, z: 1 }
            ]
        };
    } else {
        // Desktop
        return {
            startWidth: 600,
            targetWidth: 850,
            slots: [
                { x: 300, y: 230, z: 3 },
                { x: 315, y: 242, z: 2 },
                { x: 330, y: 254, z: 1 }
            ]
        };
    }
}

window.addEventListener('scroll', () => {
    const config = getResponsiveConfig();
    const cards = document.querySelectorAll('.tracker-img');
    const scrollY = window.scrollY;
    const title = document.querySelector('.Heading');
    const description = document.querySelector('.Description');
    const photos = document.querySelectorAll('.tracker-img');
    let progress = Math.min(scrollY / 600, 1);

    isFullyStacked = (progress === 1);

    cards.forEach((card, index) => {
        if (card.classList.contains('shuffling')) return;

        const startX = parseFloat(getComputedStyle(card).getPropertyValue('--start-x'));
        const startY = parseFloat(getComputedStyle(card).getPropertyValue('--start-y'));
        const startRot = parseFloat(getComputedStyle(card).getPropertyValue('--start-rot'));

        const targetX = config.slots[index].x;
        const targetY = config.slots[index].y;
        const targetRot = 0;

        const currentX = startX + (targetX - startX) * progress;
        const currentY = startY + (targetY - startY) * progress;
        const currentRot = startRot * (1 - progress);
        const currentWidth = config.startWidth + (config.targetWidth - config.startWidth) * progress;

        card.style.left = `${currentX}px`;
        card.style.top = `${currentY}px`;
        card.style.width = `${currentWidth}px`;
        card.style.setProperty('--current-rot', `${currentRot}deg`);

        if (!isFullyStacked) {
            card.style.zIndex = config.slots[index].z;
        }
    });

    if (isFullyStacked) {
        photos.forEach(img => img.classList.add('interactable'));
        title.classList.add('appear-visible');
        description.classList.add('appear-visible');
    } else {
        photos.forEach(img => img.classList.remove('interactable'));
        title.classList.remove('appear-visible');
        description.classList.remove('appear-visible');
    }
});

/* =========================================
   SHUFFLING LOGIC
   ========================================= */
const pile = document.querySelector('.tracker-pile');

const cardHeadingsMap = {
    "Home.png": "Home page",
    "Profile.png": "Profile page",
    "Analysis.png": "Analysis page"
};

const descriptionsMap = {
    "Home.png": "The Home page serves as the primary dashboard for real-time tracking. It features a tabular \"Habit Tracker\" interface where users can monitor specific tasks (such as \"first,\" \"second,\" and \"third\") across a weekly calendar view.",
    "Profile.png": "The Profile page offers a personalized space for users to manage their account settings, view their activity history, and customize their tracking preferences.",
    "Analysis.png": "The Analysis page provides in-depth insights into user habits through interactive charts and graphs, allowing users to visualize their progress and identify trends over time."
};

pile.onclick = () => {
    if (!isFullyStacked) return;

    const cards = Array.from(document.querySelectorAll('.tracker-img'));
    const titleElement = document.querySelector('.Heading');
    const descriptionElement = document.querySelector('.Description');

    // Find the top card based on z-index
    const topCard = cards.reduce((prev, curr) =>
        (parseInt(getComputedStyle(prev).zIndex) > parseInt(getComputedStyle(curr).zIndex)) ? prev : curr
    );

    if (topCard.classList.contains('shuffling')) return;

    titleElement.classList.add('title-fade');
    descriptionElement.classList.add('title-fade');
    topCard.classList.add('shuffling');

    // Staggered z-index shuffle
    setTimeout(() => {
        const config = getResponsiveConfig();
        const sortedCards = [...cards].sort((a, b) =>
            parseInt(getComputedStyle(b).zIndex) - parseInt(getComputedStyle(a).zIndex)
        );

        sortedCards.forEach((card, index) => {
            setTimeout(() => {
                let currentZ = parseInt(getComputedStyle(card).zIndex);
                let newZ = (card === topCard) ? 1 : currentZ + 1;
                card.style.zIndex = newZ;

                const newSlot = config.slots.find(s => s.z === newZ);
                if (newSlot) {
                    card.style.left = `${newSlot.x}px`;
                    card.style.top = `${newSlot.y}px`;
                }

                // Update text based on the new front card
                if (newZ === 3) {
                    const fileName = card.src.split('/').pop().split('?')[0]; // Handle potential cache busters
                    titleElement.innerText = cardHeadingsMap[fileName] || "HabiTrack";
                    descriptionElement.innerText = descriptionsMap[fileName] || "";

                    setTimeout(() => {
                        titleElement.classList.remove('title-fade');
                        descriptionElement.classList.remove('title-fade');
                    }, 100);
                }
            }, index * 50);
        });
    }, 300);

    setTimeout(() => {
        topCard.classList.remove('shuffling');
    }, 800);
};

/* =========================================
   MOUSE TRAILER
   ========================================= */
const trailer = document.querySelector('#trailer');

const animateTrailer = (e, interacting) => {
    const x = e.clientX - trailer.offsetWidth / 2;
    const y = e.clientY - trailer.offsetHeight / 2;

    // Use hardware-accelerated transforms via animate()
    const keyframes = {
        transform: `translate(${x}px, ${y}px) scale(${interacting ? 2 : 1})`
    };

    trailer.animate(keyframes, {
        duration: 800,
        fill: "forwards"
    });
}

window.onmousemove = e => {
    const interactable = e.target.closest('.interactable');
    const interacting = interactable !== null;
    const icon = document.getElementById('trailer-icon');

    animateTrailer(e, interacting);

    if (interacting) {
        icon.src = "/assets/top-right.png"; // Fixed path
        icon.style.opacity = 1;
        trailer.classList.add("Active");
    } else {
        icon.style.opacity = 0;
        trailer.classList.remove("Active");
    }
}

/* =========================================
   MAGIC TEXT & STARS ANIMATION
   ========================================= */
let starIndex = 0,
    starInterval = 1000;

const rand = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const animateStar = star => {
    star.style.setProperty("--star-left", `${rand(-10, 100)}%`);
    star.style.setProperty("--star-top", `${rand(-40, 80)}%`);

    star.style.animation = "none";
    star.offsetHeight; // trigger reflow
    star.style.animation = "";
}

for (const star of document.getElementsByClassName("magic-star")) {
    setTimeout(() => {
        animateStar(star);
        setInterval(() => animateStar(star), 1000);
    }, starIndex++ * (starInterval / 3))
}

/* =========================================
   AUTHENTICATION LOGIC
   ========================================= */
console.log("Auth module initializing...");

setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence error:", err));

let isLogin = true;

const formTitle = document.getElementById('form-title');
const nameGroup = document.getElementById('name-group');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signInBtn = document.getElementById('signin-btn');
const authSwitchText = document.getElementById('auth-switch-text');

console.log("Elements found:", { formTitle, nameGroup, signInBtn, authSwitchText });

const togglePassword = document.getElementById('toggle-password');
const eyeIcon = document.getElementById('eye-icon');

if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle icon (Eye vs Eye-off)
        if (type === 'text') {
            eyeIcon.innerHTML = '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>';
        } else {
            eyeIcon.innerHTML = '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>';
        }
    });
}

// Redirect to tracker if the path looks like a profile share link
const pathParts = window.location.pathname.split('/').filter(p => p !== "");
if (pathParts.length > 0 && pathParts[0] !== 'tracker.html' && pathParts[0] !== 'index.html') {
    // Looks like a UID share link
    window.location.href = "/tracker.html" + window.location.pathname;
}

onAuthStateChanged(auth, (user) => {
    if (user && !window.location.search.includes('logout') && pathParts.length === 0) {
        console.log("Existing session found, redirecting...");
        window.location.href = "/tracker.html?view=profile";
    }
});

function toggleAuthMode() {
    isLogin = !isLogin;

    if (isLogin) {
        formTitle.innerHTML = 'Sign in to <span>Habit-tracker</span>';
        nameGroup.style.display = 'none';
        signInBtn.querySelector('label').innerText = 'Sign in';
        authSwitchText.innerHTML = "Don't have an account? <a href='#' id='toggle-auth'>Sign up</a>";
    } else {
        formTitle.innerHTML = 'Create <span>Account</span>';
        nameGroup.style.display = 'block';
        signInBtn.querySelector('label').innerText = 'Sign up';
        authSwitchText.innerHTML = "Already have an account? <a href='#' id='toggle-auth'>Login</a>";
    }
}

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'toggle-auth') {
        e.preventDefault();
        toggleAuthMode();
    }
});

signInBtn.addEventListener('click', async () => {
    console.log("Auth button clicked. Mode:", isLogin ? "LOGIN" : "SIGNUP");
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const name = nameInput.value.trim();

    if (!email || !password || (!isLogin && !name)) {
        alert("Please fill in all fields.");
        return;
    }

    const btnLabel = signInBtn.querySelector('label');
    const originalText = btnLabel.innerText;

    try {
        btnLabel.innerText = isLogin ? "Signing in..." : "Creating account...";
        signInBtn.style.opacity = "0.7";
        signInBtn.style.pointerEvents = "none";

        if (isLogin) {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user.displayName) {
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    displayName: userCredential.user.displayName,
                    email: userCredential.user.email,
                    uid: userCredential.user.uid,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            }
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                displayName: name,
                email: email,
                uid: userCredential.user.uid,
                updatedAt: new Date().toISOString()
            });
        }

        console.log("Auth success, waiting for redirect...");
        setTimeout(() => {
            window.location.href = "/tracker.html?view=profile";
        }, 800);

    } catch (error) {
        console.error("Auth Exception:", error);
        alert("Auth Error: " + error.message);
        btnLabel.innerText = originalText;
        signInBtn.style.opacity = "1";
        signInBtn.style.pointerEvents = "auto";
    }
});
