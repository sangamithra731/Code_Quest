import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../../services/api';
import { COURSE_CATALOG } from '../../data/courseCatalog';
import RabbitMascot from '../../components/common/RabbitMascot';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [displayName, setDisplayName] = useState('Coder');

  useEffect(() => {
    const stored = localStorage.getItem('cq_user');
    const user = stored ? JSON.parse(stored) : null;
    setDisplayName(user?.username || user?.name || 'Coder');

    getDashboard().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="dash-loading">
        <span className="dash-loading-blip">▮▮▮</span>
        LOADING QUEST LOG…
      </div>
    );
  }

  const xpPct = Math.min(
    100,
    Math.round((data.xpIntoLevel / data.xpForNextLevel) * 100)
  );

  const overallPct = (() => {
    const langs = Object.values(data.courseProgress);
    if (!langs.length) return 0;
    const totalDone = langs.reduce((s, l) => s + l.completedLevels, 0);
    const totalAll = langs.reduce((s, l) => s + l.totalLevels, 0);
    return totalAll ? Math.round((totalDone / totalAll) * 100) : 0;
  })();

  // Course the player is mid-way through, for the "continue" banner.
  const continueCourse = COURSE_CATALOG.find((c) => {
    const p = data.courseProgress[c.id];
    return c.full && p && p.completedLevels > 0 && p.completedLevels < p.totalLevels;
  });
  const continuePct = continueCourse
    ? Math.round(
        (data.courseProgress[continueCourse.id].completedLevels /
          data.courseProgress[continueCourse.id].totalLevels) *
          100
      )
    : 0;

  const visibleCourses = COURSE_CATALOG.filter((c) => {
    const matchesFilter = filter === 'all' || c.difficulty === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="dash-shell">
      {/* ============== SIDEBAR ============== */}
      <aside className="side-nav">
        <div className="side-logo">
          <span className="side-logo-icon">🚀</span>
          <span className="side-logo-text">CodeQuest</span>
        </div>

        <nav className="side-links">
          <button className="side-link active">
            <span className="side-link-icon">🏠</span> Dashboard
          </button>
          <button className="side-link" onClick={() => navigate('/languages')}>
            <span className="side-link-icon">🎮</span> Quests
          </button>
          <button className="side-link" onClick={() => navigate('/leaderboard')}>
            <span className="side-link-icon">🏆</span> Leaderboard
          </button>
          <button className="side-link" onClick={() => navigate('/achievements')}>
            <span className="side-link-icon">🏅</span> Achievements
          </button>
          <button className="side-link" onClick={() => navigate('/settings')}>
            <span className="side-link-icon">⚙️</span> Settings
          </button>
        </nav>

        {/* ---- Player stat card: level, XP, streak, badges, certs ---- */}
        <div className="side-player-card">
          <div className="side-player-top">
            <span className="side-avatar">
              <RabbitMascot size={40} mood="happy" />
            </span>
            <div>
              <p className="side-player-name">{displayName}</p>
              <p className="side-player-level">LEVEL {data.level}</p>
            </div>
          </div>

          <div className="side-xp-track">
            <div className="side-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <p className="side-xp-label">
            {data.xpIntoLevel} / {data.xpForNextLevel} XP
          </p>

          <ul className="side-stat-list">
            <li>
              <span>🔥 Streak</span>
              <strong>{data.streak}d</strong>
            </li>
            <li>
              <span>🏅 Badges</span>
              <strong>{data.badges.length}</strong>
            </li>
            <li>
              <span>📜 Certs</span>
              <strong>{data.certificates.length}</strong>
            </li>
            <li>
              <span>📈 Cleared</span>
              <strong>{overallPct}%</strong>
            </li>
          </ul>
        </div>

        <button className="side-logout" onClick={() => navigate('/logout')}>
          ⏻ Log out
        </button>
      </aside>

      {/* ============== MAIN CONTENT ============== */}
      <main className="dash-main">
        <div className="dash-main-nightbg" />

        {/* Top bar: greeting + search */}
        <div className="dash-topbar">
          <div>
            <p className="dash-topbar-eyebrow">Welcome back</p>
            <h1 className="dash-topbar-name">{displayName}</h1>
          </div>
          <div className="dash-search">
            <span className="dash-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search quests…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Continue-quest hero banner */}
        {continueCourse && (
          <section
            className="continue-banner"
            style={{ '--course-color': continueCourse.color }}
            onClick={() => navigate(`/languages/${continueCourse.id}`)}
          >
            {continueCourse.image && (
              <img
                className="continue-banner-img"
                src={continueCourse.image}
                alt={continueCourse.name}
              />
            )}
            <div className="continue-banner-overlay" />
            <div className="continue-banner-body">
              <p className="continue-banner-kicker">Continue your quest</p>
              <h2>{continueCourse.name}</h2>
              <div className="continue-banner-track">
                <div
                  className="continue-banner-fill"
                  style={{ width: `${continuePct}%` }}
                />
              </div>
              <button className="continue-banner-btn">▶ Resume — {continuePct}%</button>
            </div>
          </section>
        )}

        {/* Quest grid */}
        <section className="quest-section">
          <div className="quest-head">
            <h2>Popular Quests 🔥</h2>
            <div className="quest-filters">
              {['all', 'Beginner', 'Intermediate', 'Advanced'].map((f) => (
                <button
                  key={f}
                  className={`quest-filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="quest-grid">
            {visibleCourses.map((course) => {
              const prog = data.courseProgress[course.id];
              const pct = prog
                ? Math.round((prog.completedLevels / prog.totalLevels) * 100)
                : 0;
              const started = !!prog && prog.completedLevels > 0;
              const cleared = course.full && pct >= 100;

              return (
                <article
                  key={course.id}
                  className="quest-card"
                  style={{ '--course-color': course.color }}
                  onClick={() => navigate(`/languages/${course.id}`)}
                >
                  {cleared && <span className="quest-card-cleared">CLEARED</span>}

                  <div className="quest-card-banner">
                    {course.image ? (
                      <img
                        className="quest-card-banner-img"
                        src={course.image}
                        alt={course.name}
                      />
                    ) : (
                      <span className="quest-card-icon-fallback">{course.icon}</span>
                    )}
                    <span className="quest-card-diff-tag">{course.difficulty}</span>
                  </div>

                  <div className="quest-card-body">
                    <h3>{course.name}</h3>
                    <p>{course.tagline}</p>

                    {!course.full && (
                      <span className="quest-card-soon">🔒 In development</span>
                    )}

                    {course.full && (
                      <>
                        <div className="quest-card-hp-wrap">
                          <div className="quest-card-hp-track">
                            <div
                              className="quest-card-hp-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="quest-card-hp-pct">{pct}%</span>
                        </div>
                        <button className="quest-card-btn">
                          {started ? '▶ Continue' : '▶ Start'}
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}

            {visibleCourses.length === 0 && (
              <p className="quest-empty">No quests match “{search}”.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}