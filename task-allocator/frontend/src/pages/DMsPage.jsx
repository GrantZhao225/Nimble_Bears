import React from "react";

export default function DMsPage({ onLogout }) {
  const dms = ["Alice", "Bob", "Charlie"];
  // this page doesn't matter anymore since we moved this to projectdetails. yay
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