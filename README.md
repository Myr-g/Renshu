# Creative Writing Practice App
A simple, cozy space for writers to practice their craft.

## Overview
The Creative Writing Practice App is a browser‑based tool for writers to draft stories, explore prompts, and practice their craft. You can start a new story, choose a genre, generate prompts, write freely, and save your work locally.

The app now supports real‑time collaborative writing through WebSockets, letting multiple writers work together smoothly in a shared editor. The prompt generator has expanded with new templates, word banks, and challenge modes, and the community workshop introduces a lightweight, anonymous space for sharing stories and exchanging feedback.

Long‑term, the project aims to grow into a more flexible platform with deeper customization and an even more powerful prompt system.

## Story Writing Experience
- The home screen begins with a blank story card — clicking it instantly opens a new, untitled story.

- Inside the editor, writers can:

  - Rename the story

  - Write freely in a cozy environment

  - Change the story settings (gear icon) to adjust Genre, Story Type (Solo or Collaborative), and Prompt Type (None, Template, Challenge, or Community)

- Stories support autosave and manual save

- Writers can download their work as .txt or .pdf files

- All stories are stored locally, with the ability to resume or delete them at any time

## Community 
### Writing Workshop
An anonymous space where writers can share stories and exchange constructive feedback.

**How It Works**
- Stories posted for review are anonymous — no accounts, likes, etc

- Each story includes three tag categories:
  - Genre
 
  - Content Warning
 
  - Story Type

- Authors can attach feedback notes describing what they would like reviewers to focus on

- Stories posted are up for review for one week before being automatically deleted

- Feedback is given through comments only (section-highliting being considered)

- Authors can block specific reviewers locally by clicking on their name in case of spamming or harassment

- Authors can download all feedback on their stories as a .txt file

## Prompt Submissions
A space where wriers can contribute new ideas to help expand the app's prompt system.

### Simple Prompts
Standalone prompts, challenges, or scenario ideas. These are quick to review and easy to add to the app

**Examples:**
- Write a scene where two characters argue without raising their voices

- A traveler arrives in a town that doesn’t appear on any map.

### Generator Contributions

More complex additions that are integrated directly into the prompt generator's logic.
These include:
- New Templates

- New Word Banks

- New Genre Banks

- New Challenge Banks

Because they affect generator behavior, these submissions require more careful treview to ensure the follow the generator's formatting rules and structure.

## Future Plans
The core experience of the app is done, but a few things are in mind for future updates.

### Editor Customization
Personalizing the writing environment to better match each writer's preferences

**Core Options:**
- Font family & size
- Editor Width
- Line height & spacing
- Paragraph spacing
- More themes

**Advanced Options:**
- Background styles (solid colors, gradients, images, etc.)
- Writing panel styling
- Accents
- Prompt display options
- 
### Prompt Generator Expansion
- More genre banks

- More templates and challenge structures

## Run Locally
```
cd web-app
npm install
npm start
```

Visit: http://localhost:8080
