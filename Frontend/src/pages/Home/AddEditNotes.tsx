// AddEditNotes.tsx
import { useState } from "react";
import TagInput from "../../components/Input/TagInput";
import { MdClose } from "react-icons/md";
import axiosInstance from "../../utils/AxiosInstance";
import axios from "axios";

interface NoteData {
  _id?: unknown;
  title?: string;
  content?: string;
  tags?: string[];
}

interface AddEditNotesProps {
  noteData: NoteData;
  type: string;
  onClose: () => void;
  getAllNotes: () => Promise<void>; // Added getAllNotes prop
  showToastMessage: (message: string, type: string) => void;
}

const AddEditNotes: React.FC<AddEditNotesProps> = ({
  noteData,
  type,
  onClose,
  getAllNotes, // Destructure getAllNotes from
  showToastMessage,
}) => {
  const [title, setTitle] = useState(noteData.title || "");
  const [content, setContent] = useState(noteData.content || "");
  const [tags, setTags] = useState<string[]>(noteData.tags || []);
  const [error, setError] = useState<string | null>(null);

  // Add note API
  const addNewNote = async () => {
    try {
      const response = await axiosInstance.post("/add-note", {
        title,
        content,
        tags,
      });

      if (response.data && response.data.note) {
        showToastMessage("Note Added Successfully", "success");
        getAllNotes();
        onClose();
      }
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.data &&
        (error.response.data as { message?: string }).message
      ) {
        setError((error.response.data as { message?: string }).message!);
      }
    }
  };

  // Edit note API
  const editNote = async () => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put("/edit-note/" + noteId, {
        title,
        content,
        tags,
      });

      if (response.data && response.data.note) {
        showToastMessage("Note Updated Successfully", "success");
        getAllNotes();
        onClose();
      }
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.data &&
        (error.response.data as { message?: string }).message
      ) {
        setError((error.response.data as { message?: string }).message!);
      }
    }
  };

  const handleAddNote = () => {
    if (!title) {
      setError("Please enter the title");
      return;
    }
    if (!content) {
      setError("Please enter the content");
      return;
    }
    if (type === "edit") {
      editNote();
    } else {
      addNewNote();
    }
    setError("");
  };

  return (
    <div className="relative">
      <button
        aria-label="Close"
        className="w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-50"
        onClick={onClose}
      >
        <MdClose className="text-xl text-slate-400" />
      </button>
      <div className="flex flex-col gap-2">
        <label className="input-label">TITLE</label>
        <input
          type="text"
          className="text-2xl text-slate-950 outline-none"
          placeholder="Enter Title Here"
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <label className="input-label">CONTENT</label>
        <textarea
          className="text-sm text-slate-950 outline-none bg-slate-50 rounded"
          placeholder="Enter Content Here"
          rows={10}
          value={content}
          onChange={({ target }) => setContent(target.value)}
        ></textarea>
      </div>
      <div className="mt-3">
        <label className="input-label">TAGS</label>
        <TagInput tags={tags} setTags={setTags} />
      </div>
      {error && <p className="text-red-500 text-xs pt-4">{error}</p>}
      <button
        className="btn-primary font-medium mt-5 p-3"
        onClick={handleAddNote}
      >
        {type === "edit" ? "UPDATE" : "ADD"}
      </button>
    </div>
  );
};

export default AddEditNotes;
