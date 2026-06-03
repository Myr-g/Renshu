import { getStory, saveStory as saveStorySM } from "../utils/story_manager.js";
import { loadGenres } from "./genres/genres.js";
import { loadPromptGeneratorData, generatePrompt as generatePromptPG, generateChallengePrompt } from "./prompt_generator/prompt_generator.js";
import { formatStoryToTxt } from "./download/txt_export.js";
import { formatStoryToPdf } from "./download/pdf_export.js";

/*---- DOM Elements ----*/
const page_name = document.getElementById("title");
const story_title = document.getElementById("story_title");

const settings_toggle = document.getElementById("settings_toggle");
const story_settings = document.getElementById("story_settings");
const story_genre = document.getElementById("genre");
const story_type_toggle = document.getElementById("story_type_toggle");
const solo_toggle = document.getElementById("solo_toggle");
const collaborative_toggle = document.getElementById("collaborative_toggle");

const story_prompt = document.getElementById("story_prompt");
const prompt_text = document.getElementById("prompt_text");
const regen_button = document.getElementById("regenerate_prompt");

const story_content = document.getElementById("story_content");
const back_button = document.getElementById("back_button");
const save_button = document.getElementById("save_story");
const save_icon = document.getElementById("save_icon");
const save_text = document.getElementById("save_text");
const download_button = document.getElementById("download_story");
const download_menu = document.getElementById("download_menu");
const txt_download_button = document.getElementById("txt_download");
const pdf_download_button = document.getElementById("pdf_download");

/*---- Variables ----*/
let regenerationDisabled = false;
let isExiting = false;
let autosaveTimeout;
let saving = false;
let isDirty = false;
let saveTextTimeout;

/* Back Button*/
back_button.addEventListener("click", async () => {
  if(isDirty)
  {
    const ok = confirm("You have unsaved changes. Leave anyway?");

    if(!ok)
    {
      return;
    }
  }

  isExiting = true;

  localStorage.removeItem("storyId");
  window.location.href = "/";
  isExiting = false;
});

/* Updating Story Title */
story_title.addEventListener("blur", updateTitle);

story_title.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    story_title.blur();
    updateTitle();
  }
});

function updateTitle()
{
    const storyId = localStorage.getItem("storyId");    
    const story = getStory(storyId);
    
    let updatedTitle = story_title.textContent.trim();
    
    if(updatedTitle.length === 0) 
    {
        updatedTitle = "Untitled";
    }
    
    story.title = updatedTitle;
    page_name.textContent = updatedTitle;
    story_title.textContent = updatedTitle;
    
    saveStorySM(story);
}

/* Story Settings Menu */

/* Opening/Closing */
settings_toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    
    story_settings.classList.toggle("open");

    if(story_settings.classList.contains("open")) 
    {
        const rect = settings_toggle.getBoundingClientRect();
        story_settings.style.left = `${rect.right - 400}px`;
        story_settings.style.top = `${rect.bottom - 175}px`;
  }
});

document.addEventListener("click", (e) => {
    e.stopPropagation();

    if(!story_settings.contains(e.target) && e.target !== settings_toggle) 
    {
        story_settings.classList.remove("open");
    }

    if(!download_menu.contains(event.target) && event.target !== download_button) 
    {
        download_menu.classList.remove("open");
    }
});

/* Genre */
async function loadGenreList()
{
  const genres = await loadGenres();

  story_genre.length = 1;

  for(const genre of genres)
  {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre.trim();
    story_genre.appendChild(option);
  }
}

story_genre.addEventListener("change", () => {
    const storyId = localStorage.getItem("storyId");
    const story = getStory(storyId);

    story.genre = story_genre.value;

    saveStorySM(story);
});


/* Story Type */
story_type_toggle.addEventListener("click", () => {
    const storyId = localStorage.getItem("storyId");    
    const story = getStory(storyId);

    if(solo_toggle.classList.contains("active"))
    {
        solo_toggle.classList.toggle("active");
        collaborative_toggle.classList.toggle("active");
        story.type = "collaborative";
        saveStorySM(story);
    }

    else
    {
        solo_toggle.classList.toggle("active");
        collaborative_toggle.classList.toggle("active");
        story.type = "solo";
        saveStorySM(story);
    }
});

/* Prompt Type */
const prompt_type_toggles = document.querySelectorAll(".prompt_type");

prompt_type_toggles.forEach(toggle => {
  toggle.addEventListener("click", () => {
    const type = toggle.dataset.type;

    prompt_type_toggles.forEach(t => t.classList.remove("active"));
    toggle.classList.add("active");

    const storyId = localStorage.getItem("storyId");
    const story = getStory(storyId);
    story.promptType = type;

    if(type !== "none")
    {
        story_prompt.hidden = false;
        story_prompt.classList.add("show");
        const prompt = generatePrompt(type);
        story.prompt = prompt;
        prompt_text.textContent = prompt;

        if(type === "challenge")
        {
            prompt_text.innerHTML = prompt_text.textContent.replace(/\n/g, "<br>");
        }
    }

    else
    {
        story_prompt.hidden = true;
    }

    saveStorySM(story);
  });
});


/*---- Prompt ----*/
regen_button.addEventListener("click", async () => {
    const storyId = localStorage.getItem("storyId");
    const story = getStory(storyId);

    const prompt = generatePrompt(story.promptType);
    story.prompt = prompt;
    prompt_text.textContent = prompt;

    if(story.promptType === "challenge")
    {
        prompt_text.innerHTML = prompt_text.textContent.replace(/\n/g, "<br>");
    }

    saveStorySM(story);
});

function generatePrompt(source)
{
  if(regenerationDisabled)
  {
    return;
  }

  regen_button.disabled = true;
  const icon = regen_button.querySelector('svg')
  icon.classList.add('spin');

  const storyId = localStorage.getItem("storyId");
  const story = getStory(storyId);
  const genre = story.genre;
  let prompt = "";

  if(source === "template")
  {
    prompt = generatePromptPG(genre);
  }

  else if(source === "challenge")
  {
    prompt = generateChallengePrompt(genre);
  }

  if(!regenerationDisabled) 
  {
    regen_button.disabled = false;
    regen_button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none" />
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
            <path d="M20.5 8c-1.392-3.179-4.823-5-8.522-5C7.299 3 3.453 6.552 3 11.1" />
            <path d="M16.489 8.4h3.97A.54.54 0 0 0 21 7.86V3.9M3.5 16c1.392 3.179 4.823 5 8.522 5c4.679 0 8.525-3.552 8.978-8.1" />
            <path d="M7.511 15.6h-3.97a.54.54 0 0 0-.541.54v3.96" />
        </g>
    </svg>`;
  }

  return prompt;
}

/*--- Saving ----*/
// Manual save
save_button.addEventListener("click", async () => {
  clearTimeout(autosaveTimeout);
  saveStory();
});

// Autosave
story_content.addEventListener("input", async () => {
  if(!isDirty)
  {
    isDirty = true;
    showSaveStatus("saving...");
  }
  
  clearTimeout(autosaveTimeout);

  autosaveTimeout = setTimeout(() => {
    saveStory();
  }, 1500);
});

function saveStory()
{
  if(saving)
  {
    return;
  }

  saving = true;

  const storyId = localStorage.getItem("storyId");
  const text = story_content.value;

  if(!storyId)
  {
    console.error("Story ID not found.")
    showSaveStatus("save failed");
    saving = false;
    return;
  }

  const story = getStory(storyId);

  if(!story)
  {
    console.error("Story not found.");
    showSaveStatus("save failed");
    saving = false;
    return;
  }

  story.content = text;

  saveStorySM(story);
  console.log("Story Updated");

  isDirty = false;

  showSaveStatus("saved");

  if(story.promptLocked && !regenerationDisabled)
  {
    regenerationDisabled = true;
    regen_button.disabled = true;
    document.querySelectorAll(".prompt_type").forEach(toggle => {
        toggle.disabled = true;
        toggle.classList.add("locked");
    });
  }

  saving = false;
}

function showSaveStatus(message)
{
  save_icon.classList.remove("saving");
  save_text.classList.remove("hidden");
  clearTimeout(saveTextTimeout);

  if(message === "saved")
  {
    save_icon.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M8 12.5l2.5 2.5L16 9.5"/>
    </svg>`;
    save_text.textContent = message;
    
    saveTextTimeout = setTimeout(() => {
      save_text.classList.add("hidden");
      setTimeout(() => {
        save_text.textContent = "";
      }, 250);
    }, 2000);
  }

  else if(message === "saving...")
  {
    save_icon.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9" stroke-opacity="0.25" />
      <path d="M12 3a9 9 0 0 1 9 9" />
    </svg>`;
    const icon = save_icon.querySelector("svg");
    icon.classList.add("spin");
    save_text.textContent = message;
  }

  else
  {
    save_icon.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M9 9l6 6"/>
      <path d="M15 9l-6 6"/>
    </svg>`;
    save_text.textContent = message;
  }
}

download_button.addEventListener("click", (event) => {
  event.stopPropagation();

  download_menu.classList.toggle("open");
});

txt_download_button.addEventListener("click", (event) => {
  event.stopPropagation();
  
  const storyId = localStorage.getItem("storyId");

  const story = getStory(storyId);

  if(!story)
  {
    return;
  }

  const blob = formatStoryToTxt(story);

  let filename = story.title.replace(/[\\\/:*?"<>|]/g, "");

  if(!filename)
  {
    filename = "story";
  }

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.txt`;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 100);
  download_menu.classList.remove("open");
});

pdf_download_button.addEventListener("click", async (event) => {
  event.stopPropagation();
  
  const storyId = localStorage.getItem("storyId");

  const story = getStory(storyId);

  if(!story)
  {
    return;
  }

  const blob = await formatStoryToPdf(story);

  let filename = story.title.replace(/[\\\/:*?"<>|]/g, "");

  if(!filename)
  {
    filename = "story";
  }

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.pdf`;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 100);
  download_menu.classList.remove("open");
});

window.addEventListener("beforeunload", (e) => {
  if(isExiting)
  {
    return;
  }
  
  if(!isDirty)
  {
    return;
  }

  e.preventDefault();
  e.returnValue = "";
});

/*---- On Page Load/Refresh ----*/
window.addEventListener("DOMContentLoaded", async () => {
  const storyId = localStorage.getItem("storyId");

  if(!storyId)
  {
    window.location.href = "/";
    return;
  }

  const story = getStory(storyId);

  if(!story)
  {
    window.location.href = "/";
    return;
  }

  page_name.textContent = story.title;
  story_title.textContent = story.title;

  await loadGenreList();

  if(story.genre.trim() !== "")
  {
    story_genre.value = story.genre;
  }

  if(story.type === "solo")
  {
    solo_toggle.classList.add("active");
    collaborative_toggle.classList.remove("active");
  }

  else
  {
    solo_toggle.classList.remove("active");
    collaborative_toggle.classList.add("active");
  }

  await loadPromptGeneratorData();

  prompt_type_toggles.forEach(toggle => {
    if(toggle.dataset.type === story.promptType)
    {
        toggle.classList.add("active");
    }

    else
    {
        toggle.classList.remove("active");
    }
  });
  
  if(story.promptType === "none")
  {
    regenerationDisabled = true;
    regen_button.disabled = true;
    regen_button.hidden = true;
  }

  else
  {
    if(!story.prompt && !regenerationDisabled)
    {
        const prompt = generatePrompt(story.promptType);
        story.prompt = prompt;
    }

    prompt_text.textContent = story.prompt;

    if(story.promptType === "challenge")
    {
      prompt_text.innerHTML = prompt_text.textContent.replace(/\n/g, "<br>");
    }
  }

  regenerationDisabled = story.promptLocked;

  if(regenerationDisabled && regen_button)
  {
    regen_button.disabled = true;
    document.querySelectorAll(".prompt_type").forEach(toggle => {
        toggle.disabled = true;
        toggle.classList.add("locked");
    });
  }

  story_content.value = story.content;
});
