(async function(){
    const res = await fetch('../pages/data/news.json');
    if(!res.ok) return;
    const list = await res.json();
    list.sort((a,b) => new Date(b.date)-new Date(a.date));
    const items = list.slice(0,2);
    const grid = document.getElementById('homeNewsGrid');
    items.forEach(it => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6';
        col.innerHTML = `<div class="card p-2"><h5>${it.title}</h5><div class="text-muted small">${it.date}</div><p>${it.excerpt}</p><a href="../pages/news-article.html?slug=${it.slug}" class="btn btn-sm btn-outline-primary">Читать</a></div>`;
        grid.appendChild(col);
    });
})();