(async function(){
    const DATA_URL = 'data/news.json';
    const grid = document.getElementById('newsGrid');
    const empty = document.getElementById('newsEmpty');

    function escapeHtml(s){ return s ? String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') : ''; }

    try {
        const res = await fetch(DATA_URL);
        if(!res.ok) throw new Error('Не удалось загрузить новости');
        const list = await res.json();

        if(!Array.isArray(list) || list.length === 0) {
            empty.style.display = 'block';
            return;
        }

        // сортируем по дате (свежие первыми)
        list.sort((a,b) => new Date(b.date) - new Date(a.date));

        list.forEach(it => {
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6';

            const imgHtml = it.imageUrl ? `<img src="${escapeHtml(it.imageUrl)}" alt="${escapeHtml(it.title)}" style="width:100%; height:180px; object-fit:cover; border-radius:8px;">` : '';

            col.innerHTML = `
          <article class="card h-100">
            <div class="row g-0">
              <div class="col-4 d-none d-md-block">${imgHtml}</div>
              <div class="col-12 col-md-8">
                <div class="card-body">
                  <h5 class="card-title">${escapeHtml(it.title)}</h5>
                  <div class="text-muted small mb-2">${escapeHtml(it.date)}</div>
                  <p class="card-text">${escapeHtml(it.excerpt || '')}</p>
                  <a class="btn btn-sm btn-outline-primary" href="news-article.html?slug=${encodeURIComponent(it.slug)}">Читать далее</a>
                </div>
              </div>
            </div>
          </article>
        `;
            grid.appendChild(col);
        });

    } catch (e) {
        console.error(e);
        empty.textContent = 'Ошибка загрузки новостей.';
        empty.style.display = 'block';
    }
})();