import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../../services/api';
import RabbitMascot from '../../components/common/RabbitMascot';
import './Leaderboard.css';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [range, setRange] = useState('all'); // all | month | week
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('cq_user');
    const user = stored ? JSON.parse(stored) : null;
    setCurrentUserId(user?.id || user?._id || null);

    getLeaderboard(range)
      .then((data) => {
        // Expecting: [{ id, username, level, xp, streak, avatarUrl? }, ...]
        const sorted = [...(data || [])].sort((a, b) => b.xp - a.xp);
        setRows(sorted);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [range]);

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="dash-shell">
      {/* ============== SIDEBAR (same as Dashboard) ============== */}
      <aside className="side-nav">
        <div className="side-logo">
          <span className="side-logo-icon">🚀</span>
          <span className="side-logo-text">CodeQuest</span>
        </div>

        <nav className="side-links">
          <button className="side-link" onClick={() => navigate('/dashboard')}>
            <span className="side-link-icon">🏠</span> Dashboard
          </button>
          <button className="side-link" onClick={() => navigate('/languages')}>
            <span className="side-link-icon">🎮</span> Quests
          </button>
          <button className="side-link active">
            <span className="side-link-icon">🏆</span> Leaderboard
          </button>
          <button className="side-link" onClick={() => navigate('/achievements')}>
            <span className="side-link-icon">🏅</span> Achievements
          </button>
          <button className="side-link" onClick={() => navigate('/settings')}>
            <span className="side-link-icon">⚙️</span> Settings
          </button>
        </nav>

        <button className="side-logout" onClick={() => navigate('/logout')}>
          ⏻ Log out
        </button>
      </aside>

      {/* ============== MAIN CONTENT ============== */}
      <main className="dash-main">
        <div className="dash-main-nightbg" />

        <div className="lb-topbar">
          <div>
            <p className="dash-topbar-eyebrow">Global rankings</p>
            <h1 className="dash-topbar-name">Leaderboard 🏆</h1>
          </div>

          <div className="lb-range-tabs">
            {[
              ['week', 'This Week'],
              ['month', 'This Month'],
              ['all', 'All Time'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`lb-range-tab ${range === key ? 'active' : ''}`}
                onClick={() => setRange(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="lb-loading">
            <span className="dash-loading-blip">▮▮▮</span>
            LOADING RANKINGS…
          </div>
        )}

        {!loading && error && (
          <div className="lb-empty">
            Couldn't load the leaderboard right now. Try again shortly.
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="lb-empty">No ranked players yet — be the first!</div>
        )}

        {!loading && !error && rows.length > 0 && (
          <>
            {/* ---- Podium: top 3 ---- */}
            <section className="lb-podium">
              {[podium[1], podium[0], podium[2]].map((player, i) => {
                if (!player) return <div key={i} className="lb-podium-slot empty" />;
                const place = [2, 1, 3][i]; // matches visual order: 2nd, 1st, 3rd
                return (
                  <div
                    key={player.id}
                    className={`lb-podium-slot place-${place}`}
                  >
                    <span className="lb-podium-medal">
                      {place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉'}
                    </span>
                    <div className="lb-podium-avatar">
                      <RabbitMascot size={48} mood="happy" />
                    </div>
                    <p className="lb-podium-name">{player.username}</p>
                    <p className="lb-podium-level">LV {player.level}</p>
                    <p className="lb-podium-xp">{player.xp.toLocaleString()} XP</p>
                    <div className="lb-podium-bar" />
                  </div>
                );
              })}
            </section>

            {/* ---- Ranked list: 4th onward ---- */}
            <section className="lb-list-section">
              <div className="lb-list-head">
                <span className="lb-col-rank">Rank</span>
                <span className="lb-col-player">Player</span>
                <span className="lb-col-level">Level</span>
                <span className="lb-col-streak">Streak</span>
                <span className="lb-col-xp">XP</span>
              </div>

              <ul className="lb-list">
                {rest.map((player, idx) => {
                  const rank = idx + 4;
                  const isYou = currentUserId && player.id === currentUserId;
                  return (
                    <li
                      key={player.id}
                      className={`lb-row ${isYou ? 'is-you' : ''}`}
                    >
                      <span className="lb-col-rank">#{rank}</span>
                      <span className="lb-col-player">
                        <span className="lb-row-avatar">
                          <RabbitMascot size={28} mood="happy" />
                        </span>
                        {player.username}
                        {isYou && <span className="lb-you-tag">YOU</span>}
                      </span>
                      <span className="lb-col-level">LV {player.level}</span>
                      <span className="lb-col-streak">🔥 {player.streak || 0}d</span>
                      <span className="lb-col-xp">{player.xp.toLocaleString()}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}