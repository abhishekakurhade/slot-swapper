// src/Notifications.js
import React, { useEffect, useRef, useState } from "react";
import { listRequests } from "../api";
import "./Notifications.css";

export default function Notifications({ token, user, pollInterval = 8000 }) {
  const [toasts, setToasts] = useState([]);
  const knownIdsRef = useRef(new Set());
  const pollingRef = useRef(null);

  // Add toast helper
  const pushToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 7000);
  };

  // Request browser permission for notification
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!token || !user) return;

    // fetch initial requests so we don't notify existing ones
    (async () => {
      try {
        const reqs = await listRequests(token);
        reqs.forEach((r) => knownIdsRef.current.add(r.id));
      } catch (e) {
        console.error("Initial requests load failed", e);
      }
    })();

    // start polling
    async function poll() {
      try {
        const reqs = await listRequests(token);
        // find new ones that are PENDING and intended for this user
        for (const r of reqs) {
          if (!knownIdsRef.current.has(r.id)) {
            knownIdsRef.current.add(r.id);
            // if it's PENDING and responder is current user -> incoming new request
            if (r.status === "PENDING" && r.responder_id === user.id) {
              const msg = `${r.requester_name || "Someone"} requested to swap with you (Req #${r.id})`;
              pushToast(msg);
              // browser notification
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Slot Swapper - New Request", { body: msg });
              }
            }
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }

    // first poll immediately, then interval
    poll();
    pollingRef.current = setInterval(poll, pollInterval);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [token, user, pollInterval]);

  return (
    <div className="notifications-wrapper">
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
