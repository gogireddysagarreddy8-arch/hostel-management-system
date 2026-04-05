import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  
  
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    
    navigate("/");
    
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
      <div className="container-fluid">
        <span className="navbar-brand fw-bold">
          🏨 Hostel Management
        </span>

        <div className="d-flex align-items-center text-white">
          <span className="me-3">
            {}
            Role: <strong>{role ? role.toUpperCase() : "Guest"}</strong>
          </span>

          <button className="btn btn-danger btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;