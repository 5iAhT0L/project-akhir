// App.jsx
import React, { useEffect, useState, useRef } from "react";

/**
 * Replace your existing App.jsx with this file.
 * It keeps your backend logic (fetch/add/update/delete) and improves UI/UX with Tailwind only.
 *
 * Notes:
 * - Update the baseURL variable to your backend endpoint if needed.
 * - Logo paths ("/logo.svg", "/note.svg") are used as in your original. Replace or remove if not present.
 */

const baseURL = "https://notes-app-iota-murex.vercel.app";

export default function App() {
  // data
  const [notes, setNotes] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [toast, setToast] = useState({ show: false, type: "info", text: "" });

  // modals
  const [editingNote, setEditingNote] = useState(null); // note object being edited
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // fetch notes
  const fetchNotes = async () => {
    try {
      const res = await fetch(`${baseURL}/notes`);
      const result = await res.json();
      setNotes(result.data || []);
    } catch (err) {
      console.error("Error fetching notes", err);
      showToast("error", "Gagal mengambil notes");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // add note
  const addNote = async (newTitle, newContent) => {
    try {
      const res = await fetch(`${baseURL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      const result = await res.json();
      if (res.ok) {
        setNotes((prev) => [...prev, result.data]);
        showToast("success", "Catatan berhasil ditambahkan");
      } else {
        showToast("error", result?.message || "Gagal menambahkan note");
      }
    } catch (error) {
      console.error("Error adding note", error);
      showToast("error", "Terjadi kesalahan saat menambah note");
    }
  };

  // delete
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${baseURL}/notes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotes((notes) => notes.filter((note) => note.id !== id));
        showToast("success", "Note dihapus");
      } else {
        showToast("error", "Gagal menghapus note");
      }
      setConfirmDelete({ show: false, id: null });
      fetchNotes();
    } catch (err) {
      console.error("Error deleting note", err);
      showToast("error", "Error deleting note");
    }
  };

  // update
  const handleUpdateNote = async (id, updateTitle, updateContent) => {
    try {
      const res = await fetch(`${baseURL}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updateTitle,
          content: updateContent,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === id ? result.data : note))
        );
        showToast("success", "Note diperbarui");
      } else {
        showToast("error", result?.message || "Gagal update note");
      }
    } catch (err) {
      console.error("Error updating note", err);
      showToast("error", "Error updating note");
    }
  };

  // search
  const getNoteByTitle = async (title) => {
    try {
      const res = await fetch(
        `${baseURL}/notes?title=${encodeURIComponent(title)}`
      );
      const result = await res.json();
      return result.data && result.data.length > 0 ? result.data[0] : null;
    } catch {
      showToast("error", "Gagal mencari note");
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    setSearchError("");
    setSearchResult(null);
    if (!searchTitle.trim()) {
      setSearchError("Masukkan judul untuk mencari");
      return;
    }
    const note = await getNoteByTitle(searchTitle.trim());
    if (!note) {
      setSearchError("Note tidak ditemukan.");
    } else {
      setSearchResult(note);
    }
  };

  // toast helper
  const showToast = (type, text) => {
    setToast({ show: true, type, text });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header
        onToggleSidebar={() => setIsSidebarOpen((s) => !s)}
        onOpenAdd={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
      <div className="flex pt-20">
        <Sidebar open={isSidebarOpen} />
        <main className="flex-1 px-6 md:px-10 pb-16">
          <div className="max-w-5xl mx-auto">
            <NoteForm onAddNote={addNote} showToast={showToast} />

            <div className="mt-8 mb-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <form
                onSubmit={handleSearch}
                className="flex gap-2 w-full md:max-w-lg"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Cari judul Note"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="w-full rounded-md border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-gray-300 outline-none bg-white shadow-sm"
                  />
                  <svg
                    className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                  </svg>
                </div>
                <button className="px-4 py-2 rounded-md bg-gray-900 text-white hover:opacity-95 transition">
                  Search
                </button>
              </form>

              {searchError && (
                <div className="text-sm text-red-600 mt-2 md:mt-0">
                  {searchError}
                </div>
              )}
            </div>

            {searchResult && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Hasil Pencarian</h3>
                <div className="max-w-xl">
                  <NoteCard
                    note={searchResult}
                    onEdit={(n) => setEditingNote(n)}
                    onDelete={(id) => setConfirmDelete({ show: true, id })}
                  />
                </div>
              </div>
            )}

            <section className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                <img src="/note.svg" alt="note" className="w-8" />
                Your Notes
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {notes && notes.length > 0 ? (
                  notes
                    .slice()
                    .reverse()
                    .map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={(n) => setEditingNote(n)}
                        onDelete={(id) => setConfirmDelete({ show: true, id })}
                      />
                    ))
                ) : (
                  <div className="col-span-full p-6 bg-white rounded shadow text-gray-500">
                    Data Kosong
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {editingNote && (
        <EditNoteModalWrapper
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSave={async (id, title, content) => {
            await handleUpdateNote(id, title, content);
            setEditingNote(null);
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete.show && (
        <ConfirmModal
          text="Yakin ingin menghapus note ini?"
          onClose={() => setConfirmDelete({ show: false, id: null })}
          onConfirm={() => handleDelete(confirmDelete.id)}
        />
      )}

      {/* Toast */}
      <Toast to={toast} />
    </div>
  );
}

/* ---------------------------
   Header & Sidebar
   --------------------------- */
const Header = ({ onToggleSidebar }) => (
  <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded hover:bg-gray-100 transition"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <img src="/logo.svg" alt="logo" className="w-10 h-10" />
        <span className="font-semibold text-lg">KOINote.com</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-gray-600">Profil</span>
          <button className="px-4 py-2 rounded-full bg-gray-900 text-white font-medium">
            Simpan
          </button>
        </div>
      </div>
    </div>
  </header>
);

const Sidebar = ({ open = true }) => {
  return (
    <aside
      className={`hidden md:block w-64 shrink-0 bg-white border-r border-gray-100 min-h-screen pt-24`}
      aria-hidden={!open}
    >
      <div className="p-6">
        <nav className="flex flex-col gap-2">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 transition"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3 7h18M3 12h18M3 17h18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 transition"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Notes
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 transition"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            About
          </a>
        </nav>

        <div className="mt-8 text-sm text-gray-500">
          <div className="mb-2">Categories</div>
          <div className="flex flex-col gap-2">
            <span className="text-xs">• Projects</span>
            <span className="text-xs">• Business</span>
            <span className="text-xs">• Personal</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

/* ---------------------------
   Note Form (Add)
   --------------------------- */
const NoteForm = ({ onAddNote, showToast }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({ title: "", content: "" });
  const titleRef = useRef();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const newErrors = { title: "", content: "" };

    if (!title.trim()) newErrors.title = "Title is required.";
    if (!content.trim()) newErrors.content = "Content is required.";

    setErrors(newErrors);

    // If there are errors, show toast and stop submit
    if (newErrors.title || newErrors.content) {
      showToast("error", "Judul dan konten wajib diisi");
      return;
    }

    // Otherwise, proceed to add note
    setSubmitting(true);
    await onAddNote(title.trim(), content.trim());
    setTitle("");
    setContent("");
    setErrors({ title: "", content: "" });
    setSubmitting(false);
  };

  return (
    <section className="bg-white rounded-xl shadow-md mt-5 p-6 md:p-8 md:mt-5">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start"
      >
        <div className="md:col-span-2">
          <h1 className="text-2xl font-semibold mb-1">Create Note</h1>
          <p className="text-sm text-gray-500 mb-3">
            Fill in the details below
          </p>

          {/* Title field */}
          <div className="mb-3">
            <input
              ref={titleRef}
              className={`w-full rounded-md border px-4 py-2 outline-none focus:ring-2 transition ${
                errors.title
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-200 focus:ring-gray-200"
              }`}
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Content field */}
          <div>
            <textarea
              className={`w-full rounded-md border px-4 py-2 min-h-[90px] outline-none resize-y focus:ring-2 transition ${
                errors.content
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-200 focus:ring-gray-200"
              }`}
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex flex-col gap-3 items-stretch md:items-end md:mt-50">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gray-900 text-white px-5 py-2 rounded-md font-medium hover:opacity-95 transition md:px-15 md:cursor-pointer md:transition-all md:bg-gray-900 md:hover:bg-gray-700"
          >
            {isSubmitting ? "Adding..." : "Add note"}
          </button>
        </div>
      </form>
    </section>
  );
};

/* ---------------------------
   Note Card
   --------------------------- */
const NoteCard = ({ note, onEdit, onDelete }) => {
  return (
    <article className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{note.title}</h3>
          <div className="text-xs text-gray-400 mt-1">
            {showFormattedDate(note.created_at)}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(note)}
            className="p-2 rounded-md hover:bg-gray-100 transition"
            title="Edit"
          >
            <svg
              className="w-5 h-5 text-yellow-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3 21v-3l11-11 3 3L6 21H3z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 rounded-md hover:bg-gray-100 transition"
            title="Delete"
          >
            <svg
              className="w-5 h-5 text-red-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3 6h18M9 6v12m6-12v12M10 6h4l1 14H9L10 6z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
        {note.content}
      </p>
    </article>
  );
};

/* ---------------------------
   Edit Modal
   --------------------------- */
const EditNoteModal = ({
  title,
  setTitle,
  content,
  setContent,
  onClose,
  handleSave,
  loading,
}) => {
  const [errors, setErrors] = useState({ title: "", content: "" });

  const onSaveClick = () => {
    const newErrors = { title: "", content: "" };
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!content.trim()) newErrors.content = "Content is required.";
    setErrors(newErrors);

    if (!newErrors.title && !newErrors.content) handleSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Edit Note</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
          <p className="text-sm text-blue-700">
            You are editing your note. Don’t forget to save your changes.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Title Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 transition ${
                errors.title
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Content Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note..."
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 min-h-[140px] resize-y transition ${
                errors.content
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            />
            {errors.content && (
              <p className="text-xs text-red-500 mt-1">{errors.content}</p>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 border-t px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-gray-700 bg-white border hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSaveClick}
            disabled={loading}
            className={`px-5 py-2 rounded-md text-white transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------
   Confirm Modal
   --------------------------- */
const ConfirmModal = ({ text, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h4 className="text-lg font-semibold mb-2">Confirm</h4>
          <p className="text-sm text-gray-600 mb-4">{text}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md bg-red-600 text-white"
            >
              Yes, delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper for EditNoteModal (handles title/content state)
const EditNoteModalWrapper = ({ note, onClose, onSave }) => {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await onSave(note.id, title, content);
    setLoading(false);
  };

  return (
    <EditNoteModal
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      onClose={onClose}
      handleSave={handleSave}
      loading={loading}
    />
  );
};

/* ---------------------------
   Toast Component (Tailwind only)
   --------------------------- */

const Toast = ({ to }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (to) {
      setVisible(true);

      // Auto hide after 3 seconds
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [to]);

  if (!to) return null;

  const bg =
    to.type === "success"
      ? "bg-green-600"
      : to.type === "error"
      ? "bg-red-600"
      : "bg-gray-800";

  return (
    <div className="fixed right-6 top-20 z-50">
      <div
        className={`px-4 py-2 rounded-lg text-white shadow-lg transform transition-all duration-500 ease-in-out ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-3 scale-95 pointer-events-none"
        } ${bg}`}
        style={{ minWidth: 220 }}
      >
        {to.text}
      </div>
    </div>
  );
};

/* ---------------------------
   Utilities
   --------------------------- */
const showFormattedDate = (date) => {
  try {
    const options = {
      year: "numeric",
      month: "long",
      weekday: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("id-ID", options);
  } catch {
    return date;
  }
};
