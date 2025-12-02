import React from "react";
import { Link } from "react-router-dom";

export default function SubMenu({ items }) {
  return (
    <div className="submenu">
      {items.map((item, index) => (
        <Link key={index} to={item.path}>
          {item.name}
        </Link>
      ))}
    </div>
  );
}