import { useNavigate } from "react-router-dom";
import ProfileInfo from "../Cards/ProfileInfo";
import SearchBar from "../SearchBar/SearchBar";
import { useState } from "react";

interface UserInfo {
  fullName: string;
  // Add any other properties you expect from the backend here.
}

// Define the props for Navbar, ensuring userInfo is not nullable
interface NavbarProps {
  userInfo?: UserInfo;
}

const Navbar: React.FC<NavbarProps> = ({ userInfo }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = () => {};

  const onClearSearch = () => {
    setSearchQuery("");
  };
  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
      <h2 className="text-xl font-medium text-black py-2">Notewry</h2>

      <SearchBar
        value={searchQuery}
        onchange={({ target }) => {
          setSearchQuery(target.value);
        }}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />

      {userInfo ? (
        <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
      ) : (
        // Optionally render a placeholder, guest label, or nothing when userInfo is missing
        <div className="text-sm font-medium">Guest</div>
      )}
    </div>
  );
};

export default Navbar;
