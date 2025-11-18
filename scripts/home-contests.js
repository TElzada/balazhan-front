(function(){
    const DATA_URL = '../pages/data/contests.json'; // путь от index.html в корне
    const MAX_SHOW = 3; // сколько показать на главной

    const grid = document.getElementById('homeContestsGrid');
    const emptyEl = document.getElementById('homeContestsEmpty');

    function isActive(item){
        if (!item.startDate && !item.endDate) return true;
        const now = new Date();
        const s = item.startDate ? new Date(item.startDate) : null;
        const e = item.endDate ? new Date(item.endDate) : null;
        return (!s || now >= s) && (!e || now <= e);
    }

    function escapeHtml(s){
        if(!s) return '';
        return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    }

    fetch(DATA_URL)
        .then(r => {
            if(!r.ok) throw new Error('Не удалось загрузить данные');
            return r.json();
        })
        .then(list => {
            // оставляем только активные (по датам) — опционально, можно убрать проверку isActive()
            const active = list.filter(isActive);

            // сортируем по startDate: новые сверху
            active.sort((a, b) => {
                const da = a.startDate ? new Date(a.startDate) : new Date(0);
                const db = b.startDate ? new Date(b.startDate) : new Date(0);
                return db - da;
            });

            // показываем максимум MAX_SHOW (3)
            const items = active.slice(0, MAX_SHOW);

            if (items.length === 0) {
                emptyEl.style.display = 'block';
                return;
            }
            emptyEl.style.display = 'none';
            emptyEl.style.display = 'none';
            items.forEach(it => {
                const col = document.createElement('div');
                col.className = 'col-12 col-md-4';
                const imgHtml = it.imageUrl ? `<img src="${escapeHtml(it.imageUrl)}" alt="${escapeHtml(it.title)}" style="width:100%; height:140px; object-fit:cover; border-radius:6px;">` : '';
                const dateText = it.startDate ? new Date(it.startDate).toLocaleDateString() : '';

                col.innerHTML = `
          <div class="card h-100 shadow-sm">
            ${imgHtml}
            <div class="card-body d-flex flex-column">
              <h5 class="card-title mb-1">${escapeHtml(it.title)}</h5>
              <div class="text-muted small mb-2">${dateText} · ${it.category === 'teacher' ? 'Для педагогов' : it.category === 'kid' ? 'Для детей' : 'Для всех'}</div>
              <p class="card-text flex-grow-1">${escapeHtml(it.excerpt || '')}</p>
              <div class="mt-2">
                <a class="btn btn-sm btn-outline-primary" href="../pages/contest.html?slug=${encodeURIComponent(it.slug)}">Подробнее</a>
              </div>
            </div>
          </div>
        `;
                grid.appendChild(col);
            });
        })
        .catch(err => {
            console.error(err);
            emptyEl.textContent = 'Ошибка загрузки конкурсов.';
            emptyEl.style.display = 'block';
        });
})();