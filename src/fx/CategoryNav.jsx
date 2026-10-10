import { CATEGORIES, CONTACT_EMAIL, CONTACT_LABEL } from '../lib/categories';

/**
 * Fixed top bar shown once a category is open. Same on all three:
 * wordmark + "All work" back to the selector, Speed / Focus / Pulse
 * tabs, and the contact link. Links carry real hrefs so they also
 * work as plain links (middle-click, copy link address).
 */
export default function CategoryNav({ activeId, visible, onSelect, onAllWork }) {
  const go = (e, fn) => {
    // Let modified clicks open a new tab like a normal link.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    fn();
  };

  return (
    <nav
      className={`cat-nav${visible ? ' is-visible' : ''}`}
      aria-label="Work categories"
      aria-hidden={visible ? undefined : true}
    >
      <div className="cat-nav__scrim" aria-hidden="true" />
      <div className="cat-nav__start">
        <a
          className="cat-nav__mark"
          href="/"
          data-interactive=""
          tabIndex={visible ? 0 : -1}
          onClick={(e) => go(e, onAllWork)}
          aria-label="Veloure — all work"
        >
          Veloure
        </a>
        <a
          className="cat-nav__link cat-nav__all"
          href="/"
          data-interactive=""
          tabIndex={visible ? 0 : -1}
          onClick={(e) => go(e, onAllWork)}
        >
          <span aria-hidden="true">←</span> All work
        </a>
      </div>

      <ul className="cat-nav__tabs">
        {/* Phones: "All work" moves down here beside the tabs (the top
            row only fits the wordmark and contact link). */}
        <li className="cat-nav__all-item">
          <a
            className="cat-nav__link"
            href="/"
            data-interactive=""
            tabIndex={visible ? 0 : -1}
            onClick={(e) => go(e, onAllWork)}
          >
            <span aria-hidden="true">←</span> All work
          </a>
        </li>
        {CATEGORIES.map((c) => {
          const active = c.id === activeId;
          return (
            <li key={c.id}>
              <a
                className={`cat-nav__link cat-nav__tab${active ? ' is-active' : ''}`}
                href={c.path}
                data-interactive=""
                tabIndex={visible ? 0 : -1}
                aria-current={active ? 'page' : undefined}
                onClick={(e) => go(e, () => onSelect(c.id))}
              >
                {c.label}
              </a>
            </li>
          );
        })}
      </ul>

      <a
        className="cat-nav__link cat-nav__contact"
        href={`mailto:${CONTACT_EMAIL}`}
        data-interactive=""
        tabIndex={visible ? 0 : -1}
      >
        {CONTACT_LABEL}
      </a>
    </nav>
  );
}
