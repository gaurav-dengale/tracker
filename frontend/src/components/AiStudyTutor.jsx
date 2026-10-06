import { useState, useEffect } from 'react';
import {
  Sparkles, Bot, X, Send, Copy, Check, Key, Lightbulb,
  Code2, Calculator, MessageSquare, RefreshCw, AlertCircle, ChevronRight
} from 'lucide-react';
import {
  askGemini, getDsaHint, analyzeCodeComplexity,
  explainAptitudeShortcut, evaluateMockInterviewAnswer,
  getApiKey, saveApiKey
} from '../lib/geminiService';

export default function AiStudyTutor({ isOpen, onClose, initialContext }) {
  const [activeTab, setActiveTab] = useState('dsa'); // 'dsa' | 'code' | 'aptitude' | 'interview' | 'chat'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [dsaInput, setDsaInput] = useState({ problem: '', topic: 'Arrays', difficulty: 'Medium' });
  const [codeInput, setCodeInput] = useState({ problem: '', code: '', language: 'Java' });
  const [aptitudeInput, setAptitudeInput] = useState({ topic: '' });
  const [interviewInput, setInterviewInput] = useState({ question: '', answer: '' });
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: "👋 Hi! I'm your **TCS NQT & DSA AI Mentor**. Ask me for progressive hints on any coding problem, speed-math tricks for aptitude, or code complexity reviews!",
    },
  ]);

  // Output response
  const [resultResponse, setResultResponse] = useState('');

  // API Key Settings Modal
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    setApiKeyInput(getApiKey());
  }, [showKeyModal, isOpen]);

  // Update initial context when opened from a specific problem or topic
  useEffect(() => {
    if (initialContext) {
      if (initialContext.type === 'dsa') {
        setActiveTab('dsa');
        setDsaInput({
          problem: initialContext.title || '',
          topic: initialContext.topic || 'DSA',
          difficulty: initialContext.difficulty || 'Medium',
        });
        setCodeInput((prev) => ({ ...prev, problem: initialContext.title || '' }));
      } else if (initialContext.type === 'subject') {
        setActiveTab('aptitude');
        setAptitudeInput({ topic: initialContext.subject || '' });
      }
    }
  }, [initialContext]);

  if (!isOpen) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    saveApiKey(apiKeyInput.trim());
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyModal(false);
    }, 1500);
  };

  const handleGetDsaHint = async (e) => {
    e?.preventDefault();
    if (!dsaInput.problem.trim()) return;
    setLoading(true);
    setError(null);
    setResultResponse('');
    try {
      const res = await getDsaHint(dsaInput.problem, dsaInput.topic, dsaInput.difficulty);
      setResultResponse(res);
    } catch (err) {
      setError(err.message || 'Failed to get hint.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCode = async (e) => {
    e?.preventDefault();
    if (!codeInput.code.trim()) return;
    setLoading(true);
    setError(null);
    setResultResponse('');
    try {
      const res = await analyzeCodeComplexity(
        codeInput.problem || 'DSA Problem',
        codeInput.code,
        codeInput.language
      );
      setResultResponse(res);
    } catch (err) {
      setError(err.message || 'Failed to analyze code.');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainAptitude = async (e) => {
    e?.preventDefault();
    if (!aptitudeInput.topic.trim()) return;
    setLoading(true);
    setError(null);
    setResultResponse('');
    try {
      const res = await explainAptitudeShortcut(aptitudeInput.topic);
      setResultResponse(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch explanation.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateInterview = async (e) => {
    e?.preventDefault();
    if (!interviewInput.question.trim() || !interviewInput.answer.trim()) return;
    setLoading(true);
    setError(null);
    setResultResponse('');
    try {
      const res = await evaluateMockInterviewAnswer(
        interviewInput.question,
        interviewInput.answer
      );
      setResultResponse(res);
    } catch (err) {
      setError(err.message || 'Failed to evaluate answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || loading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    setError(null);

    try {
      const res = await askGemini(userMsg);
      setChatMessages((prev) => [...prev, { role: 'assistant', text: res }]);
    } catch (err) {
      setError(err.message || 'Failed to get response.');
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `⚠️ Error: ${err.message || 'Could not connect to AI.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full h-[88vh] max-h-[750px] shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg">TCS NQT AI Study Mentor</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/25 rounded-full uppercase tracking-wider">
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-white/80">
                DSA Progressive Hints • Code Complexity • Aptitude Shortcuts • Mock Interview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowKeyModal(true)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Configure API Key"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-gray-100 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 overflow-x-auto flex-shrink-0 text-xs">
          {[
            { id: 'dsa', label: 'DSA Hints', icon: Lightbulb },
            { id: 'code', label: 'Code Review & Complexity', icon: Code2 },
            { id: 'aptitude', label: 'Aptitude Shortcuts', icon: Calculator },
            { id: 'interview', label: 'Mock Interview', icon: MessageSquare },
            { id: 'chat', label: 'Ask AI Chat', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError(null);
                  setResultResponse('');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: DSA HINTS */}
          {activeTab === 'dsa' && (
            <div className="space-y-4">
              <form onSubmit={handleGetDsaHint} className="space-y-3">
                <div>
                  <label className="label">Problem Name / Topic</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 3Sum, Trapping Rainwater, Binary Search in Rotated Array"
                    value={dsaInput.problem}
                    onChange={(e) => setDsaInput({ ...dsaInput, problem: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Topic Category</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Arrays, Trees, Dynamic Programming"
                      value={dsaInput.topic}
                      onChange={(e) => setDsaInput({ ...dsaInput, topic: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Difficulty</label>
                    <select
                      className="input-field"
                      value={dsaInput.difficulty}
                      onChange={(e) => setDsaInput({ ...dsaInput, difficulty: e.target.value })}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                  {loading ? 'Generating Hints...' : 'Get Progressive Hints & Logic'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CODE REVIEW */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <form onSubmit={handleAnalyzeCode} className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Problem Name (e.g. Next Permutation)"
                    value={codeInput.problem}
                    onChange={(e) => setCodeInput({ ...codeInput, problem: e.target.value })}
                  />
                  <select
                    className="input-field w-32"
                    value={codeInput.language}
                    onChange={(e) => setCodeInput({ ...codeInput, language: e.target.value })}
                  >
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                  </select>
                </div>

                <div>
                  <label className="label">Paste Your Code Snippet</label>
                  <textarea
                    rows={6}
                    className="input-field font-mono text-xs"
                    placeholder="Paste your solution code here to analyze Big-O time/space, TLE risks, and edge cases..."
                    value={codeInput.code}
                    onChange={(e) => setCodeInput({ ...codeInput, code: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Code2 className="w-4 h-4" />}
                  {loading ? 'Analyzing Code...' : 'Analyze Time/Space & Edge Cases'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: APTITUDE SHORTCUTS */}
          {activeTab === 'aptitude' && (
            <div className="space-y-4">
              <form onSubmit={handleExplainAptitude} className="space-y-3">
                <div>
                  <label className="label">Aptitude Topic or Question</label>
                  <textarea
                    rows={3}
                    className="input-field text-sm"
                    placeholder="e.g. If A takes 12 days and B takes 18 days to complete a work, how many days working together? OR 'Profit and Loss Discount tricks'"
                    value={aptitudeInput.topic}
                    onChange={(e) => setAptitudeInput({ topic: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-gray-400 self-center">Quick Topics:</span>
                  {['Time & Work', 'Speed, Time & Distance', 'Percentages & Profit/Loss', 'Syllogisms', 'Number Series'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAptitudeInput({ topic: t })}
                      className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:text-primary-600"
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                  {loading ? 'Calculating Shortcut...' : 'Explain 30-Second Speed Math Shortcut'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: MOCK INTERVIEW */}
          {activeTab === 'interview' && (
            <div className="space-y-4">
              <form onSubmit={handleEvaluateInterview} className="space-y-3">
                <div>
                  <label className="label">Interview Question</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Tell me about a challenging bug you fixed in your project. OR Explain OOPs Polymorphism."
                    value={interviewInput.question}
                    onChange={(e) => setInterviewInput({ ...interviewInput, question: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Your Spoken / Written Answer</label>
                  <textarea
                    rows={4}
                    className="input-field text-sm"
                    placeholder="Type your answer as you would speak it to the interviewer..."
                    value={interviewInput.answer}
                    onChange={(e) => setInterviewInput({ ...interviewInput, answer: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  {loading ? 'Evaluating Response...' : 'Evaluate Answer & Get Score (STAR Method)'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                <input
                  type="text"
                  className="input-field flex-1 text-sm"
                  placeholder="Ask any TCS NQT question, doubt, or roadmap advice..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !chatInput.trim()} className="btn-primary px-4">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          )}

          {/* Error Message Box */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="underline mt-1 hover:text-red-900 dark:hover:text-red-200"
                >
                  Click here to check or update your Gemini API Key
                </button>
              </div>
            </div>
          )}

          {/* AI Result Card (Tabs 1-4) */}
          {resultResponse && activeTab !== 'chat' && (
            <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    AI Mentor Feedback & Explanation
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(resultResponse)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-sans">
                {resultResponse}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Gemini API Key Settings
                </h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="label">Google Gemini API Key</label>
                <input
                  type="password"
                  className="input-field font-mono text-xs"
                  placeholder="Paste your Gemini API Key here (AIzaSy... or custom)"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  You can get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary-500 underline">Google AI Studio</a>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowKeyModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {keySaved ? 'Saved ✓' : 'Save Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
