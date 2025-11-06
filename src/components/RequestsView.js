import React, { useEffect, useState } from "react";
import "./RequestsView.css";

export default function RequestsView({ token, listRequests, respondToRequest }) {
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    const data = await listRequests(token);
    setRequests(data);
  };

  const handleRespond = async (id, accept) => {
    await respondToRequest(id, accept, token);
    loadRequests();
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="requests-container">
      <h2 className="section-title">Swap Requests</h2>

      {requests.length === 0 ? (
        <p className="no-requests">No pending requests 🙌</p>
      ) : (
        <div className="request-list">
          {requests.map((r) => (
            <div key={r.id} className={`request-card ${r.status.toLowerCase()}`}>
              <div>
                <h3>
                  Req #{r.id} — <span className="highlight">{r.status}</span>
                </h3>
                <p>
                  From <b>{r.requester_name || `User #${r.requester_id}`}</b> →{" "}
                  <b>{r.responder_name || `User #${r.responder_id}`}</b>
                </p>
              </div>
              {r.status === "PENDING" && (
                <div className="req-actions">
                  <button
                    onClick={() => handleRespond(r.id, true)}
                    className="accept-btn"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(r.id, false)}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
