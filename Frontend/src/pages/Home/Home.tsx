import { MdAdd } from "react-icons/md";
import NoteCard from "../../components/Cards/NoteCard";
import Navbar from "../../components/Navbar/Navbar";
import AddEditNotes from "./AddEditNotes";
import { useCallback, useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/AxiosInstance";
import axios from "axios";
import moment from "moment";
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import AddNotesImg from "../../assets/images/add-notes.png";
import NoDataImg from "../../assets/images/no-notes.png";

interface UserInfo {
  fullName: string;
  // add other properties if needed
}

// Define the Note interface (or NoteData)
export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  createdOn: string; // or Date if you prefer
  isPinned: boolean;
}

// Define the modal state interface; note that data can be null
interface OpenModalState {
  isShown: boolean;
  type: "add" | "edit";
  data: Note | null;
}

const Home = () => {
  const [showToastMsg, setShowToastMsg] = useState<{
    isShown: boolean;
    message: string;
    type: string;
  }>({
    isShown: false,
    message: "",
    type: "add", // set a default, e.g. an empty string or "success"
  });

  const [openAddEditModal, setOpenAddEditModal] = useState<OpenModalState>({
    isShown: false,
    type: "add",
    data: null,
  });

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  interface Note {
    _id: string;
    title: string;
    content: string;
    tags: string[];
    createdOn: string; // or Date if you prefer
    isPinned: boolean;
  }

  const [allNotes, setAllNotes] = useState<Note[]>([]);

  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  //toast
  const showToastMessage = (message: string, type: string) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
      type: "",
    });
  };
  //EditNote
  const handleEdit = (noteDetails: Note) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  //Get User Info
  const getUserInfo = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      // Check if the response has a fullName and no error
      if (response.data && !response.data.error && response.data.fullName) {
        setUserInfo(response.data);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  }, [navigate]);

  //GETALLNOTES
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(
        "An unexpected error occured. Please try again later!",
        error
      );
    }
  };

  //Delete Note
  const deleteNotes = async (data: Note) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);

      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfully", "success");
        getAllNotes();
      }
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.data &&
        (error.response.data as { message?: string }).message
      ) {
        console.log(
          "An unexpected error occured. Please try again later!",
          error
        );
      }
    }
  };

  //Search
  const onSearchNote = async (query: string) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { query },
      });

      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //isPinned
  const updateIsPinned = async (noteData: Note) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put(
        "/update-note-pinned/" + noteId,
        {
          isPinned: !noteData.isPinned,
        }
      );

      if (response.data && response.data.note) {
        showToastMessage("Note Pinned Successfully", "success");
        getAllNotes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
  }, [getUserInfo]);

  // Wait for userInfo to be loaded before rendering Navbar
  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />
      <div className="container mx-auto">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((item) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={moment(item.createdOn).format("Do MMM YYYY")}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteNotes(item)}
                onPinNote={() => updateIsPinned(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={isSearch ? NoDataImg : AddNotesImg}
            message={
              isSearch
                ? `Oops! No notes found matching your search.`
                : `Start creating your first note! Click the 'Add' button to jot down your thoughts, ideas, and reminders. Let's get started!`
            }
          />
        )}
      </div>
      <button
        aria-label="button"
        className="w-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() =>
          setOpenAddEditModal({ isShown: true, type: "add", data: null })
        }
      >
        <MdAdd className="text-[32px] text-white" />
      </button>
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data || {}}
          onClose={() =>
            setOpenAddEditModal({ isShown: false, type: "add", data: null })
          }
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage} // see next fix for props
        />
      </Modal>
      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
