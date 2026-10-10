export interface TrackQuestion {
  id: string;
  category: string;
  question: string;
  hints?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface DailyTrack {
  id: string;
  name: string;
  icon: string;
  color: string;
  questions: TrackQuestion[];
}

// AI Career Track — Rotating Question Bank
const aiCareerQuestions: TrackQuestion[] = [
  // LangChain / LlamaIndex
  { id: 'lc-1', category: 'LangChain', question: 'Write a Python function using LangChain to create a RetrievalQA chain with a Chroma vector store. Include proper document loading and text splitting.', difficulty: 'intermediate' },
  { id: 'lc-2', category: 'LangChain', question: 'Explain the difference between LangChain\'s ConversationBufferMemory and ConversationSummaryMemory. When would you use each?', difficulty: 'beginner' },
  { id: 'lc-3', category: 'LangChain', question: 'Build a LangChain agent that can use both a calculator tool and a web search tool. Show the complete code with tool definitions.', difficulty: 'advanced' },
  { id: 'lc-4', category: 'LlamaIndex', question: 'Create a LlamaIndex SimpleDirectoryReader pipeline that indexes PDF documents and supports semantic search queries.', difficulty: 'intermediate' },
  { id: 'lc-5', category: 'LlamaIndex', question: 'What is the difference between LlamaIndex\'s VectorStoreIndex and TreeIndex? Provide use cases for each.', difficulty: 'beginner' },

  // Prompt Engineering
  { id: 'pe-1', category: 'Prompt Engineering', question: 'Design a system prompt for an AI that extracts structured JSON data from unstructured customer support emails. Include edge case handling.', difficulty: 'intermediate' },
  { id: 'pe-2', category: 'Prompt Engineering', question: 'Write a Python script that tests 10 different prompt variations against a set of 5 test cases and outputs an accuracy matrix.', difficulty: 'advanced' },
  { id: 'pe-3', category: 'Prompt Engineering', question: 'Explain chain-of-thought prompting vs few-shot prompting. Write an example of each for a math word problem.', difficulty: 'beginner' },
  { id: 'pe-4', category: 'Prompt Engineering', question: 'Design a prompt that prevents hallucination in a RAG system. What guardrails would you add?', difficulty: 'advanced' },
  { id: 'pe-5', category: 'Prompt Engineering', question: 'What is "prompt injection"? Write 3 defensive prompt patterns to prevent it.', difficulty: 'intermediate' },

  // Python / Data Ops
  { id: 'do-1', category: 'Data Operations', question: 'Write a pandas script to clean a CSV dataset: handle missing values, normalize text columns, remove duplicates, and export to JSONL format.', difficulty: 'intermediate' },
  { id: 'do-2', category: 'Data Operations', question: 'You have 50GB of text data for fine-tuning. Design a Python pipeline to chunk, deduplicate, and validate the data quality.', difficulty: 'advanced' },
  { id: 'do-3', category: 'Data Operations', question: 'Write a Python function using the json library to flatten nested JSON structures into a flat dictionary with dot-notation keys.', difficulty: 'beginner' },
  { id: 'do-4', category: 'Data Operations', question: 'Explain tokenization in the context of LLMs. Write a Python script that counts tokens using tiktoken for GPT-4.', difficulty: 'intermediate' },
  { id: 'do-5', category: 'Data Operations', question: 'Design a data annotation pipeline for training a sentiment analysis model. Include quality control steps.', difficulty: 'advanced' },

  // AI QA / Evaluation
  { id: 'qa-1', category: 'AI QA', question: 'Write a Python script that tests an LLM API endpoint for: response latency, output format compliance, and hallucination detection against ground truth.', difficulty: 'advanced' },
  { id: 'qa-2', category: 'AI QA', question: 'What metrics would you use to evaluate a RAG system? Explain precision@k, recall@k, and MRR.', difficulty: 'intermediate' },
  { id: 'qa-3', category: 'AI QA', question: 'Design an automated test suite for an AI chatbot. What are the categories of test cases you would include?', difficulty: 'beginner' },
  { id: 'qa-4', category: 'AI QA', question: 'Write a Python function that compares two LLM responses using cosine similarity of their embeddings to detect semantic drift.', difficulty: 'advanced' },
  { id: 'qa-5', category: 'AI QA', question: 'Explain "red teaming" for AI systems. Design 5 adversarial test prompts for a customer service chatbot.', difficulty: 'intermediate' },

  // FastAPI / Backend
  { id: 'fa-1', category: 'FastAPI', question: 'Build a FastAPI endpoint that accepts a text query, embeds it using sentence-transformers, and returns the top 5 similar documents from a PostgreSQL database.', difficulty: 'advanced' },
  { id: 'fa-2', category: 'FastAPI', question: 'Write a FastAPI middleware that logs request/response times and implements rate limiting (10 requests per minute per IP).', difficulty: 'intermediate' },
  { id: 'fa-3', category: 'FastAPI', question: 'Explain the difference between FastAPI\'s Depends() and BackgroundTasks. Write an example using both.', difficulty: 'beginner' },

  // Interview Questions
  { id: 'iv-1', category: 'Interview', question: 'INTERVIEW Q: "Tell me about a time you had to debug an AI system that was producing incorrect outputs. Walk me through your approach."', difficulty: 'intermediate' },
  { id: 'iv-2', category: 'Interview', question: 'INTERVIEW Q: "How would you design an AI pipeline that processes 1 million documents per day for a search engine?"', difficulty: 'advanced' },
  { id: 'iv-3', category: 'Interview', question: 'INTERVIEW Q: "What is the difference between fine-tuning, RAG, and prompt engineering? When would you recommend each?"', difficulty: 'beginner' },
  { id: 'iv-4', category: 'Interview', question: 'INTERVIEW Q: "You notice your LLM-based feature has a 15% hallucination rate. How do you reduce it to under 2%?"', difficulty: 'advanced' },
  { id: 'iv-5', category: 'Interview', question: 'INTERVIEW Q: "Explain vector embeddings to a non-technical product manager. How do they power semantic search?"', difficulty: 'beginner' },
];

// Mentalism Track — Rotating Drill Bank
const mentalismQuestions: TrackQuestion[] = [
  { id: 'mt-1', category: 'Observation', question: 'DRILL: Sit in a public space for 10 minutes. Identify 5 people and note: dominant hand, emotional state, relationship to companions, likely occupation, and one hidden detail.', difficulty: 'intermediate' },
  { id: 'mt-2', category: 'Cold Reading', question: 'DRILL: Practice the Barnum Statement technique. Write 5 statements that sound personal but apply to 80% of people. Test them on a friend.', difficulty: 'beginner' },
  { id: 'mt-3', category: 'Billet Peek', question: 'DRILL: Practice the center tear technique for 15 minutes. Focus on natural hand positioning and misdirection timing.', difficulty: 'advanced' },
  { id: 'mt-4', category: 'Verbal Timing', question: 'DRILL: Practice the "37 Force" — ask someone to name a 2-digit number. Study timing patterns and verbal cues that increase success rate.', difficulty: 'intermediate' },
  { id: 'mt-5', category: 'Observation', question: 'DRILL: Watch a 5-minute conversation between strangers. Identify who is higher status, who is mirroring whom, and predict when the conversation will end.', difficulty: 'intermediate' },
  { id: 'mt-6', category: 'Memory Palace', question: 'DRILL: Build a memory palace with 20 stations. Place 20 random items in it and recall them forwards and backwards.', difficulty: 'advanced' },
  { id: 'mt-7', category: 'Baseline Detection', question: 'DRILL: During a normal conversation, establish someone\'s speech baseline (speed, eye movement, gestures). Then ask a surprising question and note deviations.', difficulty: 'intermediate' },
  { id: 'mt-8', category: 'Cold Reading', question: 'DRILL: Practice "shotgunning" — rapid-fire specific guesses about a stranger. Aim for 3 hits out of 10 attempts.', difficulty: 'advanced' },
  { id: 'mt-9', category: 'Observation', question: 'DRILL: Watch a cricket match. Before each delivery, predict the bowler\'s line and length from their run-up body language.', difficulty: 'beginner' },
  { id: 'mt-10', category: 'Verbal Timing', question: 'DRILL: Practice dual reality scripting — write a 2-minute routine where the audience and volunteer experience different realities.', difficulty: 'advanced' },
];

// Physical Track — Rotating Drill Bank
const physicalQuestions: TrackQuestion[] = [
  { id: 'ph-1', category: 'Boxing', question: 'SESSION: 6 rounds × 3 minutes. Jab-Cross-Hook combos. Focus on keeping chin tucked and returning to guard between combinations.', difficulty: 'intermediate' },
  { id: 'ph-2', category: 'Strength', question: 'SESSION: Compound lift day — Deadlift 4×5, Bench Press 4×6, Barbell Row 4×8. Log your weights and RPE for each set.', difficulty: 'intermediate' },
  { id: 'ph-3', category: 'Endurance', question: 'SESSION: 30-minute zone 2 cardio (heart rate 120-140 BPM). Can be running, cycling, or swimming. Log distance and average heart rate.', difficulty: 'beginner' },
  { id: 'ph-4', category: 'Boxing', question: 'SESSION: 4 rounds × 3 min shadow boxing with emphasis on footwork. Practice pivot, side-step, and back-step between combinations.', difficulty: 'beginner' },
  { id: 'ph-5', category: 'Strength', question: 'SESSION: Upper body — Overhead Press 4×6, Pull-ups 4×max, Dips 4×10, Face Pulls 3×15. Progressive overload from last week.', difficulty: 'intermediate' },
  { id: 'ph-6', category: 'Endurance', question: 'SESSION: HIIT — 8 rounds of 30s sprint / 90s walk. Track peak heart rate and recovery time between rounds.', difficulty: 'advanced' },
  { id: 'ph-7', category: 'Mobility', question: 'SESSION: 20-minute mobility flow — hip flexor stretch, thoracic spine rotation, shoulder dislocates, deep squat hold (2 min).', difficulty: 'beginner' },
  { id: 'ph-8', category: 'Boxing', question: 'SESSION: Heavy bag work — 5 rounds × 3 min. Round 1-2: single shots with power. Round 3-4: combinations. Round 5: body shots only.', difficulty: 'advanced' },
  { id: 'ph-9', category: 'Strength', question: 'SESSION: Leg day — Back Squat 4×5, Romanian Deadlift 4×8, Bulgarian Split Squat 3×10 each leg, Calf Raises 4×15.', difficulty: 'intermediate' },
  { id: 'ph-10', category: 'Presentation Prep', question: 'SESSION: Practice power posing for 5 minutes. Then rehearse a 3-minute technical presentation while maintaining strong posture and eye contact.', difficulty: 'beginner' },
];

/**
 * Get today's questions for each track based on date rotation.
 * Returns 2 questions per track (one from static bank + AI generates fresh ones).
 */
export function getDailyQuestions(dateStr: string): {
  aiCareer: TrackQuestion[];
  mentalism: TrackQuestion[];
  physical: TrackQuestion[];
} {
  // Use date string to deterministically pick questions
  const dateHash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const pickTwo = <T>(arr: T[], seed: number): T[] => {
    const idx1 = seed % arr.length;
    const idx2 = (seed + 7) % arr.length;
    return [arr[idx1], arr[idx2 === idx1 ? (idx2 + 1) % arr.length : idx2]];
  };

  return {
    aiCareer: pickTwo(aiCareerQuestions, dateHash),
    mentalism: pickTwo(mentalismQuestions, dateHash + 3),
    physical: pickTwo(physicalQuestions, dateHash + 5),
  };
}

export { aiCareerQuestions, mentalismQuestions, physicalQuestions };
