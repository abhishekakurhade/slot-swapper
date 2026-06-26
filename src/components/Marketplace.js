import React, { useEffect, useState } from "react";
import { listMyEvents } from "../api";
import "./Marketplace.css";

export default function Marketplace({ token, getSwappableSlots, createSwapRequest }) {
  const [slots, setSlots] = useState([]);
  const [mySwappable, setMySwappable] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState({}); // track selection per slot

  // Load swappable slots
  const loadSlots = async () => {
    try {
      const res = await getSwappableSlots(token);
      setSlots(res);
    } catch (error) {
      console.error("Error loading slots:", error);
    }
  };

  // Load user's own swappable events
  const loadMySwappable = async () => {
    try {
      const res = await listMyEvents(token);
      setMySwappable(res.filter((e) => e.status === "SWAPPABLE"));
    } catch (error) {
      console.error("Error loading your swappable events:", error);
    }
  };

  // Handle selection change
  const handleSelectChange = (slotId, eventId) => {
    setSelectedEvents((prev) => ({ ...prev, [slotId]: eventId }));
  };

  // Handle swap request
  const handleRequest = async (slot) => {
    const myEventId = selectedEvents[slot.id];
    if (!myEventId) {
      alert("Please select your event to swap with!");
      return;
    }

    try {
      await createSwapRequest(
        { my_event_id: parseInt(myEventId), their_event_id: slot.id },
        token
      );
      alert(`Swap request sent to ${slot.owner_name || "User"} successfully!`);
    } catch (err) {
      console.error(err);
      alert("Swap request failed. Please try again!");
    }
  };

  useEffect(() => {
    loadSlots();
    loadMySwappable();
  }, []);

  return (
    <div className="market-container">
      <h2 className="section-title">Available Swaps</h2>

      {slots.length === 0 ? (
        <p className="no-slots">No swappable slots yet 😔</p>
      ) : (
        <div className="market-list">
          {slots.map((slot) => (
            <div key={slot.id} className="market-card">
              <div className="market-details">
                <h3>{slot.title}</h3>
                <p>
                  🧍‍♂️ <strong>{slot.owner_name || `User #${slot.owner_id}`}</strong>
                </p>
                <p>
                  🕓 {new Date(slot.start_time).toLocaleString()} -{" "}
                  {new Date(slot.end_time).toLocaleString()}
                </p>
                <p>ID: {slot.id}</p>
              </div>

              <div className="market-actions">
                <select
                  value={selectedEvents[slot.id] || ""}
                  onChange={(e) => handleSelectChange(slot.id, e.target.value)}
                >
                  <option value="">Select your event</option>
                  {mySwappable.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} (ID: {ev.id})
                    </option>
                  ))}
                </select>
                <button onClick={() => handleRequest(slot)} className="swap-btn">
                  Request Swap
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
