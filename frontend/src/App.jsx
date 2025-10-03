import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import UserPanel from "./components/UserPanel";

function App() {
  return (
    <Router>

      {/* <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-3">
        <Link className="navbar-brand" to="/">Game Portal</Link>
        <div className="navbar-nav">
          <Link className="nav-link" to="/">Admin</Link>
          <Link className="nav-link" to="/user">User</Link>
        </div>
      </nav> */}


      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/user" element={<UserPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
