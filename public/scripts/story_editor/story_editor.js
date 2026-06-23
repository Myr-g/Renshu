import { getStory, saveStory as saveStorySM } from "../utils/story_manager.js";
import { loadGenres } from "./genres/genres.js";
import { loadPromptGeneratorData, generatePrompt as generatePromptPG, generateChallengePrompt } from "./prompt_generator/prompt_generator.js";
import { formatStoryToTxt } from "./download/txt_export.js";
import { formatStoryToPdf } from "./download/pdf_export.js";

/*---- DOM Elements ----*/
const page_name = document.getElementById("title");
const story_title = document.getElementById("story-title");

const settings_toggle = document.getElementById("settings-toggle");
const story_settings = document.getElementById("story-settings");
const story_genre = document.getElementById("genre");
const story_type_toggle = document.getElementById("story-type-toggle");
const solo_toggle = document.getElementById("solo-toggle");
const collaborative_toggle = document.getElementById("collaborative-toggle");

const story_prompt = document.getElementById("story-prompt");
const prompt_text = document.getElementById("prompt-text");
const regen_button = document.getElementById("regenerate-prompt");

const story_content = document.getElementById("story-content");
const back_button = document.getElementById("back-button");
const save_button = document.getElementById("save-story");
const save_icon = document.getElementById("save-icon");
const save_text = document.getElementById("save-text");
const download_button = document.getElementById("download-story");
const download_menu = document.getElementById("download-menu");
const txt_download_button = document.getElementById("txt-download");
const pdf_download_button = document.getElementById("pdf-download");

/*---- Variables ----*/
let story = null;
let regenerationDisabled = false;
let isExiting = false;
let autosaveTimeout;
let saving = false;
let isDirty = false;
let saveTextTimeout;
let socket = null;

generateWriterId();

function generateWriterId()
{
  if(localStorage.getItem("writerId"))
  {
    return;
  }

  localStorage.setItem("writerId", "writer_" + crypto.randomUUID());
}

function getLocalStory()
{
  const storyId = localStorage.getItem("storyId"); 
  
  if(!storyId)
  {
    return null;
  }

  const story = getStory(storyId);

  if(!story)
  {
    return null;
  }

  return story;
}

async function getCollaborativeStory()
{
  const storyId = window.location.pathname.split('/')[2];

  const res = await fetch(`/collaborative-stories/${storyId}`);
  
  if(!res.ok)
  {
    console.log("Collaborative story not found.");
    return null;
  }
  
  const data = await res.json();
  return data;
}

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
  let updatedTitle = story_title.textContent.trim();
    
  if(updatedTitle.length === 0) 
  {
    updatedTitle = "Untitled";
  }
    
  story.title = updatedTitle;
  page_name.textContent = updatedTitle;
  story_title.textContent = updatedTitle;
    
  saveStory();
}

/* Story Settings Menu */

/* Opening/Closing */
settings_toggle.addEventListener("click", (event) => {
  event.stopPropagation();
    
  story_settings.classList.toggle("open");
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
  story.genre = story_genre.value;

  saveStory();
});

/* Story Type */
story_type_toggle.addEventListener("click", async() => {
  if(solo_toggle.classList.contains("active"))
  {
    try 
    {
      const res = await fetch(`/collaborative-stories/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({story})
      });

      if(res.status === 400)
      {
        console.error("Invalid collaborative story creation request:", res.status);
        return;
      }

      const data = await res.json();
      console.log(data);

      solo_toggle.classList.toggle("active");
      collaborative_toggle.classList.toggle("active");

      story.type = "collaborative";
      saveStorySM(story);

      window.location.href = data.join_url;
    } 
  
    catch(err) 
    {
      console.error("Network error:", err);
    }
  }
});

/* Prompt Type */
const prompt_type_toggles = document.querySelectorAll(".prompt_type");

prompt_type_toggles.forEach(toggle => {
  toggle.addEventListener("click", () => {
    const type = toggle.dataset.type;

    prompt_type_toggles.forEach(t => t.classList.remove("active"));
    toggle.classList.add("active");

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

      regen_button.style.display = "";
    }

    else
    {
      story_prompt.hidden = true;
      prompt_text.innerHTML = "";
      regen_button.style.display = "none";
    }

    saveStory();
  });
});

/*---- Prompt ----*/
regen_button.addEventListener("click", async () => {
    const prompt = generatePrompt(story.promptType);
    story.prompt = prompt;
    prompt_text.textContent = prompt;

    if(story.promptType === "challenge")
    {
        prompt_text.innerHTML = prompt_text.textContent.replace(/\n/g, "<br>");
    }

    saveStory();
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

function saveLocalStory()
{
  const text = story_content.value;
  story.content = text;

  saveStorySM(story);

  isDirty = false;
}

async function saveCollaborativeStory()
{
  const text = story_content.value;
  story.content = text;

  const res = await fetch(`/collaborative-stories/${story.id}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({story})
  });

  if(res.status === 400)
  {
    console.error("Invalid collaborative story update request: ", res.status);
    return;
  }

  isDirty = false;

  // Send update from socket to rest of session
  socket.send(JSON.stringify({ type: "update", storyId: story.id, content: text }));
}

async function saveStory()
{
  if(saving)
  {
    return;
  }

  saving = true;

  if(story.type === "solo")
  {
    saveLocalStory();
  }

  else
  {
    await saveCollaborativeStory();
  }

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

/*---- Downloading ----*/
download_button.addEventListener("click", (event) => {
  event.stopPropagation();

  download_menu.classList.toggle("open");
});

txt_download_button.addEventListener("click", (event) => {
  event.stopPropagation();

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
  const path = window.location.pathname;

  if(path.startsWith("/collaborative/")) 
  {
    story = await getCollaborativeStory();

    if(!story)
    {
      window.location.href = "/";
      return;
    }

    socket = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`);

    socket.addEventListener("open", () => {
      console.log("Socket connected");
      socket.send(JSON.stringify({ type: "join", storyId: story.id, userId: localStorage.getItem("writerId") }));
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if(data.type === "update") 
      {
        story_content.value = data.content;
      }
   });

    socket.addEventListener("close", () => {
      console.log("Socket disconnected");
    });
  }

  else
  {
    story = getLocalStory();

    if(!story)
    {
      window.location.href = "/";
      return;
    }

    if(story.type === "collaborative")
    {
      window.location.href = `/collaborative/${story.id}`;
      return;
    }
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

  else if(story.type === "collaborative")
  {
    solo_toggle.disabled = true;
    solo_toggle.classList.remove("active");
    solo_toggle.classList.add("locked");

    collaborative_toggle.disabled = true;
    collaborative_toggle.classList.add("active");
    collaborative_toggle.classList.add("locked");
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

    regen_button.style.display = "";
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
