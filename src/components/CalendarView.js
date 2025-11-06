import React, { useEffect, useState } from "react";
import { listMyEvents } from "../api";
import "./CalendarView.css";

export default function CalendarView({ token, createEvent, toggleSwappable }) {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const loadEvents = async () => {
    const data = await listMyEvents(token);
    setEvents(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await createEvent({ title, start_time: start, end_time: end }, token);
    setTitle("");
    setStart("");
    setEnd("");
    loadEvents();
  };

  const handleToggle = async (id, status) => {
    const newStatus = status === "SWAPPABLE" ? "BUSY" : "SWAPPABLE";
    await toggleSwappable(id, newStatus, token);
    loadEvents();
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="calendar-container">
      <h2 className="section-title">My Events</h2>

      <form onSubmit={handleAdd} className="event-form">
        <input
          type="text"
          placeholder="Enter event title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
        />
        <button type="submit" className="add-btn">Add</button>
      </form>

      <div className="event-list">
        {events.map((ev) => (
          <div key={ev.id} className="event-card">
            <div>
              <h3 className="event-title">{ev.title}</h3>
              <p className="event-info">📅 ID: {ev.id}</p>
              <p className={`event-status ${ev.status.toLowerCase()}`}>
                Status: {ev.status}
              </p>
            </div>
            <button
              onClick={() => handleToggle(ev.id, ev.status)}
              className={`swap-btn ${
                ev.status === "SWAPPABLE" ? "busy" : "swappable"
              }`}
            >
              {ev.status === "SWAPPABLE" ? "Mark Busy" : "Make Swappable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
