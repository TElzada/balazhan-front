const API_BASE = "http://localhost:8080"; // такой же, как в admin-contests.js

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("newsTableBody");
    const form = document.getElementById("newsForm");
    const formTitle = document.getElementById("newsFormTitle");

    const btnNewNews = document.getElementById("btnNewNews");
    const btnResetForm = document.getElementById("btnResetNewsForm");

    // поля формы
    const idInput = document.getElementById("newsId");
    const titleInput = document.getElementById("newsTitle");
    const slugInput = document.getElementById("newsSlug");
    const imageUrlInput = document.getElementById("newsImageUrl");
    const publishedAtInput = document.getElementById("newsPublishedAt");
    const excerptInput = document.getElementById("newsExcerpt");
    const contentInput = document.getElementById("newsContent");

    let newsList = [];
    let editingId = null;

    // === 1. Загрузка новостей из бэка ===
    async function loadNews() {
        try {
            const res = await fetch(`${API_BASE}/api/admin/news`, {
                method: "GET",
                credentials: "include"
            });

            if (res.status === 401) {
                window.location.href = "admin-login.html";
                return;
            }

            if (!res.ok) {
                throw new Error("Ошибка при загрузке новостей: " + res.status);
            }
            newsList = await res.json();
            renderTable();
        } catch (e) {
            console.error(e);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-danger">Не удалось загрузить новости с сервера.</td>
                </tr>
            `;
        }
    }

    // === 2. Отрисовка таблицы ===
    function renderTable() {
        tableBody.innerHTML = "";

        if (!newsList.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-muted">Пока нет новостей.</td>
                </tr>
            `;
            return;
        }

        newsList.forEach(n => {
            const tr = document.createElement("tr");

            const displayDate = formatDateForTable(n);

            tr.innerHTML = `
                <td>${n.id}</td>
                <td>${escapeHtml(n.title)}</td>
                <td>${displayDate}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${n.id}">Редактировать</button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${n.id}">Удалить</button>
                </td>
            `;

            tableBody.appendChild(tr);
        });
    }

    // пытаемся аккуратно вытащить дату
    function formatDateForTable(n) {
        // пробуем publishedAt, date или published_at
        const value = n.publishedAt || n.date || n.published_at;
        if (!value) return "";

        const d = new Date(value);
        if (isNaN(d.getTime())) return value; // если непонятный формат — показываем как есть

        return d.toLocaleString("ru-RU", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // === 3. Заполнение формы при редактировании ===
    function fillForm(news) {
        editingId = news.id;
        formTitle.textContent = `Редактирование новости #${news.id}`;

        idInput.value = news.id || "";
        titleInput.value = news.title || "";
        slugInput.value = news.slug || "";
        imageUrlInput.value = news.imageUrl || news.image_url || "";
        excerptInput.value = news.excerpt || "";
        contentInput.value = news.content || "";

        // Попробуем привести дату к виду для datetime-local
        const rawDate = news.publishedAt || news.date || news.published_at;
        if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
                // yyyy-MM-ddTHH:mm
                const iso = d.toISOString().slice(0, 16);
                publishedAtInput.value = iso;
            } else {
                publishedAtInput.value = "";
            }
        } else {
            publishedAtInput.value = "";
        }
    }

    // === 4. Очистка формы (режим создания) ===
    function resetForm() {
        editingId = null;
        formTitle.textContent = "Создать новость";

        idInput.value = "";
        titleInput.value = "";
        slugInput.value = "";
        imageUrlInput.value = "";
        excerptInput.value = "";
        contentInput.value = "";
        publishedAtInput.value = "";
    }

    // === 5. Клики по таблице (редактировать / удалить) ===
    tableBody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === "edit") {
            const n = newsList.find(x => String(x.id) === String(id));
            if (n) {
                fillForm(n);
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            }
        }

        if (action === "delete") {
            if (!confirm("Точно удалить эту новость?")) return;

            try {
                const res = await fetch(`${API_BASE}/api/admin/news/${id}`, {
                    method: "DELETE",
                    credentials: "include"
                });

                if (res.status === 401) {
                    window.location.href = "admin-login.html";
                    return;
                }

                if (!res.ok) {
                    throw new Error("Ошибка при удалении: " + res.status);
                }
                newsList = newsList.filter(x => String(x.id) !== String(id));
                renderTable();
                resetForm();
            } catch (err) {
                console.error(err);
                alert("Не удалось удалить новость.");
            }
        }
    });

    // === 6. Кнопка "Создать новость" ===
    btnNewNews.addEventListener("click", () => {
        resetForm();
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });

    // === 7. Кнопка "Очистить форму" ===
    btnResetForm.addEventListener("click", () => {
        resetForm();
    });

    // === 8. Сабмит формы (создание/обновление) ===
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            id: editingId,
            title: titleInput.value.trim(),
            slug: slugInput.value.trim(),
            imageUrl: imageUrlInput.value.trim() || null,
            excerpt: excerptInput.value.trim() || null,
            content: contentInput.value || null,
        };

        // дата публикации: если заполнена — кладём в publishedAt
        if (publishedAtInput.value) {
            const local = publishedAtInput.value; // "yyyy-MM-ddTHH:mm"
            payload.publishedAt = local + ":00+06:00"; // "2025-11-24T16:46:00+06:00"
        }

        if (!payload.title || !payload.slug) {
            alert("Поля 'Заголовок' и 'Слаг' обязательны.");
            return;
        }

        try {
            const method = editingId ? "PUT" : "POST";
            const url = editingId
                ? `${API_BASE}/api/admin/news/${editingId}`
                : `${API_BASE}/api/admin/news`;

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(payload)
            });

            if (res.status === 401) {
                window.location.href = "admin-login.html";
                return;
            }

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Ошибка при сохранении новости:", res.status, errorText);
                throw new Error("Ошибка при сохранении: " + res.status);
            }

            const saved = await res.json();

            if (editingId) {
                const idx = newsList.findIndex(x => x.id === saved.id);
                if (idx !== -1) {
                    newsList[idx] = saved;
                }
            } else {
                newsList.push(saved);
            }

            renderTable();
            fillForm(saved);
            alert("Новость сохранена.");
        } catch (err) {
            console.error(err);
            alert("Не удалось сохранить новость. Подробности в консоли.");
        }
    });

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    // старт
    loadNews();
});
