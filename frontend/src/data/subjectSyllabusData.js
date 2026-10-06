// Default structured syllabus data for each subject with modules and subtopics

export const DEFAULT_SUBJECT_SYLLABUS = [
  {
    id: 1,
    subject: 'TCS NQT Aptitude',
    icon: 'Brain',
    color: 'from-purple-500 to-indigo-600',
    accentColor: 'purple',
    targetDate: '2026-12-15',
    resources: [
      { title: 'TCS NQT Prep Master Playlist (YouTube)', url: 'https://youtube.com', type: 'video' },
      { title: 'Aptitude Formulas & Short Tricks Cheatsheet', url: '', type: 'notes' },
    ],
    notes: 'Focus heavily on Profit & Loss, Time & Work, and Syllogism. Solve at least 20 questions daily.',
    modules: [
      {
        id: 'nqt_num',
        name: '1. Numerical Ability',
        topics: [
          { id: 'num_1', name: 'Number System & Divisibility Rules', completed: false },
          { id: 'num_2', name: 'LCM & HCF Problems', completed: false },
          { id: 'num_3', name: 'Percentages & Profit/Loss/Discount', completed: false },
          { id: 'num_4', name: 'Ratios, Proportions & Mixtures', completed: false },
          { id: 'num_5', name: 'Time, Speed & Distance / Trains / Boats', completed: false },
          { id: 'num_6', name: 'Time & Work / Pipes & Cisterns', completed: false },
          { id: 'num_7', name: 'Simple & Compound Interest', completed: false },
          { id: 'num_8', name: 'Averages, Ages & Allegations', completed: false },
          { id: 'num_9', name: 'Mensuration (2D & 3D Geometry)', completed: false },
          { id: 'num_10', name: 'Permutations, Combinations & Probability', completed: false },
        ],
      },
      {
        id: 'nqt_reas',
        name: '2. Reasoning Ability',
        topics: [
          { id: 'reas_1', name: 'Coding - Decoding & Letter Series', completed: false },
          { id: 'reas_2', name: 'Blood Relations (Coded & Direct)', completed: false },
          { id: 'reas_3', name: 'Direction & Distance Sense', completed: false },
          { id: 'reas_4', name: 'Linear & Circular Seating Arrangement', completed: false },
          { id: 'reas_5', name: 'Syllogisms & Venn Diagrams', completed: false },
          { id: 'reas_6', name: 'Data Sufficiency & Statement Assumptions', completed: false },
          { id: 'reas_7', name: 'Number Series & Analogies', completed: false },
          { id: 'reas_8', name: 'Visual / Spatial Reasoning', completed: false },
        ],
      },
      {
        id: 'nqt_verb',
        name: '3. Verbal Ability',
        topics: [
          { id: 'verb_1', name: 'Reading Comprehension (RC passages)', completed: false },
          { id: 'verb_2', name: 'Sentence Completion & Fillers', completed: false },
          { id: 'verb_3', name: 'Error Spotting & Grammar Correction', completed: false },
          { id: 'verb_4', name: 'Para Jumbles / Sentence Rearrangement', completed: false },
          { id: 'verb_5', name: 'Vocabulary: Synonyms & Antonyms', completed: false },
          { id: 'verb_6', name: 'Idioms & Phrases in Context', completed: false },
        ],
      },
    ],
  },
  {
    id: 2,
    subject: 'DSA / Striver',
    icon: 'Code2',
    color: 'from-blue-500 to-cyan-600',
    accentColor: 'blue',
    targetDate: '2026-11-30',
    resources: [
      { title: 'TakeUForward A2Z DSA Course', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/', type: 'link' },
      { title: 'Striver SDE Sheet Top Problems', url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', type: 'link' },
    ],
    notes: 'Aim for 110 total hours. Master Two Pointers, Sliding Window, Trees, and Dynamic Programming.',
    modules: [
      {
        id: 'dsa_core_1',
        name: '1. Foundations & Linear Structures',
        topics: [
          { id: 'dsa_1', name: 'Time & Space Complexity + Recursion Basics', completed: false },
          { id: 'dsa_2', name: 'Arrays: Two Pointers & Sliding Window', completed: false },
          { id: 'dsa_3', name: 'Binary Search on 1D/2D and Answer Space', completed: false },
          { id: 'dsa_4', name: 'Strings & Pattern Searching', completed: false },
          { id: 'dsa_5', name: 'Linked Lists (Singly, Doubly, Fast & Slow Pointer)', completed: false },
          { id: 'dsa_6', name: 'Stacks & Queues (Monotonic Stack patterns)', completed: false },
        ],
      },
      {
        id: 'dsa_core_2',
        name: '2. Non-Linear & Advanced Algorithms',
        topics: [
          { id: 'dsa_7', name: 'Binary Trees Traversals & Views', completed: false },
          { id: 'dsa_8', name: 'Binary Search Trees (BST) & Validation', completed: false },
          { id: 'dsa_9', name: 'Heaps & Priority Queues', completed: false },
          { id: 'dsa_10', name: 'Graphs: BFS/DFS, Cycle Detection & Dijkstra', completed: false },
          { id: 'dsa_11', name: 'Dynamic Programming: 1D, 2D, Subsequences & Strings', completed: false },
          { id: 'dsa_12', name: 'Greedy Algorithms & Backtracking', completed: false },
        ],
      },
    ],
  },
  {
    id: 3,
    subject: 'Coding Practice',
    icon: 'Terminal',
    color: 'from-amber-500 to-orange-600',
    accentColor: 'orange',
    targetDate: '2026-12-20',
    resources: [
      { title: 'TCS Previous Year Coding Questions', url: '', type: 'notes' },
      { title: 'LeetCode 75 Study Plan', url: 'https://leetcode.com/studyplan/leetcode-75/', type: 'link' },
    ],
    notes: 'Practice writing clean code within 25-30 minutes without compiler hints.',
    modules: [
      {
        id: 'code_mod_1',
        name: '1. TCS NQT Hands-On Coding',
        topics: [
          { id: 'cp_1', name: 'Base Conversions & Number Series', completed: false },
          { id: 'cp_2', name: 'Array Manipulations & Matrix Rotations', completed: false },
          { id: 'cp_3', name: 'String Processing without library functions', completed: false },
          { id: 'cp_4', name: 'Simulation & Practical System Problems', completed: false },
          { id: 'cp_5', name: 'Mock Coding Tests (2 Questions in 45 mins)', completed: false },
        ],
      },
      {
        id: 'code_mod_2',
        name: '2. Platform Assessments',
        topics: [
          { id: 'cp_6', name: 'LeetCode Easy-Medium Marathon', completed: false },
          { id: 'cp_7', name: 'GeeksforGeeks TCS Slot 1 & Slot 2 Solved Papers', completed: false },
          { id: 'cp_8', name: 'Time Complexity Optimization & Edge Case Handling', completed: false },
        ],
      },
    ],
  },
  {
    id: 4,
    subject: 'Development',
    icon: 'Laptop',
    color: 'from-emerald-500 to-teal-600',
    accentColor: 'green',
    targetDate: '2026-12-10',
    resources: [
      { title: 'Spring Boot + React Full Stack Roadmap', url: '', type: 'notes' },
      { title: 'PostgreSQL & Supabase Docs', url: 'https://supabase.com/docs', type: 'link' },
    ],
    notes: 'Build 1-2 robust full-stack projects to highlight on your resume and talk about in interviews.',
    modules: [
      {
        id: 'dev_mod_1',
        name: '1. Frontend & UI Engineering',
        topics: [
          { id: 'dev_1', name: 'React Fundamentals (JSX, Hooks, State & Props)', completed: false },
          { id: 'dev_2', name: 'Responsive UI Design & Tailwind CSS', completed: false },
          { id: 'dev_3', name: 'Client-side Routing & Protected Routes', completed: false },
          { id: 'dev_4', name: 'REST API Fetching, Async/Await & Error Boundaries', completed: false },
        ],
      },
      {
        id: 'dev_mod_2',
        name: '2. Backend, Database & Deployment',
        topics: [
          { id: 'dev_5', name: 'Java Spring Boot / Node.js REST API Architecture', completed: false },
          { id: 'dev_6', name: 'Relational Databases (SQL Queries, Schema Design, Joins)', completed: false },
          { id: 'dev_7', name: 'Authentication (JWT / OAuth / Supabase Auth)', completed: false },
          { id: 'dev_8', name: 'Git & GitHub Workflows + Vercel / Render Deployment', completed: false },
        ],
      },
    ],
  },
  {
    id: 5,
    subject: 'Communication',
    icon: 'MessageSquare',
    color: 'from-pink-500 to-rose-600',
    accentColor: 'pink',
    targetDate: '2026-12-25',
    resources: [
      { title: 'Self Introduction Framework (STAR Method)', url: '', type: 'notes' },
    ],
    notes: 'Spend 30 minutes daily speaking aloud, recording yourself, or reading tech articles.',
    modules: [
      {
        id: 'comm_mod_1',
        name: '1. Spoken English & Articulation',
        topics: [
          { id: 'comm_1', name: '2-Minute Self Introduction Pitch Mastery', completed: false },
          { id: 'comm_2', name: 'Clear Pronunciation & Voice Modulation', completed: false },
          { id: 'comm_3', name: 'Extempore / Just-A-Minute (JAM) Practice', completed: false },
          { id: 'comm_4', name: 'Project Walkthrough Explanation Practice', completed: false },
        ],
      },
      {
        id: 'comm_mod_2',
        name: '2. Professional & Business Communication',
        topics: [
          { id: 'comm_5', name: 'Email Writing & Workplace Etiquette', completed: false },
          { id: 'comm_6', name: 'Group Discussion (GD) Opening & Moderating', completed: false },
          { id: 'comm_7', name: 'Active Listening & Answering with Clarity', completed: false },
        ],
      },
    ],
  },
  {
    id: 6,
    subject: 'Interview Preparation',
    icon: 'Award',
    color: 'from-amber-400 to-yellow-600',
    accentColor: 'yellow',
    targetDate: '2026-12-31',
    resources: [
      { title: 'Core CS Subjects Interview Notes (PDF)', url: '', type: 'notes' },
      { title: 'Top 50 Behavioral HR Questions', url: '', type: 'notes' },
    ],
    notes: 'Revise OOPs, DBMS queries, OS process/thread concepts, and your resume projects.',
    modules: [
      {
        id: 'int_mod_1',
        name: '1. Core Computer Science Fundamentals',
        topics: [
          { id: 'int_1', name: 'Object-Oriented Programming (OOPs: Polymorphism, Inheritance, Encapsulation, Abstraction)', completed: false },
          { id: 'int_2', name: 'DBMS: Normalization, ACID Properties, SQL Joins & Indexing', completed: false },
          { id: 'int_3', name: 'Operating Systems: Processes, Threads, Deadlocks, Memory Management', completed: false },
          { id: 'int_4', name: 'Computer Networks: OSI Model, TCP vs UDP, HTTP/HTTPS, DNS', completed: false },
        ],
      },
      {
        id: 'int_mod_2',
        name: '2. HR, Managerial & Resume Mastery',
        topics: [
          { id: 'int_5', name: 'Why TCS? Why should we hire you?', completed: false },
          { id: 'int_6', name: 'Strengths, Weaknesses & Conflict Handling (STAR Technique)', completed: false },
          { id: 'int_7', name: 'Deep-dive into every bullet point on Resume', completed: false },
          { id: 'int_8', name: 'Mock Technical & HR Interviews', completed: false },
        ],
      },
    ],
  },
];
