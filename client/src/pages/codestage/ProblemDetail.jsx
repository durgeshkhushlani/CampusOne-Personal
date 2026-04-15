import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";

let MonacoEditor = null;

export default function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    import("@monaco-editor/react").then((mod) => {
      MonacoEditor = mod.default;
      setEditorReady(true);
    }).catch(() => setEditorReady(false));
  }, []);

  useEffect(() => {
    api.get(`/codestage/problems/${id}`).then((res) => setProblem(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
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
    try {
      const res = await api.post("/codestage/submissions", { problemId: id, code, language });
      setOutput({ status: res.data.status, message: res.data.message || `Submission (ID: ${res.data.submissionId})` });
    } catch (err) {
      setOutput({ status: "Error", message: err.response?.data?.message || "Submit failed" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
  if (!problem) return <div className="p-6"><div className="alert alert-error">Problem not found.</div></div>;

  const monacoLang = { cpp: "cpp", java: "java", python: "python", javascript: "javascript", c: "c" };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[calc(100vh-120px)]">
        {/* Left — Problem Description */}
        <div className="card bg-base-100 shadow border border-base-300 overflow-y-auto max-h-[80vh]">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="card-title text-xl">{problem.title}</h1>
              <span className={`badge badge-sm ${
                problem.difficulty === "easy" ? "badge-success" : problem.difficulty === "medium" ? "badge-warning" : "badge-error"
              }`}>{problem.difficulty}</span>
            </div>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: problem.description?.replace(/\n/g, "<br/>") }} />

            {problem.testCases?.length > 0 && (
              <div className="mt-4 space-y-3">
                <h3 className="font-bold">Sample Test Cases</h3>
                {problem.testCases.map((tc, i) => (
                  <div key={i} className="bg-base-200 rounded-lg p-3">
                    <p className="text-xs font-mono"><strong>Input:</strong> {tc.input}</p>
                    <p className="text-xs font-mono"><strong>Output:</strong> {tc.output}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Code Editor */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <select className="select select-bordered select-sm" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="c">C</option>
            </select>
            <button className="btn btn-outline btn-sm" onClick={handleRun} disabled={running}>
              {running ? "Running..." : "▶ Run"}
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden flex-1 min-h-[400px] bg-base-300">
            {editorReady && MonacoEditor ? (
              <MonacoEditor
                height="400px"
                language={monacoLang[language] || "plaintext"}
                value={code}
                onChange={(val) => setCode(val || "")}
                theme="vs-dark"
                options={{ fontSize: 14, minimap: { enabled: false }, lineNumbers: "on" }}
              />
            ) : (
              <textarea
                className="textarea w-full h-full font-mono text-sm bg-base-300 border-0"
                placeholder="Write your code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ minHeight: "400px" }}
              />
            )}
          </div>

          {/* Output */}
          {output && (
            <div className={`card shadow border ${
              output.status === "Accepted" ? "border-success bg-success/10" : output.status === "Pending" ? "border-info bg-info/10" : "border-error bg-error/10"
            }`}>
              <div className="card-body p-4">
                <h3 className="font-bold text-sm">Result: {output.status}</h3>
                {output.message && <p className="text-xs">{output.message}</p>}
                {output.output && <pre className="text-xs font-mono bg-base-200 p-2 rounded mt-1">{output.output}</pre>}
                {output.expectedOutput && (
                  <p className="text-xs mt-1"><strong>Expected:</strong> {output.expectedOutput}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
