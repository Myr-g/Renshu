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
const templates = [
  `{character_adj} {character} discovers {object} {location}, but {condition}.`,
  `{character_adj} {character} receives {object} with a message that reads: "{message}".`,
  '{character_adj} {character} must {goal}, but {secondary_character} is trying to stop them.',
  `before {event}, {character_adj} {character} must {goal}, or {consequence}.`,
  `{character_adj} {character} and {secondary_character} both want {object}, but {condition}.`,
  `after discovering {object}, {character_adj} {character} makes a rash decision—but {condition}.`,
  `when {strange_event} {location}, everybody ignores it—except {character_adj} {character}.`,
  `{character_adj} {character} realizes {condition}, and must decide whether or not to {goal}.`,
  `when {object} appears {location}, {character_adj} {character} is forced to {goal}.`,
  `everyone believes {condition}, but {character_adj} {character} knows the truth.`
];

/**
 * General word banks should work across multiple genres and avoid any overly-specific details. They
 * should be compatible with any template and encourage many different variations for any singular 
 * template.
 * 
 * Entries should be relatively short to ensure prompts read naturally.
 */
const general_word_banks = {
  character: [
    "traveler",
    "survivor",
    "detective",
    "college student",
    "journalist",
    "merchant",
    "scientist",
    "artist",
    "librarian",
    "messenger",
    "teacher",
    "musician",
    "author",
    "photographer",
    "athlete",
    "programmer",
    "witness",
    "suspect"
  ],

  character_adj: [
    "a young",
    "an experienced",
    "a quiet",
    "a curious",
    "a disgraced",
    "a paranoid",
    "an obsessive",
    "an overly ambitious",
    "a sleep-deprived",
    "a guilt-ridden"
  ],

  secondary_character: [
    "a rival",
    "an old friend",
    "a mysterious stranger",
    "a former partner",
    "a childhood friend",
    "a traveling companion",
    "a curious journalist",
    "a determined investigator"
  ],

  object: [
    "a locked journal",
    "a strange key",
    "a sealed envelope",
    "an old photograph",
    "a broken watch",
    "a weathered map",
    "a small wooden box",
    "a glass bottle",
    "a faded diary",
    "a mysterious coin",
    "an antique compass",
    "a bundle of letters"
  ],

  location: [
    "in an abandoned town",
    "in a quiet village",
    "in a crowded marketplace",
    "on a lonely road",
    "inside of a forgotten library",
    "inside of an isolated cabin",
    "in a small coastal town",
    "in a narrow alley",
    "on a remote island",
    "inside an underground tunnel",
    "in a dusty attic",
    "at an old train station",
    "in a public park"
  ],

  event: [
    "sunrise",
    "noon",
    "midnight",
    "a town festival",
    "a sudden storm",
    "a citywide blackout",
    "a wedding",
    "a funeral",
    "an important meeting"
  ],

  strange_event: [
    "with each passing day, people feel lighter than before",
    "everyone forgets the same person",
    "people grow slightly less aware of one another each day",
    "reflections begin moving on their own",
    "someone they know disappears without a trace",
    "they begin hearing their own thoughts spoken aloud",
    "a stranger recognizes them—but they’ve never met",
    "they wake up with memories that aren’t theirs"
  ],

  message: [
    "You were not meant to find this",
    "Meet me before midnight",
    "Trust no one",
    "You were right all along",
    "Burn this after reading",
    "Someone is watching",
    "You must leave tonight",
    "It begins again"
  ],

  goal: [
    "deliver a message that could change everything",
    "uncover the truth behind a long-buried secret",
    "protect something that was never meant to be found",
    "reach the meeting point before it's too late",
    "escape before the situation turns deadly",
    "meet a contact who may not be trustworthy",
    "stay one step ahead of someone hunting them",
    "decipher a message no one else can understand",
    "find out who is really behind it all",
    "prove something everyone else denies",
    "track down someone who doesn’t want to be found",
    "figure out what’s real and what isn’t",
    "prevent a mistake that can’t be undone"
  ],

  condition: [
    "it's being kept hidden for a reason",
    "they may not survive long enough to understand it",
    "they're being watched",
    "every answer only leads to more questions",
    "it isn't what it first appeared to be",
    "they can’t trust their own memory",
    "they are being framed for something they didn’t do",
    "they’re already too late to stop what’s coming",
    "someone they trusted has betrayed them",
    "someone is manipulating what they think they know",
    "they can’t tell anyone what they’ve discovered"
  ]
};

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
const genre_specific_word_banks = {
  horror: {
    add: {
      character: [
        "mortician",
        "night guard",
        "medium",
        "psychologist",
        "paranormal investigator"
      ],

      object: [
        "an old tape recorder",
        "a blood-stained journal",
        "an antique doll",
        "a rusty crucifix"
      ],

      location: [
        "in an empty parking garage",
        "in an abandoned church",
        "at a cemetery covered in heavy fog"
      ],

      message: [
        "you shouldn't have come here",
        "you won't be alone much longer",
        "it's your turn now"
      ]
    },

    override: {
      strange_event: [
        "the lights start flickering in a constant rhythm",
        "the wind comes to a still",
        "shadows linger around longer than their owners"
      ]
    }
  }
};

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
const challenge_rules = [
  "don't use dialogue",
  "keep the story under 200 words",
  "write in first person",
  "use an unreliable narrator",
  "make the ending recontextualize the entire story",
  "focus on atmosphere over action",
  "imply conflict without directly stating it",
  "write the story as a journal entry",
  "do not name any characters",
  "end the story with an unanswered question"
]

function randomItem(array) 
{
  return array[Math.floor(Math.random() * array.length)];
}

function generatePrompt(genre)
{
  const template = randomItem(templates);
  
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const initial_word_bank = general_word_banks[key];
    let final_word_bank = initial_word_bank;

    if(!initial_word_bank)
    {
      return match;
    }

    if(genre && genre_specific_word_banks[genre])
    {
      if(genre_specific_word_banks[genre].override[key])
      {
        final_word_bank = genre_specific_word_banks[genre].override[key];
      }

      else if(genre_specific_word_banks[genre].add[key])
      {
        final_word_bank = [...initial_word_bank, ...genre_specific_word_banks[genre].add[key]];
      }
    }

    return randomItem(final_word_bank);
  });
}

function generateChallengePrompt(genre)
{
  let subject = Math.random() < 0.5 ? "{character_adj} {character}" : "{object}";
  let tension = Math.random() < 0.5 ? "{condition}" : "{strange_event}";
  const challenge_rule = randomItem(challenge_rules);

  const template = `Write a short story or scene that:\n` +
  `- includes ${subject}\n` +
  `- takes place {location}\n` +
  `- includes an element where ${tension}\n- rule: ${challenge_rule}`;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const initial_word_bank = general_word_banks[key];
    let final_word_bank = initial_word_bank;

    if(!initial_word_bank)
    {
      return match;
    }

    if(genre && genre_specific_word_banks[genre])
    {
      if(genre_specific_word_banks[genre].override[key])
      {
        final_word_bank = genre_specific_word_banks[genre].override[key];
      }

      else if(genre_specific_word_banks[genre].add[key])
      {
        final_word_bank = [...initial_word_bank, ...genre_specific_word_banks[genre].add[key]];
      }
    }

    return randomItem(final_word_bank);
  });
}

module.exports = {generatePrompt, generateChallengePrompt};