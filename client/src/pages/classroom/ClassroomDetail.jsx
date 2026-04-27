import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function ClassroomDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [classroom, setClassroom] = useState(null);
  const [posts, setPosts] = useState([]);
  const [people, setPeople] = useState({ faculty: null, students: [] });
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("feed"); // "feed" | "people" | "grades"
  
  const [showCreate, setShowCreate] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", content: "", type: "material", topic: "" });
  const [file, setFile] = useState(null);

  // Grades state (student only)
  const [grades, setGrades] = useState([]);
  const [gradesLoading, setGradesLoading] = useState(false);

  // Collapsible topic sections
  const [collapsedTopics, setCollapsedTopics] = useState({});

  // Submissions viewer state (faculty)
  const [expandedSubmissions, setExpandedSubmissions] = useState({}); // { postId: [submissions] }
  const [gradeInputs, setGradeInputs] = useState({}); // { submissionId: grade }

  const fetchData = async () => {
    try {
      const [clsRes, postsRes, peopleRes] = await Promise.all([
        api.get(`/classroom/classrooms/${id}`),
        api.get(`/classroom/posts/${id}`),
        api.get(`/classroom/classrooms/${id}/people`),
      ]);
      setClassroom(clsRes.data);
      setPosts(postsRes.data);
      setPeople(peopleRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    setGradesLoading(true);
    try {
      const res = await api.get(`/classroom/classrooms/${id}/my-grades`);
      setGrades(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setGradesLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (activeTab === "grades" && user?.role === "student") {
      fetchGrades();
    }
  }, [activeTab]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("classroom_id", id);
      formData.append("title", postForm.title);
      formData.append("content", postForm.content);
      formData.append("type", postForm.type);
      formData.append("topic", postForm.topic || "General");
      if (file) {
        // Enforce basic frontend limit (~10MB)
        if (file.size > 10 * 1024 * 1024) return alert("File size must be under 10MB");
        formData.append("file", file);
      }

      await api.post("/classroom/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setShowCreate(false);
      setPostForm({ title: "", content: "", type: "material", topic: "" });
      setFile(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create post");
    }
  };

  const handleStudentSubmit = async (postId, uploadFile) => {
    if (!uploadFile) return;
    if (uploadFile.size > 10 * 1024 * 1024) return alert("File size must be under 10MB");
    
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      await api.post(`/classroom/posts/${postId}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Assignment submitted successfully!");
      fetchData(); // Refresh to potentially show submission status (if integrated)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit assignment");
    }
  };

  const handleTogglePin = async (postId) => {
    try {
      await api.put(`/classroom/posts/${postId}/pin`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to toggle pin");
    }
  };

  const toggleTopicCollapse = (topic) => {
    setCollapsedTopics((prev) => ({ ...prev, [topic]: !prev[topic] }));
  };

  const fetchSubmissions = async (postId) => {
    if (expandedSubmissions[postId]) {
      // Collapse if already expanded
      setExpandedSubmissions((prev) => { const n = { ...prev }; delete n[postId]; return n; });
      return;
    }
    try {
      const res = await api.get(`/classroom/posts/${postId}/submissions`);
      setExpandedSubmissions((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleGradeSubmission = async (submissionId, postId) => {
    const grade = gradeInputs[submissionId];
    if (grade === undefined || grade === "") return alert("Enter a grade");
    try {
      await api.put(`/classroom/posts/submissions/${submissionId}/grade`, { grade: Number(grade) });
      setGradeInputs((prev) => { const n = { ...prev }; delete n[submissionId]; return n; });
      // Refresh submissions for this post
      const res = await api.get(`/classroom/posts/${postId}/submissions`);
      setExpandedSubmissions((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to grade");
    }
  };

  // Group posts by topic, pinned posts first within each group
  const groupPostsByTopic = (posts) => {
    const groups = {};
    posts.forEach((post) => {
      const topic = post.topic || "General";
      if (!groups[topic]) groups[topic] = [];
      groups[topic].push(post);
    });
    // Sort each group: pinned first, then by date
    Object.keys(groups).forEach((topic) => {
      groups[topic].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });
    return groups;
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!classroom) return <div className="p-6"><div className="alert alert-error">Classroom not found.</div></div>;

  const topicGroups = groupPostsByTopic(posts);

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="rounded-xl p-6 text-white mb-6 shadow-md relative overflow-hidden" style={{ backgroundColor: classroom.themeColor || "#1967d2" }}>
        <h1 className="text-3xl font-bold mb-1 relative z-10">{classroom.name}</h1>
        <p className="opacity-90 font-medium relative z-10">{classroom.section} {classroom.subject ? `· ${classroom.subject}` : ""}</p>
        <p className="text-sm mt-4 opacity-80 relative z-10 flex items-center justify-between">
          <span>Faculty: {classroom.faculty_name} · {classroom.student_count} students</span>
          <span className="font-mono bg-black/20 px-2 py-1 rounded">Code: {classroom.code}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6 bg-base-200">
        <button className={`tab ${activeTab === "feed" ? "tab-active" : ""}`} onClick={() => setActiveTab("feed")}>Feed</button>
        <button className={`tab ${activeTab === "people" ? "tab-active" : ""}`} onClick={() => setActiveTab("people")}>People</button>
        {user?.role === "student" && (
          <button className={`tab ${activeTab === "grades" ? "tab-active" : ""}`} onClick={() => setActiveTab("grades")}>Grades</button>
        )}
      </div>

      {activeTab === "people" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-1">
             <div className="card bg-base-100 shadow border border-base-300">
                <div className="card-body">
                   <h2 className="card-title text-base border-b pb-2">Faculty</h2>
                   <div className="flex items-center gap-3 mt-2">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-10">
                          <span>{people.faculty?.name?.charAt(0)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{people.faculty?.name}</p>
                        <p className="text-xs text-base-content/60">{people.faculty?.email}</p>
                      </div>
                   </div>
                </div>
             </div>
           </div>
           <div className="md:col-span-2">
             <div className="card bg-base-100 shadow border border-base-300">
                <div className="card-body p-0">
                   <h2 className="card-title text-base p-6 pb-2 border-b">Students ({people.students.length})</h2>
                   <div className="overflow-x-auto">
                     <table className="table table-zebra w-full text-sm">
                        <tbody>
                          {people.students.map((student, i) => (
                            <tr key={student.id}>
                               <td className="w-10 text-base-content/50">{i + 1}</td>
                               <td>
                                 <div className="font-medium">{student.name}</div>
                                 <div className="text-xs text-base-content/50">{student.email}</div>
                               </td>
                               <td className="text-right text-xs text-base-content/40">
                                 Joined {new Date(student.joined_at).toLocaleDateString()}
                               </td>
                            </tr>
                          ))}
                          {people.students.length === 0 && (
                            <tr><td colSpan="3" className="text-center py-4 text-base-content/50">No students joined yet.</td></tr>
                          )}
                        </tbody>
                     </table>
                   </div>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Grades Tab — Students only */}
      {activeTab === "grades" && user?.role === "student" && (
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-0">
            <h2 className="card-title text-base p-6 pb-2 border-b">📊 My Grades</h2>
            {gradesLoading ? (
              <div className="flex justify-center p-10"><span className="loading loading-spinner loading-md text-primary"></span></div>
            ) : grades.length === 0 ? (
              <div className="p-6 text-center text-base-content/50">No assignments yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full text-sm">
                  <thead>
                    <tr>
                      <th>Assignment Name</th>
                      <th>Due Date</th>
                      <th>Your Grade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((g) => (
                      <tr key={g.postId} className="hover">
                        <td className="font-medium">{g.postTitle}</td>
                        <td className="text-base-content/60">
                          {g.dueDate ? new Date(g.dueDate).toLocaleDateString() : "No due date"}
                        </td>
                        <td>
                          {g.grade !== null && g.grade !== undefined ? (
                            <span className="font-bold text-primary">{g.grade} / {g.totalPoints}</span>
                          ) : (
                            <span className="text-base-content/40">--</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-sm ${
                            g.status === "graded" ? "badge-success" :
                            g.status === "submitted" ? "badge-warning" :
                            "badge-ghost"
                          }`}>
                            {g.status === "not_submitted" ? "Not Submitted" : g.status.charAt(0).toUpperCase() + g.status.slice(1)}
                          </span>
                          {g.isLate && <span className="badge badge-sm badge-error ml-1">⚠ Late</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "feed" && (
        <>
          {/* Create Post */}
          {user?.role === "faculty" && (
            <div className="mb-6">
              <button className="btn btn-primary btn-sm shadow-sm" onClick={() => setShowCreate(!showCreate)}>
                {showCreate ? "Cancel Posting" : "+ Create Post"}
              </button>
              {showCreate && (
                <form onSubmit={handleCreatePost} className="card bg-base-100 shadow mt-3 border border-base-300">
                  <div className="card-body space-y-4">
                    <h3 className="font-bold text-lg mb-2">New Post</h3>
                    <select className="select select-bordered w-full" value={postForm.type} onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}>
                      <option value="material">Material</option>
                      <option value="assignment">Assignment</option>
                      <option value="announcement">Announcement</option>
                    </select>
                    <input className="input input-bordered w-full" placeholder="Title" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} required />
                    <textarea className="textarea textarea-bordered w-full" placeholder="Instruction / Content" value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} />
                    
                    <input className="input input-bordered w-full" placeholder="Topic (e.g. Unit 1, Homework — default: General)" value={postForm.topic} onChange={(e) => setPostForm({ ...postForm, topic: e.target.value })} />

                    <div>
                      <label className="label"><span className="label-text">Attach File (Optional, max 10MB)</span></label>
                      <input type="file" className="file-input file-input-bordered file-input-sm w-full max-w-xs" onChange={(e) => setFile(e.target.files[0])} />
                    </div>

                    <div className="form-control mt-2">
                       <button type="submit" className="btn btn-primary">Post</button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Posts Feed — Grouped by Topic */}
          {posts.length === 0 ? (
            <div className="alert alert-info shadow-sm bg-base-100 border border-info"><span>No posts yet.</span></div>
          ) : (
            <div className="space-y-6">
              {Object.entries(topicGroups).map(([topic, topicPosts]) => (
                <div key={topic}>
                  {/* Topic Header — Collapsible */}
                  <button
                    onClick={() => toggleTopicCollapse(topic)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-base-200 rounded-lg mb-3 hover:bg-base-300 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-sm uppercase tracking-wide text-base-content/70">
                      📂 {topic} <span className="text-xs font-normal text-base-content/40">({topicPosts.length} post{topicPosts.length !== 1 ? "s" : ""})</span>
                    </span>
                    <svg className={`w-4 h-4 transition-transform ${collapsedTopics[topic] ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Topic Posts */}
                  {!collapsedTopics[topic] && (
                    <div className="space-y-4">
                      {topicPosts.map((post) => (
                        <div key={post._id} className={`card bg-base-100 shadow-md border hover:border-primary/30 transition-colors ${post.isPinned ? "border-warning/50 bg-warning/5" : "border-base-300"}`}>
                          <div className="card-body">
                            <div className="flex items-center gap-2 mb-2">
                              {post.isPinned && <span className="text-lg" title="Pinned">📌</span>}
                              <span className={`badge badge-sm font-semibold ${post.type === "assignment" ? "badge-warning" : post.type === "announcement" ? "badge-info" : "badge-ghost"}`}>
                                {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                              </span>
                              <span className="text-xs text-base-content/50">{new Date(post.createdAt).toLocaleDateString()}</span>
                              {post.type === "assignment" && post.dueDate && (
                                <span className={`text-xs font-medium ml-auto ${new Date(post.dueDate) < new Date() ? "text-error" : "text-success"}`}>
                                  {new Date(post.dueDate) < new Date() ? "⏰ Past due" : `Due: ${new Date(post.dueDate).toLocaleDateString()}`}
                                </span>
                              )}
                            </div>
                            {post.type === "assignment" ? (
                              <Link to={`/classroom/${id}/assignment/${post._id}`} className="card-title text-lg flex items-start gap-2 hover:text-primary transition-colors cursor-pointer">
                                 <svg className="w-5 h-5 mt-0.5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                 {post.title}
                              </Link>
                            ) : (
                              <h2 className="card-title text-lg flex items-start gap-2">
                                 {post.title}
                              </h2>
                            )}
                            {post.content && <p className="text-sm text-base-content/80 whitespace-pre-line mt-2 bg-base-200/50 p-3 rounded-lg border border-base-200">{post.content}</p>}
                            
                            {post.fileUrl && (
                              <div className="mt-3">
                                 <a href={post.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline btn-info gap-2 normal-case">
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                   {post.fileName || "Download Attachment"}
                                 </a>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-base-200">
                              <p className="text-xs text-base-content/50 font-medium">
                                By {post.author_name} · {post.comment_count || 0} comments
                                {post.type === "assignment" && user?.role !== "student" && ` · ${post.submission_count || 0} submissions`}
                              </p>

                              <div className="flex items-center gap-2">
                                {/* Pin/Unpin button — Faculty only */}
                                {(user?.role === "faculty" || user?.role === "admin") && (
                                  <button
                                    onClick={() => handleTogglePin(post._id)}
                                    className={`btn btn-xs ${post.isPinned ? "btn-warning" : "btn-ghost"}`}
                                    title={post.isPinned ? "Unpin" : "Pin"}
                                  >
                                    📌 {post.isPinned ? "Unpin" : "Pin"}
                                  </button>
                                )}

                                {post.type === "assignment" && user?.role === "student" && (
                                  <Link to={`/classroom/${id}/assignment/${post._id}`} className="btn btn-sm btn-primary shadow-sm">
                                     View Assignment
                                  </Link>
                                )}
                              </div>
                            </div>

                            {/* Faculty Submissions Viewer */}
                            {post.type === "assignment" && (user?.role === "faculty" || user?.role === "admin") && (
                              <div className="mt-3">
                                <button
                                  onClick={() => fetchSubmissions(post._id)}
                                  className="btn btn-xs btn-outline btn-secondary gap-1"
                                >
                                  {expandedSubmissions[post._id] ? "Hide Submissions" : `📋 View Submissions (${post.submission_count || 0})`}
                                </button>

                                {expandedSubmissions[post._id] && (
                                  <div className="mt-3 border border-base-300 rounded-lg overflow-hidden">
                                    {expandedSubmissions[post._id].length === 0 ? (
                                      <div className="p-4 text-center text-sm text-base-content/50">No submissions yet.</div>
                                    ) : (
                                      <table className="table table-sm w-full">
                                        <thead>
                                          <tr className="bg-base-200">
                                            <th>Student</th>
                                            <th>File</th>
                                            <th>Status</th>
                                            <th>Grade</th>
                                            <th></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {expandedSubmissions[post._id].map((sub) => (
                                            <tr key={sub._id} className="hover">
                                              <td className="text-sm">
                                                {sub.studentId?.name || "Unknown"}
                                                {sub.isLate && <span className="badge badge-xs badge-error ml-2">⚠ Late</span>}
                                              </td>
                                              <td>
                                                <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="link link-primary text-xs">
                                                  {sub.fileName || "View File"}
                                                </a>
                                              </td>
                                              <td>
                                                <span className={`badge badge-xs ${sub.status === "graded" ? "badge-success" : "badge-warning"}`}>
                                                  {sub.status}
                                                </span>
                                              </td>
                                              <td>
                                                {sub.status === "graded" ? (
                                                  <span className="font-bold text-sm">{sub.grade}/{post.totalPoints}</span>
                                                ) : (
                                                  <input
                                                    type="number"
                                                    className="input input-bordered input-xs w-16"
                                                    placeholder="--"
                                                    value={gradeInputs[sub._id] || ""}
                                                    onChange={(e) => setGradeInputs((prev) => ({ ...prev, [sub._id]: e.target.value }))}
                                                  />
                                                )}
                                              </td>
                                              <td>
                                                {sub.status !== "graded" && (
                                                  <button
                                                    onClick={() => handleGradeSubmission(sub._id, post._id)}
                                                    className="btn btn-xs btn-primary"
                                                  >
                                                    Grade
                                                  </button>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
