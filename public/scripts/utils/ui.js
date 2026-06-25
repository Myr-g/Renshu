const sidebar = document.getElementById("sidebar");
const sidebar_toggle = document.getElementById("sidebar-toggle");
const container = document.getElementById("container");
const home_toggle = document.getElementById("home-toggle");
const community_toggle = document.getElementById("community-toggle");
const theme_toggle = document.getElementById("theme-toggle");
const theme_label = document.getElementById("theme-label");

sidebar_toggle.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  container.classList.toggle("sidebar-collapsed");

  const sidebarCollapsed = sidebar.classList.contains("collapsed");
  localStorage.setItem("sidebarCollapsed", sidebarCollapsed ? "true" : "false");
});

home_toggle.addEventListener("click", () => {
  if(localStorage.getItem("storyId"))
  {
    localStorage.removeItem("storyId");
  }

  if(localStorage.getItem("workshopId"))
  {
    localStorage.removeItem("workshopId");
  }

  window.location.href = "/";
});

community_toggle.addEventListener("click", () => {
  if(localStorage.getItem("storyId"))
  {
    localStorage.removeItem("storyId");
  }

  if(localStorage.getItem("workshopId"))
  {
    localStorage.removeItem("workshopId");
  }

  window.location.href = "/community.html";
});

document.documentElement.getAttribute("data-theme") === "light" ? theme_label.textContent = "Light" : "Dark";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  theme_label.textContent = theme === "light" ? "Light" : "Dark";
}

theme_toggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
});

window.addEventListener("DOMContentLoaded", () => {
  const collapsed = localStorage.getItem("sidebarCollapsed") === "true";

  container.classList.add("no-transition");

  if(collapsed) 
  {
    sidebar.classList.add("collapsed");
    container.classList.add("sidebar-collapsed");
  }

  sidebar.style.display = "flex";
  container.style.visibility = "visible";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.classList.remove("no-transition");
    });
  });
});
