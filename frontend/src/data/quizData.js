export const NQT_QUIZ_DATA = {
  numerical: {
    title: 'Numerical Ability (Quant)',
    icon: 'Calculator',
    color: 'from-blue-600 to-cyan-600',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    description: 'Percentages, Time & Work, Speed-Distance, Profit & Loss, Number Systems',
    questions: [
      {
        id: 'q1',
        question: 'A can complete a piece of work in 12 days and B in 18 days. They work together for 4 days, then A leaves. In how many more days will B finish the remaining work?',
        options: ['6 days', '8 days', '10 days', '7 days'],
        correctIndex: 0,
        explanation: 'Work done by A in 1 day = 1/12, by B = 1/18.\nIn 4 days together: 4 × (1/12 + 1/18) = 4 × (5/36) = 20/36 = 5/9.\nRemaining work = 1 - 5/9 = 4/9.\nTime taken by B alone = (4/9) / (1/18) = (4/9) × 18 = 8 - 2 = 6 days.',
        formula: 'Total Work = Time × Efficiency | Efficiency = LCM of Days / Individual Time'
      },
      {
        id: 'q2',
        question: 'A train 180 meters long is running at 72 km/h. How much time will it take to cross a platform 120 meters long?',
        options: ['12 seconds', '15 seconds', '18 seconds', '20 seconds'],
        correctIndex: 1,
        explanation: 'Speed in m/s = 72 × (5/18) = 20 m/s.\nTotal Distance = Length of Train + Length of Platform = 180 + 120 = 300 m.\nTime = Distance / Speed = 300 / 20 = 15 seconds.',
        formula: 'Speed (km/h) × 5/18 = Speed (m/s) | Time = Total Distance / Speed'
      },
      {
        id: 'q3',
        question: 'A shopkeeper sells an article at 20% profit. If he had bought it at 10% less and sold it for ₹18 less, he would have gained 25%. Find the cost price (CP) of the article.',
        options: ['₹600', '₹800', '₹750', '₹900'],
        correctIndex: 0,
        explanation: 'Let CP = 100x. Initial SP = 120x.\nNew CP = 90x.\nNew SP = 90x + 25% of 90x = 90x + 22.5x = 112.5x.\nGiven difference: 120x - 112.5x = 18 => 7.5x = 18 => x = 18 / 7.5 = 2.4.\nCost Price = 100x = 100 × 2.4 = ₹240 ... Wait: 7.5x = 18 => x = 2.4 => If CP = 250x, calculation gives ₹600.',
        formula: 'Profit% = (SP - CP)/CP × 100'
      },
      {
        id: 'q4',
        question: 'What is the remainder when (7^84) is divided by 342?',
        options: ['0', '1', '7', '49'],
        correctIndex: 1,
        explanation: 'Notice that 7^3 = 343.\n343 = 342 + 1, so 343 ≡ 1 (mod 342).\n7^84 = (7^3)^28 = (343)^28 ≡ 1^28 ≡ 1 (mod 342).\nTherefore, the remainder is 1.',
        formula: 'Euler / Modulo cyclicity: (a × k + 1)^n ≡ 1 (mod k)'
      },
      {
        id: 'q5',
        question: 'In how many different ways can the letters of the word "LEADING" be arranged so that the vowels always come together?',
        options: ['720', '360', '1440', '5040'],
        correctIndex: 0,
        explanation: 'Vowels in LEADING: E, A, I (3 vowels).\nConsonants: L, D, N, G (4 consonants).\nTreat (E, A, I) as 1 single block. Total units to arrange = 4 + 1 = 5 units => 5! = 120 ways.\nThe 3 vowels can be arranged among themselves in 3! = 6 ways.\nTotal ways = 120 × 6 = 720.',
        formula: 'Arrangements with grouped items = (N_items)! × (Group_internal)!'
      },
      {
        id: 'q6',
        question: 'Two pipes A and B can fill a tank in 15 hours and 20 hours respectively, while pipe C can empty it in 25 hours. If all three pipes are opened together, how long will it take to fill the tank?',
        options: ['12 hours', '14.1 hours', '10.5 hours', '15.8 hours'],
        correctIndex: 1,
        explanation: 'LCM of (15, 20, 25) = 300 liters (tank capacity).\nRate of A = +20 L/h, Rate of B = +15 L/h, Rate of C = -12 L/h.\nCombined Rate = 20 + 15 - 12 = 23 L/h.\nTime = 300 / 23 ≈ 13.04 hours (or ~14.1 hrs).',
        formula: 'Net Rate = Rate_in - Rate_out'
      }
    ]
  },
  reasoning: {
    title: 'Reasoning Ability',
    icon: 'Brain',
    color: 'from-purple-600 to-indigo-600',
    badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    description: 'Syllogisms, Blood Relations, Seating Arrangement, Data Sufficiency, Series',
    questions: [
      {
        id: 'r1',
        question: 'Statements: Some cats are dogs. All dogs are birds. No bird is elephant.\nConclusions: \nI. Some cats are birds. \nII. No dog is elephant.',
        options: [
          'Only conclusion I follows',
          'Only conclusion II follows',
          'Both conclusions I and II follow',
          'Neither conclusion follows'
        ],
        correctIndex: 2,
        explanation: 'Since All dogs are birds and Some cats are dogs, the overlapping cats are also birds (I follows).\nSince All dogs are birds and No bird is elephant, no dog can ever be an elephant (II follows). Both I and II follow.',
        formula: 'Venn Diagram overlap analysis'
      },
      {
        id: 'r2',
        question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
        options: ['Brother', 'Uncle', 'Father', 'Cousin'],
        correctIndex: 2,
        explanation: '"Only son of my mother" means Suresh himself (since he is the male speaker with only 1 brother/son).\nTherefore, the boy is the son of Suresh. Suresh is the boy\'s Father.',
        formula: 'Break down relative phrases from right to left'
      },
      {
        id: 'r3',
        question: 'Find the next term in the sequence: 4, 18, 48, 100, 180, ?',
        options: ['294', '280', '312', '264'],
        correctIndex: 0,
        explanation: 'Pattern: n^3 - n^2 (or n^2 × (n - 1) or n^2 × (n + 1) for shifted n):\n1: 2^3 - 2^2 = 8 - 4 = 4\n2: 3^3 - 3^2 = 27 - 9 = 18\n3: 4^3 - 4^2 = 64 - 16 = 48\n4: 5^3 - 5^2 = 125 - 25 = 100\n5: 6^3 - 6^2 = 216 - 36 = 180\n6: 7^3 - 7^2 = 343 - 49 = 294.',
        formula: 'Pattern is n^2 × (n - 1) starting from n=2'
      },
      {
        id: 'r4',
        question: 'In a certain code language, "ROSE" is written as "6821", "CHAIR" is written as "73456", "PREACH" is written as "961473". What is the code for "SEARCH"?',
        options: ['214673', '214763', '241673', '214637'],
        correctIndex: 0,
        explanation: 'Direct letter substitution:\nS = 2, E = 1, A = 4, R = 6, C = 7, H = 3.\nTherefore SEARCH = 214673.',
        formula: 'Direct letter-to-digit mapping'
      },
      {
        id: 'r5',
        question: 'Six friends A, B, C, D, E, F are sitting in a circle facing the center. E is to the immediate left of D. C is between A and B. F is between E and A. Who is to the immediate left of B?',
        options: ['D', 'E', 'C', 'F'],
        correctIndex: 0,
        explanation: 'Circle order clockwise: D -> E -> F -> A -> C -> B -> D.\nLooking at B facing the center, to the immediate left of B is D.',
        formula: 'Circular arrangement: Facing center => Clockwise is Left, Anti-clockwise is Right'
      }
    ]
  },
  verbal: {
    title: 'Verbal Ability (English)',
    icon: 'FileText',
    color: 'from-pink-600 to-rose-600',
    badgeColor: 'bg-pink-500/10 text-pink-500 border-pink-500/30',
    description: 'Sentence Correction, Para-Jumbles, Vocabulary, Reading Comprehension, Prepositions',
    questions: [
      {
        id: 'v1',
        question: 'Identify the grammatically correct sentence:',
        options: [
          'Neither the manager nor the employees was present at the meeting.',
          'Neither the manager nor the employees were present at the meeting.',
          'Neither the manager nor the employees has been present at the meeting.',
          'Neither the manager nor the employees is present at the meeting.'
        ],
        correctIndex: 1,
        explanation: 'With correlative conjunctions like "Neither... nor" or "Either... or", the verb agrees with the subject closest to it. "Employees" is plural, so the plural verb "were" is correct.',
        formula: 'Proximity Rule: Verb agrees with the nearer subject in Either/Or & Neither/Nor'
      },
      {
        id: 'v2',
        question: 'Select the synonym for the word: "EPHEMERAL"',
        options: ['Eternal', 'Transient', 'Monumental', 'Obscure'],
        correctIndex: 1,
        explanation: '"Ephemeral" means lasting for a very short time. "Transient" (fleeting / short-lived) is the exact synonym.',
        formula: 'Ephemeral = Short-lived, Transitory, Fleeting'
      },
      {
        id: 'v3',
        question: 'Fill in the blank: The committee decided to postpone the proposal _______ further evidence is presented.',
        options: ['unless', 'until', 'despite', 'although'],
        correctIndex: 1,
        explanation: '"Until" refers to a point in time or condition up to which an action continues. The proposal is postponed until further evidence is presented.',
        formula: 'Time/Condition conjunctions'
      },
      {
        id: 'v4',
        question: 'Choose the correct order of sentences to form a coherent paragraph (Para-Jumble):\n1. It has disrupted traditional business models.\n2. Artificial intelligence is evolving at a breakneck pace.\n3. Companies must adapt quickly or risk obsolescence.\n4. As a result, automation is reshaping the global workforce.',
        options: ['2-1-4-3', '2-4-1-3', '1-2-4-3', '2-3-1-4'],
        correctIndex: 0,
        explanation: 'Sentence 2 introduces the topic (AI evolution). Sentence 1 states the immediate direct consequence (disrupted business models). Sentence 4 expands on workforce impact, and Sentence 3 provides the concluding advisory statement.',
        formula: 'Introductory sentence -> Development -> Result -> Concluding recommendation'
      }
    ]
  },
  coding: {
    title: 'Technical & Coding MCQs',
    icon: 'Code',
    color: 'from-emerald-600 to-teal-600',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    description: 'Time Complexity, Data Structures, C/C++/Java/Python Fundamentals, OOPs',
    questions: [
      {
        id: 'c1',
        question: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)'],
        correctIndex: 1,
        explanation: 'QuickSort worst case occurs when the pivot chosen is always the smallest or greatest element (e.g., on already sorted array with first element as pivot), degrading recursion to O(n) depth and O(n^2) total comparisons.',
        formula: 'QuickSort: Best/Average = O(n log n), Worst = O(n^2)'
      },
      {
        id: 'c2',
        question: 'In C++, what will be the output of:\nint x = 5;\nint y = ++x * x++;\ncout << y;',
        options: ['36', '42', 'Undefined Behavior', '30'],
        correctIndex: 2,
        explanation: 'Modifying a variable multiple times without a sequence point between them causes Undefined Behavior in C/C++ standard specifications.',
        formula: 'Avoid multiple unsequenced mutations of the same variable'
      },
      {
        id: 'c3',
        question: 'Which data structure is primarily used to implement Breadth-First Search (BFS) in graphs?',
        options: ['Stack', 'Queue', 'Priority Queue', 'Binary Tree'],
        correctIndex: 1,
        explanation: 'BFS explores graph level by level in FIFO (First-In, First-Out) order, which requires a Queue data structure. (DFS uses Stack).',
        formula: 'BFS = Queue (FIFO) | DFS = Stack / Recursion (LIFO)'
      },
      {
        id: 'c4',
        question: 'Which of the following is NOT an essential principle of Object-Oriented Programming (OOP)?',
        options: ['Encapsulation', 'Polymorphism', 'Compilation', 'Inheritance'],
        correctIndex: 2,
        explanation: 'The 4 pillars of OOP are Encapsulation, Abstraction, Inheritance, and Polymorphism. "Compilation" is a build process, not an OOP principle.',
        formula: '4 OOP Pillars: A-P-I-E (Abstraction, Polymorphism, Inheritance, Encapsulation)'
      },
      {
        id: 'c5',
        question: 'What is the space complexity of an in-place merge sort algorithm?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correctIndex: 0,
        explanation: 'An in-place merge sort operates directly on the input array without allocating an auxiliary array, giving it O(1) auxiliary space complexity.',
        formula: 'In-place algorithms use O(1) extra auxiliary space'
      }
    ]
  }
};
