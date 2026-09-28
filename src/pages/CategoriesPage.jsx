import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "./DashboardPage";
import Icon from "../components/Icon";
import { getCurrencyInfo } from "../utils/currency";
import "../styles/dashboard.css";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categoryApi";

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

/*
 * The backend does not currently store icon/color information for categories.
 * These are presentation choices so the existing UI still looks the same.
 */
const categoryVisuals = {
  Food: {
    icon: "food",
    tone: "amber",
  },

  Transport: {
    icon: "bus",
    tone: "blue",
  },

  "Hostel/Rent": {
    icon: "home",
    tone: "purple",
  },

  Academics: {
    icon: "grad",
    tone: "teal",
  },

  Subscriptions: {
    icon: "tv",
    tone: "pink",
  },

  Entertainment: {
    icon: "ticket",
    tone: "peach",
  },

  Miscellaneous: {
    icon: "more",
    tone: "slate",
  },

  Allowance: {
    icon: "coins",
    tone: "amber",
  },

  Scholarship: {
    icon: "grad",
    tone: "teal",
  },

  "Part-time Work": {
    icon: "zap",
    tone: "blue",
  },

  Freelance: {
    icon: "coins",
    tone: "purple",
  },

  Gifts: {
    icon: "gift",
    tone: "peach",
  },
};

const fallbackVisuals = [
  {
    icon: "refresh",
    tone: "blue",
  },
  {
    icon: "coins",
    tone: "teal",
  },
  {
    icon: "zap",
    tone: "purple",
  },
  {
    icon: "gift",
    tone: "peach",
  },
  {
    icon: "more",
    tone: "slate",
  },
];

function toneIcon(tone, icon) {
  return (
    <span className={`d-icon ${tone}`}>
      <Icon name={icon} size={17} />
    </span>
  );
}

function getCategoryVisual(category) {
  if (categoryVisuals[category.name]) {
    return categoryVisuals[category.name];
  }

  const characterScore =
    category.name
      ?.split("")
      .reduce(
        (total, character) => total + character.charCodeAt(0),
        0
      ) || 0;

  return fallbackVisuals[
    characterScore % fallbackVisuals.length
  ];
}

function CategoriesPage() {
  const currencyInfo = getCurrencyInfo();

  const [dark, setDark] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Category data
  const [categories, setCategories] = useState([]);

  // Loading / API state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form state
  const [type, setType] = useState("expense");
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("refresh");
  const [selectedColor, setSelectedColor] = useState("#008b62");
  const [budget, setBudget] = useState("");

  // Page tab
  const [categoryTab, setCategoryTab] = useState("expense");

  /*
   * Load categories when the page opens.
   */
  useEffect(() => {
    loadCategories();
  }, []);

  /*
   * Close modal with Escape.
   */
  useEffect(() => {
    if (!formOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        closeCategoryForm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [formOpen, saving]);

  /*
   * GET /api/categories
   */
  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const data = await getCategories();

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load categories:", err);

      setError(
        err?.message ||
          "Unable to load your categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Separate categories by transaction type.
   */
  const expenseCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.type === "EXPENSE"
      ),
    [categories]
  );

  const incomeCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.type === "INCOME"
      ),
    [categories]
  );

  /*
   * Separate system/default categories from
   * student-created categories.
   */
  const expenseDefaults = useMemo(
    () =>
      expenseCategories.filter(
        (category) => category.defaultCategory === true
      ),
    [expenseCategories]
  );

  const incomeDefaults = useMemo(
    () =>
      incomeCategories.filter(
        (category) => category.defaultCategory === true
      ),
    [incomeCategories]
  );

  const expenseCustom = useMemo(
    () =>
      expenseCategories.filter(
        (category) => category.defaultCategory === false
      ),
    [expenseCategories]
  );

  const incomeCustom = useMemo(
    () =>
      incomeCategories.filter(
        (category) => category.defaultCategory === false
      ),
    [incomeCategories]
  );

  /*
   * Categories currently displayed based on the selected tab.
   */
  const visibleDefaults =
    categoryTab === "expense"
      ? expenseDefaults
      : incomeDefaults;

  const visibleCustom =
    categoryTab === "expense"
      ? expenseCustom
      : incomeCustom;

  /*
   * Open create modal.
   */
  const openCategoryForm = () => {
    setEditingCategory(null);
    setCreated(false);
    setError("");
    setSuccessMessage("");

    setName("");
    setType(
      categoryTab === "income"
        ? "income"
        : "expense"
    );

    setSelectedIcon("refresh");
    setSelectedColor("#008b62");
    setBudget("");

    setFormOpen(true);
  };

  /*
   * Open edit modal.
   *
   * Default/admin categories cannot be edited.
   */
  const openEditCategoryForm = (category) => {
    if (category.defaultCategory) {
      return;
    }

    setEditingCategory(category);
    setCreated(false);
    setError("");
    setSuccessMessage("");

    setName(category.name);

    setType(
      category.type === "INCOME"
        ? "income"
        : "expense"
    );

    const visual = getCategoryVisual(category);

    setSelectedIcon(visual.icon);
    setSelectedColor("#008b62");
    setBudget("");

    setFormOpen(true);
  };

  /*
   * Close modal and reset temporary form state.
   */
  const closeCategoryForm = () => {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setCreated(false);
    setEditingCategory(null);
    setError("");
    setSuccessMessage("");
    setName("");
  };

  /*
   * Create a new student-defined category.
   *
   * We intentionally DO NOT send:
   * - createdBy
   * - defaultCategory
   *
   * The backend gets the authenticated user's ID
   * from the JWT and sets createdBy itself.
   */
  const handleCreate = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a category name.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await createCategory({
        name: trimmedName,
        type:
          type === "income"
            ? "INCOME"
            : "EXPENSE",
      });

      setCategories((current) => [
        ...current,
        response,
      ]);

      setCreated(true);
      setSuccessMessage(
        `${trimmedName} created successfully.`
      );

      window.setTimeout(() => {
        setFormOpen(false);
        setCreated(false);
        setSuccessMessage("");
        setName("");
      }, 900);
    } catch (err) {
      console.error(
        "Failed to create category:",
        err
      );

      setError(
        err?.message ||
          "Unable to create category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Update an existing student-defined category.
   */
  const handleUpdate = async () => {
    if (!editingCategory) {
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a category name.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await updateCategory(
        editingCategory.categoryId,
        {
          name: trimmedName,
          type:
            type === "income"
              ? "INCOME"
              : "EXPENSE",
        }
      );

      setCategories((current) =>
        current.map((category) =>
          category.categoryId ===
          response.categoryId
            ? response
            : category
        )
      );

      setCreated(true);
      setSuccessMessage(
        `${trimmedName} updated successfully.`
      );

      window.setTimeout(() => {
        setFormOpen(false);
        setEditingCategory(null);
        setCreated(false);
        setSuccessMessage("");
      }, 900);
    } catch (err) {
      console.error(
        "Failed to update category:",
        err
      );

      setError(
        err?.message ||
          "Unable to update category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Delete a student-defined category.
   *
   * Default/admin categories cannot be deleted.
   */
  const handleDelete = async (category) => {
    if (category.defaultCategory) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}"? This category will no longer be available for new transactions.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      await deleteCategory(
        category.categoryId
      );

      setCategories((current) =>
        current.filter(
          (item) =>
            item.categoryId !==
            category.categoryId
        )
      );

      setSuccessMessage(
        `${category.name} deleted successfully.`
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (err) {
      console.error(
        "Failed to delete category:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete category. Please try again."
      );
    }
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
          box-shadow:
            0 0 0 2px var(--db-surface),
            0 0 0 3px var(--category-color);
        }

        .dashboard-app .category-api-message {
          margin: 12px 0;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 12px;
          line-height: 1.4;
        }

        .dashboard-app .category-api-error {
          background: #fff0f0;
          color: #b42318;
          border: 1px solid #f3c4c0;
        }

        .dashboard-app .category-api-success {
          background: #e8f6ef;
          color: #107f55;
          border: 1px solid #b8e3cf;
        }

        .dashboard-app .category-loading,
        .dashboard-app .category-empty {
          padding: 28px 20px;
          border: 1px dashed var(--db-border);
          border-radius: 14px;
          color: var(--db-muted);
          font-size: 13px;
          text-align: center;
        }

        .dashboard-app .category-error-state {
          margin-bottom: 18px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #fff0f0;
          color: #b42318;
          border: 1px solid #f3c4c0;
          font-size: 13px;
        }

        .dashboard-app .category-edit-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dashboard-app .category-edit-actions button {
          width: 28px;
          height: 28px;
          padding: 0;
          border: 0;
          border-radius: 8px;
          display: grid;
          place-items: center;
          background: #eef2f5;
          color: #516178;
          cursor: pointer;
          font-size: 14px;
        }

        .dashboard-app .category-edit-actions button:hover {
          background: #e1e7ec;
          color: var(--db-text);
        }

        .dashboard-app .category-edit-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dashboard-app .category-card.editable {
          position: relative;
        }

        .dashboard-app .category-card-button {
          text-align: left;
        }

        .dashboard-app .category-card-button:focus-visible,
        .dashboard-app .add-category-card:focus-visible {
          outline: 2px solid #008b62;
          outline-offset: 2px;
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
              Default categories come from your
              campus admin. Add your own for
              anything else.
            </p>
          </div>

          <button
            className="primary-btn new-category-trigger"
            onClick={openCategoryForm}
            type="button"
          >
            <Icon name="plus" size={16} />
            <span>New category</span>
          </button>
        </div>

        {error && !formOpen && (
          <div
            className="category-error-state"
            role="alert"
          >
            {error}

            <button
              type="button"
              onClick={loadCategories}
              style={{
                marginLeft: "10px",
                border: 0,
                background: "transparent",
                color: "inherit",
                textDecoration: "underline",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Try again
            </button>
          </div>
        )}

        <div
          className="category-tabs"
          role="tablist"
          aria-label="Category type"
        >
          <button
            className={
              categoryTab === "expense"
                ? "active"
                : ""
            }
            onClick={() =>
              setCategoryTab("expense")
            }
            role="tab"
            aria-selected={
              categoryTab === "expense"
            }
            type="button"
          >
            Expense · {expenseCategories.length}
          </button>

          <button
            className={
              categoryTab === "income"
                ? "active"
                : ""
            }
            onClick={() =>
              setCategoryTab("income")
            }
            role="tab"
            aria-selected={
              categoryTab === "income"
            }
            type="button"
          >
            Income · {incomeCategories.length}
          </button>
        </div>

        <div className="categories-layout">
          <div className="categories-main-column">
            <h3>
              {categoryTab === "expense"
                ? "Default"
                : "Income categories"}{" "}
              <small>
                {visibleDefaults.length} ·
                managed by admin
              </small>
            </h3>

            {loading ? (
              <div className="category-loading">
                Loading categories...
              </div>
            ) : visibleDefaults.length === 0 ? (
              <div className="category-empty">
                No default{" "}
                {categoryTab} categories available.
              </div>
            ) : (
              <div className="category-grid">
                {visibleDefaults.map(
                  (category) => {
                    const visual =
                      getCategoryVisual(
                        category
                      );

                    return (
                      <div
                        className="category-card"
                        key={
                          category.categoryId
                        }
                      >
                        {toneIcon(
                          visual.tone,
                          visual.icon
                        )}

                        <span className="default-tag">
                          <Icon
                            name="lock"
                            size={12}
                          />
                          Default
                        </span>

                        <strong>
                          {category.name}
                        </strong>

                        <small>
                          {category.type ===
                          "EXPENSE"
                            ? "Expense category"
                            : "Income category"}
                        </small>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            <h3 className="my-cat">
              My categories{" "}
              <small>
                {visibleCustom.length} ·
                only visible to you
              </small>
            </h3>

            {loading ? (
              <div className="category-loading">
                Loading your categories...
              </div>
            ) : (
              <div className="category-grid my-grid">
                {visibleCustom.map(
                  (category) => {
                    const visual =
                      getCategoryVisual(
                        category
                      );

                    return (
                      <div
                        className="category-card editable"
                        key={
                          category.categoryId
                        }
                      >
                        {toneIcon(
                          visual.tone,
                          visual.icon
                        )}

                        <span className="category-edit-actions">
                          <button
                            type="button"
                            aria-label={`Edit ${category.name}`}
                            onClick={() =>
                              openEditCategoryForm(
                                category
                              )
                            }
                            disabled={saving}
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            aria-label={`Delete ${category.name}`}
                            onClick={() =>
                              handleDelete(
                                category
                              )
                            }
                            disabled={saving}
                          >
                            ♧
                          </button>
                        </span>

                        <strong>
                          {category.name}
                        </strong>

                        <small>
                          {category.type ===
                          "EXPENSE"
                            ? "Expense category"
                            : "Income category"}
                        </small>
                      </div>
                    );
                  }
                )}

                <button
                  className="add-category-card"
                  type="button"
                  onClick={openCategoryForm}
                >
                  <span>＋</span>
                  <strong>
                    Add a category
                  </strong>
                </button>
              </div>
            )}
          </div>

          {formOpen && (
            <div
              className="category-form-modal-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (
                  event.target ===
                    event.currentTarget &&
                  !saving
                ) {
                  closeCategoryForm();
                }
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
                  aria-label="Close category form"
                  disabled={saving}
                >
                  ×
                </button>

                <h3 id="new-category-title">
                  {editingCategory
                    ? "Edit category"
                    : "New category"}
                </h3>

                <p>
                  {editingCategory
                    ? "Update your personal category"
                    : "Shows up in quick add right away"}
                </p>

                {error && (
                  <div
                    className="category-api-message category-api-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div
                    className="category-api-message category-api-success"
                    role="status"
                  >
                    {successMessage}
                  </div>
                )}

                <label>
                  Name

                  <input
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="e.g. Laundry"
                    autoComplete="off"
                    disabled={saving}
                  />
                </label>

                <label>
                  Type

                  <div className="expense-tabs category-type-tabs">
                    <button
                      type="button"
                      className={
                        type === "expense"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setType("expense")
                      }
                      disabled={saving}
                    >
                      Expense
                    </button>

                    <button
                      type="button"
                      className={
                        type === "income"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setType("income")
                      }
                      disabled={saving}
                    >
                      Income
                    </button>
                  </div>
                </label>

                <label>
                  Icon

                  <div className="icon-picker">
                    {pickerIcons.map(
                      (iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          className={
                            selectedIcon ===
                            iconName
                              ? "selected"
                              : ""
                          }
                          onClick={() =>
                            setSelectedIcon(
                              iconName
                            )
                          }
                          aria-label={`Select ${iconName} icon`}
                          aria-pressed={
                            selectedIcon ===
                            iconName
                          }
                          disabled={saving}
                        >
                          <Icon
                            name={iconName}
                            size={17}
                          />
                        </button>
                      )
                    )}
                  </div>
                </label>

                <label>
                  Colour

                  <div className="color-picker">
                    {pickerColors.map(
                      (color) => (
                        <button
                          key={color}
                          type="button"
                          className={
                            selectedColor ===
                            color
                              ? "selected"
                              : ""
                          }
                          style={{
                            "--category-color":
                              color,
                          }}
                          onClick={() =>
                            setSelectedColor(
                              color
                            )
                          }
                          aria-label={`Select ${color} colour`}
                          aria-pressed={
                            selectedColor ===
                            color
                          }
                          disabled={saving}
                        />
                      )
                    )}
                  </div>
                </label>

                <label>
                  Monthly budget (optional)

                  <div className="field-input budget-input">
                    <span>{currencyInfo.symbol}</span>

                    <input
                      value={budget}
                      onChange={(e) =>
                        setBudget(
                          e.target.value.replace(
                            /[^0-9.]/g,
                            ""
                          )
                        )
                      }
                      inputMode="decimal"
                      placeholder="15.00"
                      aria-label="Monthly budget"
                      disabled={saving}
                    />
                  </div>

                  <small>
                    ⓘ You will be alerted at
                    85% and 100%
                  </small>
                </label>

                <div className="new-cat-footer">
                  <button
                    type="button"
                    onClick={closeCategoryForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={
                      editingCategory
                        ? handleUpdate
                        : handleCreate
                    }
                    disabled={saving}
                  >
                    {saving
                      ? editingCategory
                        ? "Saving..."
                        : "Creating..."
                      : editingCategory
                        ? "Save changes"
                        : "Create category"}
                  </button>
                </div>

                {created && successMessage && (
                  <div
                    className="category-created"
                    role="status"
                  >
                    ✓ {successMessage}
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