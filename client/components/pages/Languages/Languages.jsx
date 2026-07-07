import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COURSE_CATALOG } from '../../data/courseCatalog';
import NightSky from '../../NightSky'; // adjust path if you move NightSky into a components folder later
import './Languages.css';

export default function Languages() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const visibleCourses =
    filter === 'all'
      ? COURSE_CATALOG
      : COURSE_CATALOG.filter((c) => c.difficulty === filter);

  return (
    <div className="lang-page">
      <div className="lang-nightbg" />
      <NightSky />

      <button className="lang-back" onClick={() => navigate('/')}>
        ← Home
      </button>

      <header className="lang-header">
        <h1 className="lang-title">Choose Your Language</h1>
        <p className="lang-subtitle">
          25+ languages. Pick one and start your quest — works offline too.
        </p>
      </header>

      <div className="lang-filters">
        {['all', 'Beginner', 'Intermediate', 'Advanced'].map((f) => (
          <button
            key={f}
            className={`lang-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <div className="lang-grid">
        {visibleCourses.map((course) => (
          <article
            key={course.id}
            className="lang-card"
            data-difficulty={course.difficulty}
            style={{ '--course-color': course.color }}
            onClick={() => navigate(`/languages/${course.id}`)}
          >
            <div className="lang-card-banner">
              {course.image ? (
                <img
                  className="lang-card-banner-img"
                  src={course.image}
                  alt={course.name}
                />
              ) : (
                <div className="lang-card-icon-fallback">{course.icon}</div>
              )}
            </div>

            <div className="lang-card-body">
              <div className="lang-card-kicker">Course</div>
              <h3>{course.name}</h3>
              <p>{course.tagline}</p>

              <div className="lang-card-footer">
                <span className="lang-card-diff">
                  <span className="lang-card-diff-bars">
                    <span></span><span></span><span></span>
                  </span>
                  {course.difficulty}
                </span>

                {!course.full && (
                  <span className="lang-card-soon">Coming soon</span>
                )}
                {course.full && (
                  <button className="lang-card-btn">Start</button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}