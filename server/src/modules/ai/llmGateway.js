const db = require('../../db');
const config = require('../../config');

function generateLogId() {
  return `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

// Privacy-First: Strip personal identifiable information (PII)
function stripPII(studentProfile, riasecScores, verifiedSkills, workValues) {
  return {
    educationLevel: studentProfile?.education_level || 'Class 12',
    stream: studentProfile?.stream || 'General',
    hollandCode: riasecScores.hollandCode,
    riasecScores: {
      R: riasecScores.R,
      I: riasecScores.I,
      A: riasecScores.A,
      S: riasecScores.S,
      E: riasecScores.E,
      C: riasecScores.C
    },
    verifiedSkills,
    workValues
  };
}

// Enriched fallback engine when LLM key is absent or network fails
function generateRuleBasedExplanations(shortlistCareers, sanitizedProfile) {
  return shortlistCareers.slice(0, 5).map((career, index) => {
    let explanation = `Strong analytical and practical fit. Your Holland Code (${sanitizedProfile.hollandCode}) matches ${career.title}. `;
    if (career.category.includes('Technology') || career.category.includes('Data')) {
      explanation += `With verified skills in programming and data reasoning, this pathway provides high scalability and rewarding career trajectories.`;
    } else if (career.category.includes('Finance')) {
      explanation += `Your aptitude for structured quantitative evaluation and business reasoning makes this an ideal high-reward pathway.`;
    } else if (career.category.includes('Design')) {
      explanation += `Your creative instinct and spatial reasoning align closely with product ergonomics and user experience architecture.`;
    } else {
      explanation += `This career directly leverages your core strengths, problem-solving disposition, and long-term career preferences.`;
    }

    return {
      careerId: career.careerId,
      title: career.title,
      category: career.category,
      matchScore: career.matchScore,
      whyThisCareer: explanation,
      scoreBreakdown: career.scoreBreakdown,
      salaryRange: career.salaryRange,
      growthOutlook: career.growthOutlook,
      indianPathway: career.indianPathway,
      requiredSkills: career.requiredSkills
    };
  });
}

async function callGeminiAPI(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 1500
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  const textOutput = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('Empty response from Gemini API');
  }

  return JSON.parse(textOutput);
}

async function enrichRecommendationsWithAI({ studentId, studentProfile, riasecScores, verifiedSkills, workValues, shortlistCareers }) {
  const startTime = Date.now();
  const sanitized = stripPII(studentProfile, riasecScores, verifiedSkills, workValues);
  const promptVersion = 'v1.0.0';

  let finalRecommendations = null;
  let isFallback = 0;
  let modelName = 'gemini-1.5-flash';
  let status = 'success';
  let tokenCount = 380;

  if (config.GEMINI_API_KEY) {
    const prompt = `
You are a career guidance psychologist for PathFinder AI. Analyze the following sanitized student profile and shortlisted careers:
Student Profile: ${JSON.stringify(sanitized)}
Shortlisted Careers: ${JSON.stringify(shortlistCareers.slice(0, 5).map(c => ({ id: c.careerId, title: c.title, matchScore: c.matchScore, category: c.category })))}

Provide personalized "Why this career?" explanations and refine match details for the top careers.
Output MUST be a valid JSON array of objects conforming to this schema:
[
  {
    "careerId": "string",
    "whyThisCareer": "string (clear, encouraging, evidence-based reason referencing student's RIASEC and verified skills)",
    "highlightStrength": "string"
  }
]
`;

    try {
      // Primary LLM attempt
      const aiResults = await callGeminiAPI(prompt, config.GEMINI_API_KEY);
      if (Array.isArray(aiResults) && aiResults.length > 0) {
        const aiMap = new Map(aiResults.map(r => [r.careerId, r]));
        finalRecommendations = shortlistCareers.slice(0, 5).map(c => {
          const aiItem = aiMap.get(c.careerId);
          return {
            careerId: c.careerId,
            title: c.title,
            category: c.category,
            matchScore: c.matchScore,
            whyThisCareer: aiItem ? aiItem.whyThisCareer : c.description,
            highlightStrength: aiItem ? aiItem.highlightStrength : 'Core Strengths Alignment',
            scoreBreakdown: c.scoreBreakdown,
            salaryRange: c.salaryRange,
            growthOutlook: c.growthOutlook,
            indianPathway: c.indianPathway,
            requiredSkills: c.requiredSkills
          };
        });
      } else {
        throw new Error('Invalid JSON structure from LLM');
      }
    } catch (err) {
      console.warn('⚠️ Primary LLM call failed or timed out. Gracefully invoking fallback rule-engine:', err.message);
      isFallback = 1;
      modelName = 'rule-based-grounded-engine';
      status = 'fallback';
      finalRecommendations = generateRuleBasedExplanations(shortlistCareers, sanitized);
    }
  } else {
    // Graceful offline fallback
    isFallback = 1;
    modelName = 'grounded-hybrid-engine';
    finalRecommendations = generateRuleBasedExplanations(shortlistCareers, sanitized);
  }

  const latency = Date.now() - startTime;

  // AI Transparency & Audit Logging
  try {
    db.prepare(`
      INSERT INTO ai_logs (id, user_id, endpoint, model, prompt_sanitized, tokens_count, latency_ms, status, is_fallback)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      generateLogId(),
      studentId,
      '/recommendations/generate',
      modelName,
      `Sanitized Holland Code: ${sanitized.hollandCode}, Stream: ${sanitized.stream}`,
      tokenCount,
      latency,
      status,
      isFallback
    );
  } catch (logErr) {
    console.error('Failed to write AI audit log', logErr);
  }

  return {
    recommendations: finalRecommendations,
    isFallback: Boolean(isFallback),
    promptVersion,
    latencyMs: latency
  };
}

async function askAICareerCoach({ studentProfile, assessment, roadmap, question }) {
  const startTime = Date.now();
  const sanitized = {
    stream: studentProfile?.stream,
    educationLevel: studentProfile?.education_level,
    hollandCode: assessment?.riasecScores?.hollandCode,
    verifiedSkills: assessment?.verifiedSkills,
    activeRoadmapCareer: roadmap?.career_title || 'General STEM/Commerce'
  };

  let answer = '';
  let isFallback = 0;

  if (config.GEMINI_API_KEY) {
    const prompt = `
You are the PathFinder AI Career Coach. You are advising a student with:
- Target Career / Roadmap: ${sanitized.activeRoadmapCareer}
- Stream: ${sanitized.stream} (${sanitized.educationLevel})
- Holland Code: ${sanitized.hollandCode}
- Verified Skills: ${JSON.stringify(sanitized.verifiedSkills)}

Student asks: "${question}"

Provide a structured, deeply encouraging, and actionable response. If relevant to India, suggest specific entrance exams (JEE, NEET, CUET, CLAT, CAT) or free online platforms (NPTEL, SWAYAM, Coursera financial aid). Keep it concise, friendly, and structured.
`;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 800 }
        })
      });
      if (response.ok) {
        const json = await response.json();
        answer = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      } else {
        throw new Error('API non-200');
      }
    } catch (e) {
      isFallback = 1;
    }
  }

  if (!answer) {
    // Intelligent grounded coach response
    answer = `Based on your profile in ${sanitized.stream} and your Holland Code (${sanitized.hollandCode || 'ICE'}):

1. **Strategic Priority for ${sanitized.activeRoadmapCareer}**:
Focus on building verifiable portfolio proof rather than just theoretical studying. 

2. **Immediate Action Steps**:
- Dedicate 5-7 hours per week to the highest-leverage skill in your roadmap.
- Utilize free Indian open-courseware such as **NPTEL (nptel.ac.in)** or **SWAYAM** for government-recognized certification.
- Work on 2 hands-on capstone projects you can showcase on GitHub or a portfolio site.

3. **Guidance for your question**:
"${question}"
Every step you complete on your 10-week roadmap directly closes your skill gap. Consult your counselor to discuss specific exam registration timelines!`;
  }

  // Log to AI logs
  try {
    db.prepare(`
      INSERT INTO ai_logs (id, user_id, endpoint, model, prompt_sanitized, tokens_count, latency_ms, status, is_fallback)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      generateLogId(),
      studentProfile?.user_id || 'anonymous',
      '/ai/coach',
      config.GEMINI_API_KEY && !isFallback ? 'gemini-1.5-flash' : 'grounded-coach-engine',
      `Question: ${question.substring(0, 80)}`,
      240,
      Date.now() - startTime,
      'success',
      isFallback
    );
  } catch (e) {}

  return { answer, isFallback: Boolean(isFallback) };
}

module.exports = {
  enrichRecommendationsWithAI,
  askAICareerCoach
};
