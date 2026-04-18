import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function ClassroomDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [classroom, setClassroom] = useState(null);
  const [posts, setPosts] = useState([]);
  const [people, setPeople] = useState({ faculty: null, students: [] });
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("feed"); // "feed" | "people"
  
  const [showCreate, setShowCreate] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", content: "", type: "material" });
  const [file, setFile] = useState(null);

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

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("classroom_id", id);
      formData.append("title", postForm.title);
      formData.append("content", postForm.content);
      formData.append("type", postForm.type);
      if (file) {
        // Enforce basic frontend limit (~10MB)
        if (file.size > 10 * 1024 * 1024) return alert("File size must be under 10MB");
        formData.append("file", file);
      }

      await api.post("/classroom/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setShowCreate(false);
      setPostForm({ title: "", content: "", type: "material" });
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

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!classroom) return <div className="p-6"><div className="alert alert-error">Classroom not found.</div></div>;

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

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className="alert alert-info shadow-sm bg-base-100 border border-info"><span>No posts yet.</span></div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post._id} className="card bg-base-100 shadow-md border border-base-300 hover:border-primary/30 transition-colors">
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge badge-sm font-semibold ${post.type === "assignment" ? "badge-warning" : post.type === "announcement" ? "badge-info" : "badge-ghost"}`}>
                        {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                      </span>
                      <span className="text-xs text-base-content/50">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h2 className="card-title text-lg flex items-start gap-2">
                       {post.type === "assignment" && <svg className="w-5 h-5 mt-0.5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                       {post.title}
                    </h2>
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

                      {post.type === "assignment" && user?.role === "student" && (
                         <div className="flex items-center gap-2">
                           <input 
                             type="file" 
                             id={`file-${post._id}`} 
                             className="hidden" 
                             onChange={(e) => handleStudentSubmit(post._id, e.target.files[0])} 
                           />
                           <label htmlFor={`file-${post._id}`} className="btn btn-sm btn-primary shadow-sm cursor-pointer">
                              Submit Work
                           </label>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
