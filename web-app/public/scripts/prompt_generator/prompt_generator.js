/** 
 * Prompt Generator Guidelines
 * 
 * The purpose of the generator is to provide a structured variety of ideas for writers
 * to inspire creativity without fully detailing a story.
 * 
 * Templates should be grammatically flexible with multiple word banks, with decently-high reusability based on the word banks used.
 * General word banks should be flexible across a wide variety of genres without being too specific towards any one in particular.
 * Genre-specific word banks should reinforce tone without making prompts overly restrictive.
 * 
 * The resulting prompt should be generally open-ended, allowing writers to have full creative
 * freedom with what they choose to write about.
*/

/**
 * Templates should establish a narrative setup or tension, using placeholders that are
 * interchangable to ensure a wide variety of different combanations for a single template.
 * 
 * Placeholders should not have "a", "an", or "the" before them, as that would disrupt the
 * general flow of the template and lowers reusability. Instead, they should go inside the
 * word bank itself.
 * 
 * Templates should not expect highly-specific outputs for a word bank, and should generally
 * work with most entries and across any genre.
 */

/**
 * General word banks should work across multiple genres and avoid any overly-specific details. They
 * should be compatible with any template and encourage many different variations for any singular 
 * template.
 * 
 * Entries should be relatively short to ensure prompts read naturally.
 */

/**
 * Genre-specific word banks should be compatible with any template, while also reinforcing the tone 
 * and/or atmosphere of a given genre without making prompts too repetitive or predictable.
 * 
 * Add: expands on the general word banks, enhancing variability by providing entries
 * that are more specific to a given genre.
 * 
 * Override: replaces the general word banks that do not suit the given genre well,
 * providing a different tone or atmosphere compared to the corresponding general word bank.
 */

/**
 * Challenge prompts provide an alternative structure for prompts, giving only elements
 * of the story and a challenge rule.
 * 
 * Challenge rules are made with the intention of getting writers a bit out of their usual
 * comfort zones to enhance their writing by providing specific narrative styles, tropes, or
 * other constraints.
 * 
 * Challenge prompts are intentionally more restrictive than standard prompts.
 */

const data = {
  templates: null,
  general_word_banks: null,
  genre_specific_word_banks: null,
  challenge_rules: null
};

async function loadPromptGeneratorData()
{
  try
  {
    if(data.templates)
    {
      return;
    }

    const [templates, generalWordBanks, genreSpecificWordBanks, challengeRules] = await Promise.all([
      fetch('scripts/prompt_generator/templates.json').then(res => res.json()),
      fetch('scripts/prompt_generator/general_word_banks.json').then(res => res.json()),
      fetch('scripts/prompt_generator/genre_word_banks.json').then(res => res.json()),
      fetch('scripts/prompt_generator/challenge_rules.json').then(res => res.json())
    ]);

    data.templates = templates;
    data.general_word_banks = generalWordBanks;
    data.genre_specific_word_banks = genreSpecificWordBanks;
    data.challenge_rules = challengeRules;
  }

  catch(err)
  {
    console.error("Prompt generator data could not be loaded: ", err);
  }
}

function randomItem(array) 
{
  return array[Math.floor(Math.random() * array.length)];
}

function generatePrompt(genre)
{
  const template = randomItem(data.templates);
  
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const initial_word_bank = data.general_word_banks[key];
    let final_word_bank = initial_word_bank;

    if(!initial_word_bank)
    {
      return match;
    }

    if(genre && data.genre_specific_word_banks[genre])
    {
      if(data.genre_specific_word_banks[genre].override[key])
      {
        final_word_bank = data.genre_specific_word_banks[genre].override[key];
      }

      else if(data.genre_specific_word_banks[genre].add[key])
      {
        final_word_bank = [...initial_word_bank, ...data.genre_specific_word_banks[genre].add[key]];
      }
    }

    return randomItem(final_word_bank);
  });
}

function generateChallengePrompt(genre)
{
  let subject = Math.random() < 0.5 ? "{character_adj} {character}" : "{object}";
  let tension = Math.random() < 0.5 ? "{condition}" : "{strange_event}";
  const challenge_rule = randomItem(data.challenge_rules);

  const template = `Write a short story or scene that:\n` +
  `- includes ${subject}\n` +
  `- takes place {location}\n` +
  `- includes an element where ${tension}\n- rule: ${challenge_rule}`;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const initial_word_bank = data.general_word_banks[key];
    let final_word_bank = initial_word_bank;

    if(!initial_word_bank)
    {
      return match;
    }

    if(genre && data.genre_specific_word_banks[genre])
    {
      if(data.genre_specific_word_banks[genre].override[key])
      {
        final_word_bank = data.genre_specific_word_banks[genre].override[key];
      }

      else if(data.genre_specific_word_banks[genre].add[key])
      {
        final_word_bank = [...initial_word_bank, ...data.genre_specific_word_banks[genre].add[key]];
      }
    }

    return randomItem(final_word_bank);
  });
}

export {loadPromptGeneratorData, generatePrompt, generateChallengePrompt};