import React, { useEffect, useState } from "react";
import { listMyEvents } from "../api";

export default function Marketplace({ token, getSwappableSlots, createSwapRequest }) {
  const [slots, setSlots] = useState([]);
  const [mySwappable, setMySwappable] = useState([]);

  const loadSlots = async () => {
    const res = await getSwappableSlots(token);
    setSlots(res);
  };

  const loadMySwappable = async () => {
    const res = await listMyEvents(token);
    setMySwappable(res.filter((e) => e.status === "SWAPPABLE"));
  };

  const handleRequest = async (slot, myEventId) => {
    if (!myEventId) return alert("Please select your event to swap with!");
    try {
      await createSwapRequest({ my_event_id: myEventId, their_event_id: slot.id }, token);
      alert("Swap request sent!");
    } catch (err) {
      console.error(err);
      alert("Swap failed. Please check console for details.");
    }
  };

  useEffect(() => {
    loadSlots();
    loadMySwappable();
  }, []);

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Marketplace</h2>
      <div className="space-y-3">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="bg-gray-800 p-4 rounded-lg flex flex-col gap-3 border border-gray-700 shadow-md"
          >
            <div>
              <p className="font-semibold text-lg">{slot.title}</p>
              <p className="text-sm text-gray-400">
                Posted by User #{slot.owner_id} | Event ID: {slot.id}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                id={`select-${slot.id}`}
                className="bg-gray-700 text-white p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500"
                defaultValue=""
              >
                <option value="">Select your swappable event</option>
                {mySwappable.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} (ID: {ev.id})
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  handleRequest(slot, document.getElementById(`select-${slot.id}`).value)
                }
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold"
              >
                Request Swap
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
