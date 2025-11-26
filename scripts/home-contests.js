(function () {
    const API_BASE = 'https://balajan-back.onrender.com';
    const DATA_URL = '../pages/data/contests.json'; // запасной JSON
    const MAX_SHOW = 3;

    const grid = document.getElementById('homeContestsGrid');
    const emptyEl = document.getElementById('homeContestsEmpty');
    if (!grid || !emptyEl) return;

    function isActive(item) {
        if (!item.startDate && !item.endDate) return true;
        const now = new Date();
        const s = item.startDate ? new Date(item.startDate) : null;
        const e = item.endDate ? new Date(item.endDate) : null;
        return (!s || now >= s) && (!e || now <= e);
    }

    function escapeHtml(s) {
        if (!s) return '';
        return String(s)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }

    async function loadFromBackend() {
        try {
            const res = await fetch(`${API_BASE}/api/contests`);
            if (!res.ok) {
                throw new Error('Ошибка API: ' + res.status);
            }
            return await res.json();
        } catch (e) {
            console.error('Не удалось загрузить конкурсы с бэка', e);
            return [];
        }
    }

    async function loadFromJson() {
        try {
            const res = await fetch(DATA_URL);
            if (!res.ok) throw new Error('Не удалось загрузить ' + DATA_URL);
            return await res.json();
        } catch (e) {
            console.error('Не удалось загрузить contests.json', e);
            return [];
        }
    }

    (async function init() {
        try {
            // 1) пробуем взять конкурсы с бэка
            let list = await loadFromBackend();

            // 2) если с бэка пусто или ошибка — берём из JSON
            if (!Array.isArray(list) || !list.length) {
                list = await loadFromJson();
            }

            if (!Array.isArray(list) || !list.length) {
                emptyEl.textContent = 'Сейчас нет активных конкурсов.';
                emptyEl.style.display = 'block';
                return;
            }

            // оставляем только активные по датам
            const active = list.filter(isActive);

            // сортируем по startDate: новые сверху
            active.sort((a, b) => {
                const da = a.startDate ? new Date(a.startDate) : new Date(0);
                const db = b.startDate ? new Date(b.startDate) : new Date(0);
                return db - da;
            });

            // показываем максимум MAX_SHOW
            const items = active.slice(0, MAX_SHOW);

            if (!items.length) {
                emptyEl.style.display = 'block';
                return;
            }
            emptyEl.style.display = 'none';

            items.forEach(it => {
                const col = document.createElement('div');
                col.className = 'col-12 col-md-4';

                const imgHtml = it.imageUrl
                    ? `<img src="${escapeHtml(it.imageUrl)}" alt="${escapeHtml(it.title)}"
                             style="width:100%; height:140px; object-fit:cover; border-radius:6px;">`
                    : '';

                const dateText = it.startDate
                    ? new Date(it.startDate).toLocaleDateString()
                    : '';

                const categoryText =
                    it.category === 'teacher'
                        ? 'Для педагогов'
                        : it.category === 'kid'
                            ? 'Для детей'
                            : 'Для всех';

                col.innerHTML = `
          <div class="card h-100 shadow-sm">
            ${imgHtml}
            <div class="card-body d-flex flex-column">
              <h5 class="card-title mb-1">${escapeHtml(it.title)}</h5>
              <div class="text-muted small mb-2">
                ${dateText} · ${categoryText}
              </div>
              <p class="card-text flex-grow-1">${escapeHtml(it.excerpt || '')}</p>
              <div class="mt-2">
                <a class="btn btn-sm btn-outline-primary"
                   href="../pages/contest.html?slug=${encodeURIComponent(it.slug)}">
                   Подробнее
                </a>
              </div>
            </div>
          </div>
        `;
                grid.appendChild(col);
            });
        } catch (err) {
            console.error(err);
            emptyEl.textContent = 'Ошибка загрузки конкурсов.';
            emptyEl.style.display = 'block';
        }
    })();
})();
