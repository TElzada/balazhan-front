const API_BASE = "http://localhost:8080"; // если поменяете порт/домен, поменяешь тут

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("contestsTableBody");
    const form = document.getElementById("contestForm");
    const formTitle = document.getElementById("formTitle");

    const btnNewContest = document.getElementById("btnNewContest");
    const btnResetForm = document.getElementById("btnResetForm");

    // поля формы
    const idInput = document.getElementById("contestId");
    const titleInput = document.getElementById("title");
    const slugInput = document.getElementById("slug");
    const categorySelect = document.getElementById("category");
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const imageUrlInput = document.getElementById("imageUrl");
    const excerptInput = document.getElementById("excerpt");
    const contentInput = document.getElementById("content");
    const isFeaturedInput = document.getElementById("isFeatured");

    let contests = [];
    let editingId = null; // null = создаём новый, не null = редактируем существующий

    // === 1. Загрузка списка конкурсов из бэка ===
    async function loadContests() {
        try {
            const res = await fetch(`${API_BASE}/api/admin/contests`);
            if (!res.ok) {
                throw new Error("Ошибка при загрузке конкурсов: " + res.status);
            }
            contests = await res.json();
            renderTable();
        } catch (e) {
            console.error(e);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-danger">Не удалось загрузить конкурсы с сервера.</td>
                </tr>
            `;
        }
    }

    // === 2. Отрисовка таблицы ===
    function renderTable() {
        tableBody.innerHTML = "";

        if (!contests.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-muted">Пока нет ни одного конкурса.</td>
                </tr>
            `;
            return;
        }

        contests.forEach(c => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${escapeHtml(c.title)}</td>
                <td>${escapeHtml(c.category || "")}</td>
                <td>${c.startDate || ""}</td>
                <td>${c.endDate || ""}</td>
                <td>${c.featured ? "Да" : "Нет"}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${c.id}">Редактировать</button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${c.id}">Удалить</button>
                </td>
            `;

            tableBody.appendChild(tr);
        });
    }

    // === 3. Заполнение формы для редактирования ===
    function fillForm(contest) {
        editingId = contest.id;
        formTitle.textContent = `Редактирование конкурса #${contest.id}`;
        idInput.value = contest.id || "";
        titleInput.value = contest.title || "";
        slugInput.value = contest.slug || "";
        categorySelect.value = contest.category || "";
        startDateInput.value = contest.startDate || "";
        endDateInput.value = contest.endDate || "";
        imageUrlInput.value = contest.imageUrl || "";
        excerptInput.value = contest.excerpt || "";
        contentInput.value = contest.content || "";
        isFeaturedInput.checked = contest.featured || contest.isFeatured || false;
    }

    // === 4. Очистка формы (режим "Создать новый") ===
    function resetForm() {
        editingId = null;
        formTitle.textContent = "Создать конкурс";
        idInput.value = "";
        titleInput.value = "";
        slugInput.value = "";
        categorySelect.value = "";
        startDateInput.value = "";
        endDateInput.value = "";
        imageUrlInput.value = "";
        excerptInput.value = "";
        contentInput.value = "";
        isFeaturedInput.checked = false;
    }

    // === 5. Обработка кликов по таблице (редакт / удаление) ===
    tableBody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === "edit") {
            const contest = contests.find(c => String(c.id) === String(id));
            if (contest) {
                fillForm(contest);
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            }
        }

        if (action === "delete") {
            if (!confirm("Точно удалить конкурс?")) return;

            try {
                const res = await fetch(`${API_BASE}/api/admin/contests/${id}`, {
                    method: "DELETE"
                });
                if (!res.ok) {
                    throw new Error("Ошибка при удалении: " + res.status);
                }
                // обновляем список
                contests = contests.filter(c => String(c.id) !== String(id));
                renderTable();
                resetForm();
            } catch (err) {
                console.error(err);
                alert("Не удалось удалить конкурс.");
            }
        }
    });

    // === 6. Создать новый (кнопка "Создать новый конкурс") ===
    btnNewContest.addEventListener("click", () => {
        resetForm();
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });

    // === 7. Очистить форму (кнопка "Очистить форму") ===
    btnResetForm.addEventListener("click", () => {
        resetForm();
    });

    // === 8. Сабмит формы (создание/обновление конкурса) ===
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            id: editingId,
            title: titleInput.value.trim(),
            slug: slugInput.value.trim(),
            category: categorySelect.value || null,
            startDate: startDateInput.value || null,
            endDate: endDateInput.value || null,
            imageUrl: imageUrlInput.value.trim() || null,
            excerpt: excerptInput.value.trim() || null,
            content: contentInput.value || null,
            featured: isFeaturedInput.checked
        };

        // простая валидация
        if (!payload.title || !payload.slug) {
            alert("Поля 'Заголовок' и 'Слаг' обязательны.");
            return;
        }

        try {
            const method = editingId ? "PUT" : "POST";
            const url = editingId
                ? `${API_BASE}/api/admin/contests/${editingId}`
                : `${API_BASE}/api/admin/contests`;

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Ошибка при сохранении конкурса:", res.status, errorText);
                throw new Error("Ошибка при сохранении: " + res.status);
            }

            const saved = await res.json();

            if (editingId) {
                // обновляем запись в массиве
                const idx = contests.findIndex(c => c.id === saved.id);
                if (idx !== -1) {
                    contests[idx] = saved;
                }
            } else {
                // добавляем новый в массив
                contests.push(saved);
            }

            renderTable();
            fillForm(saved); // остаёмся в режиме "редактирования" сохранённого конкурса
            alert("Конкурс сохранён.");

        } catch (err) {
            console.error(err);
            alert("Не удалось сохранить конкурс. Подробности в консоли.");
        }
    });

    // утилита для защиты от XSS
    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    // === старт: грузим конкурсы ===
    loadContests();
});
