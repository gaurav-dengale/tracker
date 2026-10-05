import { ExternalLink, BookOpen, Code, Calculator, Brain, Award } from 'lucide-react';

const RESOURCES = [
  {
    title: "Striver's A2Z DSA Sheet",
    description: "Complete Step-by-Step DSA roadmap (TakeUforward)",
    url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
    category: "DSA",
    icon: Code,
    badge: "Essential",
    color: "from-blue-600 to-cyan-500",
  },
  {
    title: "IndiaBix Quantitative Aptitude",
    description: "Topic-wise aptitude formulas & solved questions",
    url: "https://www.indiabix.com/aptitude/questions-and-answers/",
    category: "Aptitude",
    icon: Calculator,
    badge: "High Weightage",
    color: "from-purple-600 to-pink-500",
  },
  {
    title: "IndiaBix Logical Reasoning",
    description: "Blood relations, series, seating arrangements",
    url: "https://www.indiabix.com/logical-reasoning/questions-and-answers/",
    category: "Reasoning",
    icon: Brain,
    badge: "Core",
    color: "from-emerald-600 to-teal-500",
  },
  {
    title: "GeeksforGeeks TCS NQT Guide",
    description: "Previous year questions, test patterns & syllabus",
    url: "https://www.geeksforgeeks.org/tcs-nqt-preparation/",
    category: "Exam Guide",
    icon: Award,
    badge: "Official Pattern",
    color: "from-amber-600 to-orange-500",
  },
];

export default function StudyResources() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600/20 text-primary-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              Quick Study Resources & Direct Links
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Handpicked preparation portals</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {RESOURCES.map((r) => {
          const Icon = r.icon;
          return (
            <a
              key={r.title}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 hover:border-primary-500/50 hover:bg-primary-50/30 dark:hover:bg-gray-800 transition-all flex items-start gap-3 group"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${r.color} text-white flex items-center justify-center flex-shrink-0 shadow-md`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {r.title}
                  </h3>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-primary-500 flex-shrink-0 transition-colors" />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                  {r.description}
                </p>
                <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-200/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300">
                  {r.badge}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
