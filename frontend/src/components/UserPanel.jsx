import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./UserPanel.css"; 

function UserPanel() {
  const [games, setGames] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Discover");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/games")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => (a.priority || 0) - (b.priority || 0));
        setGames(sorted);

        let uniqueCategories = [
          "Discover",
          ...new Set(
            sorted.map((g) => {
              if (!g.game_category || Object.keys(g.game_category).length === 0)
                return "Others";
              return (
                Object.keys(g.game_category).find((k) => g.game_category[k] !== "") ||
                Object.keys(g.game_category)[0]
              );
            })
          ),
        ];

        uniqueCategories = uniqueCategories.filter((c) => c !== "Others");
        uniqueCategories.push("Others");
        setCategories(uniqueCategories);

        const uniqueTags = [...new Set(sorted.flatMap((g) => g.game_tag || []))];
        setTags(uniqueTags);
      })
      .catch((err) => console.error(err));
  }, []);

  const getCategoryName = (gameCategory) => {
    if (!gameCategory || Object.keys(gameCategory).length === 0) return "Others";
    return (
      Object.keys(gameCategory).find((k) => gameCategory[k] !== "") ||
      Object.keys(gameCategory)[0]
    );
  };

  const filteredByCategory =
    activeCategory === "Discover"
      ? games
      : games.filter((g) => getCategoryName(g.game_category) === activeCategory);

  const selectedTagGames = selectedTag
    ? filteredByCategory.filter((g) => (g.game_tag || []).includes(selectedTag))
    : [];

  const scrollRow = (tag, direction) => {
    const row = document.getElementById(`row-${tag}`);
    if (!row) return;

    const scrollAmount = 300;
    row.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  return (
    <div style={{ backgroundColor: "#121212", minHeight: "100vh", color: "white" }}>
      <div className="container py-4">

        {!selectedTag && (
          <>
            <h2 className="mb-4 text-center" style={{ color: "#facc15", fontWeight: "bold" }}>
              User Game Panel
            </h2>

            
            <div className="d-flex flex-wrap justify-content-center mb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`btn me-2 mb-2 rounded-pill ${
                    activeCategory === cat ? "btn-warning text-dark fw-bold" : "btn-outline-light"
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            
            {tags.map((tag) => {
              const taggedGames = filteredByCategory.filter((g) =>
                (g.game_tag || []).includes(tag)
              );
              if (taggedGames.length === 0) return null;

              return (
                <div key={tag} className="mb-5 position-relative">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0" style={{ color: "#facc15" }}>
                      {tag}
                    </h4>

                    {taggedGames.length > 4 && (
                      <button
                        className="btn btn-sm btn-outline-light rounded-pill"
                        onClick={() => setSelectedTag(tag)}
                      >
                        Show More
                      </button>
                    )}
                  </div>

                
                  <div className="position-relative">
                    
                    {taggedGames.length > 4 && (
                      <button
                        className="position-absolute top-50 start-0 translate-middle-y btn btn-dark rounded-circle"
                        style={{ zIndex: 10, width: "35px", height: "35px", opacity: 0.8 }}
                        onClick={() => scrollRow(tag, "left")}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    )}

                    
                    {taggedGames.length > 4 && (
                      <button
                        className="position-absolute top-50 end-0 translate-middle-y btn btn-dark rounded-circle"
                        style={{ zIndex: 10, width: "35px", height: "35px", opacity: 0.8 }}
                        onClick={() => scrollRow(tag, "right")}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    )}

                    <div
                      className="row flex-nowrap"
                      id={`row-${tag}`}
                      style={{
                        overflowX: "hidden",
                        scrollBehavior: "smooth",
                      }}
                    >
                      {taggedGames.map((game) => (
                        <div key={game._id} className="col-md-3 col-sm-6 mb-3">
                          <div className="card h-100 shadow-lg game-card">
                            <img
                              src={game.game_icon}
                              className="card-img-top mb-2"
                              alt={game.game_name}
                              
                              style={{ height: "220px", objectFit: "cover", borderRadius: "15px 15px 0 0" }}
                            />
                            <div
                              className="card-body d-flex justify-content-between align-items-center p-2 mb-1"
                              style={{ flexGrow: 1 }}
                            >
                              <h6
                                className="card-title text-white fw-bold"
                                style={{
                                  fontSize: "0.95rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {game.game_name}
                              </h6>
                              <button
                                className="btn btn-sm btn-warning text-dark fw-bold"
                                style={{
                                  fontSize: "0.75rem",
                                  padding: "3px 8px",
                                  borderRadius: "12px",
                                }}
                              >
                                Game Info
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Full Tag View */}
        {selectedTag && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0" style={{ color: "#facc15", fontWeight: "bold" }}>
                {selectedTag} Games
              </h2>
              <button
                className="btn btn-sm btn-outline-light rounded-pill"
                onClick={() => setSelectedTag(null)}
              >
                Back
              </button>
            </div>

            <div className="row">
              {selectedTagGames.map((game) => (
                <div key={game._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                  <div className="card h-100 shadow-lg game-card">
                    <img
                      src={game.game_icon}
                      className="card-img-top mb-2"
                      alt={game.game_name}
                      style={{ height: "220px", objectFit: "cover", borderRadius: "15px 15px 0 0" }}
                    />
                    <div
                      className="card-body d-flex justify-content-between align-items-center p-2 mb-1"
                    >
                      <h6
                        className="card-title mb-0 text-white fw-bold"
                        style={{
                          fontSize: "0.95rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {game.game_name}
                      </h6>
                      <button
                        className="btn btn-sm btn-warning text-dark fw-bold"
                        style={{
                          fontSize: "0.75rem",
                          padding: "3px 8px",
                          borderRadius: "12px",
                        }}
                      >
                        Game Info
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserPanel;
