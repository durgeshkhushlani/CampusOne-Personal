import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import confetti from "canvas-confetti";
import { Play, Send, FileText, MessageSquare, Terminal, ChevronDown, CheckCircle2, XCircle } from "lucide-react";

let MonacoEditor = null;

export default function ProblemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorReady, setEditorReady] = useState(false);

  // Layout state
  const [leftTab, setLeftTab] = useState("description"); // "description" or "discussion"
  const [consoleTab, setConsoleTab] = useState("testcases"); // "testcases" or "result"
  const [activeTestCase, setActiveTestCase] = useState(0);

  // Discussion state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    import("@monaco-editor/react").then((mod) => {
      MonacoEditor = mod.default;
      setEditorReady(true);
    }).catch(() => setEditorReady(false));
  }, []);

  useEffect(() => {
    api.get(`/codestage/problems/${id}`)
       .then((res) => setProblem(res.data))
       .catch(console.error)
       .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (leftTab === "discussion" && comments.length === 0) {
      fetchComments();
    }
  }, [leftTab, comments.length]); // Added comments.length to dependency array to satisfy exhaustive-deps, though conceptually we just need leftTab.

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await api.get(`/codestage/problems/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      await api.post(`/codestage/problems/${id}/comments`, { content: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post comment");
    } finally {
      setPostingComment(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    setConsoleTab("result");
    try {
      const res = await api.post("/codestage/submissions/run", { problemId: id, code, language });
      setOutput(res.data);
    } catch (err) {
      setOutput({ status: "Error", message: err.response?.data?.message || "Run failed" });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setOutput(null);
    setConsoleTab("result");
    try {
      const res = await api.post("/codestage/submissions", { problemId: id, code, language });
      setOutput({ status: res.data.status, message: res.data.message || `Submission (ID: ${res.data.submissionId})` });
      
      if (res.data.status === "Accepted") {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
      }
    } catch (err) {
      setOutput({ status: "Error", message: err.response?.data?.message || "Submit failed" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><span className="loading loading-spinner loading-lg" style={{ color: "#5B8DB8" }}></span></div>;
  if (!problem) return <div className="p-6"><div className="alert alert-error">Problem not found.</div></div>;

  const monacoLang = { cpp: "cpp", java: "java", python: "python", javascript: "javascript", c: "c" };

  return (
    <div style={{ height: "calc(100vh-56px)", background: "#F7F6F2", padding: 8, display: "flex", gap: 8, overflow: "hidden" }}>
      
      {/* LEFT PANE */}
      <div style={{ width: "50%", display: "flex", flexDirection: "column", background: "#FFFFFF", borderRadius: 14, border: "1px solid #E4E2DC", boxShadow: "0 1px 4px rgba(44,62,80,0.06)", overflow: "hidden" }}>
        {/* Left Tabs */}
        <div className="flex bg-base-200/50 border-b border-base-200">
          <button 
            onClick={() => setLeftTab("description")} 
            style={{ padding: "10px 18px", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, borderBottom: leftTab === "description" ? "2px solid #5B8DB8" : "2px solid transparent", color: leftTab === "description" ? "#5B8DB8" : "#8A94A0", background: leftTab === "description" ? "#FFFFFF" : "transparent", cursor: "pointer", transition: "all 150ms ease" }}
          >
            <FileText className="w-4 h-4" /> Description
          </button>
          <button 
            onClick={() => setLeftTab("discussion")} 
            style={{ padding: "10px 18px", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, borderBottom: leftTab === "discussion" ? "2px solid #5B8DB8" : "2px solid transparent", color: leftTab === "discussion" ? "#5B8DB8" : "#8A94A0", background: leftTab === "discussion" ? "#FFFFFF" : "transparent", cursor: "pointer", transition: "all 150ms ease" }}
          >
            <MessageSquare className="w-4 h-4" /> Discussion
          </button>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {leftTab === "description" && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-semibold text-base-content">{problem.title}</h1>
                <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: problem.difficulty === "easy" ? "#EDF7F2" : problem.difficulty === "medium" ? "#FBF6EE" : "#FBF0F0", color: problem.difficulty === "easy" ? "#3D7A62" : problem.difficulty === "medium" ? "#8B6914" : "#9B4444" }}>{problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}</span>

              </div>
              
              <div className="prose prose-sm max-w-none text-base-content/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: problem.description?.replace(/\n/g, "<br/>") }} />

              {problem.testCases?.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="font-semibold text-lg text-base-content">Examples</h3>
                  {problem.testCases.map((tc, i) => (
                    <div key={i} className="bg-base-200/50 rounded-lg p-4 border border-base-200">
                      <p className="font-semibold text-sm mb-2">Example {i + 1}:</p>
                      <div className="space-y-1">
                        <p className="text-sm font-mono"><strong className="text-base-content/60">Input:</strong> {tc.input}</p>
                        <p className="text-sm font-mono"><strong className="text-base-content/60">Output:</strong> {tc.output}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {leftTab === "discussion" && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {commentsLoading ? (
                  <div className="flex justify-center py-4"><span className="loading loading-spinner text-primary"></span></div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-10 text-base-content/50">No comments yet. Be the first to start the discussion!</div>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="bg-base-200/40 p-4 rounded-xl border border-base-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                            {c.userId?.name?.charAt(0) || "?"}
                          </div>
                          <span className="font-semibold text-sm">{c.userId?.name || "Unknown"}</span>
                          {c.userId?.role === "admin" && <span className="badge badge-primary badge-xs">Admin</span>}
                        </div>
                        <span className="text-xs text-base-content/40">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-base-content/80 whitespace-pre-line pl-8">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-base-200 flex gap-2">
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1 bg-base-200/50 focus:bg-base-100 transition-colors"
                  placeholder="Share your approach..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                />
                <button
                  onClick={handlePostComment}
                  className="btn btn-primary btn-sm"
                  disabled={postingComment || !newComment.trim()}
                >
                  {postingComment ? <span className="loading loading-spinner loading-xs"></span> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 flex flex-col gap-2">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1E1E1E] rounded-lg shadow-sm overflow-hidden border border-base-200 min-h-[50%]">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] border-b border-[#404040]">
            <select 
              className="select select-sm bg-[#3D3D3D] text-gray-200 border-none focus:outline-none focus:ring-1 focus:ring-primary w-32" 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="c">C</option>
            </select>
            <div className="flex gap-2">
              <button 
                className="btn btn-sm bg-[#3D3D3D] hover:bg-[#4D4D4D] text-gray-200 border-none gap-2 px-4" 
                onClick={handleRun} 
                disabled={running}
              >
                {running ? <span className="loading loading-spinner loading-xs"></span> : <Play className="w-4 h-4 text-success" />}
                Run
              </button>
              <button 
                className="btn btn-sm btn-success text-success-content gap-2 px-5" 
                onClick={handleSubmit} 
                disabled={submitting}
              >
                {submitting ? <span className="loading loading-spinner loading-xs"></span> : "Submit"}
              </button>
            </div>
          </div>
          
          {/* Editor Content */}
          <div className="flex-1 relative">
            {editorReady && MonacoEditor ? (
              <MonacoEditor
                height="100%"
                language={monacoLang[language] || "plaintext"}
                value={code}
                onChange={(val) => setCode(val || "")}
                theme="vs-dark"
                options={{ 
                  fontSize: 14, 
                  minimap: { enabled: false }, 
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  padding: { top: 16 }
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">Loading editor...</div>
            )}
          </div>
        </div>

        {/* Console Area */}
        <div className="h-[280px] flex flex-col bg-base-100 rounded-lg shadow-sm border border-base-200 overflow-hidden shrink-0">
          {/* Console Tabs */}
          <div className="flex bg-base-200/50 border-b border-base-200">
            <button 
              onClick={() => setConsoleTab("testcases")} 
              className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${consoleTab === "testcases" ? "border-primary text-primary bg-base-100" : "border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200"}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Testcases
            </button>
            <button 
              onClick={() => setConsoleTab("result")} 
              className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${consoleTab === "result" ? "border-primary text-primary bg-base-100" : "border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200"}`}
            >
              <Terminal className="w-3.5 h-3.5" /> Test Result
            </button>
          </div>

          {/* Console Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {consoleTab === "testcases" && problem.testCases && (
              <div className="flex flex-col h-full gap-4">
                <div className="flex gap-2">
                  {problem.testCases.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveTestCase(i)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTestCase === i ? "bg-base-300 text-base-content" : "bg-base-200/50 text-base-content/60 hover:bg-base-200"}`}
                    >
                      Case {i + 1}
                    </button>
                  ))}
                </div>
                {problem.testCases[activeTestCase] && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-base-content/60 mb-1">Input:</p>
                      <div className="bg-base-200/50 p-3 rounded-lg font-mono text-sm border border-base-200">
                        {problem.testCases[activeTestCase].input}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-base-content/60 mb-1">Expected Output:</p>
                      <div className="bg-base-200/50 p-3 rounded-lg font-mono text-sm border border-base-200">
                        {problem.testCases[activeTestCase].output}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {consoleTab === "result" && (
              <div className="h-full">
                {!output ? (
                  <div className="flex h-full items-center justify-center text-sm text-base-content/40 font-medium">
                    Run your code to see results
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-xl font-semibold ${
                        output.status === "Accepted" ? "text-success" : 
                        output.status === "Pending" ? "text-info" : 
                        "text-error"
                      }`}>
                        {output.status}
                      </h3>
                      {output.executionTime && <span className="text-xs font-medium text-base-content/50 bg-base-200 px-2 py-1 rounded-md">Runtime: {output.executionTime}s</span>}
                    </div>

                    {output.failedTestCase && <div className="text-sm font-semibold text-error bg-error/10 p-2 rounded-md inline-block">Failed on Test Case #{output.failedTestCase}</div>}
                    {output.message && <div className="text-sm font-medium text-error bg-error/5 p-3 rounded-lg border border-error/20 whitespace-pre-line">{output.message}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {output.output && (
                        <div>
                          <p className="text-xs font-semibold text-base-content/60 mb-1">Your Output:</p>
                          <div className={`p-3 rounded-lg font-mono text-sm border ${output.status === 'Accepted' ? 'bg-success/5 border-success/20' : 'bg-error/5 border-error/20'}`}>
                            {output.output}
                          </div>
                        </div>
                      )}
                      {output.expectedOutput && (
                        <div>
                          <p className="text-xs font-semibold text-base-content/60 mb-1">Expected Output:</p>
                          <div className="bg-base-200/50 p-3 rounded-lg font-mono text-sm border border-base-200">
                            {output.expectedOutput}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </div>
  );
}
