import { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Calculator,
  FileText,
  Code,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Zap,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { NQT_QUIZ_DATA } from '../data/quizData';
import { saveQuizResult, getQuizHistory, getUserXp, getLevelInfo } from '../lib/gamificationUtils';
import { triggerCelebration } from '../lib/confetti';

const ICON_MAP = {
  Calculator,
  Brain,
  FileText,
  Code,
};

export default function PracticeQuiz() {
  const [selectedCategory, setSelectedCategory] = useState('numerical');
  const [quizMode, setQuizMode] = useState('test'); // 'test' | 'practice'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showPracticeExplanation, setShowPracticeExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [userXp, setUserXp] = useState(getUserXp());
  const targetEndTimeRef = useRef(null);
  const timerRef = useRef(null);

  const categoryData = NQT_QUIZ_DATA[selectedCategory] || NQT_QUIZ_DATA.numerical;
  const questions = categoryData.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const levelInfo = getLevelInfo(userXp);

  useEffect(() => {
    setQuizHistory(getQuizHistory());
    const handleXpUpdate = (e) => {
      if (e?.detail?.xp !== undefined) {
        setUserXp(e.detail.xp);
      } else {
        setUserXp(getUserXp());
      }
    };
    window.addEventListener('xp-updated', handleXpUpdate);
    return () => window.removeEventListener('xp-updated', handleXpUpdate);
  }, []);

  // Timer countdown in test mode with timestamp-based precision & tab switch sync
  useEffect(() => {
    if (!isTimerRunning || quizCompleted) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const checkTime = () => {
      if (!targetEndTimeRef.current) return;
      const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        targetEndTimeRef.current = null;
        handleSubmitQuiz();
      }
    };

    checkTime();
    timerRef.current = setInterval(checkTime, 500);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' || !document.hidden) {
        checkTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [isTimerRunning, quizCompleted]);

  const startQuiz = (categoryKey, mode = 'test') => {
    setSelectedCategory(categoryKey);
    setQuizMode(mode);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowPracticeExplanation(false);
    setQuizCompleted(false);
    setScoreResult(null);
    setTimeLeft(300);

    if (mode === 'test') {
      targetEndTimeRef.current = Date.now() + 300 * 1000;
      setIsTimerRunning(true);
    } else {
      targetEndTimeRef.current = null;
      setIsTimerRunning(false);
    }
  };

  const handleSelectOption = (index) => {
    if (quizCompleted && quizMode === 'test') return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: index,
    }));
  };

  const handleSubmitQuiz = () => {
    setIsTimerRunning(false);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const timeSpent = 300 - timeLeft;
    const result = saveQuizResult(categoryData.title, correctCount, questions.length, timeSpent);
    
    setScoreResult({
      score: correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100),
      earnedXp: result?.earnedXp || 0,
      timeSpent,
    });
    setQuizCompleted(true);
    setUserXp(getUserXp());
    setQuizHistory(getQuizHistory());

    if (correctCount / questions.length >= 0.7) {
      triggerCelebration();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Gamification Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
              <Zap className="w-5 h-5" />
            </span>
            TCS NQT Practice Arena & Quiz
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Master authentic TCS NQT questions, build speed, and earn XP points.
          </p>
        </div>

        {/* Level and XP Badge */}
        <div className="card px-4 py-2.5 flex items-center gap-3">
          <span className="text-2xl">{levelInfo.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                Level {levelInfo.level}: {levelInfo.title}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500 font-semibold border border-primary-500/20">
                {levelInfo.currentXp} XP
              </span>
            </div>
            <div className="w-32 bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-primary-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Cards Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(NQT_QUIZ_DATA).map(([key, item]) => {
          const IconComponent = ICON_MAP[item.icon] || HelpCircle;
          const isSelected = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => startQuiz(key, quizMode)}
              className={`card p-4 text-left transition-all relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/5'
                  : 'hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.color} text-white shadow-md`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {item.questions.length} Qs
                </span>
              </div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-gray-100 dark:bg-gray-900/60 p-2 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => startQuiz(selectedCategory, 'test')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              quizMode === 'test'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Timed Mock Test (5 mins)
          </button>
          <button
            onClick={() => startQuiz(selectedCategory, 'practice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              quizMode === 'practice'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Practice & Solutions Mode
          </button>
        </div>

        {quizMode === 'test' && !quizCompleted && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 text-xs font-bold font-mono">
            <Clock className="w-3.5 h-3.5" />
            Time Left: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Main Question / Result Area */}
      {!quizCompleted ? (
        <div className="card p-6 space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary-500 bg-primary-500/10 px-2.5 py-1 rounded-md border border-primary-500/20">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-gray-500">
                {categoryData.title}
              </span>
            </div>

            {/* Question Quick Dots */}
            <div className="flex items-center gap-1.5">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    setShowPracticeExplanation(false);
                  }}
                  className={`w-6 h-6 rounded-md text-xs font-bold transition-all ${
                    currentQuestionIndex === idx
                      ? 'bg-primary-600 text-white'
                      : selectedAnswers[idx] !== undefined
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed whitespace-pre-line">
              {currentQuestion?.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === idx;
              const isPracticeAnswer = quizMode === 'practice' && showPracticeExplanation;
              const isCorrect = idx === currentQuestion.correctIndex;

              let optionStyle = 'border-gray-200 dark:border-gray-800 hover:border-primary-500/50 hover:bg-gray-50 dark:hover:bg-gray-800/50';

              if (isSelected && !isPracticeAnswer) {
                optionStyle = 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold';
              } else if (isPracticeAnswer) {
                if (isCorrect) {
                  optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between text-sm ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold flex items-center justify-center text-gray-600 dark:text-gray-300">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {isPracticeAnswer && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  )}
                  {isPracticeAnswer && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Practice Mode Instant Explanation */}
          {quizMode === 'practice' && (
            <div className="pt-2">
              {!showPracticeExplanation ? (
                <button
                  onClick={() => setShowPracticeExplanation(true)}
                  className="btn-secondary text-xs flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-primary-500" />
                  Show Formula & Step-by-Step Solution
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Step-by-Step Solution:
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                  {currentQuestion.formula && (
                    <div className="mt-2 pt-2 border-t border-blue-500/20 text-[11px] font-mono text-primary-600 dark:text-primary-300">
                      ⚡ Shortcut/Formula: {currentQuestion.formula}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                  setShowPracticeExplanation(false);
                }
              }}
              disabled={currentQuestionIndex === 0}
              className="btn-secondary text-xs disabled:opacity-40"
            >
              Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                  setShowPracticeExplanation(false);
                }}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                Next Question <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="btn-primary text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Submit & Finish Quiz
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Result View */
        <div className="card p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20 flex items-center justify-center mx-auto text-3xl">
            {scoreResult.percentage >= 80 ? '🏆' : scoreResult.percentage >= 50 ? '🎯' : '📚'}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {scoreResult.percentage >= 80
                ? 'Outstanding Performance!'
                : scoreResult.percentage >= 50
                ? 'Good Job! Keep Practicing!'
                : 'Need More Revision!'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You scored {scoreResult.score} out of {scoreResult.total} questions ({scoreResult.percentage}%)
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 text-center min-w-[120px]">
              <span className="text-xs text-gray-400">Accuracy</span>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{scoreResult.percentage}%</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 text-center min-w-[120px]">
              <span className="text-xs text-gray-400">XP Earned</span>
              <p className="text-lg font-bold text-primary-500">+{scoreResult.earnedXp} XP</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 text-center min-w-[120px]">
              <span className="text-xs text-gray-400">Time Taken</span>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(scoreResult.timeSpent)}</p>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="text-left space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-primary-500" /> Answer Review & Solutions:
            </h3>

            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border ${
                      isCorrect
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        {idx + 1}. {q.question}
                      </span>
                      {isCorrect ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex-shrink-0">
                          ✓ Correct
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 font-bold flex-shrink-0">
                          ✗ Incorrect
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                      <p>
                        <span className="font-semibold text-emerald-500">Correct Answer:</span> {q.options[q.correctIndex]}
                      </p>
                      {!isCorrect && userAns !== undefined && (
                        <p>
                          <span className="font-semibold text-red-500">Your Answer:</span> {q.options[userAns]}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 bg-gray-100 dark:bg-gray-800 p-2.5 rounded-lg whitespace-pre-line">
                        💡 {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => startQuiz(selectedCategory, quizMode)}
              className="btn-primary flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Retake Quiz
            </button>
            <button
              onClick={() => {
                const categories = Object.keys(NQT_QUIZ_DATA);
                const nextIdx = (categories.indexOf(selectedCategory) + 1) % categories.length;
                startQuiz(categories[nextIdx], quizMode);
              }}
              className="btn-secondary flex items-center gap-2"
            >
              Try Next Section <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Quiz Attempts & Accuracy History */}
      {quizHistory.length > 0 && (
        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-500" /> Recent Quiz Activity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {quizHistory.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                    {item.category}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {item.timeSpentSeconds}s
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    item.percentage >= 80
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : item.percentage >= 50
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}
                >
                  {item.score}/{item.total} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
