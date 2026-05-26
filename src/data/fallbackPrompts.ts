export type Category = 'opinion' | 'personal' | 'hypothetical' | 'explain' | 'wildcard' | 'freestyle'
export type Difficulty = 'easy' | 'medium' | 'hard'

export type Prompt = {
  id: string
  text: string
  category: Category
  difficulty: Difficulty
  isFreestyle: boolean
}

export type Filters = {
  category: Category | 'all'
  difficulty: Difficulty | 'all'
}

export const fallbackPrompts: Prompt[] = [
  // Opinion
  { id: 'op1', text: 'Should schools assign homework?', category: 'opinion', difficulty: 'easy', isFreestyle: false },
  { id: 'op2', text: 'Is breakfast really the most important meal of the day?', category: 'opinion', difficulty: 'easy', isFreestyle: false },
  { id: 'op3', text: 'Is expertise overrated in the age of search engines?', category: 'opinion', difficulty: 'medium', isFreestyle: false },
  { id: 'op4', text: 'Should social media platforms be held liable for their content?', category: 'opinion', difficulty: 'medium', isFreestyle: false },
  { id: 'op5', text: 'Is remote work better or worse for society overall?', category: 'opinion', difficulty: 'medium', isFreestyle: false },
  { id: 'op6', text: "Pick a hill you'd die on and defend it.", category: 'opinion', difficulty: 'hard', isFreestyle: false },
  { id: 'op7', text: 'Argue that a widely held moral belief in your community is actually wrong.', category: 'opinion', difficulty: 'hard', isFreestyle: false },
  { id: 'op8', text: 'Is meritocracy a myth? Defend your position.', category: 'opinion', difficulty: 'hard', isFreestyle: false },

  // Personal
  { id: 'pe1', text: "Describe a skill you wish you'd learned earlier.", category: 'personal', difficulty: 'easy', isFreestyle: false },
  { id: 'pe2', text: 'Talk about a place that feels like home to you.', category: 'personal', difficulty: 'easy', isFreestyle: false },
  { id: 'pe3', text: 'Talk about a time you were completely wrong.', category: 'personal', difficulty: 'medium', isFreestyle: false },
  { id: 'pe4', text: 'Describe a moment that changed how you see yourself.', category: 'personal', difficulty: 'medium', isFreestyle: false },
  { id: 'pe5', text: 'Talk about a relationship that shaped who you are.', category: 'personal', difficulty: 'medium', isFreestyle: false },
  { id: 'pe6', text: "What's a belief you hold that most people in your life would disagree with?", category: 'personal', difficulty: 'hard', isFreestyle: false },
  { id: 'pe7', text: 'Describe the version of yourself you are most ashamed of.', category: 'personal', difficulty: 'hard', isFreestyle: false },
  { id: 'pe8', text: "What would your life look like if you'd made the opposite choice at a pivotal moment?", category: 'personal', difficulty: 'hard', isFreestyle: false },

  // Hypothetical
  { id: 'hy1', text: 'If you could live in any decade of the past, which would you choose and why?', category: 'hypothetical', difficulty: 'easy', isFreestyle: false },
  { id: 'hy2', text: 'If you could have dinner with any person alive today, who and why?', category: 'hypothetical', difficulty: 'easy', isFreestyle: false },
  { id: 'hy3', text: "You have 48 hours to redesign your city's transit system — what's your first call?", category: 'hypothetical', difficulty: 'medium', isFreestyle: false },
  { id: 'hy4', text: 'You wake up with the ability to make one law that everyone must follow. What is it?', category: 'hypothetical', difficulty: 'medium', isFreestyle: false },
  { id: 'hy5', text: 'A time capsule will be opened in 100 years. What do you put in it and why?', category: 'hypothetical', difficulty: 'medium', isFreestyle: false },
  { id: 'hy6', text: "Humanity must leave Earth in 10 years. You're on the logistics committee.", category: 'hypothetical', difficulty: 'hard', isFreestyle: false },
  { id: 'hy7', text: 'You can eliminate one human cognitive bias from all of humanity. Which one?', category: 'hypothetical', difficulty: 'hard', isFreestyle: false },
  { id: 'hy8', text: "You are given control of the world's education system for one year. What changes?", category: 'hypothetical', difficulty: 'hard', isFreestyle: false },

  // Explain
  { id: 'ex1', text: 'Explain compound interest using only a story.', category: 'explain', difficulty: 'easy', isFreestyle: false },
  { id: 'ex2', text: 'Explain what a habit is to someone who has never heard the word.', category: 'explain', difficulty: 'easy', isFreestyle: false },
  { id: 'ex3', text: 'Explain why humans need sleep without using any scientific jargon.', category: 'explain', difficulty: 'medium', isFreestyle: false },
  { id: 'ex4', text: 'Explain how the internet works using only physical-world analogies.', category: 'explain', difficulty: 'medium', isFreestyle: false },
  { id: 'ex5', text: 'Explain why diversity makes groups smarter — use a story or metaphor.', category: 'explain', difficulty: 'medium', isFreestyle: false },
  { id: 'ex6', text: 'Explain the concept of entropy to a ten-year-old using three concrete examples.', category: 'explain', difficulty: 'hard', isFreestyle: false },
  { id: 'ex7', text: 'Explain why democracy sometimes produces bad outcomes, without making it sound like democracy is bad.', category: 'explain', difficulty: 'hard', isFreestyle: false },
  { id: 'ex8', text: 'Explain consciousness as if the listener has never experienced being confused before.', category: 'explain', difficulty: 'hard', isFreestyle: false },

  // Wildcard
  { id: 'wc1', text: "Give a TED talk about why Mondays deserve more respect.", category: 'wildcard', difficulty: 'easy', isFreestyle: false },
  { id: 'wc2', text: 'Describe your morning routine as if it were an epic quest.', category: 'wildcard', difficulty: 'easy', isFreestyle: false },
  { id: 'wc3', text: 'Give a eulogy for the concept of boredom.', category: 'wildcard', difficulty: 'medium', isFreestyle: false },
  { id: 'wc4', text: "Defend the most mundane object near you as humanity's greatest invention.", category: 'wildcard', difficulty: 'medium', isFreestyle: false },
  { id: 'wc5', text: "Pitch a new national holiday and explain why it's desperately needed.", category: 'wildcard', difficulty: 'medium', isFreestyle: false },
  { id: 'wc6', text: 'Explain the rules of human society to a highly intelligent alien who has never seen Earth.', category: 'wildcard', difficulty: 'hard', isFreestyle: false },
  { id: 'wc7', text: 'You are a grain of sand. Narrate your life story.', category: 'wildcard', difficulty: 'hard', isFreestyle: false },
  { id: 'wc8', text: 'Argue that the concept of time is the most destructive invention in human history.', category: 'wildcard', difficulty: 'hard', isFreestyle: false },

  // Freestyle
  { id: 'fs1', text: 'Coffee', category: 'freestyle', difficulty: 'easy', isFreestyle: true },
  { id: 'fs2', text: 'Airports', category: 'freestyle', difficulty: 'easy', isFreestyle: true },
  { id: 'fs3', text: 'Momentum', category: 'freestyle', difficulty: 'easy', isFreestyle: true },
  { id: 'fs4', text: 'Nostalgia', category: 'freestyle', difficulty: 'easy', isFreestyle: true },
  { id: 'fs5', text: 'Silence', category: 'freestyle', difficulty: 'easy', isFreestyle: true },
  { id: 'fs6', text: 'The second before you fall asleep', category: 'freestyle', difficulty: 'medium', isFreestyle: true },
  { id: 'fs7', text: 'Almost remembering', category: 'freestyle', difficulty: 'medium', isFreestyle: true },
  { id: 'fs8', text: 'Tuesday at 3pm', category: 'freestyle', difficulty: 'easy', isFreestyle: true },
]
