import React, { useState } from "react";
import { Link } from "react-router-dom";
import SubMenu from "./SubMenu";

export default function Sidebar() {
  const [showTasks, setShowTasks] = useState(false);

  return (
    <div className="sidebar">
      <h2>Task Allocator</h2>
      <nav>
        <Link to="/">🏠 Home</Link>
        <Link to="/profile">👤 Profile</Link>

        <Link to="/files">📁 Files</Link>

        <div className="submenu-toggle" onClick={() => setShowTasks(!showTasks)}>
          ✅ Task Tracker ▾
        </div>
        {showTasks && <SubMenu items={[{ name: "All Tasks", path: "/tasks" }]} />}
      </nav>
    </div>
  );
}