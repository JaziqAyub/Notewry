import { MdAdd } from "react-icons/md";
import NoteCard from "../../components/Cards/NoteCard";
import Navbar from "../../components/Navbar/Navbar";
import AddEditNotes from "./AddEditNotes";
import { useCallback, useEffect, useState } from "react";
// import { data } from "react-router-dom";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/AxiosInstance";
import axios from "axios";
import moment from "moment";

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


  const navigate = useNavigate();

  //EditNote
  const handleEdit = (noteDetails: Note) => {
    setOpenAddEditModal ({isShown: true, data: noteDetails, type: "edit"})
  }

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
      <Navbar userInfo={userInfo} />

      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4 mt-8">
          {allNotes.map((item)=>(
             <NoteCard
             key={item._id}
             title={item.title}
             date={moment(item.createdOn).format('Do MMM YYYY')}
             content={item.content}
             tags={item.tags} // Join the array into a string
             isPinned={item.isPinned}
             onEdit={() => handleEdit(item)}
             onDelete={() => {}}
             onPinNote={() => {}}
           />
          ))}
         
        </div>
      </div>
      <button
        className="w-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        {}
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
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllNotes = {getAllNotes}
        />
      </Modal>
    </>
  );
};

export default Home;
