import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // Determine sidebar title based on role
  const getSidebarTitle = () => {
    return role === "admin" ? "Admin Dashboard" : "Student Dashboard";
  };

  // Determine sidebar icon based on role
  const getSidebarIcon = () => {
    return role === "admin" ? "⚙️" : "📚";
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className={`sidebar-wrapper ${role === "admin" ? "admin-sidebar" : ""}`}>
      <div className={`sidebar-container d-flex flex-column ${role === "admin" ? "admin-sidebar" : ""}`} style={{ width: "250px" }}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <span className="sidebar-icon">{getSidebarIcon()}</span>
            <h4 className="sidebar-title">{getSidebarTitle()}</h4>
          </div>
          <button 
            className="btn btn-logout w-100 mb-4" 
            onClick={handleLogout}
          >
            Logout
          </button>
          <hr className="sidebar-divider" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;