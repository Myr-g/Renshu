import { loadFilters } from "./filters/filter_tags.js";

generateReviewerId();

function generateReviewerId()
{
    if(localStorage.getItem("reviewerId"))
    {
        return;
    }

    localStorage.setItem("reviewerId", "reviewer_" + crypto.randomUUID());
}

await loadFilterPanel();

async function loadFilterPanel()
{
    const filters = await loadFilters();

    const panel = document.getElementById("filter_panel");
    panel.innerHTML = "";

    for(const [category, tags] of Object.entries(filters))
    {
        const row = document.createElement("div");
        row.classList.add("filter_row");

        const label = document.createElement("label");
        label.classList.add("filter_label");
        label.textContent = category;

        const tagContainer = document.createElement("div");
        tagContainer.classList.add("filter_tags");

        for(const tag of tags)
        {
            const btn = document.createElement("button");
            btn.classList.add("filter_tag");
            btn.textContent = tag;
            tagContainer.appendChild(btn);
        }

        row.appendChild(label);
        row.appendChild(tagContainer);
        panel.appendChild(row);
    }
}

const toggle = document.getElementById('filter_toggle');
const panel = document.getElementById('filter_panel');
const filter_tag = document.getElementById("filter_tag");

toggle.addEventListener('click', () => {
  panel.classList.toggle('expanded');
  toggle.textContent = panel.classList.contains('expanded') ? "Hide Filters" : "Show Filters";
});


