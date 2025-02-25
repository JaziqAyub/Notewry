import { MdCreate, MdDelete, MdOutlinePushPin } from "react-icons/md";

// Define prop types
interface NoteCardProps {
  title: string;
  date?: string;
  content: string;
  tags?: string[]; // Changed from string to string[]
  isPinned?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPinNote: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  title,
  date,
  content,
  tags = [], // Provide a default empty array
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
}) => {
  return (
    <div className="border rounded p-4 bg-white hover:shadow-xl transition-all ease-out">
      <div className="flex items-center justify-between">
        <div>
          <h6 className="text-sm font-medium">{title}</h6>
          <span className="text-xs text-slate-500">{date}</span>
        </div>
        <MdOutlinePushPin
          className={`icon-btn ${isPinned ? "text-primary" : "text-slate-300"}`}
          onClick={onPinNote}
        />
      </div>
      <p className="text-xs text-slate-600 mt-2">{content?.slice(0, 60)}</p>
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-slate-500">
          {tags.map((item) => `#${item}`)}{" "}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <MdCreate
            className="icon-btn hover:text-green-600"
            onClick={onEdit}
          />
          <MdDelete
            className="icon-btn hover:text-red-500"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
