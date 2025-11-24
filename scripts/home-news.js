(async function () {
    const API_BASE = 'http://localhost:8080';
    const FALLBACK_JSON = '../pages/data/news.json';
    const grid = document.getElementById('homeNewsGrid');
    if (!grid) return;

    function escapeHtml(s) {
        if (!s) return '';
        return String(s)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    try {
        // 1) пробуем взять новости с бэка
        let list = await loadFromBackend();

        // 2) если бэк пустой или упал — берём старый JSON
        if (!list || !list.length) {
            list = await loadFromJson();
        }

        if (!list || !list.length) return;

        // сортируем по дате (берём либо date, либо publishedAt)
        list.sort((a, b) => {
            const da = new Date(a.date || a.publishedAt || a.published_at || 0);
            const db = new Date(b.date || b.publishedAt || b.published_at || 0);
            return db - da;
        });

        const items = list.slice(0, 2);
        items.forEach(it => {
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6';

            const dateText = it.date || it.publishedAt || it.published_at || '';

            col.innerHTML = `
                <div class="card p-2 h-100">
                    <h5>${escapeHtml(it.title || '')}</h5>
                    <div class="text-muted small">${escapeHtml(dateText)}</div>
                    <p>${escapeHtml(it.excerpt || '')}</p>
                    <a href="../pages/news-article.html?slug=${encodeURIComponent(it.slug)}"
                       class="btn btn-sm btn-outline-primary">
                       Читать
                    </a>
                </div>
            `;

            grid.appendChild(col);
        });

    } catch (e) {
        console.error('Ошибка загрузки новостей для главной:', e);
    }

    async function loadFromBackend() {
        try {
            const res = await fetch(`${API_BASE}/api/news`);
            if (!res.ok) {
                throw new Error('Ошибка при загрузке с бэка: ' + res.status);
            }
            return await res.json();
        } catch (e) {
            console.error('Не удалось загрузить новости с бэка', e);
            return [];
        }
    }

    async function loadFromJson() {
        try {
            const res = await fetch(FALLBACK_JSON);
            if (!res.ok) {
                throw new Error('Не удалось загрузить ' + FALLBACK_JSON);
            }
            return await res.json();
        } catch (e) {
            console.error('Не удалось загрузить новости из локального JSON', e);
            return [];
        }
    }
})();
