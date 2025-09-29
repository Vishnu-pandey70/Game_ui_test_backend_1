import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function AdminPanel() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

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

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(filteredGames);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    const updatedGames = items.map((g, index) => ({ ...g, priority: index }));
    setFilteredGames(updatedGames);
    setGames(updatedGames);

    updatedGames.forEach((game) => {
      fetch(`http://localhost:5000/api/games/${game._id}/priority`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: game.priority }),
      }).catch((err) => console.error(err));
    });
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4">Admin Game Panel</h2>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
          >
            <option value="">All Subcategories</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
          >
            <option value="">All Providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="">All Tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="games">
          {(provided) => (
            <table
              className="table table-bordered table-striped"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
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
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <td>{game.game_name}</td>
                        <td>{game.game_code}</td>
                        <td>{getCategoryName(game.game_category)}</td>
                        <td>{(game.game_subcategory || []).join(", ")}</td>
                        <td>{game.provider_name}</td>
                        <td>{(game.game_tag || []).join(", ")}</td>
                        <td>{game.game_status ? "Active" : "Inactive"}</td>
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
  );
}

export default AdminPanel;