import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/games")
      .then((res) => res.json())
      .then((data) => setGames(data));

  }, []);

  return (
    <div className="container-fluid">
  
      <div className="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
        <h4 className="m-0">OMS Operator</h4>
        <div>
          <span className="me-3">Credit: <b>1761716.12</b></span>
          <span className="badge bg-warning">StagingApp(230201)</span>
        </div>
      </div>

    
      <div className="p-3">
        <h5>Game Management - Game List</h5>
      </div>

      <div className="table-responsive px-3">
        <table className="table table-striped table-bordered text-center align-middle">
          <thead className="table-dark">
            <tr>
              <th>Game Code</th>
              <th>Game Name</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Tag</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Icon</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => (
              <tr key={index}>
                <td>{game.game_code}</td>
                <td>{game.game_name}</td>
                <td>
                {Object.entries(game.game_category || {}).map(([k, v]) => (
                <div key={k}>
                  {k}: {v ? <a href={v} target="_blank" rel="noreferrer">Link</a> : "—"}
                </div>
                    ))}

                </td>
                <td>{(game.game_subcategory || []).join(", ")}</td>
                <td>{(game.game_tag || []).join(", ")}</td>

                <td>{game.provider_name}</td>
                <td>
                  <span className={`badge ${game.game_status ? "bg-success" : "bg-danger"}`}>
                    {game.operational_status}
                  </span>
                </td>
                <td>
                  <img src={game.game_icon} alt="icon" style={{ width: "50px", height: "50px" }} />
                </td>
                <td>
                  <button className="btn btn-sm btn-primary">Edit</button>
                  <button className="btn btn-sm btn-danger ms-2">Delete</button>
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
