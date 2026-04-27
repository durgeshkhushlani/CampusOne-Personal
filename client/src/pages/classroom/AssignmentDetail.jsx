import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
  FileText,
  Upload,
  Clock,
  CheckCircle,
  FileBadge2,
  Trash2,
  ArrowLeft
} from "lucide-react";

export default function AssignmentDetail() {
  const { id, postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postRes, subRes] = await Promise.all([
        api.get(`/classroom/posts/post/${postId}`),
        api.get(`/classroom/posts/${postId}/my-submission`)
      ]);
      setPost(postRes.data);
      setSubmission(subRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load assignment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [postId]);

  const handleSubmit = async () => {
    if (!file) return alert("Please select a file to submit");
    if (file.size > 10 * 1024 * 1024) return alert("File size must be under 10MB");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/classroom/posts/${postId}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Assignment submitted successfully!");
      setFile(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnsubmit = async () => {
    if (!window.confirm("Are you sure you want to unsubmit? This will remove your current work.")) return;
    
    try {
      await api.delete(`/classroom/posts/${postId}/submit`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to unsubmit");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!post) return <div className="p-6"><div className="alert alert-error">Assignment not found.</div></div>;

  const isLate = post.dueDate && new Date() > new Date(post.dueDate);

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-[calc(100vh-64px)]">
      <button onClick={() => navigate(`/classroom/${id}`)} className="btn btn-ghost btn-sm mb-6 flex items-center gap-2 text-base-content/70 hover:text-base-content">
        <ArrowLeft className="w-4 h-4" />
        Back to Classroom
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assignment Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start gap-4 border-b border-base-200 pb-6">
            <div className="p-3 bg-primary/10 rounded-full text-primary mt-1">
              <FileBadge2 className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-base-content">{post.title}</h1>
              <div className="flex items-center gap-2 text-sm text-base-content/60 mt-2 font-medium">
                <span>{post.author_name}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <span className="font-semibold text-base-content/80">{post.totalPoints || 100} points</span>
                {post.dueDate && (
                  <span className={`flex items-center gap-1 font-semibold ${isLate ? "text-error" : "text-base-content/80"}`}>
                    <Clock className="w-4 h-4" />
                    Due {new Date(post.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="prose max-w-none text-base-content/80">
            <p className="whitespace-pre-line">{post.content}</p>
          </div>

          {post.fileUrl && (
            <div className="mt-6 border border-base-300 rounded-lg p-4 flex items-center gap-4 bg-base-100 hover:bg-base-200 transition-colors w-max">
              <FileText className="w-8 h-8 text-info" />
              <div>
                <a href={post.fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium link link-hover text-base-content">
                  {post.fileName || "View Attachment"}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Your Work */}
        {user?.role === "student" && (
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow border border-base-300 sticky top-24">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title text-xl">Your work</h2>
                  {submission?.status === "graded" && (
                    <span className="text-success font-bold text-lg">{submission.grade} / {post.totalPoints}</span>
                  )}
                  {submission?.status === "submitted" && (
                    <span className="text-sm font-semibold text-success flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Turned in
                      {submission.isLate && <span className="text-error ml-1">(Late)</span>}
                    </span>
                  )}
                  {!submission && (
                    <span className={`text-sm font-semibold ${isLate ? "text-error" : "text-success"}`}>
                      {isLate ? "Missing" : "Assigned"}
                    </span>
                  )}
                </div>

                {submission ? (
                  <div className="space-y-4">
                    <div className="border border-base-300 rounded-lg p-3 flex items-center gap-3">
                      <FileText className="w-6 h-6 text-primary" />
                      <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium link link-hover truncate max-w-[200px]">
                        {submission.fileName || "Submitted File"}
                      </a>
                    </div>
                    {submission.status !== "graded" && (
                      <button onClick={handleUnsubmit} className="btn btn-outline w-full gap-2 text-base-content/70 hover:text-error hover:bg-error/10 hover:border-error">
                        <Trash2 className="w-4 h-4" />
                        Unsubmit
                      </button>
                    )}
                    {submission.status === "graded" && (
                      <p className="text-sm text-base-content/60 text-center mt-2">This assignment has been graded and cannot be unsubmitted.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {file ? (
                      <div className="border border-base-300 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-sm font-medium truncate">{file.name}</span>
                        </div>
                        <button onClick={() => setFile(null)} className="btn btn-ghost btn-xs text-error">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()} className="btn btn-outline w-full gap-2 border-dashed border-2 text-primary hover:bg-primary/5 hover:border-primary">
                        <Upload className="w-4 h-4" />
                        Add or create
                      </button>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={(e) => setFile(e.target.files[0])} 
                    />
                    <button 
                      onClick={handleSubmit} 
                      disabled={!file || submitting}
                      className="btn btn-primary w-full"
                    >
                      {submitting ? "Turning in..." : "Turn in"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
