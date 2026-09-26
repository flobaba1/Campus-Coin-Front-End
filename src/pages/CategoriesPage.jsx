import { useEffect, useState } from "react";
import { DashboardShell } from "./DashboardPage";
import Icon from "../components/Icon";
import "../styles/dashboard.css";

const defaults = [
  ["Food", "food", "amber", "$214.60 this month · 18 entries"],
  ["Transport", "bus", "blue", "$68.40 this month · 12 entries"],
  ["Hostel/Rent", "home", "purple", "$300.00 this month · 1 entry"],
  ["Academics", "grad", "teal", "$84.20 this month · 4 entries"],
  ["Subscriptions", "tv", "pink", "$25.98 this month · 2 entries"],
  ["Entertainment", "ticket", "peach", "$38.40 this month · 3 entries"],
  ["Miscellaneous", "more", "slate", "$11.22 this month · 2 entries"],
];

const pickerIcons = [
  "refresh",
  "grad",
  "coins",
  "zap",
  "gift",
  "bus",
  "food",
  "tv",
  "ticket",
  "home",
];

const pickerColors = [
  "#0b7d78",
  "#008b62",
  "#1769e0",
  "#7d38f4",
  "#9a32ef",
  "#d04a00",
  "#f5a916",
  "#df1832",
];

function toneIcon(tone, icon) {
  return (
    <span className={`d-icon ${tone}`}>
      <Icon name={icon} size={17} />
    </span>
  );
}

function CategoriesPage() {
  const [dark, setDark] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const [type, setType] = useState("expense");
  const [name, setName] = useState("Laundry");
  const [selectedIcon, setSelectedIcon] = useState("refresh");
  const [selectedColor, setSelectedColor] = useState("#008b62");
  const [budget, setBudget] = useState("15.00");
  const [categoryTab, setCategoryTab] = useState("expense");

  useEffect(() => {
    if (!formOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeCategoryForm();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [formOpen]);

  const openCategoryForm = () => {
    setCreated(false);
    setFormOpen(true);
  };

  const closeCategoryForm = () => {
    setFormOpen(false);
    setCreated(false);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    setCreated(true);

    // Keep the desktop panel open, but close the mobile bottom sheet shortly
    // after showing the success state so the user sees the confirmation.
    window.setTimeout(() => {
      setFormOpen(false);
    }, 900);
  };

  return (
    <DashboardShell
      dark={dark}
      setDark={setDark}
      notificationOpen={notificationOpen}
      setNotificationOpen={setNotificationOpen}
      page="Categories"
      search={search}
      setSearch={setSearch}
    >
      <style>{`
        .dashboard-app .category-form-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #1528427a;
        }

        .dashboard-app .category-form-modal {
          position: relative;
          width: min(360px, 100%);
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          align-self: center;
          margin: 0;
          box-shadow: 0 25px 70px #071e4140;
          scrollbar-width: thin;
        }

        .dashboard-app .category-form-modal-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 9px;
          background: #eef2f5;
          color: #516178;
          font-size: 21px;
          line-height: 1;
          display: grid;
          place-items: center;
          cursor: pointer;
          z-index: 2;
        }

        .dashboard-app .category-form-modal-close:hover {
          background: #e5eaef;
        }

        .dashboard-app .category-form-modal .icon-picker button.selected {
          border-color: #008b62;
          color: #008b62;
          background: #e1f8ef;
        }

        .dashboard-app .category-form-modal .color-picker button {
          width: 20px;
          height: 20px;
          padding: 0;
          border-radius: 50%;
          border: 2px solid var(--db-surface);
          box-shadow: 0 0 0 1px var(--db-border);
          background: var(--category-color);
          cursor: pointer;
        }

        .dashboard-app .category-form-modal .color-picker button.selected {
          box-shadow: 0 0 0 2px var(--db-surface), 0 0 0 3px var(--category-color);
        }

        @media (max-width: 760px) {
          .dashboard-app .category-form-modal-backdrop {
            padding: 12px;
          }

          .dashboard-app .category-form-modal {
            width: min(100%, 360px);
            max-height: calc(100vh - 24px);
          }
        }
      `}</style>

      <section className="dash-content categories-page">
        <div className="dash-heading categories-heading">
          <div>
            <label>ORGANISE</label>
            <h1>Categories</h1>
            <p>
              Default categories come from your campus admin. Add your own for
              anything else.
            </p>
          </div>

          <button
            className="primary-btn new-category-trigger"
            onClick={openCategoryForm}
          >
            <Icon name="plus" size={16} />
            <span>New category</span>
          </button>
        </div>

        <div
          className="category-tabs"
          role="tablist"
          aria-label="Category type"
        >
          <button
            className={categoryTab === "expense" ? "active" : ""}
            onClick={() => setCategoryTab("expense")}
            role="tab"
            aria-selected={categoryTab === "expense"}
          >
            Expense · 9
          </button>
          <button
            className={categoryTab === "income" ? "active" : ""}
            onClick={() => setCategoryTab("income")}
            role="tab"
            aria-selected={categoryTab === "income"}
          >
            Income · 6
          </button>
        </div>

        <div className="categories-layout">
          <div className="categories-main-column">
            <h3>
              {categoryTab === "expense" ? "Default" : "Income categories"}{" "}
              <small>
                {categoryTab === "expense"
                  ? "7 · managed by admin"
                  : "6 · managed by admin"}
              </small>
            </h3>

            <div className="category-grid">
              {defaults.map((c) => (
                <button
                  className="category-card category-card-button"
                  key={c[0]}
                  type="button"
                  onClick={openCategoryForm}
                  aria-label={`Open ${c[0]} category`}
                >
                  {toneIcon(c[2], c[1])}
                  <span className="default-tag">
                    <Icon name="lock" size={12} /> Default
                  </span>
                  <strong>{c[0]}</strong>
                  <small>{c[3]}</small>
                </button>
              ))}
            </div>

            <h3 className="my-cat">
              My categories <small>2 · only visible to you</small>
            </h3>

            <div className="category-grid my-grid">
              <button
                className="category-card editable category-card-button"
                type="button"
                onClick={openCategoryForm}
              >
                {toneIcon("blue", "zap")}
                <span className="category-edit-actions">
                  <span>✎</span>
                  <span>♧</span>
                </span>
                <strong>Phone data</strong>
                <small>$0.00 this month · last used Aug 28</small>
              </button>

              <button
                className="category-card editable category-card-button"
                type="button"
                onClick={openCategoryForm}
              >
                {toneIcon("teal", "activity")}
                <span className="category-edit-actions">
                  <span>✎</span>
                  <span>♧</span>
                </span>
                <strong>Gym membership</strong>
                <small>$0.00 this month · paused</small>
              </button>

              <button
                className="add-category-card"
                type="button"
                onClick={openCategoryForm}
              >
                <span>＋</span>
                <strong>Add a category</strong>
              </button>
            </div>
          </div>

          {/* The form is intentionally not part of the page layout. It opens as a modal
              when New category (or Add a category) is clicked, matching the dashboard
              transaction modal behavior without changing the form's existing design. */}
          {formOpen && (
            <div
              className="category-form-modal-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeCategoryForm();
              }}
            >
              <aside
                className="new-category-card category-form-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-category-title"
              >
                <button
                  type="button"
                  className="category-form-modal-close"
                  onClick={closeCategoryForm}
                  aria-label="Close new category"
                >
                  ×
                </button>

                <h3 id="new-category-title">New category</h3>
                <p>Shows up in quick add right away</p>

                <label>
                  Name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Laundry"
                    autoComplete="off"
                  />
                </label>

                <label>
                  Type
                  <div className="expense-tabs category-type-tabs">
                    <button
                      type="button"
                      className={type === "expense" ? "active" : ""}
                      onClick={() => setType("expense")}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      className={type === "income" ? "active" : ""}
                      onClick={() => setType("income")}
                    >
                      Income
                    </button>
                  </div>
                </label>

                <label>
                  Icon
                  <div className="icon-picker">
                    {pickerIcons.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        className={selectedIcon === iconName ? "selected" : ""}
                        onClick={() => setSelectedIcon(iconName)}
                        aria-label={`Select ${iconName} icon`}
                        aria-pressed={selectedIcon === iconName}
                      >
                        <Icon name={iconName} size={17} />
                      </button>
                    ))}
                  </div>
                </label>

                <label>
                  Colour
                  <div className="color-picker">
                    {pickerColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={selectedColor === color ? "selected" : ""}
                        style={{ "--category-color": color }}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select ${color} colour`}
                        aria-pressed={selectedColor === color}
                      />
                    ))}
                  </div>
                </label>

                <label>
                  Monthly budget (optional)
                  <div className="field-input budget-input">
                    <span>$</span>
                    <input
                      value={budget}
                      onChange={(e) =>
                        setBudget(e.target.value.replace(/[^0-9.]/g, ""))
                      }
                      inputMode="decimal"
                      placeholder="15.00"
                      aria-label="Monthly budget"
                    />
                  </div>
                  <small>ⓘ You will be alerted at 85% and 100%</small>
                </label>

                <div className="new-cat-footer">
                  <button type="button" onClick={closeCategoryForm}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleCreate}
                  >
                    Create category
                  </button>
                </div>

                {created && (
                  <div className="category-created" role="status">
                    ✓ {name} created
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}

export default CategoriesPage;
