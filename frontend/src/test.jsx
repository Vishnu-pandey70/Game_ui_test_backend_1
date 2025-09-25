import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch("https://game-ui-test-1.onrender.com/Game_list.json")
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="container">
      
      <div className="header">
        <h3>OMS Operator</h3>
        <div className="header-right">
          <span className="credit">
            Credit: <b>1761514.12</b>
          </span>
          <span className="badge">StagingApp(230201)</span>
        </div>
      </div>


      <div className="title">
        <h5>Game List</h5>
      </div>

      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Game Name</th>
              <th>Game Code</th>
              <th>Operational Status</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => (
              <tr key={index} className={index % 2 === 0 ? "even" : "odd"}>
                <td>
                  <span className="dot">●</span>
                  {game.game_name}
                </td>
                <td>{game.game_code}</td>
                <td>{game.operational_status}</td>
                <td>{game.priority}</td>
                <td>
                  <button className="btn">{game.action || "Active"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
