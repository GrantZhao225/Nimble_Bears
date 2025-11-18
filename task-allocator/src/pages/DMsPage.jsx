import React from "react";

export default function DMsPage() {
  const dms = ["Alice", "Bob", "Charlie"];
  return (
    <div>
      <h1>Recent DMs</h1>
      <ul>
        {dms.map((dm, i) => (
          <li key={i}>{dm}</li>
        ))}
      </ul>
    </div>
  );
}