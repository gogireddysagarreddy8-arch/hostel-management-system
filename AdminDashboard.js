import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [allocatingId, setAllocatingId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Search state
  
  const floors = [3, 2, 1];
  const roomsList = [1, 2, 3, 4, 5];

  // Get current date
  const getCurrentDate = () => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      setRequests(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load requests. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAllocate = async (requestId, roomNumber, slot) => {
    if (!selectedStudent || !selectedStudent._id) {
      alert("Invalid student selection. Please try again.");
      return;
    }

    // Prevent double allocation
    if (allocatingId === requestId) {
      alert("Allocation in progress. Please wait...");
      return;
    }

    setAllocatingId(requestId);

    try {
      const response = await axios.put(`http://localhost:5000/api/bookings/update/${requestId}`, {
        status: "Approved",
        roomNumber: String(roomNumber),
        slot: String(slot),
        message: `Allocated Room ${roomNumber} (${slot})`
      });
      
      alert(`✅ Success! Allocated Room ${roomNumber} (${slot}) to ${selectedStudent.studentRollNo}`);
      setSelectedStudent(null);
      setError("");
      
      // Update state immediately
      setRequests(requests.map(r => r._id === requestId ? response.data : r));
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Allocation failed. Check console.";
      setError(errorMsg);
      console.error("Allocation error:", err);
    } finally {
      setAllocatingId(null);
    }
  };

  const handleDeallocate = async (id) => {
    if (!window.confirm("Are you sure? This will free up the room slot.")) return;
    
    setAllocatingId(id);

    try {
      const response = await axios.put(`http://localhost:5000/api/bookings/update/${id}`, {
        status: "Pending", 
        roomNumber: null,
        slot: null,
        message: "Room deallocated by Admin"
      });
      
      alert("✅ Room deallocated successfully.");
      setError("");
      
      // Update state immediately
      setRequests(requests.map(r => r._id === id ? response.data : r));
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Deallocation failed.";
      setError(errorMsg);
      console.error("Deallocation error:", err);
    } finally {
      setAllocatingId(null);
    }
  };

  const updateStatus = async (id, status, msg) => {
    setAllocatingId(id);

    try {
      const response = await axios.put(`http://localhost:5000/api/bookings/update/${id}`, { 
        status: status, 
        message: msg 
      });
      
      setError("");
      
      // Update state immediately
      setRequests(requests.map(r => r._id === id ? response.data : r));
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Status update failed.";
      setError(errorMsg);
      console.error("Update error:", err);
    } finally {
      setAllocatingId(null);
    }
  };

  const getOccupant = (roomNo, slot) => {
    return requests.find(r => 
      r.status === "Approved" && 
      String(r.roomNumber) === String(roomNo) && 
      r.slot === slot
    );
  };

  const getOccupiedSlots = (roomNo) => {
    return requests.filter(r => 
      r.status === "Approved" && 
      String(r.roomNumber) === String(roomNo)
    ).length;
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter requests based on search query
  const filteredRequests = requests.filter((r) => {
    const query = searchQuery.toLowerCase().trim();
    if (query === "") return true;
    return r.studentRollNo.toLowerCase().includes(query);
  });

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
  };

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
        <div className="admin-welcome-banner">
          <div className="welcome-content">
            <p className="welcome-date">{getCurrentDate()}</p>
            <h2 className="welcome-text">Welcome back, Admin! 👋</h2>
            <p className="welcome-subtitle">Manage hostel bookings and room allocations</p>
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

          {loading && <div className="alert alert-info mt-3">Loading data...</div>}
          
          {/* VISUAL ROOM GRID - BLUE BACKGROUND */}
          <div className="room-allocation-container">
            <div className="room-grid-header">
              <span>Room Allocation Grid (Floors 1-3) - Total Rooms: {floors.length * roomsList.length}</span>
              {selectedStudent && <span className="badge bg-warning text-dark">Selection Mode Active</span>}
            </div>
            <div className="room-grid-body">
              {selectedStudent && (
                <div className="alert alert-info d-flex justify-content-between align-items-center mb-3">
                  <span>Click an available slot (M1/M2) to assign <strong>{selectedStudent.studentRollNo}</strong></span>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedStudent(null)}>Cancel</button>
                </div>
              )}
              
              {floors.map(f => (
                <div key={f} className="floor-section">
                  <h6 className="floor-title">Floor {f}</h6>
                  <div className="rooms-container">
                    {roomsList.map(r => {
                      const roomNo = `${f}0${r}`;
                      const occupiedCount = getOccupiedSlots(roomNo);
                      
                      return (
                        <div key={roomNo} className="room-card">
                          <div className="room-number">Room {roomNo}</div>
                          <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem" }}>
                            ({occupiedCount}/2 occupied)
                          </div>
                          <div className="room-slots">
                            {['M1', 'M2'].map(slot => {
                              const occupant = getOccupant(roomNo, slot);
                              const isAllocating = allocatingId && selectedStudent?._id === allocatingId;
                              
                              return (
                                <button
                                  key={slot}
                                  disabled={!!occupant || !selectedStudent || isAllocating}
                                  onClick={() => {
                                    if (selectedStudent && selectedStudent._id && !isAllocating) {
                                      handleAllocate(selectedStudent._id, roomNo, slot);
                                    }
                                  }}
                                  className={`slot-btn ${occupant ? 'occupied' : 'available'}`}
                                  title={occupant ? `Occupied by ${occupant.studentRollNo}` : "Available"}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REQUEST MANAGEMENT TABLE */}
          <div className="requests-section-header">
            <h3 className="requests-title">Pending Requests & Complaints</h3>
            <span className="request-count-badge">{filteredRequests.length} Result{filteredRequests.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Search Bar */}
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search by Roll Number (e.g., 24b11cs136)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="btn-clear-search"
                  onClick={handleClearSearch}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="search-stats">
              {searchQuery && (
                <small className="text-muted">
                  Found <strong>{filteredRequests.length}</strong> matching request{filteredRequests.length !== 1 ? 's' : ''}
                </small>
              )}
            </div>
          </div>
          
          {/* Table Header Bar */}
          <div className="table-header-toolbar">
            <div className="toolbar-column student-col">Student Roll No</div>
            <div className="toolbar-column type-col">Type</div>
            <div className="toolbar-column status-col">Status & Details</div>
            <div className="toolbar-column manage-col">Manage</div>
          </div>

          {/* Table Content */}
          <div className="table-content-wrapper">
            {filteredRequests.length === 0 ? (
              <div className="no-data-message">
                {requests.length === 0 ? (
                  <>
                    <span>📭 No data available.</span>
                  </>
                ) : (
                  <>
                    <span>🔍 No matching results found for "<strong>{searchQuery}</strong>"</span>
                    <br />
                    <small className="text-muted mt-2" style={{ display: 'block' }}>
                      Try searching with a different roll number
                    </small>
                  </>
                )}
              </div>
            ) : (
              filteredRequests.map((r) => (
                <div key={r._id}>
                  <div className="table-row">
                    <div className="table-cell student-col">
                      <span className="cell-label">Student Roll No</span>
                      <span className="cell-value fw-bold">{r.studentRollNo}</span>
                    </div>
                    <div className="table-cell type-col">
                      <span className="cell-label">Type</span>
                      <span className={`badge ${r.type === 'Complaint' ? 'bg-info' : 'bg-secondary'}`}>
                        {r.type}
                      </span>
                    </div>
                    <div className="table-cell status-col">
                      <span className="cell-label">Status</span>
                      <div className="status-content">
                        <span className={`badge ${
                          r.status === 'Approved' ? 'bg-success' : 
                          r.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'
                        }`}>
                          {r.status} {r.roomNumber ? `(Room ${r.roomNumber} - ${r.slot})` : ""}
                        </span>
                        {r.type === 'Complaint' && (
                          <button
                            className="btn btn-sm btn-link details-toggle"
                            onClick={() => setExpandedRow(expandedRow === r._id ? null : r._id)}
                            title="View complaint details"
                          >
                            {expandedRow === r._id ? "▼ Hide Details" : "▶ Show Details"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="table-cell manage-col">
                      <span className="cell-label">Manage</span>
                      {r.status === "Pending" ? (
                        <div className="btn-group-custom">
                          {r.type === "Room Request" ? (
                            <button 
                              className="btn btn-primary btn-sm" 
                              onClick={() => setSelectedStudent(r)}
                              disabled={allocatingId !== null}
                            >
                              Assign Room
                            </button>
                          ) : (
                            <button 
                              className="btn btn-success btn-sm" 
                              onClick={() => updateStatus(r._id, "Approved", "Issue Resolved")}
                              disabled={allocatingId !== null}
                            >
                              Resolve
                            </button>
                          )}
                          <button 
                            className="btn btn-outline-danger btn-sm" 
                            onClick={() => updateStatus(r._id, "Rejected", "Denied by Admin")}
                            disabled={allocatingId !== null}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        r.status === "Approved" && r.type === "Room Request" && (
                          <button 
                            className="btn btn-warning btn-sm" 
                            onClick={() => handleDeallocate(r._id)}
                            disabled={allocatingId !== null}
                          >
                            Deallocate
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Expanded Complaint Details Row */}
                  {expandedRow === r._id && r.type === 'Complaint' && (
                    <div className="complaint-details-row">
                      <div className="complaint-message-container">
                        <div className="complaint-header">
                          <span className="complaint-icon">📝</span>
                          <span className="complaint-title">Complaint Details</span>
                        </div>
                        <div className="complaint-message-box">
                          <p className="complaint-text">{r.message}</p>
                          <div className="complaint-meta">
                            <small className="complaint-date">
                              📅 Submitted: {formatDate(r.createdAt)}
                            </small>
                            <small className="complaint-status">
                              Status: <strong>{r.status}</strong>
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;