import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminPanel() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/games")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => (a.priority || 0) - (b.priority || 0));
        setGames(sorted);
        setFilteredGames(sorted);
      })
      .catch((err) => console.error(err));
  }, []);

  const getCategoryName = (gameCategory) => {
    if (!gameCategory || Object.keys(gameCategory).length === 0) return "N/A";
    const categories = Object.keys(gameCategory).filter((key) => gameCategory[key] !== "");
    return categories.length > 0 ? categories.join(", ") : Object.keys(gameCategory).join(", ");
  };

  useEffect(() => {
    let temp = [...games];
    if (categoryFilter)
      temp = temp.filter((g) =>
        getCategoryName(g.game_category).split(", ").includes(categoryFilter)
      );
    if (subcategoryFilter)
      temp = temp.filter((g) => (g.game_subcategory || []).includes(subcategoryFilter));
    if (providerFilter) temp = temp.filter((g) => g.provider_name === providerFilter);
    if (tagFilter) temp = temp.filter((g) => (g.game_tag || []).includes(tagFilter));

    setFilteredGames(temp);
  }, [games, categoryFilter, subcategoryFilter, providerFilter, tagFilter]);

  const categories = [...new Set(games.flatMap((g) => getCategoryName(g.game_category).split(", ")))];
  const subcategories = [...new Set(games.flatMap((g) => g.game_subcategory || []))];
  const providers = [...new Set(games.map((g) => g.provider_name).filter(Boolean))];
  const tags = [...new Set(games.flatMap((g) => g.game_tag || []))];

//  const onDragEnd = (result) => {
//   if (!result.destination) return;

//   const sourceIndex = result.source.index;
//   const destinationIndex = result.destination.index;

//   // Create a mapping from filteredGames to indexes in the full games array
//   const reorderedGameId = filteredGames[sourceIndex]._id;

//   // Clone the original games list
//   const updatedGames = [...games];

//   // Find the index of the dragged game in the original games list
//   const draggedGameIndex = updatedGames.findIndex(game => game._id === reorderedGameId);
//   const [draggedGame] = updatedGames.splice(draggedGameIndex, 1);

//   // Figure out where to re-insert in the full list based on filtered destination
//   const destinationGameId = filteredGames[destinationIndex]?._id;
//   const destinationGameIndex = updatedGames.findIndex(game => game._id === destinationGameId);

//   updatedGames.splice(destinationGameIndex, 0, draggedGame);

//   // Reassign priorities
//   const reorderedWithPriorities = updatedGames.map((g, i) => ({
//     ...g,
//     priority: i
//   }));

//   setGames(reorderedWithPriorities); // ← full updated list
//   // filteredGames will be updated automatically via useEffect

//   // Sync to backend
//   fetch(`http://localhost:5000/api/games/update-priorities`, {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       games: reorderedWithPriorities.map((game) => ({
//         _id: game._id,
//         priority: game.priority,
//       })),
//     }),
//   })
//     .then((res) => res.json())
//     .then((data) => console.log("Priorities updated successfully:", data))
//     .catch((err) => console.error("Error updating priorities:", err));
// };


// const onDragEnd = (result) => {
//   if (!result.destination) return;

//   const sourceIndex = result.source.index;
//   const destinationIndex = result.destination.index;
//   const reorderedGameId = filteredGames[sourceIndex]._id;

//   const updatedGames = [...filteredGames];
//   const [draggedGame] = updatedGames.splice(sourceIndex, 1);
//   updatedGames.splice(destinationIndex, 0, draggedGame);

//   // Reassign priorities only inside current tag filter
//   const reorderedWithPriorities = updatedGames.map((g, i) => ({
//     ...g,
//     priority: i
//   }));

//   setFilteredGames(reorderedWithPriorities);

//   // Update full games list with new tag priorities
//   const updatedAllGames = games.map((g) => {
//     const match = reorderedWithPriorities.find((fg) => fg._id === g._id);
//     if (match) {
//       return {
//         ...g,
//         tag_priorities: {
//           ...g.tag_priorities,
//           [tagFilter]: match.priority
//         }
//       };
//     }
//     return g;
//   });

//   setGames(updatedAllGames);

  
//   fetch(`http://localhost:5000/api/games/update-priorities`, {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       tag: tagFilter,
//       games: reorderedWithPriorities.map((game) => ({
//         _id: game._id,
//         priority: game.priority,
//       })),
//     }),
//   })
//     .then((res) => res.json())
//     .then((data) => {
//         console.log("Priorities updated:", data);
//         toast.success("Game order updated successfully ✅", { position: "top-right" });
//       })
//     .catch((err) => {
//         console.error("Error updating priorities:", err);
//         toast.error("Error updating game order ❌", { position: "top-right" });
//       });
// };

const onDragEnd = (result) => {
  if (!result.destination) return;

  const sourceIndex = result.source.index;
  const destinationIndex = result.destination.index;

  // Clone the filtered list
  const updatedFiltered = Array.from(filteredGames);
  const [movedGame] = updatedFiltered.splice(sourceIndex, 1);
  updatedFiltered.splice(destinationIndex, 0, movedGame);

  if (tagFilter) {
    // TAG-BASED drag
    const reordered = updatedFiltered.map((g, i) => ({
      ...g,
      tag_priorities: { ...g.tag_priorities, [tagFilter]: i },
    }));

    setFilteredGames(reordered);

    const updatedAllGames = games.map((g) => {
      const match = reordered.find((fg) => fg._id === g._id);
      if (match) return { ...g, tag_priorities: match.tag_priorities };
      return g;
    });
    setGames(updatedAllGames);

    fetch("http://localhost:5000/api/games/update-priorities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tag: tagFilter,
        games: reordered.map((g) => ({ _id: g._id, priority: g.tag_priorities[tagFilter] })),
      }),
    })
      .then((res) => res.json())
      .then(() => toast.success("Tag priorities updated ✅"))
      .catch(() => toast.error("Error updating priorities ❌"));

  } else {

    const reordered = updatedFiltered.map((g, i) => ({ ...g, priority: i }));
    setFilteredGames(reordered);
    setGames(reordered);

    fetch("http://localhost:5000/api/games/update-priorities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tag: null,
        games: reordered.map((g) => ({ _id: g._id, priority: g.priority })),
      }),
    })
      .then((res) => res.json())
      .then(() => toast.success("Global priorities updated ✅"))
      .catch(() => toast.error("Error updating priorities ❌"));
  }
};




  return (
    <div className="admin-container">
         <ToastContainer />
               <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo">
          <span>OMS</span>
          <div className="operator">Operator</div>
        </div>
        <ul className="nav">
          <li>Dashboard</li>
          <li>Player Management</li>
                <li>
            <Link to="/user" style={{ textDecoration: "none", color: "inherit" }}>
              User Management
            </Link>
          </li>
          <li>Game Management</li>
          <li>Affiliate Management</li>
          <li>Game History</li>
          <li>Finance</li>
          <li>Transactions</li>
          <li>Reports</li>
          <li>App Store Management</li>
          <li>Tournament Management</li>
          <li>Promotion Management</li>
          <li>Turnovers</li>
          <li>Analytics</li>
          <li>Master Settings</li>
        </ul>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <main className="main-content">

        <div className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="icons">
            <span>🔔</span>
            <span>📬</span>
          </div>
          <div className="credit">Credit: <b>1698160.36</b></div>
          <div className="badge">StagingApp(230201)</div>
        </div>

        <div className="filters">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={subcategoryFilter} onChange={(e) => setSubcategoryFilter(e.target.value)}>
            <option value="">All Subcategories</option>
            {subcategories.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
          </select>
          <select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
            <option value="">All Providers</option>
            {providers.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
            <option value="">All Tags</option>
            {tags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="games">
              {(provided) => (
                <table ref={provided.innerRef} {...provided.droppableProps}>
                  <thead>
                    <tr>
                      <th>Game Name</th>
                      <th>Game Code</th>
                      <th>Category</th>
                      <th>Subcategory</th>
                      <th>Provider</th>
                      <th>Tags</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGames.map((game, index) => (
                      <Draggable key={game._id} draggableId={game._id} index={index}>
                        {(provided) => (
                          <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={index % 2 === 0 ? "even" : "odd"}>
                            <td><span className="dot">●</span> {game.game_name}</td>
                            <td>{game.game_code}</td>
                            <td>{getCategoryName(game.game_category)}</td>
                            <td>{(game.game_subcategory || []).join(", ")}</td>
                            <td>{game.provider_name}</td>
                            <td>{(game.game_tag || []).join(", ")}</td>
                            <td><span className={game.game_status ? "status-btn active" : "status-btn inactive"}>{game.game_status ? "Active" : "Inactive"}</span></td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                </table>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </main>

      {/* Styles */}
      <style jsx>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        .admin-container { display:flex; min-height:100vh; background:#f5f5f5; }
        .sidebar { width:220px; background:#300515; color:white; padding:16px; transition:left 0.3s ease; }
        .logo { font-size:28px; font-weight:bold; margin-bottom:16px; }
        .logo .operator { font-size:14px; font-weight:normal; color:yellow; }
        .nav { list-style:none; }
        .nav li { margin:10px 0; font-size:14px; cursor:pointer; }
        .main-content { flex-grow:1; display:flex; flex-direction:column; }
        .topbar { display:flex; justify-content:flex-end; align-items:center; background:#300515; color:white; padding:12px 20px; flex-wrap:wrap; }
        .credit { margin-left:20px; }
        .badge { background:orange; padding:4px 10px; border-radius:12px; font-size:13px; margin-left:20px; color:black; }
        .hamburger { display:none; font-size:24px; background:none; border:none; color:white; cursor:pointer; margin-right:auto; }
        .filters { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; padding:16px; background:#fff; }
        .filters select { width:100%; padding:8px; font-size:14px; border-radius:4px; border:1px solid #ccc; }
        .table-wrapper { overflow-x:auto; padding:16px; }
        table { width:100%; border-collapse:collapse; min-width:800px; }
        th, td { border:1px solid #ccc; padding:10px; text-align:left; font-size:14px; }
        th { background:#e6e6e7; }
        .even { background:#fff; }
        .odd { background:#ede9f5f9; }
        .dot { color:green; font-size:18px; margin-right:5px; }
        .status-btn { display:inline-block; padding:6px 12px; border-radius:20px; font-size:13px; font-weight:500; text-align:center; min-width:60px; }
        .status-btn.active { background:#009900; color:white; }
        .status-btn.inactive { background:#ccc; color:black; }

        @media(max-width:1024px) { .filters { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:768px) {
          .hamburger { display:block; }
          .sidebar { position:fixed; top:0; left:-100%; height:100%; z-index:1000; width:220px; padding:16px; }
          .sidebar.open { left:0; }
          .sidebar-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.3); z-index:999; }
          .main-content { margin-left:0; width:100%; }
          .topbar { width:100%; padding:12px 20px; }
          .filters { grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  );
}

export default AdminPanel;
