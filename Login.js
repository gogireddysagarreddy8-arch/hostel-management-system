import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  
  // Student State
  const [sRoll, setSRoll] = useState("");
  const [sPass, setSPass] = useState("");
  
  // Admin State
  const [aUser, setAUser] = useState("");
  const [aPass, setAPass] = useState("");
  
  // Error State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [capacityInfo, setCapacityInfo] = useState(null);

  // Check capacity on mount
  useEffect(() => {
    checkHostelCapacity();
  }, []);

  const checkHostelCapacity = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users/hostel/capacity");
      setCapacityInfo(response.data);
    } catch (err) {
      console.error("Capacity check error:", err);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    // Input Validation
    if (!aUser.trim() || !aPass.trim()) {
      setError("Username and password are required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/users/admin-login", {
        username: aUser.trim(),
        password: aPass.trim()
      });
      
      localStorage.setItem("role", "admin");
      localStorage.setItem("adminUsername", response.data.username);
      alert(response.data.message);
      navigate("/admin");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid Admin Credentials. Use admin / admin@123";
      setError(errorMsg);
      console.error("Admin Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    // Input Validation
    if (!sRoll.trim() || !sPass.trim()) {
      setError("Roll number and password are required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/users/student-login", {
        rollNo: sRoll.trim(),
        password: sPass.trim()
      });

      localStorage.setItem("role", "student");
      localStorage.setItem("rollNo", response.data.rollNo);
      localStorage.setItem("id", response.data.id);
      
      alert(response.data.message);
      navigate("/student");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid Student Credentials";
      setError(errorMsg);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Image with Overlay */}
      <div className="login-background"></div>
      
      {/* Content Wrapper */}
      <div className="login-content">
        <div className="login-header">
          <h1 className="login-main-title">🏨 Our Hostels</h1>
          <p className="login-description">Welcome back! Sign in to your account</p>
        </div>

        {/* Capacity Status Banner */}
        {capacityInfo && (
          <div className={`alert ${capacityInfo.isFull ? 'alert-danger' : 'alert-info'} alert-dismissible fade show w-100 mb-3`} role="alert">
            <strong>
              {capacityInfo.isFull 
                ? '🚫 HOSTEL FULL - No Vacancies!' 
                : '📊 Available Beds: ' + capacityInfo.remainingCapacity}
            </strong>
            {!capacityInfo.isFull && (
              <small className="d-block">
                ({capacityInfo.totalStudents}/{capacityInfo.maxCapacity} beds occupied)
              </small>
            )}
            <button type="button" className="btn-close" onClick={() => setCapacityInfo(null)}></button>
          </div>
        )}
        
        {/* Display Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show w-100 mb-4" role="alert">
            <strong>⚠️ Error:</strong> {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        <div className="card login-card border-0 shadow-lg">
          <div className="row g-0">
            
            {/* Student Portal */}
            <div className="col-md-6 border-end p-4">
              <div className="student-section">
                <h4 className="text-center text-primary mb-4 fw-bold">
                  👨‍🎓 Student Portal
                </h4>
                <form onSubmit={handleStudentLogin}>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">ROLL NUMBER</label>
                    <input 
                      className="form-control form-control-sm" 
                      placeholder="" 
                      value={sRoll} 
                      onChange={(e) => setSRoll(e.target.value)} 
                      required 
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">PASSWORD</label>
                    <input 
                      type="password" 
                      className="form-control form-control-sm" 
                      placeholder="" 
                      value={sPass} 
                      onChange={(e) => setSPass(e.target.value)} 
                      required 
                      disabled={loading}
                    />
                  </div>
                  <button 
                    className="btn btn-primary w-100 py-2 fw-bold mb-2 btn-sm" 
                    disabled={loading}
                  >
                    {loading ? "🔄 Logging in..." : "Login as Student"}
                  </button>
                  <div className="text-center">
                    <span className="text-muted small">Don't have an account? </span>
                    <Link to="/register" className="text-primary fw-bold text-decoration-none small">
                      Register here
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            {/* Admin Portal */}
            <div className="col-md-6 p-4">
              <div className="admin-section">
                <h4 className="text-center text-dark mb-4 fw-bold">
                  🔐 Admin Portal
                </h4>
                <form onSubmit={handleAdminLogin}>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">USERNAME</label>
                    <input 
                      className="form-control form-control-sm" 
                      placeholder="" 
                      value={aUser} 
                      onChange={(e) => setAUser(e.target.value)} 
                      required 
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">PASSWORD</label>
                    <input 
                      type="password" 
                      className="form-control form-control-sm" 
                      placeholder="" 
                      value={aPass} 
                      onChange={(e) => setAPass(e.target.value)} 
                      required 
                      disabled={loading}
                    />
                  </div>
                  <button 
                    className="btn btn-dark w-100 py-2 fw-bold btn-sm" 
                    disabled={loading}
                  >
                    {loading ? "🔄 Logging in..." : "Login as Admin"}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="login-footer text-center mt-4">
          <p className="text-white-50 small">
            © 2026 Our Hostels | All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;