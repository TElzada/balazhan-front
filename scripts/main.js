// анимация появления карточек

const cards = document.querySelectorAll(".card");

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, { threshold: 0.2 });

cards.forEach(card => observer.observe(card));

// ленивое прогружение картинок

document.querySelectorAll("img").forEach(img => {
    if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
    }
});

//  кнопка наверх
const toTopBtn = document.createElement("button");
toTopBtn.innerHTML = "↑";
toTopBtn.className = "to-top-btn";
document.body.appendChild(toTopBtn);

toTopBtn.style.display = "none";

window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        toTopBtn.style.display = "block";
    } else {
        toTopBtn.style.display = "none";
    }
});

toTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// анимация меню при скролле
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});
// тёмная тема
const themeToggle = document.createElement("button");
themeToggle.textContent = "🌙";
themeToggle.className = "theme-toggle";
document.body.appendChild(themeToggle);

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    themeToggle.textContent =
        document.body.classList.contains("dark") ? "☀️" : "🌙";
});

