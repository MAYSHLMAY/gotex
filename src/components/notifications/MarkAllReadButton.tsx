"use client";

export function MarkAllReadButton() {
  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={async () => {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAll: true }),
        });
        window.location.reload();
      }}
    >
      Mark all read
    </button>
  );
}
