import { Link, useNavigate } from "react-router-dom";
import ProfileInfo from "../Cards/ProfileInfo";
import SearchBar from "../SearchBar/SearchBar";
import { useState } from "react";

interface UserInfo {
  fullName: string;
  // Add any other properties you expect from the backend here.
}

// Define the props for Navbar
interface NavbarProps {
  userInfo?: UserInfo;
  onSearchNote: (query: string) => Promise<void>;
  handleClearSearch: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userInfo, onSearchNote, handleClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  return (
    <div className="bg-white px-4 py-2 drop-shadow">
      {/* Desktop / Laptop view: visible on screens sm and above */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="w-1/3 flex items-center justify-start">
          <Link to="/dashboard">
            <h2 className="text-xl font-medium text-black py-2">Notewry</h2>
          </Link>
        </div>
        <div className="w-1/3 flex items-center justify-center">
          <SearchBar
            value={searchQuery}
            onchange={({ target }) => setSearchQuery(target.value)}
            handleSearch={handleSearch}
            onClearSearch={onClearSearch}
          />
        </div>
        <div className="w-1/3 flex items-center justify-end">
          {userInfo ? (
            <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
          ) : (
            <div className="text-sm font-medium">Guest</div>
          )}
        </div>
      </div>
      {/* Mobile view: visible on screens smaller than sm */}
      <div className="flex flex-col sm:hidden">
        <div className="flex items-center justify-center">
          <Link to="/dashboard">
            <h2 className="text-xl font-medium text-black py-2">Notewry</h2>
          </Link>
        </div>
        <div className="mt-2 flex items-center justify-center">
          <SearchBar
            value={searchQuery}
            onchange={({ target }) => setSearchQuery(target.value)}
            handleSearch={handleSearch}
            onClearSearch={onClearSearch}
          />
        </div>
        <div className="mt-5 flex items-center justify-center">
          {userInfo ? (
            <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
          ) : (
            <div className="text-sm font-medium">Guest</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
