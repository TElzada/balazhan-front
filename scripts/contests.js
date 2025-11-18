/* contests page renderer (uses pages/data/contests.json relative to this file) */
(() => {
    const DATA_URL = 'data/contests.json';
    const PAGE_SIZE = 6;

    let allContests = [];
    let filtered = [];
    let visibleCount = PAGE_SIZE;

    const grid = document.getElementById('contestsGrid');
    const modalsContainer = document.getElementById('modalsContainer');
    const tabs = document.querySelectorAll('.tab');
    const qInput = document.getElementById('q');
    const loadMoreBtn = document.getElementById('loadMore');

    async function loadData() {
        try {
            const res = await fetch(DATA_URL);
            if (!res.ok) throw new Error('Не удалось загрузить ' + DATA_URL);
            allContests = await res.json();
            applyFilters();
        } catch (e) {
            grid.innerHTML = '<p class="text-danger">Не удалось загрузить данные.</p>';
            console.error(e);
        }
    }

    function isActive(item) {
        if (!item.startDate && !item.endDate) return true;
        const now = new Date();
        const start = item.startDate ? new Date(item.startDate) : null;
        const end = item.endDate ? new Date(item.endDate) : null;
        return (!start || now >= start) && (!end || now <= end);
    }

    function applyFilters() {
        const activeTab = document.querySelector('.tab.active').dataset.cat;
        const q = qInput.value.trim().toLowerCase();

        filtered = allContests.filter(item => {
            if (activeTab !== 'all' && item.category !== activeTab && item.category !== 'both') return false;
            if (q) {
                const hay = (item.title + ' ' + (item.excerpt||'') + ' ' + (item.content||'')).toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });

        // сортируем по дате (новые сверху) если есть startDate
        filtered.sort((a,b) => {
            const da = a.startDate ? new Date(a.startDate) : new Date(0);
            const db = b.startDate ? new Date(b.startDate) : new Date(0);
            return db - da;
        });

        visibleCount = PAGE_SIZE;
        render();
    }

    function render() {
        grid.innerHTML = '';
        modalsContainer.innerHTML = '';
        const slice = filtered.slice(0, visibleCount);
        if (slice.length === 0) {
            grid.innerHTML = '<p>Нет конкурсов по выбранным фильтрам.</p>';
            loadMoreBtn.style.display = 'none';
            return;
        }

        slice.forEach(it => {
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4';

            const img = it.imageUrl ? `<img src="${escape(it.imageUrl)}" class="card-img-top" alt="${escape(it.title)}" style="height:160px; object-fit:cover; border-radius:8px 8px 0 0;">` : '';
            const startDateText = it.startDate ? `С ${new Date(it.startDate).toLocaleDateString()}` : '';

            col.innerHTML = `
        <div class="card h-100 shadow-sm">
          ${img}
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${escape(it.title)}</h5>
            <div class="mb-2 text-muted small">${startDateText}</div>
            <p class="card-text flex-grow-1">${escape(it.excerpt || '')}</p>
          </div>
          <div class="card-footer text-center bg-white">
            <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modal-${escapeId(it.slug)}">Подробнее</button>
            <a class="btn btn-link" href="contest.html?slug=${encodeURIComponent(it.slug)}">Перейти на страницу</a>
          </div>
        </div>`;

            grid.appendChild(col);

            // modal
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = `modal-${escapeId(it.slug)}`;
            modal.tabIndex = -1;
            modal.setAttribute('aria-hidden', 'true');

            const stagesHtml = (it.stages || []).map(s => `<li><strong>${escape(s.title)}</strong> — ${escape(s.date)}: ${escape(s.description)}</li>`).join('');
            modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${escape(it.title)}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ${ it.imageUrl ? `<img src="${escape(it.imageUrl)}" alt="${escape(it.title)}" class="img-fluid mb-3">` : '' }
              <p class="mb-1"><strong>Сроки:</strong> ${escape(it.startDate||'')} ${it.endDate ? '— ' + escape(it.endDate) : ''}</p>
              <p><strong>Кратко:</strong> ${escape(it.excerpt||'')}</p>
              <hr>
              <div><strong>Этапы:</strong>
                <ul>${stagesHtml}</ul>
              </div>
              <hr>
              <div class="full-content">${it.content || ''}</div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
              <a class="btn btn-primary" href="contest.html?slug=${encodeURIComponent(it.slug)}">Перейти на полную страницу</a>
            </div>
          </div>
        </div>`;

            modalsContainer.appendChild(modal);
        });

        loadMoreBtn.style.display = visibleCount < filtered.length ? 'inline-block' : 'none';
    }

    function escape(s) {
        if (!s) return '';
        return String(s)
            .replaceAll('&','&amp;')
            .replaceAll('<','&lt;')
            .replaceAll('>','&gt;')
            .replaceAll('"','&quot;');
    }
    function escapeHtml(s){ return escape(s); }
    function escapeId(s){ return String(s).replace(/[^a-zA-Z0-9-_]/g,'-'); }

    // listeners
    tabs.forEach(t => t.addEventListener('click', () => {
        tabs.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        applyFilters();
    }));
    qInput.addEventListener('input', () => applyFilters());
    loadMoreBtn.addEventListener('click', () => { visibleCount += PAGE_SIZE; render(); });

    // load
    loadData();
})();