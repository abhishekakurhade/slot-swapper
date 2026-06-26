import React, { useEffect, useState } from "react";
import {
  listMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleSwappable,
} from "../api";
import "./CalendarView.css";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    start_time: "",
    end_time: "",
    status: "BUSY",
  });

  const [newEvent, setNewEvent] = useState({
    title: "",
    start_time: "",
    end_time: "",
    status: "BUSY",
  });

  const token = localStorage.getItem("token");

  // Fetch events
  async function fetchEvents() {
    try {
      setLoading(true);
      const res = await listMyEvents(token);
      setEvents(res || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load your events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  // Add new event
  async function handleAddEvent(e) {
    e.preventDefault();
    if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const created = await createEvent(
        {
          title: newEvent.title,
          start_time: newEvent.start_time,
          end_time: newEvent.end_time,
        },
        token
      );

      // Update event status if not BUSY (backend default)
      if (newEvent.status !== "BUSY") {
        await toggleSwappable(created.id, newEvent.status, token);
        created.status = newEvent.status;
      }

      setEvents((prev) => [...prev, created]);
      setNewEvent({ title: "", start_time: "", end_time: "", status: "BUSY" });
    } catch (err) {
      console.error(err);
      alert("Failed to add event.");
    }
  }

  // Delete event
  async function handleDelete(id) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id, token);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  }

  // Start editing
  function startEdit(event) {
    setEditingId(event.id);
    setEditForm({
      title: event.title,
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
      status: event.status,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({
      title: "",
      start_time: "",
      end_time: "",
      status: "BUSY",
    });
  }

  // Submit edited event
  async function submitEdit(e) {
    e.preventDefault();
    try {
      const updated = await updateEvent(
        editingId,
        {
          title: editForm.title,
          start_time: editForm.start_time,
          end_time: editForm.end_time,
        },
        token
      );

      // Update status if needed
      if (editForm.status !== updated.status) {
        await toggleSwappable(editingId, editForm.status, token);
        updated.status = editForm.status;
      }

      setEvents((prev) =>
        prev.map((e) => (e.id === editingId ? updated : e))
      );
      cancelEdit();
    } catch (err) {
      console.error(err);
      alert("Update failed.");
    }
  }

  function onEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  function onNewChange(e) {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  }

  if (loading) return <div className="calendar-loading">Loading events...</div>;
  if (error) return <div className="calendar-error">{error}</div>;

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">My Calendar Events</h2>

      {/* ➕ ADD EVENT FORM */}
      <form className="add-event-form" onSubmit={handleAddEvent}>
        <input
          type="text"
          name="title"
          value={newEvent.title}
          onChange={onNewChange}
          placeholder="Event title"
          required
        />
        <input
          type="datetime-local"
          name="start_time"
          value={newEvent.start_time}
          onChange={onNewChange}
          required
        />
        <input
          type="datetime-local"
          name="end_time"
          value={newEvent.end_time}
          onChange={onNewChange}
          required
        />
        <select
          name="status"
          value={newEvent.status}
          onChange={onNewChange}
          className="status-select"
        >
          <option value="BUSY">Busy</option>
          <option value="SWAPPABLE">Swappable</option>
          <option value="SWAP_PENDING">Swap Pending</option>
        </select>
        <button type="submit" className="btn btn-add">
          Add Event
        </button>
      </form>

      {/* No events message */}
      {events.length === 0 && (
        <p className="calendar-empty">No events found. Add one above!</p>
      )}

      {/* Event Cards */}
      <div className="calendar-grid">
        {events.map((event) => (
          <div className="calendar-card" key={event.id}>
            <div className="calendar-card-header">
              <h3 className="calendar-card-title">{event.title}</h3>
              <div className="calendar-actions">
                <button
                  className="btn btn-edit"
                  onClick={() => startEdit(event)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() => handleDelete(event.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="calendar-time">
              <p>
                🕒 {new Date(event.start_time).toLocaleString()} →{" "}
                {new Date(event.end_time).toLocaleString()}
              </p>
            </div>

            <div
              className={`status-badge status-${event.status.toLowerCase()}`}
            >
              {event.status}
            </div>
          </div>
        ))}
      </div>

      {/* ✏️ Edit Modal */}
      {editingId && (
        <div className="calendar-edit-modal">
          <form className="calendar-edit-form" onSubmit={submitEdit}>
            <h3>Edit Event</h3>

            <label>
              Title
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={onEditChange}
                required
              />
            </label>

            <label>
              Start Time
              <input
                type="datetime-local"
                name="start_time"
                value={editForm.start_time}
                onChange={onEditChange}
                required
              />
            </label>

            <label>
              End Time
              <input
                type="datetime-local"
                name="end_time"
                value={editForm.end_time}
                onChange={onEditChange}
                required
              />
            </label>

            <label>
              Status
              <select
                name="status"
                value={editForm.status}
                onChange={onEditChange}
                className="status-select"
              >
                <option value="BUSY">Busy</option>
                <option value="SWAPPABLE">Swappable</option>
                <option value="SWAP_PENDING">Swap Pending</option>
              </select>
            </label>

            <div className="edit-buttons">
              <button type="submit" className="btn btn-save">
                Save
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
