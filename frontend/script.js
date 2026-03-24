// frontend/script.js
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    const loginMsg = document.getElementById("loginMsg");
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginMsg.textContent = "";
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      try {
        const resp = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await resp.json();
        if (data.ok) {
          window.location.href = "/dashboard";
        } else {
          loginMsg.innerHTML = `<div class="alert alert-danger">${data.error || "Login failed."}</div>`;
        }
      } catch (err) {
        loginMsg.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
      }
    });
  }

  if (registerForm) {
    const registerMsg = document.getElementById("registerMsg");
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      registerMsg.textContent = "";
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value;
      try {
        const resp = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await resp.json();
        if (data.ok) {
          registerMsg.innerHTML = `<div class="alert alert-success">Account created. Please login.</div>`;
          setTimeout(() => (window.location.href = "/login.html"), 800);
        } else {
          registerMsg.innerHTML = `<div class="alert alert-danger">${data.error || "Registration failed."}</div>`;
        }
      } catch (err) {
        registerMsg.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
      }
    });
  }
});
