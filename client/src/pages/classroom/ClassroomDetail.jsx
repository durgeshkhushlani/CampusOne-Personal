import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function ClassroomDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [classroom, setClassroom] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", content: "", type: "material" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clsRes, postsRes] = await Promise.all([
          api.get(`/classroom/classrooms/${id}`),
          api.get(`/classroom/posts/${id}`),
        ]);
        setClassroom(clsRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await api.post("/classroom/posts", { ...postForm, classroom_id: id });
      setShowCreate(false);
      setPostForm({ title: "", content: "", type: "material" });
      const res = await api.get(`/classroom/posts/${id}`);
      setPosts(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create post");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
  if (!classroom) return <div className="p-6"><div className="alert alert-error">Classroom not found.</div></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-xl p-6 text-white mb-6" style={{ backgroundColor: classroom.themeColor || "#1967d2" }}>
        <h1 className="text-2xl font-bold">{classroom.name}</h1>
        <p className="opacity-80">{classroom.section} {classroom.subject ? `· ${classroom.subject}` : ""}</p>
        <p className="text-sm mt-2 opacity-70">Faculty: {classroom.faculty_name} · {classroom.student_count} students · Code: {classroom.code}</p>
      </div>

      {/* Create Post */}
      {user?.role === "faculty" && (
        <div className="mb-4">
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? "Cancel" : "+ Create Post"}
          </button>
          {showCreate && (
            <form onSubmit={handleCreatePost} className="card bg-base-100 shadow mt-3 border border-base-300">
              <div className="card-body space-y-3">
                <select className="select select-bordered w-full" value={postForm.type} onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}>
                  <option value="material">Material</option>
                  <option value="assignment">Assignment</option>
                  <option value="announcement">Announcement</option>
                </select>
                <input className="input input-bordered w-full" placeholder="Title" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} required />
                <textarea className="textarea textarea-bordered w-full" placeholder="Content" value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} />
                <button type="submit" className="btn btn-primary btn-sm">Post</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="alert alert-info"><span>No posts yet.</span></div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="card bg-base-100 shadow border border-base-300">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge badge-sm ${post.type === "assignment" ? "badge-warning" : post.type === "announcement" ? "badge-info" : "badge-ghost"}`}>
                    {post.type}
                  </span>
                  <span className="text-xs text-base-content/40">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <h2 className="card-title text-base">{post.title}</h2>
                {post.content && <p className="text-sm text-base-content/70">{post.content}</p>}
                <p className="text-xs text-base-content/40 mt-2">
                  By {post.author_name} · {post.comment_count || 0} comments
                  {post.type === "assignment" && ` · ${post.submission_count || 0} submissions`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
