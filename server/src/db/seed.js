const bcrypt = require('bcryptjs');
const db = require('./index');

function seedDatabase() {
  console.log('🌱 Starting PathFinder AI database seeding...');

  // 1. Clean existing tables
  db.exec(`
    DELETE FROM activity_events;
    DELETE FROM ai_logs;
    DELETE FROM roadmap_milestones;
    DELETE FROM roadmaps;
    DELETE FROM counselor_reviews;
    DELETE FROM recommendations;
    DELETE FROM assessment_answers;
    DELETE FROM assessments;
    DELETE FROM questions;
    DELETE FROM careers;
    DELETE FROM counselor_assignments;
    DELETE FROM student_profiles;
    DELETE FROM counselor_profiles;
    DELETE FROM users;
  `);

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  // 2. Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, role, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  insertUser.run('user-student-1', 'student@pathfinder.ai', passwordHash, 'student');
  insertUser.run('user-student-2', 'rahul@pathfinder.ai', passwordHash, 'student');
  insertUser.run('user-student-3', 'priya@pathfinder.ai', passwordHash, 'student');
  insertUser.run('user-counselor-1', 'counselor@pathfinder.ai', passwordHash, 'counselor');
  insertUser.run('user-admin-1', 'admin@pathfinder.ai', passwordHash, 'admin');

  // Insert Profiles
  const insertStudent = db.prepare(`
    INSERT INTO student_profiles (user_id, full_name, education_level, stream, grade, target_language, career_interests, consent_ai)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  insertStudent.run('user-student-1', 'Ananya Sharma', 'Class 12', 'Science (PCM)', '92%', 'en', 'Artificial Intelligence, Software Architecture, Robotics');
  insertStudent.run('user-student-2', 'Rahul Verma', 'Class 12', 'Commerce with Maths', '88%', 'en', 'Fintech, Investment Banking, Data Analytics');
  insertStudent.run('user-student-3', 'Priya Patel', 'Undergraduate (1st Year)', 'Computer Applications', '8.4 CGPA', 'en', 'Cybersecurity, Cloud Engineering');

  const insertCounselor = db.prepare(`
    INSERT INTO counselor_profiles (user_id, full_name, institution, specialization)
    VALUES (?, ?, ?, ?)
  `);
  insertCounselor.run('user-counselor-1', 'Dr. Vikram Seth', 'Apex Career Advisory Cell', 'STEM, Commerce & Career Transition');

  // 3. Insert Questions (Interest RIASEC, Skills with Reality Check, Work Values)
  const insertQuestion = db.prepare(`
    INSERT INTO questions (id, part, dimension, text_en, text_hi, options_json, reality_quiz_json, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const questions = [
    // --- Part 1: Holland RIASEC Interests ---
    {
      id: 'q-riasec-r1',
      part: 'interest',
      dimension: 'Realistic',
      text_en: 'I enjoy assembling hardware, repairing mechanical systems, or working with physical tools and electronics.',
      text_hi: 'मुझे हार्डवेयर जोड़ना, यांत्रिक प्रणालियों की मरम्मत करना या भौतिक उपकरणों और इलेक्ट्रॉनिक्स के साथ काम करना पसंद है।',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    {
      id: 'q-riasec-r2',
      part: 'interest',
      dimension: 'Realistic',
      text_en: 'I prefer hands-on outdoor activities or building physical prototypes rather than sitting all day writing essays.',
      text_hi: 'मैं दिन भर निबंध लिखने के बजाय व्यावहारिक बाहरी गतिविधियों या भौतिक प्रोटोटाइप बनाने को प्राथमिकता देता हूँ।',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    {
      id: 'q-riasec-i1',
      part: 'interest',
      dimension: 'Investigative',
      text_en: 'I love solving complex math puzzles, analyzing statistical trends, or debugging mysterious software errors.',
      text_hi: 'मुझे जटिल गणित पहेलियों को हल करना, सांख्यिकीय रुझानों का विश्लेषण करना या सॉफ़्टवेयर त्रुटियों को ठीक करना पसंद है।',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    {
      id: 'q-riasec-i2',
      part: 'interest',
      dimension: 'Investigative',
      text_en: 'I enjoy diving into scientific research papers and discovering underlying principles behind how things function.',
      text_hi: 'मुझे वैज्ञानिक शोध पत्रों को पढ़ने और चीजें कैसे काम करती हैं, इसके सिद्धांतों को खोजने में मज़ा आता है।',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    {
      id: 'q-riasec-a1',
      part: 'interest',
      dimension: 'Artistic',
      text_en: 'I love expressing ideas visually, writing creative stories, designing digital graphics, or composing media.',
      text_hi: 'मुझे विचारों को दृश्य रूप से व्यक्त करना, रचनात्मक कहानियाँ लिखना, डिजिटल ग्राफिक्स डिजाइन करना या मीडिया बनाना पसंद है।',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    {
      id: 'q-riasec-a2',
      part: 'interest',
      dimension: 'Artistic',
      text_en: 'I feel constrained by rigid rulebooks and prefer work where novel thinking and aesthetic sense are celebrated.',
      text_hi: 'मैं कठोर नियमों से बंधा हुआ महसूस करता हूँ और ऐसा काम पसंद करता हूँ जहाँ नवीन सोच और सौंदर्य बोध का स्वागत हो।',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    {
      id: 'q-riasec-s1',
      part: 'interest',
      dimension: 'Social',
      text_en: 'I find deep fulfillment in mentoring peers, explaining difficult subjects, or offering emotional and career guidance.',
      text_hi: 'मुझे साथियों को मार्गदर्शन देने, कठिन विषयों को समझाने या भावनात्मक और करियर संबंधी सलाह देने में खुशी मिलती है।',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    {
      id: 'q-riasec-s2',
      part: 'interest',
      dimension: 'Social',
      text_en: 'I thrive in collaborative team environments focused on improving community welfare or helping individuals grow.',
      text_hi: 'मैं सामुदायिक कल्याण में सुधार या लोगों के विकास में मदद करने वाली टीम में बेहतर काम करता हूँ।',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    {
      id: 'q-riasec-e1',
      part: 'interest',
      dimension: 'Enterprising',
      text_en: 'I enjoy pitching ideas, leading student clubs, negotiating terms, or launching entrepreneurial ventures.',
      text_hi: 'मुझे नए विचार पेश करना, छात्र क्लबों का नेतृत्व करना, बातचीत करना या व्यावसायिक उद्यम शुरू करना पसंद है।',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    {
      id: 'q-riasec-e2',
      part: 'interest',
      dimension: 'Enterprising',
      text_en: 'I am energized by competitive environments, public speaking, and taking calculated business risks.',
      text_hi: 'मैं प्रतिस्पर्धी माहौल, सार्वजनिक भाषण और नपे-तुले व्यावसायिक जोखिम लेने से ऊर्जावान महसूस करता हूँ।',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    {
      id: 'q-riasec-c1',
      part: 'interest',
      dimension: 'Conventional',
      text_en: 'I take pride in keeping spreadsheets well-organized, maintaining financial records, and tracking systematic checklists.',
      text_hi: 'मुझे स्प्रेडशीट को व्यवस्थित रखने, वित्तीय रिकॉर्ड बनाए रखने और व्यवस्थित चेकलिस्ट का पालन करने पर गर्व है।',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    {
      id: 'q-riasec-c2',
      part: 'interest',
      dimension: 'Conventional',
      text_en: 'I prefer clear protocols, standard operating procedures, and structured workflows with minimal ambiguity.',
      text_hi: 'मैं स्पष्ट प्रोटोकॉल, मानक संचालन प्रक्रियाओं और न्यूनतम अस्पष्टता वाले संरचित वर्कफ़्लो को प्राथमिकता देता हूँ।',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },

    // --- Part 2: Skills with Skill Reality Check Micro-Quizzes ---
    {
      id: 'q-skill-coding',
      part: 'skill',
      dimension: 'Programming & Logic',
      text_en: 'Rate your proficiency in Programming & Algorithmic Problem Solving (e.g. Python, C++, or JavaScript):',
      text_hi: 'प्रोग्रामिंग और एल्गोरिथम समस्या समाधान (जैसे पायथन, सी++, या जावास्क्रिप्ट) में अपनी दक्षता का मूल्यांकन करें:',
      options: ['1 - Novice (No code yet)', '2 - Beginner (Loops & Ifs)', '3 - Intermediate (Functions & OOP)', '4 - Proficient (Data structures & APIs)', '5 - Expert (Complex algorithms & Systems)'],
      reality_quiz: [
        {
          question: 'In Python, what is the time complexity of looking up a key in a standard dictionary (average case)?',
          options: ['O(N)', 'O(1)', 'O(log N)', 'O(N^2)'],
          correctIndex: 1
        },
        {
          question: 'Which of the following data structures operates on a First-In, First-Out (FIFO) principle?',
          options: ['Stack', 'Queue', 'Binary Tree', 'Max Heap'],
          correctIndex: 1
        },
        {
          question: 'What will `[1, 2, 3] + [4, 5]` produce in Python?',
          options: ['[5, 7, 3]', '[1, 2, 3, 4, 5]', 'Error: Invalid operator', '[[1,2,3], [4,5]]'],
          correctIndex: 1
        }
      ]
    },
    {
      id: 'q-skill-data',
      part: 'skill',
      dimension: 'Data Analysis & Mathematics',
      text_en: 'Rate your capability in Data Analysis, Statistics, and Mathematical Reasoning:',
      text_hi: 'डेटा विश्लेषण, सांख्यिकी और गणितीय तर्क में अपनी क्षमता का मूल्यांकन करें:',
      options: ['1 - Basic arithmetic only', '2 - Comfortable with school algebra', '3 - Probability & Descriptive stats', '4 - Inferential stats, SQL & regression', '5 - Advanced calculus & ML metrics'],
      reality_quiz: [
        {
          question: 'What metric best describes the middle value in a skewed distribution that is less affected by extreme outliers?',
          options: ['Mean', 'Median', 'Mode', 'Standard Deviation'],
          correctIndex: 1
        },
        {
          question: 'In SQL, which clause is used to filter records resulting from a GROUP BY statement?',
          options: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'],
          correctIndex: 1
        },
        {
          question: 'If a coin is tossed 3 times, what is the probability of getting exactly 2 heads?',
          options: ['1/8', '3/8', '1/2', '5/8'],
          correctIndex: 1
        }
      ]
    },
    {
      id: 'q-skill-design',
      part: 'skill',
      dimension: 'Visual Design & UI/UX',
      text_en: 'Rate your experience with Visual Aesthetics, UI Design tools (Figma/Adobe), or Creative Prototyping:',
      text_hi: 'दृश्य सौंदर्यशास्त्र, यूआई डिज़ाइन टूल (फिगमा) या रचनात्मक प्रोटोटाइप में अपने अनुभव का मूल्यांकन करें:',
      options: ['1 - Never created graphics', '2 - Can make basic slides/posters', '3 - Basic Figma layouts & color palettes', '4 - Wireframes, typography & component libraries', '5 - Full design systems & user testing'],
      reality_quiz: [
        {
          question: 'In UI/UX design, what does the 60-30-10 rule primarily apply to?',
          options: ['Font sizing hierarchy', 'Color distribution in an interface', 'Whitespace margin percentage', 'User research sample sizing'],
          correctIndex: 1
        },
        {
          question: 'Which WCAG contrast ratio is the minimum standard (AA level) for normal body text?',
          options: ['2:1', '3:1', '4.5:1', '7:1'],
          correctIndex: 2
        },
        {
          question: 'What is a "Wireframe" primarily used for in product design?',
          options: ['Final high-res marketing asset', 'Structural layout without decorative styling', 'Backend API routing schema', 'Database ER diagram'],
          correctIndex: 1
        }
      ]
    },
    {
      id: 'q-skill-communication',
      part: 'skill',
      dimension: 'Verbal & Written Communication',
      text_en: 'Rate your ability to synthesize ideas, write technical summaries, and present persuasively to audiences:',
      text_hi: 'विचारों को संक्षेप में प्रस्तुत करने, तकनीकी सारांश लिखने और दर्शकों को प्रभावित करने की अपनी क्षमता का मूल्यांकन करें:',
      options: ['1 - Extremely nervous/hesitant', '2 - Can speak in 1-on-1 casual settings', '3 - Clear in group conversations', '4 - Confident stage presentation & crisp writing', '5 - Persuasive executive speaker & published writer'],
      reality_quiz: [
        {
          question: 'Which structure is widely recommended for answering behavioral interview questions concisely?',
          options: ['SWOT analysis', 'STAR method (Situation, Task, Action, Result)', 'PESTEL framework', 'Waterfall methodology'],
          correctIndex: 1
        },
        {
          question: 'What does "Active Listening" require you to do when someone is speaking?',
          options: ['Prepare your rebuttal while they talk', 'Paraphrase and validate understanding before responding', 'Interrupt immediately if you notice an error', 'Nod silently without asking questions'],
          correctIndex: 1
        },
        {
          question: 'In professional written reports, what is the purpose of an "Executive Summary"?',
          options: ['A list of references and citations', 'A standalone overview highlighting key findings and recommendations', 'A technical glossary of acronyms', 'A copy of all raw database rows'],
          correctIndex: 1
        }
      ]
    },

    // --- Part 3: Work Values & Preferences ---
    {
      id: 'q-val-autonomy',
      part: 'value',
      dimension: 'Autonomy & Flexibility',
      text_en: 'How important is it for you to have flexible working hours, remote options, and freedom from micromanagement?',
      text_hi: 'आपके लिए लचीले काम के घंटे, रिमोट विकल्प और स्वायत्तता होना कितना महत्वपूर्ण है?',
      options: ['Not important', 'Slightly important', 'Moderately important', 'Very important', 'Essential']
    },
    {
      id: 'q-val-impact',
      part: 'value',
      dimension: 'Societal Impact & Purpose',
      text_en: 'How important is it that your daily work directly improves society, saves lives, or protects the environment?',
      text_hi: 'यह कितना महत्वपूर्ण है कि आपका दैनिक काम सीधे समाज में सुधार करे या जीवन की रक्षा करे?',
      options: ['Not important', 'Slightly important', 'Moderately important', 'Very important', 'Essential']
    },
    {
      id: 'q-val-compensation',
      part: 'value',
      dimension: 'High Financial Reward',
      text_en: 'How high of a priority is rapid wealth accumulation, performance bonuses, and top-tier market compensation?',
      text_hi: 'तेजी से वित्तीय लाभ और शीर्ष वेतन आपके लिए कितनी उच्च प्राथमिकता है?',
      options: ['Not important', 'Slightly important', 'Moderately important', 'Very important', 'Essential']
    },
    {
      id: 'q-val-stability',
      part: 'value',
      dimension: 'Job Security & Structure',
      text_en: 'How important is predictable employment, steady career progression, and well-established organizational hierarchy?',
      text_hi: 'स्थिर रोजगार, पूर्वानुमेय करियर प्रगति और अच्छी तरह से स्थापित संगठनात्मक संरचना कितनी महत्वपूर्ण है?',
      options: ['Not important', 'Slightly important', 'Moderately important', 'Very important', 'Essential']
    }
  ];

  for (const q of questions) {
    insertQuestion.run(
      q.id,
      q.part,
      q.dimension,
      q.text_en,
      q.text_hi || null,
      JSON.stringify(q.options),
      q.reality_quiz ? JSON.stringify(q.reality_quiz) : null
    );
  }

  // 4. Insert Curated Career Dataset
  const insertCareer = db.prepare(`
    INSERT INTO careers (id, title, category, riasec_vector_json, required_skills_json, education_paths_json, growth_outlook, salary_range, description, indian_pathway_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const careers = [
    {
      id: 'car-ai-ml',
      title: 'AI & Machine Learning Engineer',
      category: 'Technology & Data',
      riasec_vector: { R: 0.5, I: 0.95, A: 0.3, S: 0.2, E: 0.4, C: 0.7 },
      required_skills: {
        'Programming & Logic': 5,
        'Data Analysis & Mathematics': 5,
        'Visual Design & UI/UX': 2,
        'Verbal & Written Communication': 3
      },
      education_paths: [
        'B.Tech / B.E in Computer Science, Data Science, or AI',
        'M.Tech / MS in Machine Learning, Robotics, or Computational Intelligence',
        'Self-directed portfolio with PyTorch/TensorFlow models & Kaggle competitions'
      ],
      growth_outlook: 'Very High (+38% projected growth over 5 years)',
      salary_range: '₹12,00,000 - ₹38,00,000 / year (Entry to Mid)',
      description: 'Designs, trains, and deploys intelligent models that solve real-world problems from NLP and computer vision to autonomous systems.',
      indian_pathway: {
        stream: 'Science (PCM with CS)',
        entranceExams: ['JEE Main / Advanced', 'BITSAT', 'State CETs (MHT-CET, KCET, WBJEE)'],
        topInstitutes: ['IIT Bombay', 'IIT Delhi', 'IIIT Hyderabad', 'BITS Pilani', 'NIT Trichy'],
        freeCourses: ['NPTEL Deep Learning by IIT Madras', 'SWAYAM Artificial Intelligence', 'CS50 AI (edX)']
      }
    },
    {
      id: 'car-data-scientist',
      title: 'Data Scientist & Analytics Consultant',
      category: 'Technology & Data',
      riasec_vector: { R: 0.3, I: 0.9, A: 0.4, S: 0.4, E: 0.6, C: 0.8 },
      required_skills: {
        'Programming & Logic': 4,
        'Data Analysis & Mathematics': 5,
        'Visual Design & UI/UX': 3,
        'Verbal & Written Communication': 4
      },
      education_paths: [
        'B.Sc / B.Tech in Statistics, Mathematics, Computer Science, or Economics',
        'PG Diploma or M.Sc in Business Analytics / Data Science'
      ],
      growth_outlook: 'High (+28% projected growth)',
      salary_range: '₹9,00,000 - ₹28,00,000 / year',
      description: 'Transforms unstructured enterprise data into predictive insights, business dashboards, and strategic growth drivers.',
      indian_pathway: {
        stream: 'Science or Commerce with Mathematics',
        entranceExams: ['CUET (UG)', 'ISI Admission Test (Indian Statistical Institute)', 'JEE Main'],
        topInstitutes: ['ISI Kolkata', 'Chennai Mathematical Institute (CMI)', 'IIT Kharagpur', 'Delhi School of Economics'],
        freeCourses: ['NPTEL Applied Statistics', 'Google Data Analytics Professional Certificate', 'SWAYAM Python for Data Science']
      }
    },
    {
      id: 'car-fullstack-dev',
      title: 'Full-Stack Software Engineer',
      category: 'Technology & Software',
      riasec_vector: { R: 0.6, I: 0.85, A: 0.5, S: 0.3, E: 0.4, C: 0.7 },
      required_skills: {
        'Programming & Logic': 5,
        'Data Analysis & Mathematics': 3,
        'Visual Design & UI/UX': 4,
        'Verbal & Written Communication': 3
      },
      education_paths: [
        'B.Tech / B.E in CSE/IT, BCA -> MCA, or hands-on software bootcamps',
        'Proven open-source contributions and production-grade full-stack web applications'
      ],
      growth_outlook: 'High (+24% projected growth)',
      salary_range: '₹8,00,000 - ₹26,00,000 / year',
      description: 'Architects scalable client-facing web applications, REST APIs, and microservices powering modern digital platforms.',
      indian_pathway: {
        stream: 'Any stream (Science PCM preferred for B.Tech)',
        entranceExams: ['JEE Main', 'COMEDK', 'VITEEE', 'NIMCET (for MCA)'],
        topInstitutes: ['IIIT Bangalore', 'IIT Roorkee', 'DTU Delhi', 'Vellore Institute of Technology'],
        freeCourses: ['The Odin Project', 'FreeCodeCamp Full Stack', 'NPTEL Cloud Computing']
      }
    },
    {
      id: 'car-cybersecurity',
      title: 'Cybersecurity Analyst & Ethical Hacker',
      category: 'Cybersecurity & Defense',
      riasec_vector: { R: 0.7, I: 0.85, A: 0.2, S: 0.2, E: 0.5, C: 0.8 },
      required_skills: {
        'Programming & Logic': 4,
        'Data Analysis & Mathematics': 3,
        'Visual Design & UI/UX': 1,
        'Verbal & Written Communication': 4
      },
      education_paths: [
        'B.Tech in Computer Science / Information Security or BCA',
        'Industry Certifications: CEH (Certified Ethical Hacker), CompTIA Security+, OSCP'
      ],
      growth_outlook: 'Very High (+32% projected growth)',
      salary_range: '₹8,50,000 - ₹25,00,000 / year',
      description: 'Protects critical infrastructure, networks, and confidential data from breaches, vulnerabilities, and cyber espionage.',
      indian_pathway: {
        stream: 'Science (PCM)',
        entranceExams: ['JEE Main', 'National Forensic Sciences University (NFSU) Entrance', 'State CETs'],
        topInstitutes: ['NFSU Gandhinagar', 'IIT Kanpur (C3i Center)', 'Amrita Center for Cybersecurity'],
        freeCourses: ['SANS Cyber Aces Online', 'NPTEL Information Security', 'TryHackMe beginner paths']
      }
    },
    {
      id: 'car-fintech-analyst',
      title: 'Fintech & Investment Banking Analyst',
      category: 'Finance & Economics',
      riasec_vector: { R: 0.2, I: 0.8, A: 0.2, S: 0.4, E: 0.85, C: 0.85 },
      required_skills: {
        'Programming & Logic': 3,
        'Data Analysis & Mathematics': 5,
        'Visual Design & UI/UX': 2,
        'Verbal & Written Communication': 5
      },
      education_paths: [
        'B.Com (Hons), B.Sc Finance, B.A. Economics (Hons), or B.Tech with Finance minor',
        'Chartered Financial Analyst (CFA Level 1 & 2) or MBA in Finance'
      ],
      growth_outlook: 'Steady (+18% projected growth)',
      salary_range: '₹10,00,000 - ₹32,00,000 / year',
      description: 'Models valuation metrics, evaluates merger & acquisition deals, and analyzes algorithmic financial instruments.',
      indian_pathway: {
        stream: 'Commerce with Maths or Science',
        entranceExams: ['CUET (UG) for Delhi University', 'IPMAT (IIM Indore/Rohtak)', 'CAT (for MBA)'],
        topInstitutes: ['SRCC Delhi', 'St. Xavier’s College Mumbai', 'IIM Ahmedabad / Bangalore', 'Shaheed Sukhdev College (SSCBS)'],
        freeCourses: ['Corporate Finance Institute (CFI) free courses', 'NPTEL Financial Accounting', 'SWAYAM Banking and Finance']
      }
    },
    {
      id: 'car-product-manager',
      title: 'Digital Product Manager (PM)',
      category: 'Product Strategy & Management',
      riasec_vector: { R: 0.2, I: 0.7, A: 0.6, S: 0.75, E: 0.9, C: 0.6 },
      required_skills: {
        'Programming & Logic': 3,
        'Data Analysis & Mathematics': 4,
        'Visual Design & UI/UX': 4,
        'Verbal & Written Communication': 5
      },
      education_paths: [
        'Undergraduate in Engineering, Design, or Business',
        'MBA or Associate Product Manager (APM) transition programs'
      ],
      growth_outlook: 'High (+22% projected growth)',
      salary_range: '₹14,00,000 - ₹35,00,000 / year',
      description: 'Connects technology, user experience, and business strategy to define and lead digital products from inception to launch.',
      indian_pathway: {
        stream: 'Any stream',
        entranceExams: ['JEE Main / CUET / CAT / XAT'],
        topInstitutes: ['IIM Calcutta', 'ISB Hyderabad', 'IIT Madras (DoMS)', 'FMS Delhi'],
        freeCourses: ['Product School Micro-Certifications', 'SWAYAM Product Management', 'Coursera Digital Product Management']
      }
    },
    {
      id: 'car-ui-ux-designer',
      title: 'Product UI/UX & Design Systems Architect',
      category: 'Design & Human-Computer Interaction',
      riasec_vector: { R: 0.3, I: 0.6, A: 0.95, S: 0.65, E: 0.5, C: 0.5 },
      required_skills: {
        'Programming & Logic': 3,
        'Data Analysis & Mathematics': 2,
        'Visual Design & UI/UX': 5,
        'Verbal & Written Communication': 4
      },
      education_paths: [
        'B.Des / M.Des in Interaction Design, Industrial Design, or New Media',
        'Comprehensive UX case studies portfolio demonstrating research and accessible design systems'
      ],
      growth_outlook: 'High (+20% projected growth)',
      salary_range: '₹7,50,000 - ₹24,00,000 / year',
      description: 'Creates intuitive, accessible, and delightful digital user interfaces that turn complex workflows into seamless user journeys.',
      indian_pathway: {
        stream: 'Any stream',
        entranceExams: ['UCEED (IIT Bombay)', 'NID DAT', 'CEED (for PG)'],
        topInstitutes: ['National Institute of Design (NID) Ahmedabad', 'IDC School of Design (IIT Bombay)', 'Srishti Institute Bengaluru'],
        freeCourses: ['Google UX Design Certificate', 'NPTEL Interaction Design', 'Figma Community Design Labs']
      }
    },
    {
      id: 'car-biomedical-ai',
      title: 'Biomedical & Healthcare AI Engineer',
      category: 'Healthcare & Biotechnology',
      riasec_vector: { R: 0.6, I: 0.9, A: 0.3, S: 0.7, E: 0.3, C: 0.6 },
      required_skills: {
        'Programming & Logic': 4,
        'Data Analysis & Mathematics': 4,
        'Visual Design & UI/UX': 2,
        'Verbal & Written Communication': 4
      },
      education_paths: [
        'B.Tech in Biomedical Engineering, Biotechnology, or Electrical Engineering',
        'Postgrad in Computational Biology, Medical Imaging, or Health Informatics'
      ],
      growth_outlook: 'High (+26% projected growth)',
      salary_range: '₹8,00,000 - ₹27,00,000 / year',
      description: 'Builds AI diagnostic algorithms, hospital telemetry systems, and robotic assistive devices to elevate patient healthcare outcomes.',
      indian_pathway: {
        stream: 'Science (PCB or PCMB)',
        entranceExams: ['JEE Main', 'NEET (for Allied Health / MedTech)', 'GATE Biotechnology/Biomedical'],
        topInstitutes: ['IIT Madras (Dept of Biotechnology)', 'AIIMS New Delhi (Biomedical Eng)', 'Manipal Institute of Technology'],
        freeCourses: ['NPTEL Biomedical Signal Processing', 'Coursera AI for Medicine by DeepLearning.AI', 'SWAYAM Healthcare Technologies']
      }
    },
    {
      id: 'car-corporate-lawyer',
      title: 'Corporate Lawyer & Tech Policy Advisor',
      category: 'Law & Governance',
      riasec_vector: { R: 0.1, I: 0.75, A: 0.3, S: 0.6, E: 0.9, C: 0.8 },
      required_skills: {
        'Programming & Logic': 2,
        'Data Analysis & Mathematics': 2,
        'Visual Design & UI/UX': 1,
        'Verbal & Written Communication': 5
      },
      education_paths: [
        '5-Year Integrated B.A. LL.B / B.B.A. LL.B from National Law Universities',
        'Specialization in Intellectual Property, Data Privacy, or M&A'
      ],
      growth_outlook: 'Steady (+16% projected growth)',
      salary_range: '₹9,00,000 - ₹30,00,000 / year',
      description: 'Advises tech enterprises and startups on data compliance, intellectual property licensing, antitrust policies, and venture financing.',
      indian_pathway: {
        stream: 'Any stream (Humanities / Commerce / Science)',
        entranceExams: ['CLAT (Common Law Admission Test)', 'AILET (NLU Delhi)', 'LSAT India'],
        topInstitutes: ['NLSIU Bengaluru', 'NALSAR Hyderabad', 'WBNUJS Kolkata', 'NLU Delhi'],
        freeCourses: ['SWAYAM Intellectual Property Rights', 'Coursera Privacy Law and Data Protection', 'NPTEL Constitutional Law']
      }
    },
    {
      id: 'car-sustainability',
      title: 'Environmental Scientist & ESG Consultant',
      category: 'Environment & Sustainability',
      riasec_vector: { R: 0.7, I: 0.85, A: 0.3, S: 0.6, E: 0.6, C: 0.6 },
      required_skills: {
        'Programming & Logic': 2,
        'Data Analysis & Mathematics': 4,
        'Visual Design & UI/UX': 2,
        'Verbal & Written Communication': 4
      },
      education_paths: [
        'B.Sc / B.Tech in Environmental Engineering, Earth Sciences, or Forestry',
        'M.Sc / M.Tech in Climate Science, ESG Reporting, or Renewable Systems'
      ],
      growth_outlook: 'Very High (+30% projected growth)',
      salary_range: '₹7,00,000 - ₹22,00,000 / year',
      description: 'Assists organizations in measuring carbon footprints, achieving net-zero compliance, and deploying renewable energy systems.',
      indian_pathway: {
        stream: 'Science (PCB or PCM)',
        entranceExams: ['CUET (UG)', 'JEE Main', 'ICAR AIEEA'],
        topInstitutes: ['TERI School of Advanced Studies', 'IIT Roorkee (Hydrology)', 'IISc Bengaluru (CES)', 'JNU Delhi'],
        freeCourses: ['UN CC:Learn Climate Change free courses', 'NPTEL Ecology and Environment', 'SWAYAM Sustainable Development']
      }
    }
  ];

  for (const c of careers) {
    insertCareer.run(
      c.id,
      c.title,
      c.category,
      JSON.stringify(c.riasec_vector),
      JSON.stringify(c.required_skills),
      JSON.stringify(c.education_paths),
      c.growth_outlook,
      c.salary_range,
      c.description,
      JSON.stringify(c.indian_pathway)
    );
  }

  // 5. Seed an existing assessment & recommendation for Rahul Verma (Student 2)
  // so Counselor has an active item in review queue right away!
  const assessmentId = 'ass-rahul-001';
  const recId = 'rec-rahul-001';

  db.prepare(`
    INSERT INTO assessments (id, student_id, status, riasec_scores_json, verified_skills_json, work_values_json, reality_check_gap_json, completed_at)
    VALUES (?, ?, 'completed', ?, ?, ?, ?, datetime('now', '-2 hours'))
  `).run(
    assessmentId,
    'user-student-2',
    JSON.stringify({ R: 30, I: 80, A: 40, S: 50, E: 85, C: 90, hollandCode: 'CEI' }),
    JSON.stringify({
      'Programming & Logic': 3.0,
      'Data Analysis & Mathematics': 4.5,
      'Visual Design & UI/UX': 2.0,
      'Verbal & Written Communication': 4.5
    }),
    JSON.stringify({
      'Autonomy & Flexibility': 'Moderately important',
      'Societal Impact & Purpose': 'Very important',
      'High Financial Reward': 'Essential',
      'Job Security & Structure': 'Very important'
    }),
    JSON.stringify({
      skill: 'Data Analysis & Mathematics',
      selfRating: 5,
      verifiedScore: 4.5,
      gap: 0.5,
      status: 'VERIFIED'
    })
  );

  const topCareersRahul = [
    {
      careerId: 'car-fintech-analyst',
      title: 'Fintech & Investment Banking Analyst',
      category: 'Finance & Economics',
      matchScore: 94,
      whyThisCareer: 'High alignment with your Conventional-Enterprising-Investigative profile. Your strong verified math skills (4.5/5) and aspiration for financial growth match top-tier investment banking roles.',
      scoreBreakdown: { interests: 96, skills: 92, values: 94 },
      salaryRange: '₹10,00,000 - ₹32,00,000 / year',
      growthOutlook: 'Steady (+18% projected growth)'
    },
    {
      careerId: 'car-data-scientist',
      title: 'Data Scientist & Analytics Consultant',
      category: 'Technology & Data',
      matchScore: 88,
      whyThisCareer: 'Balances analytical rigor with high market demand. Fits your high investigative score and strong performance on SQL/statistics reality check.',
      scoreBreakdown: { interests: 85, skills: 90, values: 89 },
      salaryRange: '₹9,00,000 - ₹28,00,000 / year',
      growthOutlook: 'High (+28% projected growth)'
    },
    {
      careerId: 'car-product-manager',
      title: 'Digital Product Manager (PM)',
      category: 'Product Strategy & Management',
      matchScore: 82,
      whyThisCareer: 'Leverages your enterprising drive, structured thinking, and solid verbal communication skills.',
      scoreBreakdown: { interests: 84, skills: 78, values: 84 },
      salaryRange: '₹14,00,000 - ₹35,00,000 / year',
      growthOutlook: 'High (+22% projected growth)'
    }
  ];

  db.prepare(`
    INSERT INTO recommendations (id, assessment_id, student_id, top_careers_json, prompt_version, status, counselor_badge, counselor_notes)
    VALUES (?, ?, ?, ?, 'v1.0.0', 'pending_review', 0, NULL)
  `).run(
    recId,
    assessmentId,
    'user-student-2',
    JSON.stringify(topCareersRahul)
  );

  // Seed sample AI log
  db.prepare(`
    INSERT INTO ai_logs (id, user_id, endpoint, model, prompt_sanitized, tokens_count, latency_ms, status, is_fallback)
    VALUES ('log-001', 'user-student-2', '/recommendations/generate', 'gemini-1.5-flash / hybrid-engine', 'Prompt with RIASEC: CEI, verified math 4.5, sanitized profile', 420, 840, 'success', 0)
  `).run();

  // Seed activity event
  db.prepare(`
    INSERT INTO activity_events (id, user_id, event_type, metadata_json)
    VALUES ('act-001', 'user-student-2', 'ASSESSMENT_COMPLETED', '{"score": "CEI"}')
  `).run();

  console.log('✅ PathFinder AI Database seeded successfully!');
  console.log('   Users:');
  console.log('   - student@pathfinder.ai (password123) [Student]');
  console.log('   - rahul@pathfinder.ai   (password123) [Student - Ready with pending review]');
  console.log('   - counselor@pathfinder.ai (password123) [Counselor]');
  console.log('   - admin@pathfinder.ai     (password123) [Admin]');
}

seedDatabase();
