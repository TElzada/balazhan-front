document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('main.container');

    const controlsHtml = `
        <div class="d-flex justify-content-between align-items-center mb-4 gap-2" id="teachers-controls">
            <div class="input-group w-75">
                <span class="input-group-text">🔎</span>
                <input id="teachers-search" class="form-control" placeholder="Поиск по названиям и описаниям...">
            </div>
            <button id="reset-filters" class="btn btn-outline-secondary">Сброс</button>
        </div>
    `;
    if (container) container.prepend(createFragment(controlsHtml));

    const searchInput = document.getElementById('teachers-search');
    const resetBtn = document.getElementById('reset-filters');
    const cards = Array.from(document.querySelectorAll('.card.h-100'));

    /* Ленивая загрузка картинок */
    document.querySelectorAll('.card img').forEach(img => {
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });

    /*  Поиск  */
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterCards(searchInput.value.trim().toLowerCase());
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            filterCards('');
        });
    }

    function filterCards(query = '') {
        cards.forEach(card => {
            const title = (card.querySelector('.card-title') || {}).innerText || '';
            const desc = (card.querySelector('.card-text') || {}).innerText || '';
            const text = (title + ' ' + desc).toLowerCase();
            card.style.display = (!query || text.includes(query)) ? '' : 'none';
        });
    }

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in-view');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(card => {
        card.classList.add('hidden-card');
        io.observe(card);
    });



    filterCards('');
});

/* Тёмная / светлая тема */
(function themeToggleInit() {
    // Не создаём кнопку, если она уже есть (из других скриптов)
    if (document.querySelector('.theme-toggle')) return;

    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Переключить тему');

    document.body.appendChild(btn);


    const saved = localStorage.getItem('theme'); // 'dark' / 'light' / null
    let isDark;
    if (saved === 'dark') isDark = true;
    else if (saved === 'light') isDark = false;
    else isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    setTheme(isDark, false);


    btn.addEventListener('click', () => {
        const nowDark = document.body.classList.toggle('dark');
        setTheme(nowDark, true);
    });

    function setTheme(dark, persist) {
        if (dark) {
            document.body.classList.add('dark');
            btn.textContent = '☀️';
        } else {
            document.body.classList.remove('dark');
            btn.textContent = '🌙';
        }
        if (persist) localStorage.setItem('theme', dark ? 'dark' : 'light');
    }


    if (!localStorage.getItem('theme') && window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener ? mq.addEventListener('change', e => setTheme(e.matches, false)) : mq.addListener(e => setTheme(e.matches, false));
    }
})();

(function injectStylesIfMissing() {

    if (document.getElementById('teachers-js-styles')) return;

    const css = `
    .hidden-card { transform: translateY(18px); opacity: 0; transition: all .5s ease; }
    .hidden-card.in-view { transform: none; opacity: 1; }
    #teachers-controls .input-group-text { background: white; }
    @media (max-width: 576px) { #teachers-controls .w-75 { width: 100% !important; } }
    `;
    const style = document.createElement('style');
    style.id = 'teachers-js-styles';
    style.innerHTML = css;
    document.head.appendChild(style);
})();
