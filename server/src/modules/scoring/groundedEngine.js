const db = require('../../db');

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function computeShortlist(riasecScores, verifiedSkills, workValues) {
  const careers = db.prepare('SELECT * FROM careers').all();

  // Vector keys: R, I, A, S, E, C
  const studentVec = [
    (riasecScores.R || 50) / 100,
    (riasecScores.I || 50) / 100,
    (riasecScores.A || 50) / 100,
    (riasecScores.S || 50) / 100,
    (riasecScores.E || 50) / 100,
    (riasecScores.C || 50) / 100
  ];

  const scoredCareers = careers.map(c => {
    const careerVecObj = JSON.parse(c.riasec_vector_json);
    const careerVec = [
      careerVecObj.R || 0,
      careerVecObj.I || 0,
      careerVecObj.A || 0,
      careerVecObj.S || 0,
      careerVecObj.E || 0,
      careerVecObj.C || 0
    ];

    // 1. Interest cosine similarity
    const interestSim = Math.max(0, cosineSimilarity(studentVec, careerVec));

    // 2. Skill match
    const reqSkills = JSON.parse(c.required_skills_json);
    let skillScoreSum = 0;
    let skillCount = 0;

    for (const [skillName, reqLevel] of Object.entries(reqSkills)) {
      const studentLevel = verifiedSkills[skillName] || 2.5;
      // Ratio of student level to required level (capped at 1.0)
      const ratio = Math.min(1.0, studentLevel / (reqLevel || 3.0));
      skillScoreSum += ratio;
      skillCount++;
    }
    const skillMatch = skillCount > 0 ? (skillScoreSum / skillCount) : 0.7;

    // 3. Work values fit
    let valuesFit = 0.8;
    if (workValues && Object.keys(workValues).length > 0) {
      if (workValues['High Financial Reward'] === 'Essential' && c.salary_range.includes('3')) {
        valuesFit += 0.1;
      }
      if (workValues['Societal Impact & Purpose'] === 'Essential' && (c.category.includes('Healthcare') || c.category.includes('Environment') || c.category.includes('Law'))) {
        valuesFit += 0.1;
      }
      if (workValues['Autonomy & Flexibility'] === 'Essential' && (c.category.includes('Software') || c.category.includes('Design') || c.category.includes('Data'))) {
        valuesFit += 0.08;
      }
    }
    valuesFit = Math.min(1.0, valuesFit);

    // Weighted Formula: 0.5 * Interest + 0.35 * Skill + 0.15 * Values
    const totalMatch = (0.50 * interestSim) + (0.35 * skillMatch) + (0.15 * valuesFit);
    const matchPercentage = Math.round(totalMatch * 100);

    return {
      careerId: c.id,
      title: c.title,
      category: c.category,
      description: c.description,
      matchScore: Math.min(99, Math.max(55, matchPercentage)),
      scoreBreakdown: {
        interests: Math.round(interestSim * 100),
        skills: Math.round(skillMatch * 100),
        values: Math.round(valuesFit * 100)
      },
      salaryRange: c.salary_range,
      growthOutlook: c.growth_outlook,
      educationPaths: JSON.parse(c.education_paths_json),
      indianPathway: JSON.parse(c.indian_pathway_json),
      requiredSkills: reqSkills
    };
  });

  // Sort by match score descending
  scoredCareers.sort((a, b) => b.matchScore - a.matchScore);

  return scoredCareers;
}

module.exports = {
  computeShortlist
};
