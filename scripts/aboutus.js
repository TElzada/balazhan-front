// Появление блоков при скролле
const sections = document.querySelectorAll('.about-section');

function revealSections() {
    const triggerBottom = window.innerHeight * 0.85;

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop < triggerBottom) {
            section.classList.add('show');
        }
    });
}

window.addEventListener('scroll', revealSections);
revealSections(); // запускаем при загрузке

// Кнопка "Наверх"
const toTopBtn = document.createElement('button');
toTopBtn.innerHTML = '↑';
toTopBtn.className = 'to-top-btn';
document.body.appendChild(toTopBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        toTopBtn.style.display = 'block';
    } else {
        toTopBtn.style.display = 'none';
    }
});

toTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Темная тема
const themeToggle = document.createElement("button");
themeToggle.textContent = "🌙";
themeToggle.className = "theme-toggle";
document.body.appendChild(themeToggle);

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    themeToggle.textContent =
        document.body.classList.contains("dark") ? "☀️" : "🌙";
});