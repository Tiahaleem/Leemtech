document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");
  const submitBtn = form.querySelector(".login-bth");

  // If already logged in, skip straight to the dashboard.
  if (localStorage.getItem("leemtech_admin_token")) {
    window.location.href = "dashboard.html";
    return;
  }

  // Show/hide password toggle
  const passwordInput = document.getElementById("loginPassword");
  const toggleBtn = document.getElementById("togglePassword");
  const eyeIcon = toggleBtn.querySelector(".icon-eye");
  const eyeOffIcon = toggleBtn.querySelector(".icon-eye-off");

  toggleBtn.addEventListener("click", () => {
    const isCurrentlyText = passwordInput.type === "text";
    passwordInput.type = isCurrentlyText ? "password" : "text";
    eyeIcon.style.display = isCurrentlyText ? "block" : "none";
    eyeOffIcon.style.display = isCurrentlyText ? "none" : "block";
    toggleBtn.setAttribute("aria-label", isCurrentlyText ? "Show password" : "Hide password");
    toggleBtn.setAttribute("aria-pressed", String(!isCurrentlyText));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const email = document.getElementById("loginEmail").value.trim();
    const password = passwordInput.value;

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      localStorage.setItem("leemtech_admin_token", data.access_token);
      localStorage.setItem("leemtech_admin_email", data.user.email);
      window.location.href = "dashboard.html";
    } catch (err) {
      errorEl.textContent = err.message || "Something went wrong. Please try again.";
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  });
});