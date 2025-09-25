import React, { useEffect, useState } from "react";

function UserPanel() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

useEffect(() => {
  fetch("https://game-ui-test-backend-1.onrender.com/api/games")
    .then(res => res.json())
    .then(data => {
      
      const sorted = data.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      setGames(sorted);
    })
    .catch(err => console.error(err));
}, []);


  const getCategoryName = (gameCategory) => {
    if (!gameCategory || Object.keys(gameCategory).length === 0) return "N/A";
    const key = Object.keys(gameCategory).find(k => gameCategory[k] !== "") || Object.keys(gameCategory)[0];
    return key;
  };

  useEffect(() => {
    let temp = [...games];

    
    if (categoryFilter) temp = temp.filter(g => getCategoryName(g.game_category) === categoryFilter);
    if (subcategoryFilter) temp = temp.filter(g => (g.game_subcategory || []).includes(subcategoryFilter));
    if (providerFilter) temp = temp.filter(g => g.provider_name === providerFilter);

    
    if (sortBy === "category") {
      temp.sort((a, b) => getCategoryName(a.game_category).localeCompare(getCategoryName(b.game_category)));
    } else if (sortBy === "subcategory") {
      temp.sort((a, b) => {
        const subA = (a.game_subcategory || [])[0] || "";
        const subB = (b.game_subcategory || [])[0] || "";
        return subA.localeCompare(subB);
      });
    }
    else {
    temp.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }

    setFilteredGames(temp);
  }, [games, categoryFilter, subcategoryFilter, providerFilter, sortBy]);

  
  const categories = [...new Set(games.map(g => getCategoryName(g.game_category)))];
  const subcategories = [...new Set(games.flatMap(g => g.game_subcategory || []))];
  const providers = [...new Set(games.map(g => g.provider_name).filter(Boolean))];

  return (
    <div className="container my-4">
      <h2 className="mb-4">User Game Panel</h2>


      <div className="row mb-3">
        <div className="col-md-3">
          <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={subcategoryFilter} onChange={e => setSubcategoryFilter(e.target.value)}>
            <option value="">All Subcategories</option>
            {subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={providerFilter} onChange={e => setProviderFilter(e.target.value)}>
            <option value="">All Providers</option>
            {providers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="">Sort By</option>
            <option value="category">Category</option>
            <option value="subcategory">Subcategory</option>
          </select>
        </div>
      </div>

      
      <div className="row">
        {(filteredGames || []).length === 0 && <p>No games found</p>}
        {(filteredGames || []).map(game => (
          <div key={game._id} className="col-md-3 mb-4">
            <div className="card h-100">
              <img src={game.game_icon} className="card-img-top" alt={game.game_name} />
              <div className="card-body">
                <h5 className="card-title">{game.game_name}</h5>
                <p className="card-text">
                  Category: {getCategoryName(game.game_category)} <br/>
                  Subcategory: {(game.game_subcategory || []).join(", ") || "N/A"} <br/>
                  Provider: {game.provider_name || "N/A"} <br/>
                  Status: {game.game_status ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserPanel;
