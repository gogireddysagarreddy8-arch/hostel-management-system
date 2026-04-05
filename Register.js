import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ rollNo: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [capacityInfo, setCapacityInfo] = useState(null);
  const [hostelFull, setHostelFull] = useState(false);

  // Check hostel capacity on component mount
  useEffect(() => {
    checkHostelCapacity();
  }, []);

  const checkHostelCapacity = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users/hostel/capacity");
      setCapacityInfo(response.data);
      
      if (response.data.isFull) {
        setHostelFull(true);
        setError("🚫 Hostel is at Full Capacity! No Vacancies Available.");
      }
    } catch (err) {
      console.error("Capacity check error:", err);
    }
  };

  // Validate roll number format
  const isValidRollNo = (rollNo) => {
    return rollNo.match(/^[a-z0-9]+$/i) && rollNo.length >= 8;
  };

  // Validate password strength
  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!formData.rollNo.trim()) {
      setError("Roll number is required");
      return;
    }

    if (!isValidRollNo(formData.rollNo)) {
      setError("Invalid roll number format (min 8 characters, alphanumeric)");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    if (!isValidPassword(formData.password)) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        rollNo: formData.rollNo.trim().toLowerCase(),
        password: formData.password
      };

      const res = await axios.post("http://localhost:5000/api/users/register", payload);
      alert(res.data.message);
      
      // Refresh capacity info
      await checkHostelCapacity();
      
      // Reset form and redirect
      setFormData({ rollNo: "", password: "" });
      navigate("/"); 
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration Failed. Check backend terminal.";
      setError(errorMsg);
      
      // If hostel is full, update the flag
      if (err.response?.data?.isFull) {
        setHostelFull(true);
        await checkHostelCapacity();
      }
      
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card p-4 shadow border-0" style={{ width: "400px" }}>
        <h3 className="text-center mb-2 fw-bold text-success">Student Registration</h3>
        
        {/* Capacity Info */}
        {capacityInfo && (
          <div className={`alert ${capacityInfo.isFull ? 'alert-danger' : 'alert-info'} mb-3`} role="alert">
            <strong>
              {capacityInfo.isFull 
                ? '🚫 Hostel Full!' 
                : '📊 Hostel Status:'}
            </strong>
            <br/>
            <small>
              {capacityInfo.isFull 
                ? `All ${capacityInfo.maxCapacity} beds are occupied. No more registrations accepted.`
                : `${capacityInfo.totalStudents} / ${capacityInfo.maxCapacity} beds occupied`}
            </small>
            {!capacityInfo.isFull && (
              <br/>
            )}
            {!capacityInfo.isFull && (
              <small className="text-muted">
                Remaining: {capacityInfo.remainingCapacity} beds
              </small>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        {/* Registration Form - Disabled if Hostel is Full */}
        {!hostelFull ? (
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label font-weight-bold">Roll Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 24b11cs136"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                required
                disabled={loading}
              />
              <small className="text-muted">Min 8 characters, alphanumeric only</small>
            </div>

            <div className="mb-3">
              <label className="form-label font-weight-bold">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Create a password (min 6 chars)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
              <small className="text-muted">At least 6 characters</small>
            </div>

            <button 
              className="btn btn-success w-100 mb-3 py-2 fw-bold"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <div className="text-center">
              <Link to="/" className="text-decoration-none small">Already have an account? Login</Link>
            </div>
          </form>
        ) : (
          <div className="alert alert-danger text-center py-4">
            <h5 className="mb-3">🏨 Hostel Capacity Full</h5>
            <p className="mb-3">
              All <strong>{capacityInfo?.maxCapacity}</strong> student beds are currently occupied.
            </p>
            <p className="text-muted mb-3">
              Please try again later or contact the hostel administration.
            </p>
            <Link to="/" className="btn btn-primary">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;