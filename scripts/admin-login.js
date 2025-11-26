const API_BASE = "https://balajan-back.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorMsg = document.getElementById("error");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMsg.style.display = "none";

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) return;

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",     // сохраняем куки сессии
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                // успех — идём в админку
                window.location.href = "admin-dashboard.html";
                return;
            }

            // неуспех (401/500/что-то) — показываем сообщение
            console.error("Login failed:", res.status, await res.text());
            errorMsg.style.display = "block";

        } catch (err) {
            console.error("Login request error:", err);
            errorMsg.textContent = "Ошибка соединения с сервером.";
            errorMsg.style.display = "block";
        }
    });
});
