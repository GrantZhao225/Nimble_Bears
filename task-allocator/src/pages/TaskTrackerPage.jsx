import React from "react";

export default function TaskTrackerPage() {
  const tasks = [
    { member: "Alice", task: "Design UI", status: "In Progress" },
    { member: "Bob", task: "Build API", status: "Complete" },
    { member: "Charlie", task: "Write Tests", status: "Pending" },
  ];

  return (
    <div>
      <h1>Task Tracker</h1>
      <table>
        <thead>
          <tr>
            <th>Team Member</th>
            <th>Task</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t, i) => (
            <tr key={i}>
              <td>{t.member}</td>
              <td>{t.task}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}