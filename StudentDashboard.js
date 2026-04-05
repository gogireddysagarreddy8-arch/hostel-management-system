import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [complaintText, setComplaintText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const rollNo = localStorage.getItem("rollNo");

  // Get current date
  const getCurrentDate = () => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const fetchRequests = useCallback(async () => {
    if (!rollNo) {
      setError("User not authenticated. Please login again.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/bookings?rollNo=${rollNo}`);
      setRequests(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load your requests. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [rollNo]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Check if student has an active room request
  const hasActiveRoomRequest = () => {
    return requests.some(r => r.type === 'Room Request' && (r.status === 'Pending' || r.status === 'Approved'));
  };

  const submitAction = async (type, message) => {
    if (!message || message.trim() === "") {
      setError("Please enter details before submitting.");
      return;
    }

    // Prevent double submission
    if (submitInProgress) {
      setError("Submission in progress. Please wait...");
      return;
    }

    // Check if trying to request room while already having active request
    if (type === "Room Request" && hasActiveRoomRequest()) {
      setError("You already have an active room request. Please wait for admin approval or rejection.");
      return;
    }

    setSubmitInProgress(true);
    setLoading(true);
    
    try {
      const payload = {
        studentRollNo: rollNo,
        type: type,
        message: message.trim(),
        status: "Pending"
      };
      
      const response = await axios.post("http://localhost:5000/api/bookings/apply", payload);
      
      alert(`${type} submitted successfully!`);
      setComplaintText("");
      setError("");
      
      // Add new request to state immediately
      setRequests([response.data, ...requests]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Submission failed. Please try again.";
      setError(errorMsg);
      console.error("Submission error:", err);
    } finally {
      setSubmitInProgress(false);
      setLoading(false);
    }
  };

  if (!rollNo) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          User not authenticated. Please <a href="/">login again</a>.
        </div>
      </div>
    );
  }

  const isRoomRequestDisabled = hasActiveRoomRequest() || submitInProgress;
  const roomRequestButtonTitle = hasActiveRoomRequest()
    ? "You already have a pending or approved room request" 
    : "Request a room assignment from the admin";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className="container-fluid mt-0" style={{ 
        flex: 1, 
        paddingRight: "0", 
        marginLeft: "250px",
        display: "flex",
        flexDirection: "column"
      }}>
        
        {/* Welcome Banner */}
        <div className="student-welcome-banner">
          <div className="welcome-content">
            <p className="welcome-date">{getCurrentDate()}</p>
            <h2 className="welcome-text">Welcome back, {rollNo}! 👋</h2>
            <p className="welcome-subtitle">Always stay updated in your student portal</p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ paddingRight: "30px", paddingLeft: "30px", flex: 1 }}>
          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          )}

          {loading && <div className="alert alert-info mt-3">Loading...</div>}

          {/* Cards Container - Smaller Size */}
          <div className="row mt-5 g-4 justify-content-start">
            {/* Room Allocation Card */}
            <div className="col-auto">
              <div className="card-hover-container">
                <div className="card shadow-sm border-primary card-hover" style={{ width: "350px", minHeight: "250px" }}>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title mb-3">
                      <span style={{ fontSize: "24px" }}>🛏️</span> Room Allocation
                    </h5>
                    <p className="text-muted small mb-3">{roomRequestButtonTitle}</p>
                    <button 
                      className="btn w-100 mt-auto" 
                      style={{
                        background: isRoomRequestDisabled 
                          ? "linear-gradient(135deg, #999 0%, #666 100%)" 
                          : "linear-gradient(135deg, #3822b4 0%, #6926a3 100%)",
                        border: "none",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "1rem",
                        padding: "0.65rem 1.25rem",
                        transition: "all 0.3s ease-in-out",
                        cursor: isRoomRequestDisabled ? "not-allowed" : "pointer",
                        opacity: isRoomRequestDisabled ? 0.6 : 1
                      }}
                      onClick={() => submitAction("Room Request", "Requesting a room assignment")}
                      disabled={isRoomRequestDisabled}
                      title={roomRequestButtonTitle}
                    >
                      {submitInProgress ? "Submitting..." : "Request Room"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaint Form Card */}
            <div className="col-auto">
              <div className="card-hover-container">
                <div className="card shadow-sm card-hover complaint-card" style={{ width: "350px", minHeight: "250px" }}>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title mb-3">
                      <span style={{ fontSize: "24px" }}>📋</span> Complaint Form
                    </h5>
                    <textarea 
                      className="form-control form-control-sm mb-3 flex-grow-1 complaint-textarea" 
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      placeholder="Describe your issue..." 
                      rows="3"
                      style={{ resize: "none", minHeight: "80px" }}
                    />
                    <button 
                      className="btn w-100" 
                      style={{
                        background: "linear-gradient(135deg, #3335d8 0%, #5d0c93 100%)",
                        border: "none",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "1rem",
                        padding: "0.65rem 1.25rem",
                        transition: "all 0.3s ease-in-out",
                        cursor: submitInProgress || !complaintText.trim() ? "not-allowed" : "pointer",
                        opacity: submitInProgress || !complaintText.trim() ? 0.7 : 1
                      }}
                      onClick={() => submitAction("Complaint", complaintText)}
                      disabled={submitInProgress || !complaintText.trim()}
                    >
                      {submitInProgress ? "Submitting..." : "Submit Complaint"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Check Table */}
          <div className="mt-5 mb-5">
            <h5 className="border-bottom pb-3 mb-4">
              <span style={{ fontSize: "20px" }}>📊</span> Status Check
            </h5>
            <div className="table-responsive">
              <table className="table table-hover border bg-white status-table">
                <thead className="table-header-violet">
                  <tr>
                    <th>Type</th>
                    <th>Details</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length > 0 ? (
                    requests.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <span className={`badge badge-type ${r.type === 'Complaint' ? 'badge-complaint' : 'badge-room'}`}>
                            {r.type}
                          </span>
                        </td>
                        <td>{r.message}</td>
                        <td>
                          <span className={`badge ${
                            r.status === 'Approved' ? 'bg-success' : 
                            r.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'
                          }`}>
                            {r.status} {r.roomNumber ? `(Room: ${r.roomNumber} - ${r.slot})` : ""}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-muted">
                        No records found. Make your first request above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;