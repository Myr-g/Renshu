const home_toggle = document.getElementById("home_toggle");
const community_toggle = document.getElementById("community_toggle");
const theme_toggle = document.getElementById("theme_toggle");
const theme_label = document.getElementById("theme_label");

home_toggle.addEventListener("click", () => {
  if(localStorage.getItem("storyId"))
  {
    localStorage.removeItem("storyId");
    window.location.href = "/";
  }

  else
  {
    window.location.href = "/";
  }
});

community_toggle.addEventListener("click", () => {
  if(localStorage.getItem("storyId"))
  {
    localStorage.removeItem("storyId");
    window.location.href = "/community.html";
  }

  else
  {
    window.location.href = "/community.html";
  }
});

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  theme_label.textContent = theme === "light" ? "Light" : "Dark";
}

const savedTheme = localStorage.getItem("theme");
applyTheme(savedTheme || "dark");

theme_toggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
});