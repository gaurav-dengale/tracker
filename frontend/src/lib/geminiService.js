// Gemini AI Tutor Service for TCS NQT & DSA Preparation

const DEFAULT_SYSTEM_PROMPT = `You are the TCS NQT & Striver DSA AI Study Mentor, an expert tutor specialized in helping engineering students crack the TCS NQT (National Qualifier Test), TCS Digital/Prime, and technical coding interviews.
Your goals:
1. Provide crystal clear, structured, and pedagogical explanations.
2. When asked for hints, give progressive clues (Level 1: Intuition & Concept -> Level 2: Algorithm/Two-Pointers/Pattern -> Level 3: Pseudocode & Complexity) rather than spoiling full code right away unless explicitly asked.
3. For Aptitude & Reasoning, explain the fast 30-second shortcut formulas and step-by-step logic.
4. For Interview questions, use the STAR framework (Situation, Task, Action, Result) and evaluate student answers constructively.
5. Keep explanations concise, well-formatted in markdown with code blocks, bullet points, and complexity highlights.`;

export function getApiKey() {
  // Check local storage override first, then env variable
  try {
    const customKey = localStorage.getItem('nqt_gemini_api_key');
    if (customKey && customKey.trim()) return customKey.trim();
  } catch {}
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function saveApiKey(key) {
  try {
    if (!key || !key.trim()) {
      localStorage.removeItem('nqt_gemini_api_key');
    } else {
      localStorage.setItem('nqt_gemini_api_key', key.trim());
    }
  } catch {}
}

let cachedWorkingModel = null;

export async function getAvailableModels(apiKey) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.models && Array.isArray(data.models)) {
      const generateModels = data.models
        .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map((m) => m.name.replace(/^models\//, ''));
      return generateModels;
    }
  } catch (e) {
    console.debug('Failed to dynamically fetch Gemini models', e);
  }
  return null;
}

export async function askGemini(prompt, systemInstruction = DEFAULT_SYSTEM_PROMPT) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing Gemini API Key. Please add your API key in Settings or .env file.');
  }

  // If we already found a working model in this session, try it first
  const fallbackModels = [
    cachedWorkingModel,
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-pro',
  ].filter(Boolean);

  // Try dynamically discovering available models for this key
  let modelsToTry = fallbackModels;
  try {
    const discovered = await getAvailableModels(apiKey);
    if (discovered && discovered.length > 0) {
      // Prioritize flash models, then pro models
      const sorted = [
        ...discovered.filter((m) => m.includes('flash')),
        ...discovered.filter((m) => !m.includes('flash')),
      ];
      modelsToTry = Array.from(new Set([...(cachedWorkingModel ? [cachedWorkingModel] : []), ...sorted, ...fallbackModels]));
    }
  } catch {}

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || `API Error (${response.status})`);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty response received from AI model.');
      }

      // Cache this working model for faster subsequent calls
      cachedWorkingModel = model;
      return text;
    } catch (err) {
      lastError = err;
      // If unauthorized or bad key, don't keep cycling models
      if (
        err.message &&
        (err.message.includes('API_KEY_INVALID') ||
          err.message.includes('API key not valid') ||
          err.message.includes('PERMISSION_DENIED'))
      ) {
        throw new Error('Invalid or unauthorized Gemini API Key. Please check your key in settings.');
      }
    }
  }

  throw lastError || new Error('Failed to connect to Gemini AI.');
}


// 1. Get Progressive DSA Hint
export async function getDsaHint(problemTitle, topicName, difficulty) {
  const prompt = `I am practicing the DSA problem: "${problemTitle}" under Topic: "${topicName}" (${difficulty} difficulty).
Please give me:
1. 💡 **Core Intuition & Pattern**: What fundamental concept or pattern applies here?
2. 🪜 **Progressive Hints**:
   - *Hint 1 (High Level)*: How to think about the brute force vs optimal solution.
   - *Hint 2 (Data Structure/Technique)*: Which pointer/stack/map/traversal to use.
   - *Hint 3 (Approach Outline)*: Step-by-step logic.
3. ⚡ **Target Complexity**: Expected Time Complexity and Space Complexity for TCS/LeetCode optimal solution.
(Do NOT output the full source code solution unless asked, so I can try writing the code myself first).`;

  return askGemini(prompt);
}

// 2. Analyze Code & Time/Space Complexity
export async function analyzeCodeComplexity(problemTitle, codeSnippet, language = 'Java') {
  const prompt = `Please review my ${language} code for the problem: "${problemTitle}".

Code:
\`\`\`${language.toLowerCase()}
${codeSnippet}
\`\`\`

Provide:
1. ⏱️ **Time Complexity**: Exact Big-O with clear explanation of loops/recursion.
2. 💾 **Space Complexity**: Auxiliary space vs input space.
3. ⚠️ **Potential Pitfalls & Edge Cases**: (e.g., Integer Overflow, Empty inputs, Negative numbers, TLE risks in TCS NQT/LeetCode).
4. 🚀 **Optimization Suggestions**: If there is a more optimal approach, summarize it briefly.`;

  return askGemini(prompt);
}

// 3. Explain Aptitude Shortcut & Speed Math
export async function explainAptitudeShortcut(topicOrQuestion) {
  const prompt = `Topic / Question: "${topicOrQuestion}"

Please explain:
1. 📐 **Core Concept & Formula**: Standard textbook formula.
2. ⚡ **TCS NQT 30-Second Speed Shortcut**: Fast mental math trick or ratio shortcut to solve this in under 45 seconds during the exam.
3. 📝 **1 Solved Example with Shortcut**: Walk through a representative example demonstrating the shortcut step-by-step.`;

  return askGemini(prompt);
}

// 4. Evaluate Mock Technical / HR Interview Answer
export async function evaluateMockInterviewAnswer(question, studentAnswer) {
  const prompt = `Interview Question: "${question}"
Student Answer: "${studentAnswer}"

Evaluate this answer as a senior TCS Technical/HR Interviewer:
1. 🌟 **Score**: (X / 10)
2. 🎯 **Strengths**: What was done well.
3. 💡 **Areas to Improve**: Missing technical terms, lack of clarity, or structure issues.
4. ✨ **Model Answer Example**: How an ideal candidate would answer this concisely in 60-90 seconds using the STAR method if applicable.`;

  return askGemini(prompt);
}
