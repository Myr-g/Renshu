const home_toggle = document.getElementById("home_toggle");
const theme_toggle = document.getElementById("theme_toggle");
const theme_label = document.getElementById("theme_label");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  theme_label.textContent = theme === "light" ? "Light" : "Dark";
}

const savedTheme = localStorage.getItem("theme");
applyTheme(savedTheme || "light");

theme_toggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
});