import { useMemo, useRef, useState, useEffect } from "react";
import { navigate } from "../routes/AppRoutes";
import Icon from "../components/Icon";
import Logo from "../components/Logo";
import { clearStudentSession, getStudentSession } from "../utils";
import ThemeToggle from "../components/ThemeToggle";
import { formatMoney } from "../utils/currency";
import "../styles/dashboard.css";
import "../styles/money-tools.css";
import {
  getBudgets,
  getBudgetsForMonth,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../api/budgetApi";

import { getCategories } from "../api/categoryApi";
import { getTransactions } from "../api/transactionApi";

const categories = [
  {
    name: "Food",
    icon: "food",
    tone: "amber",
    spent: 214.6,
    budget: 250,
    status: "On track",
  },
  {
    name: "Transport",
    icon: "bus",
    tone: "blue",
    spent: 68.4,
    budget: 90,
    status: "On track",
  },
  {
    name: "Hostel/Rent",
    icon: "home",
    tone: "purple",
    spent: 300,
    budget: 300,
    status: "At limit",
  },
  {
    name: "Academics",
    icon: "grad",
    tone: "teal",
    spent: 84.2,
    budget: 120,
    status: "On track",
  },
  {
    name: "Entertainment",
    icon: "ticket",
    tone: "peach",
    spent: 38.4,
    budget: 60,
    status: "On track",
  },
  {
    name: "Subscriptions",
    icon: "tv",
    tone: "pink",
    spent: 25.98,
    budget: 20,
    status: "Over budget",
  },
  {
    name: "Miscellaneous",
    icon: "folder",
    tone: "slate",
    spent: 11.22,
    budget: 30,
    status: "On track",
  },
];

const alerts = [
  [
    "Hostel/Rent is at its limit",
    "You have used the full September budget.",
    "home",
    "At limit",
  ],
  [
    "Subscriptions is over budget",
    `${formatMoney(25.98)} spent against a ${formatMoney(20)} budget.`,
    "tv",
    "Over",
  ],
  [
    "Food is approaching its limit",
    `${formatMoney(214.60)} spent · ${formatMoney(35.40)} remaining.`,
    "food",
    "86%",
  ],
];

const tips = [
  {
    title: "Cut one food delivery this week",
    text: "Skipping one delivery can keep your Food budget below its monthly target.",
    amount: formatMoney(18.40),
    tone: "amber",
    icon: "food",
  },
  {
    title: "Use your student transport option",
    text: "Choose your lower-cost route for the next few library trips.",
    amount: formatMoney(6.20),
    tone: "blue",
    icon: "bus",
  },
  {
    title: "Pause unused subscriptions",
    text: "Review recurring services before the next billing cycle.",
    amount: formatMoney(5.99),
    tone: "pink",
    icon: "tv",
  },
  {
    title: "Set aside your next income",
    text: "Move a small amount into savings when your next payment arrives.",
    amount: formatMoney(20),
    tone: "teal",
    icon: "coins",
  },
  {
    title: "Plan academics spending",
    text: "Keep printing and lecture-note costs inside the remaining budget.",
    amount: formatMoney(35.80),
    tone: "peach",
    icon: "grad",
  },
];

const bookmarks = [
  [
    "Food delivery guide",
    "A quick reference for reducing delivery spending without cutting meals.",
    "amber",
    "food",
  ],
  [
    "September 2026 plan",
    "Your saved monthly budget plan and target spending limits.",
    "mint",
    "target",
  ],
  [
    "AI budgeting notes",
    "How CampusCoin uses your transaction history to surface useful patterns.",
    "blue",
    "sparkle",
  ],
  [
    "Lecture week checklist",
    "A saved checklist for transport, printing and campus essentials.",
    "teal",
    "grad",
  ],
];

const reviewRows = [
  ["Sep 23", "Printing, lecture notes", formatMoney(4.50), "Academics", "91%"],
  ["Sep 22", "Ride to library", formatMoney(6.20), "Transport", "96%"],
  ["Sep 20", "Chop & Go delivery", formatMoney(18.40), "Food", "94%"],
  ["Sep 18", "Cinema night", formatMoney(14), "Entertainment", "88%"],
  ["Sep 17", "Campus Cafe", formatMoney(8.50), "Food", "97%"],
  ["Sep 16", "Monthly data", formatMoney(12), "Subscriptions", "79%"],
  ["Sep 14", "Textbook rental", formatMoney(32), "Academics", "93%"],
  ["Sep 12", "Bus pass", formatMoney(20), "Transport", "95%"],
  ["Sep 09", "Misc purchase", formatMoney(9.20), "Miscellaneous", "68%"],
  ["Sep 04", "Spotify", formatMoney(5.99), "Subscriptions", "81%"],
];

function money(v) {
  return formatMoney(v);
}
function useToast() {
  const [toast, setToast] = useState("");
  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(window.__campusCoinToast);
    window.__campusCoinToast = window.setTimeout(() => setToast(""), 2400);
  };
  return [toast, showToast];
}

function ActionToast({ message }) {
  if (!message) return null;
  return (
    <div className="cc-toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

function Modal({ title, description, onClose, children, wide = false }) {
  return (
    <div
      className="tool-overlay"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`cc-modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className="close-tool"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="close" size={16} />
        </button>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {children}
      </div>
    </div>
  );
}

function MobileToolsNav({ page, onAdd, onMore }) {
  return (
    <>
      <nav className="mobile-tools-nav" aria-label="Mobile navigation">
        <button
          type="button"
          className={page === "Dashboard" ? "active" : ""}
          onClick={() => navigate("/dashboard")}
        >
          <Icon name="grid" size={18} />
          <span>Home</span>
        </button>
        <button
          type="button"
          className={page === "Transactions" ? "active" : ""}
          onClick={() => navigate("/transactions")}
        >
          <Icon name="swap" size={18} />
          <span>Activity</span>
        </button>
        <button
          type="button"
          className="mobile-tools-add"
          onClick={onAdd}
          aria-label="Quick add"
        >
          <Icon name="plus" size={21} />
        </button>
        <button
          type="button"
          className={page === "Categories" ? "active" : ""}
          onClick={() => navigate("/categories")}
        >
          <Icon name="tag" size={18} />
          <span>Categories</span>
        </button>
        <button type="button" onClick={onMore}>
          <Icon name="more" size={18} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}

function MobileMoreSheet({ onClose }) {
  const links = [
    ["AI Insights", "sparkle", "/ai-insights"],
    ["Saving Tips", "bulb", "/saving-tips"],
    ["Bookmarks", "bookmark", "/bookmarks"],
    ["Import CSV", "upload", "/import-csv"],
    ["Settings", "settings", "/settings"],
    ["Budgets", "target", "/budgets"],
    ["Reports", "report", "/reports"],
  ];
  return (
    <div
      className="mobile-sheet-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="mobile-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="More pages"
      >
        <div className="sheet-handle" />
        <div className="sheet-title">
          <strong>More</strong>
          <button type="button" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="mobile-more-grid">
          {links.map(([label, icon, path]) => (
            <button
              type="button"
              key={path}
              onClick={() => {
                onClose();
                navigate(path);
              }}
            >
              <Icon name={icon} size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickAddSheet({ onClose }) {
  return (
    <div
      className="mobile-sheet-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="mobile-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Quick add"
      >
        <div className="sheet-handle" />
        <div className="sheet-title">
          <strong>Quick add</strong>
          <button type="button" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="quick-add-grid">
          <button
            type="button"
            onClick={() => navigate("/dashboard?add=expense")}
          >
            <Icon name="arrowdown" size={18} />
            <span>Add expense</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard?add=income")}
          >
            <Icon name="plus" size={18} />
            <span>Add income</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function toneIcon(tone, icon) {
  return (
    <span className={`d-icon ${tone}`}>
      <Icon name={icon} size={16} />
    </span>
  );
}

function ToolsShell({
  children,
  page,
  dark,
  setDark,
  notificationOpen,
  setNotificationOpen,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [resolvedDark, setResolvedDark] = useState(
    document.documentElement.dataset.theme === "dark"
  );

  useEffect(() => {
    const handleThemeChange = () => {
      setResolvedDark(
        document.documentElement.dataset.theme === "dark"
      );
    };

    window.addEventListener(
      "campuscoin-theme-change",
      handleThemeChange
    );

    return () =>
      window.removeEventListener(
        "campuscoin-theme-change",
        handleThemeChange
      );
  }, []);

  const studentSession = getStudentSession();
  const userFullName =
    studentSession?.name ||
    studentSession?.fullName ||
    "CampusCoin User";

  const userInitials =
    userFullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "CU";

  const nav = [
    ["Dashboard", "grid", "/dashboard"],
    ["Transactions", "swap", "/transactions"],
    ["Categories", "tag", "/categories"],
    ["Budgets", "target", "/budgets"],
    ["Reports", "report", "/reports"],
  ];
  const smart = [
    ["AI Insights", "sparkle", "/ai-insights"],
    ["Saving Tips", "bulb", "/saving-tips"],
    ["Bookmarks", "bookmark", "/bookmarks"],
  ];
  const account = [
    ["Import CSV", "upload", "/import-csv"],
    ["Settings", "settings", "/settings"],
  ];
  const signOut = () => {
    clearStudentSession();
    navigate("/");
  };



  return (
    <div className={`dashboard-app money-tools-app ${resolvedDark ? "dark" : ""}`}>
      <aside className="dash-sidebar">
        <button
          className="dash-brand"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <Logo />
        </button>
        <div className="side-label">MENU</div>
        <nav>
          {nav.map(([label, icon, path]) => (
            <button
              key={label}
              className={`side-link ${page === label ? "active" : ""}`}
              onClick={() => navigate(path)}
              type="button"
            >
              <Icon name={icon} size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-label smart">SMART MONEY</div>
        {smart.map(([label, icon, path]) => (
          <button
            key={label}
            className={`side-link ${page === label ? "active" : ""}`}
            onClick={() => navigate(path)}
            type="button"
          >
            <Icon name={icon} size={18} />
            <span>{label}</span>
            {label === "AI Insights" && <b className="new">New</b>}
          </button>
        ))}
        <div className="side-label smart">ACCOUNT</div>
        {account.map(([label, icon, path]) => (
          <button
            key={label}
            className={`side-link ${page === label ? "active" : ""}`}
            onClick={() => navigate(path)}
            type="button"
          >
            <Icon name={icon} size={18} />
            <span>{label}</span>
          </button>
        ))}
        <div className="side-spacer" />
        <div className="budget-mini">
          <div>
            <span>Current month spending</span>
            <strong>Live</strong>
          </div>

          <em>Updated</em>

          <div className="mini-track">
            <i />
          </div>

          <small>
            Based on your transactions
          </small>
        </div>
        <button
          className="profile-mini"
          type="button"
          onClick={signOut}
          title="Sign out"
        >
          <span className="avatar">{userInitials}</span>
          <span>
            <strong>{userFullName}</strong>
            <small>Sign out</small>
          </span>
          <Icon name="logout" size={14} />
        </button>
      </aside>
      <main className="dash-main">
        <header className="dash-topbar">
          <div className="crumb">
            <Icon name="home" size={15} />
            <span>›</span>
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <ThemeToggle />

            <div className="notify-wrap">
              <button
                className={`top-btn ${notificationOpen ? "selected" : ""}`}
                type="button"
                onClick={() => setNotificationOpen((v) => !v)}
                aria-label="Notifications"
              >
                <Icon name="bell" size={17} />
                <i />
              </button>

              {notificationOpen && (
                <MiniNotifications
                  onClose={() => setNotificationOpen(false)}
                />
              )}
            </div>

            <button
              className="top-avatar"
              type="button"
              onClick={() => navigate("/settings")}
              aria-label="Open settings"
            >
              {userInitials}
            </button>
          </div>
        </header>
        {children}
      </main>
      <MobileToolsNav
        page={page}
        onAdd={() => setQuickAddOpen(true)}
        onMore={() => setMoreOpen(true)}
      />
      {moreOpen && <MobileMoreSheet onClose={() => setMoreOpen(false)} />}
      {quickAddOpen && <QuickAddSheet onClose={() => setQuickAddOpen(false)} />}
    </div>
  );
}

function MiniNotifications({ onClose }) {
  const [read, setRead] = useState(false);
  return (
    <div className="money-notifications">
      <div className="notification-head">
        <strong>Notifications</strong>
        <b>{read ? "0 new" : "4 new"}</b>
        <button type="button" onClick={() => setRead(true)}>
          Mark all read
        </button>
        <button type="button" onClick={onClose} aria-label="Close">
          <Icon name="close" size={14} />
        </button>
      </div>
      {[
        "Your September insight is ready",
        "Food is at 86% of budget",
        "Possible duplicate found",
        "Subscriptions is over budget",
      ].map((x) => (
        <button
          className={`notification-item ${read ? "read" : ""}`}
          key={x}
          type="button"
          onClick={onClose}
        >
          {x}
          <Icon name="chevron" size={13} />
        </button>
      ))}
    </div>
  );
}

function PageFrame({ eyebrow, title, description, actions, children }) {
  return (
    <section className="dash-content money-page">
      <div className="money-heading">
        <div>
          <label>{eyebrow}</label>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="money-actions">{actions}</div>
      </div>
      {children}
    </section>
  );
}

function BudgetsPage() {
  const now = new Date();

  const [dark, setDark] = useState(false);
  const [notify, setNotify] = useState(false);
  const [progress, setProgress] = useState(true);

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [planOpen, setPlanOpen] = useState(false);
  const [budgetModal, setBudgetModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [toast, showToast] = useToast();

  const loadBudgets = async (
    selectedYear = year,
    selectedMonth = month,
    showLoading = true
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const [budgetData, categoryData] = await Promise.all([
        getBudgetsForMonth(selectedYear, selectedMonth),
        getCategories(),
      ]);

      setBudgets(Array.isArray(budgetData) ? budgetData : []);

      const expenseCategories = Array.isArray(categoryData)
        ? categoryData.filter((category) => category.type === "EXPENSE")
        : [];

      setCategories(expenseCategories);
    } catch (error) {
      console.error("Failed to load budgets:", error);
      showToast(error.message || "Failed to load budgets");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadBudgets(year, month);
  }, [year, month]);

  const monthName = new Date(year, month - 1, 1).toLocaleString(
    "en-US",
    {
      month: "long",
    }
  );

  const monthShortName = new Date(
    year,
    month - 1,
    1
  ).toLocaleString("en-US", {
    month: "short",
  });

  const totalBudget = budgets.reduce(
    (sum, budget) => sum + Number(budget.amount || 0),
    0
  );

  const totalSpent = budgets.reduce(
    (sum, budget) => sum + Number(budget.spent || 0),
    0
  );

  const totalRemaining = totalBudget - totalSpent;

  const alertBudgets = budgets.filter(
    (budget) =>
      budget.status === "OVER_BUDGET" ||
      budget.status === "AT_LIMIT" ||
      budget.status === "APPROACHING_LIMIT"
  );

  const sync = async () => {
    try {
      setSyncing(true);

      await loadBudgets(year, month, false);

      showToast("Budgets synced successfully");
    } catch (error) {
      console.error("Budget sync failed:", error);
      showToast(error.message || "Budget sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleMonthChange = (selectedMonth, selectedYear = year) => {
    setMonth(selectedMonth);
    setYear(selectedYear);
    setPlanOpen(false);
  };

  const handleCreateBudget = async (payload) => {
    try {
      const created = await createBudget(payload);

      setBudgets((current) => [
        ...current,
        created,
      ]);

      setBudgetModal(false);

      showToast(
        `${created.categoryName} budget set to ${money(
          created.amount
        )}`
      );
    } catch (error) {
      console.error("Failed to create budget:", error);
      showToast(
        error.message || "Failed to create budget"
      );
    }
  };

  const handleUpdateBudget = async (budgetId, payload) => {
    try {
      const updated = await updateBudget(
        budgetId,
        payload
      );

      setBudgets((current) =>
        current.map((budget) =>
          budget.budgetId === budgetId
            ? updated
            : budget
        )
      );

      setEditing(null);

      showToast(
        `${updated.categoryName} budget updated to ${money(
          updated.amount
        )}`
      );
    } catch (error) {
      console.error("Failed to update budget:", error);
      showToast(
        error.message || "Failed to update budget"
      );
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    const budget = budgets.find(
      (item) => item.budgetId === budgetId
    );

    if (!budget) return;

    const confirmed = window.confirm(
      `Delete the ${budget.categoryName} budget for ${monthName} ${year}?`
    );

    if (!confirmed) return;

    try {
      await deleteBudget(budgetId);

      setBudgets((current) =>
        current.filter(
          (item) => item.budgetId !== budgetId
        )
      );

      setEditing(null);

      showToast("Budget deleted successfully");
    } catch (error) {
      console.error("Failed to delete budget:", error);
      showToast(
        error.message || "Failed to delete budget"
      );
    }
  };

  return (
    <ToolsShell
      page="Budgets"
      dark={dark}
      setDark={setDark}
      notificationOpen={notify}
      setNotificationOpen={setNotify}
    >
      <PageFrame
        eyebrow={`BUDGETS · ${monthShortName.toUpperCase()}`}
        title="Budgets & alerts"
        description="Stay ahead of your monthly limits with category budgets and timely alerts."
        actions={
          <>
            <div className="tool-dropdown-wrap">
              <button
                className="tool-btn"
                type="button"
                onClick={() =>
                  setPlanOpen((value) => !value)
                }
              >
                <Icon name="target" size={14} />{" "}
                {monthName} {year}⌄
              </button>

              {planOpen && (
                <div className="tool-dropdown">
                  <button
                    type="button"
                    onClick={() =>
                      handleMonthChange(
                        month,
                        year
                      )
                    }
                  >
                    {monthName} {year}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const nextMonth =
                        month === 12 ? 1 : month + 1;

                      const nextYear =
                        month === 12
                          ? year + 1
                          : year;

                      handleMonthChange(
                        nextMonth,
                        nextYear
                      );
                    }}
                  >
                    {new Date(
                      year,
                      month,
                      1
                    ).toLocaleString("en-US", {
                      month: "long",
                    })}{" "}
                    {month === 12
                      ? year + 1
                      : year}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const previousMonth =
                        month === 1 ? 12 : month - 1;

                      const previousYear =
                        month === 1
                          ? year - 1
                          : year;

                      handleMonthChange(
                        previousMonth,
                        previousYear
                      );
                    }}
                  >
                    {new Date(
                      year,
                      month - 2,
                      1
                    ).toLocaleString("en-US", {
                      month: "long",
                    })}{" "}
                    {month === 1
                      ? year - 1
                      : year}
                  </button>
                </div>
              )}
            </div>

            <button
              className="tool-btn"
              type="button"
              onClick={sync}
              disabled={syncing}
            >
              <Icon name="refresh" size={14} />{" "}
              {syncing
                ? "Syncing…"
                : "Sync now"}
            </button>

            <button
              className="tool-primary"
              type="button"
              onClick={() =>
                setBudgetModal(true)
              }
            >
              <Icon name="plus" size={14} /> Add budget
            </button>
          </>
        }
      >
        <div className="metric-grid four">
          <Metric
            label={`${monthShortName} budget`}
            value={money(totalBudget)}
          />

          <Metric
            label="Spent"
            value={money(totalSpent)}
          />

          <Metric
            label="Remaining"
            value={money(totalRemaining)}
            green={totalRemaining >= 0}
            danger={totalRemaining < 0}
          />

          <Metric
            label="Alerts"
            value={String(alertBudgets.length)}
            danger={alertBudgets.length > 0}
          />
        </div>

        {loading ? (
          <div className="empty-state">
            <strong>Loading budgets…</strong>
            <span>
              Fetching your {monthName} budget plan.
            </span>
          </div>
        ) : (
          <>
            <div className="alert-list">
              {alertBudgets.map((budget) => {
                const alertInfo =
                  getBudgetAlertInfo(budget);

                return (
                  <div
                    className="alert-row"
                    key={budget.budgetId}
                  >
                    {toneIcon(
                      alertInfo.tone,
                      alertInfo.icon
                    )}

                    <div>
                      <strong>
                        {alertInfo.title}
                      </strong>

                      <small>
                        {alertInfo.description}
                      </small>
                    </div>

                    <b>{alertInfo.tag}</b>
                  </div>
                );
              })}

              {alertBudgets.length === 0 && (
                <div className="alert-row">
                  {toneIcon(
                    "teal",
                    "check"
                  )}

                  <div>
                    <strong>
                      No budget alerts
                    </strong>

                    <small>
                      Your budgets are currently
                      within their limits.
                    </small>
                  </div>

                  <b>On track</b>
                </div>
              )}
            </div>

            <div className="budget-layout">
              <div className="budget-category-grid">
                {budgets.map((budget) => (
                  <BudgetCategory
                    key={budget.budgetId}
                    budget={budget}
                    progress={progress}
                    onEdit={() =>
                      setEditing(budget)
                    }
                  />
                ))}

                {budgets.length === 0 && (
                  <div className="empty-state">
                    <strong>
                      No budgets for {monthName}
                    </strong>

                    <span>
                      Add your first category budget
                      to start tracking spending.
                    </span>
                  </div>
                )}
              </div>

              <BudgetAutomation
                alertCount={
                  alertBudgets.length
                }
              />
            </div>

            <div className="budget-view-toggle">
              <button
                type="button"
                className={
                  progress ? "active" : ""
                }
                onClick={() =>
                  setProgress(true)
                }
              >
                Show progress
              </button>

              <button
                type="button"
                className={
                  !progress ? "active" : ""
                }
                onClick={() =>
                  setProgress(false)
                }
              >
                Compact view
              </button>
            </div>
          </>
        )}
      </PageFrame>

      {budgetModal && (
        <Modal
          title="Add a budget"
          description={`Set a category limit for ${monthName} ${year}.`}
          onClose={() =>
            setBudgetModal(false)
          }
        >
          <BudgetForm
            categories={categories}
            month={month}
            year={year}
            onClose={() =>
              setBudgetModal(false)
            }
            onSave={handleCreateBudget}
          />
        </Modal>
      )}

      {editing && (
        <Modal
          title={`Edit ${editing.categoryName} budget`}
          description={`Update the monthly limit for ${monthName} ${year}.`}
          onClose={() =>
            setEditing(null)
          }
        >
          <BudgetForm
            categories={categories}
            month={editing.month}
            year={editing.year}
            initialCategoryId={
              editing.categoryId
            }
            initialAmount={
              editing.amount
            }
            editing
            onClose={() =>
              setEditing(null)
            }
            onDelete={() =>
              handleDeleteBudget(
                editing.budgetId
              )
            }
            onSave={(payload) =>
              handleUpdateBudget(
                editing.budgetId,
                payload
              )
            }
          />
        </Modal>
      )}

      <ActionToast message={toast} />
    </ToolsShell>
  );
}

function Metric({
  label,
  value,
  green,
  danger,
}) {
  return (
    <div className="metric-card">
      <span>{label}</span>

      <strong
        className={
          green
            ? "green-text"
            : danger
              ? "danger-text"
              : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}

function getCategoryPresentation(
  categoryName
) {
  const map = {
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

    Entertainment: {
      icon: "ticket",
      tone: "peach",
    },

    Subscriptions: {
      icon: "tv",
      tone: "pink",
    },

    Miscellaneous: {
      icon: "folder",
      tone: "slate",
    },

    Education: {
      icon: "grad",
      tone: "teal",
    },

    Shopping: {
      icon: "shopping",
      tone: "pink",
    },

    "Bills & Utilities": {
      icon: "bill",
      tone: "blue",
    },

    Savings: {
      icon: "target",
      tone: "teal",
    },

    "Personal Care": {
      icon: "user",
      tone: "purple",
    },

    Other: {
      icon: "folder",
      tone: "slate",
    },

    Health: {
      icon: "heart",
      tone: "pink",
    },
  };

  return (
    map[categoryName] || {
      icon: "folder",
      tone: "slate",
    }
  );
}

function BudgetCategory({
  budget,
  progress,
  onEdit,
}) {
  const spent = Number(
    budget.spent || 0
  );

  const amount = Number(
    budget.amount || 0
  );

  const used = Math.min(
    100,
    Math.round(
      Number(
        budget.percentageUsed || 0
      )
    )
  );

  const presentation =
    getCategoryPresentation(
      budget.categoryName
    );

  const remaining = Number(
    budget.remaining || 0
  );

  const statusLabels = {
    ON_TRACK: "On track",
    APPROACHING_LIMIT:
      "Approaching limit",
    AT_LIMIT: "At limit",
    OVER_BUDGET: "Over budget",
  };

  const status =
    statusLabels[budget.status] ||
    budget.status ||
    "On track";

  return (
    <div className="budget-category">
      <div className="budget-cat-head">
        {toneIcon(
          presentation.tone,
          presentation.icon
        )}

        <div>
          <strong>
            {budget.categoryName}
          </strong>

          <small>{status}</small>
        </div>

        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${budget.categoryName} budget`}
        >
          <Icon
            name="edit"
            size={13}
          />
        </button>
      </div>

      {progress && (
        <div
          className={`mini-progress ${used >= 100
              ? "danger"
              : ""
            }`}
        >
          <i
            style={{
              width: `${used}%`,
            }}
          />
        </div>
      )}

      <div className="budget-cat-foot">
        <span>
          {money(spent)} spent
        </span>

        <b>{money(amount)}</b>
      </div>

      <small className="budget-percent">
        {used}% used ·{" "}
        {money(
          Math.max(
            0,
            remaining
          )
        )}{" "}
        left
      </small>
    </div>
  );
}

function BudgetForm({
  categories,
  month,
  year,
  initialCategoryId = "",
  initialAmount = "",
  editing = false,
  onClose,
  onSave,
  onDelete,
}) {
  const firstCategoryId =
    initialCategoryId ||
    categories[0]?.categoryId ||
    "";

  const [categoryId, setCategoryId] =
    useState(firstCategoryId);

  const [amount, setAmount] =
    useState(
      initialAmount !== ""
        ? String(initialAmount)
        : ""
    );

  const [saving, setSaving] =
    useState(false);

  const selectedCategory =
    categories.find(
      (category) =>
        category.categoryId ===
        categoryId
    );

  const submit = async (e) => {
    e.preventDefault();

    const numericAmount =
      Number(amount);

    if (
      !categoryId ||
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      return;
    }

    try {
      setSaving(true);

      await onSave({
        categoryId,
        amount: Number(
          numericAmount.toFixed(2)
        ),
        month,
        year,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="cc-form"
      onSubmit={submit}
    >
      <label>
        Category

        <select
          value={categoryId}
          onChange={(e) =>
            setCategoryId(
              e.target.value
            )
          }
          disabled={editing}
        >
          <option value="">
            Select category
          </option>

          {categories.map(
            (category) => (
              <option
                key={
                  category.categoryId
                }
                value={
                  category.categoryId
                }
              >
                {category.name}
              </option>
            )
          )}
        </select>
      </label>

      {selectedCategory && (
        <small>
          Budgeting{" "}
          <strong>
            {selectedCategory.name}
          </strong>{" "}
          for{" "}
          {new Date(
            year,
            month - 1,
            1
          ).toLocaleString(
            "en-US",
            {
              month: "long",
              year: "numeric",
            }
          )}
          .
        </small>
      )}

      <label>
        Monthly limit

        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
          placeholder="250.00"
          required
        />
      </label>

      <div className="modal-actions">
        <button
          type="button"
          className="ghost-btn"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </button>

        {editing && onDelete && (
          <button
            type="button"
            className="ghost-btn"
            onClick={onDelete}
            disabled={saving}
          >
            Delete
          </button>
        )}

        <button
          type="submit"
          className="tool-primary"
          disabled={
            saving ||
            !categoryId ||
            !amount
          }
        >
          {saving
            ? "Saving…"
            : editing
              ? "Update budget"
              : "Save budget"}
        </button>
      </div>
    </form>
  );
}

function getBudgetAlertInfo(
  budget
) {
  switch (budget.status) {
    case "OVER_BUDGET":
      return {
        title: `${budget.categoryName} is over budget`,
        description: `${money(
          Math.abs(
            Number(
              budget.remaining || 0
            )
          )
        )} over the monthly limit.`,
        tag: "Over budget",
        icon: "alert",
        tone: "pink",
      };

    case "AT_LIMIT":
      return {
        title: `${budget.categoryName} is at its limit`,
        description: `You've used the full ${money(
          budget.amount
        )} budget.`,
        tag: "At limit",
        icon: "alert",
        tone: "amber",
      };

    case "APPROACHING_LIMIT":
      return {
        title: `${budget.categoryName} is approaching its limit`,
        description: `${money(
          Math.max(
            0,
            Number(
              budget.remaining || 0
            )
          )
        )} remaining.`,
        tag: "Watch",
        icon: "alert",
        tone: "blue",
      };

    default:
      return {
        title: `${budget.categoryName} is on track`,
        description: `${money(
          Math.max(
            0,
            Number(
              budget.remaining || 0
            )
          )
        )} remaining.`,
        tag: "On track",
        icon: "check",
        tone: "teal",
      };
  }
}

function BudgetAutomation({
  alertCount = 0,
}) {
  const [a, setA] = useState([
    true,
    true,
    true,
    false,
  ]);

  return (
    <aside className="automation-card">
      <h3>AI alerts</h3>

      <p>
        Let CampusCoin watch your
        budgets and flag changes early.
      </p>

      {[
        "Approaching budget limit",
        "Unusual spend detected",
        "Weekly budget check",
        "Auto-adjust suggestions",
      ].map((x, i) => (
        <div
          className="toggle-row"
          key={x}
        >
          <span>{x}</span>

          <button
            type="button"
            className={
              a[i] ? "on" : ""
            }
            onClick={() =>
              setA((value) =>
                value.map(
                  (item, index) =>
                    index === i
                      ? !item
                      : item
                )
              )
            }
          >
            <i />
          </button>
        </div>
      ))}

      <div className="automation-note">
        <Icon
          name="sparkle"
          size={15}
        />

        <span>
          {alertCount > 0
            ? `CampusCoin found ${alertCount} budget alert${alertCount === 1
              ? ""
              : "s"
            } for this month.`
            : "No budget alerts for this month."}
        </span>
      </div>
    </aside>
  );
}

function ReportsPage() {
  const now = new Date();

  const [dark, setDark] = useState(false);
  const [notify, setNotify] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  const [range, setRange] = useState(
    `${now.toLocaleString("en-US", { month: "short" })} 1 – ${now.toLocaleString(
      "en-US",
      { month: "short" }
    )} ${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`
  );

  const [category, setCategory] = useState("All categories");
  const [kind, setKind] = useState("All transactions");
  const [view, setView] = useState("Month");

  const [toast, showToast] = useToast();

  useEffect(() => {
    loadReportData();
  }, []);

  async function loadReportData() {
    try {
      setLoading(true);

      const [transactionData, categoryData, budgetData] =
        await Promise.all([
          getTransactions(),
          getCategories(),
          getBudgets(),
        ]);

      setTransactions(
        Array.isArray(transactionData) ? transactionData : []
      );

      setCategories(
        Array.isArray(categoryData) ? categoryData : []
      );

      setBudgets(
        Array.isArray(budgetData) ? budgetData : []
      );
    } catch (error) {
      console.error("Failed to load report data:", error);
      showToast(error.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  }

  const expenseCategories = useMemo(
    () =>
      categories.filter(
        (c) =>
          String(c.type || "").toUpperCase() === "EXPENSE"
      ),
    [categories]
  );

  const currentMonthTransactions = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return transactions.filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month
      );
    });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = [...currentMonthTransactions];

    if (category !== "All categories") {
      result = result.filter(
        (transaction) =>
          transaction.categoryName === category ||
          transaction.category?.name === category
      );
    }

    if (kind === "Expenses") {
      result = result.filter(
        (transaction) =>
          String(transaction.type || "").toUpperCase() === "EXPENSE"
      );
    }

    if (kind === "Income") {
      result = result.filter(
        (transaction) =>
          String(transaction.type || "").toUpperCase() === "INCOME"
      );
    }

    return result;
  }, [currentMonthTransactions, category, kind]);

  const expenseTransactions = useMemo(
    () =>
      filteredTransactions.filter(
        (transaction) =>
          String(transaction.type || "").toUpperCase() === "EXPENSE"
      ),
    [filteredTransactions]
  );

  const incomeTransactions = useMemo(
    () =>
      filteredTransactions.filter(
        (transaction) =>
          String(transaction.type || "").toUpperCase() === "INCOME"
      ),
    [filteredTransactions]
  );

  const totalSpend = useMemo(
    () =>
      expenseTransactions.reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount || 0),
        0
      ),
    [expenseTransactions]
  );

  const totalIncome = useMemo(
    () =>
      incomeTransactions.reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount || 0),
        0
      ),
    [incomeTransactions]
  );

  const categorySpending = useMemo(() => {
    const map = {};

    expenseTransactions.forEach((transaction) => {
      const name =
        transaction.categoryName ||
        transaction.category?.name ||
        "Uncategorized";

      map[name] = (map[name] || 0) + Number(transaction.amount || 0);
    });

    return Object.entries(map)
      .map(([name, spent]) => ({
        name,
        spent,
      }))
      .sort((a, b) => b.spent - a.spent);
  }, [expenseTransactions]);

  const selectedMonthBudget = useMemo(() => {
    return budgets
      .filter(
        (budget) =>
          Number(budget.month) === now.getMonth() + 1 &&
          Number(budget.year) === now.getFullYear()
      )
      .reduce(
        (sum, budget) => sum + Number(budget.amount || 0),
        0
      );
  }, [budgets]);

  const monthlyBudgetSpent = useMemo(
    () =>
      currentMonthTransactions
        .filter(
          (transaction) =>
            String(transaction.type || "").toUpperCase() === "EXPENSE"
        )
        .reduce(
          (sum, transaction) =>
            sum + Number(transaction.amount || 0),
          0
        ),
    [currentMonthTransactions]
  );

  const remainingBudget =
    selectedMonthBudget - monthlyBudgetSpent;

  const monthlyData = useMemo(() => {
    const result = [];

    for (let offset = 4; offset >= 0; offset--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - offset,
        1
      );

      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const monthTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        return (
          transactionDate.getFullYear() === year &&
          transactionDate.getMonth() + 1 === month &&
          String(transaction.type || "").toUpperCase() === "EXPENSE"
        );
      });

      const spent = monthTransactions.reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount || 0),
        0
      );

      const budget = budgets
        .filter(
          (item) =>
            Number(item.month) === month &&
            Number(item.year) === year
        )
        .reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        );

      result.push({
        month: date.toLocaleString("en-US", {
          month: "short",
        }),
        budget,
        spent,
      });
    }

    return result;
  }, [transactions, budgets]);

  const dailySpending = useMemo(() => {
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    const values = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const total = currentMonthTransactions
        .filter((transaction) => {
          if (
            String(transaction.type || "").toUpperCase() !==
            "EXPENSE"
          ) {
            return false;
          }

          const date = new Date(transaction.date);

          return date.getDate() === day;
        })
        .reduce(
          (sum, transaction) =>
            sum + Number(transaction.amount || 0),
          0
        );

      values.push(total);
    }

    return values;
  }, [currentMonthTransactions]);

  const maxDailySpend = Math.max(...dailySpending, 1);

  const topCategories = categorySpending.slice(0, 5);

  const monthLabel = now.toLocaleString("en-US", {
    month: "long",
  });

  const yearLabel = now.getFullYear();

  const handleExport = (format) => {
    if (format === "CSV data") {
      const headers = [
        "Date",
        "Description",
        "Type",
        "Category",
        "Amount",
      ];

      const rows = filteredTransactions.map((transaction) => [
        transaction.date || "",
        transaction.description || "",
        transaction.type || "",
        transaction.categoryName ||
        transaction.category?.name ||
        "",
        transaction.amount || 0,
      ]);

      const csv = [
        headers,
        ...rows,
      ]
        .map((row) =>
          row
            .map((value) =>
              `"${String(value).replaceAll('"', '""')}"`
            )
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `campuscoin-report-${monthLabel.toLowerCase()}-${yearLabel}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setExportOpen(false);
      showToast("CSV report downloaded");
      return;
    }

    window.print();
  };

  return (
    <ToolsShell
      page="Reports"
      dark={dark}
      setDark={setDark}
      notificationOpen={notify}
      setNotificationOpen={setNotify}
    >
      <PageFrame
        eyebrow={`INSIGHTS · ${monthLabel.slice(0, 3).toUpperCase()}`}
        title="Reports"
        description="Understand where your money goes and how your spending changes over time."
        actions={
          <>
            <button
              className="tool-primary"
              type="button"
              onClick={() => setExportOpen(true)}
            >
              <Icon name="download" size={14} />
              Export report
            </button>

            <button
              className="tool-btn"
              type="button"
              onClick={() =>
                showToast("Use the filters below to refine this report")
              }
            >
              <Icon name="filter" size={14} />
              Filters
            </button>
          </>
        }
      >
        <div className="report-filters">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option>
              {monthLabel.slice(0, 3)} 1 – {monthLabel.slice(0, 3)}{" "}
              {new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
              ).getDate()}
            </option>

            <option>
              {monthLabel.slice(0, 3)} 1 – {monthLabel.slice(0, 3)}{" "}
              {now.getDate()}
            </option>

            <option>
              {new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
              ).toLocaleString("en-US", {
                month: "short",
              })}{" "}
              1 –{" "}
              {new Date(
                now.getFullYear(),
                now.getMonth(),
                0
              ).toLocaleString("en-US", {
                month: "short",
              })}{" "}
              {new Date(
                now.getFullYear(),
                now.getMonth(),
                0
              ).getDate()}
            </option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All categories</option>

            {expenseCategories.map((c) => (
              <option key={c.categoryId || c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option>All transactions</option>
            <option>Expenses</option>
            <option>Income</option>
          </select>

          <div />

          {["Month", "Week", "Day"].map((item) => (
            <button
              key={item}
              type="button"
              className={view === item ? "active" : ""}
              onClick={() => setView(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="report-filter-summary">
          Showing <strong>{category}</strong> ·{" "}
          <strong>{kind}</strong> · <strong>{range}</strong>
        </div>

        {loading ? (
          <div
            className="report-card"
            style={{
              padding: "40px",
              textAlign: "center",
              gridColumn: "1 / -1",
            }}
          >
            Loading your report...
          </div>
        ) : (
          <div className="report-grid">
            <CategoryReport
              categorySpending={categorySpending}
              totalSpend={totalSpend}
            />

            <BudgetActualReport
              monthlyData={monthlyData}
              selectedMonthBudget={selectedMonthBudget}
              monthlyBudgetSpent={monthlyBudgetSpent}
              remainingBudget={remainingBudget}
            />

            <DailySpendReport
              dailySpending={dailySpending}
              maxDailySpend={maxDailySpend}
              view={view}
            />

            <TopSpenders
              topCategories={topCategories}
            />
          </div>
        )}

        <div className="report-banner">
          <Icon name="sparkle" size={16} />

          <div>
            <strong>AI report ready</strong>

            <span>
              Your report is based on your latest CampusCoin
              transactions and budgets.
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/ai-insights")}
          >
            View insight
          </button>
        </div>
      </PageFrame>

      {exportOpen && (
        <ExportModal
          onClose={() => setExportOpen(false)}
          onExport={handleExport}
        />
      )}

      <ActionToast message={toast} />
    </ToolsShell>
  );
}

function CategoryReport({
  categorySpending,
  totalSpend,
}) {
  const max = Math.max(
    ...categorySpending.map((item) => item.spent),
    1
  );

  return (
    <div className="report-card">
      <div className="report-card-title">
        <div>
          <strong>Spend by category</strong>
          <small>Current month total</small>
        </div>

        <span className="legend-dot green" />
      </div>

      <div
        className="donut-report"
        style={{
          "--p": totalSpend > 0 ? "48%" : "0%",
        }}
      >
        <b>{money(totalSpend)}</b>
        <small>total spend</small>
      </div>

      <div className="legend-list">
        {categorySpending.length === 0 ? (
          <span>
            No expense data for this period.
          </span>
        ) : (
          categorySpending.slice(0, 6).map((item, index) => (
            <span key={item.name}>
              <i className={`legend-color l${index}`} />

              {item.name}

              <b>{money(item.spent)}</b>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function BudgetActualReport({
  monthlyData,
  selectedMonthBudget,
  monthlyBudgetSpent,
  remainingBudget,
}) {
  const max = Math.max(
    ...monthlyData.flatMap((item) => [
      item.budget,
      item.spent,
    ]),
    1
  );

  return (
    <div className="report-card budget-chart-card">
      <div className="report-card-title">
        <div>
          <strong>Budget vs actual</strong>
          <small>Monthly comparison</small>
        </div>

        <span className="chart-legend">
          <i />
          Budget <i />
          Actual
        </span>
      </div>

      <div className="bars filled">
        {monthlyData.map((item) => (
          <div className="bar-group" key={item.month}>
            <div className="bars-area">
              <i
                style={{
                  height:
                    item.budget > 0
                      ? `${(item.budget / max) * 100}%`
                      : "4%",
                }}
              />

              <b
                style={{
                  height:
                    item.spent > 0
                      ? `${(item.spent / max) * 100}%`
                      : "4%",
                }}
              />
            </div>

            <span>{item.month}</span>
          </div>
        ))}
      </div>

      <div className="chart-summary">
        <span>
          Budget
          <b>
            {selectedMonthBudget > 0
              ? money(selectedMonthBudget)
              : "—"}
          </b>
        </span>

        <span>
          Spent
          <b>
            {monthlyBudgetSpent > 0
              ? money(monthlyBudgetSpent)
              : "—"}
          </b>
        </span>

        <span>
          Remaining
          <b className="green-text">
            {selectedMonthBudget > 0
              ? money(Math.max(remainingBudget, 0))
              : "—"}
          </b>
        </span>
      </div>
    </div>
  );
}

function DailySpendReport({
  dailySpending,
  maxDailySpend,
  view,
}) {
  const values =
    view === "Month"
      ? dailySpending
      : dailySpending.slice(0, view === "Week" ? 7 : 1);

  return (
    <div className="report-card daily-card">
      <div className="report-card-title">
        <div>
          <strong>Daily spending</strong>

          <small>
            {view === "Month"
              ? "Current month"
              : `${view} view`}
          </small>
        </div>
      </div>

      <div className="daily-bars filled">
        {values.map((value, index) => (
          <i
            key={index}
            style={{
              height:
                value > 0
                  ? `${Math.max(
                    (value / maxDailySpend) * 100,
                    5
                  )}%`
                  : "3%",
            }}
            title={`${money(value)}`}
          />
        ))}
      </div>

      <small className="chart-foot">
        Higher bars represent days with greater spending.
      </small>
    </div>
  );
}

function TopSpenders({ topCategories }) {
  return (
    <div className="report-card top-spenders">
      <div className="report-card-title">
        <div>
          <strong>Top categories</strong>
          <small>By current-month spend</small>
        </div>
      </div>

      {topCategories.length === 0 ? (
        <div className="spender-row">
          <span>
            No spending yet
            <small>Add an expense to see it here.</small>
          </span>
        </div>
      ) : (
        topCategories.map((item) => (
          <div className="spender-row" key={item.name}>
            <span>
              {item.name}
              <small>Current month</small>
            </span>

            <b>{money(item.spent)}</b>
          </div>
        ))
      )}

      <button
        className="text-link"
        type="button"
        onClick={() => navigate("/categories")}
      >
        View all categories
      </button>
    </div>
  );
}

function ExportModal({
  onClose,
  onExport,
}) {
  const [format, setFormat] = useState("PDF report");
  const [ai, setAi] = useState(true);

  const [items, setItems] = useState([
    true,
    true,
    true,
    true,
  ]);

  const labels = [
    "Spending summary",
    "Category breakdown",
    "Budget vs actual",
    "Daily spending chart",
  ];

  return (
    <Modal
      title="Export report"
      description="Choose the format and data you want to include."
      onClose={onClose}
      wide
    >
      <div className="export-tabs">
        {["PDF report", "CSV data"].map((item) => (
          <button
            type="button"
            key={item}
            className={format === item ? "active" : ""}
            onClick={() => setFormat(item)}
          >
            <Icon
              name={
                item.startsWith("PDF")
                  ? "receipt"
                  : "download"
              }
              size={15}
            />

            {item}

            {format === item && <b>✓</b>}
          </button>
        ))}
      </div>

      <div className="check-list">
        {labels.map((label, index) => (
          <label key={label}>
            <input
              type="checkbox"
              checked={items[index]}
              onChange={(event) =>
                setItems((current) =>
                  current.map((value, itemIndex) =>
                    itemIndex === index
                      ? event.target.checked
                      : value
                  )
                )
              }
            />

            <span>✓</span>

            {label}
          </label>
        ))}
      </div>

      <div className="toggle-row export-toggle">
        <span>Include AI insights</span>

        <button
          type="button"
          className={ai ? "on" : ""}
          onClick={() => setAi((value) => !value)}
        >
          <i />
        </button>
      </div>

      <div className="export-footer">
        <button
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          type="button"
          className="tool-primary"
          onClick={() => onExport(format)}
        >
          <Icon name="download" size={14} />

          {format === "CSV data"
            ? "Download CSV"
            : "Print report"}
        </button>
      </div>
    </Modal>
  );
}

function AIInsightsPage() {
  const [dark, setDark] = useState(false),
    [notify, setNotify] = useState(false),
    [saved, setSaved] = useState(false),
    [dismissed, setDismissed] = useState([]),
    [refreshing, setRefreshing] = useState(false),
    [toast, showToast] = useToast();
  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      showToast("Insights refreshed");
    }, 700);
  };
  return (
    <ToolsShell
      page="AI Insights"
      dark={dark}
      setDark={setDark}
      notificationOpen={notify}
      setNotificationOpen={setNotify}
    >
      <PageFrame
        eyebrow="SMART MONEY"
        title="AI Insights"
        description="Clear, useful patterns from your September transactions and budgets."
        actions={
          <>
            <button
              className="tool-btn"
              type="button"
              onClick={() => {
                setSaved((v) => !v);
                showToast(
                  saved ? "Insight removed from bookmarks" : "Insight saved",
                );
              }}
            >
              <Icon name="bookmark" size={14} />{" "}
              {saved ? "Saved" : "Save insight"}
            </button>
            <button className="tool-primary" type="button" onClick={refresh}>
              <Icon name="refresh" size={14} />{" "}
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </>
        }
      >
        <div className="ai-layout">
          <div>
            <div className="insight-hero">
              <div className="insight-icon">
                <Icon name="sparkle" size={19} />
              </div>
              <div>
                <strong>Your September story</strong>
                <small>Updated today · based on 47 transactions</small>
                <p>
                  Your spending is tracking below the September budget. Food
                  delivery and subscriptions are the two areas with the clearest
                  opportunity to save.
                </p>
                <p>
                  Rent is fixed, while your flexible spending has been more
                  concentrated around meals and small recurring purchases.
                </p>
                <div className="insight-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setSaved((v) => !v);
                      showToast(saved ? "Insight removed" : "Insight saved");
                    }}
                  >
                    {saved ? "Saved" : "Save insight"}
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast("Share link ready")}
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
            <h3 className="section-mini-title">Key opportunities</h3>
            <div className="opportunity-grid">
              {!dismissed.includes("food") && (
                <Opportunity
                  title="Food delivery"
                  value={`−${formatMoney(18.40)}`}
                  text="One fewer delivery this week keeps Food comfortably inside budget."
                  tone="amber"
                  icon="food"
                  onDismiss={() => setDismissed((v) => [...v, "food"])}
                  onView={() => showToast("Saving tip opened")}
                />
              )}{" "}
              {!dismissed.includes("subs") && (
                <Opportunity
                  title="Subscriptions"
                  value={`−${formatMoney(5.99)}`}
                  text="Review one recurring service before the next billing cycle."
                  tone="pink"
                  icon="tv"
                  onDismiss={() => setDismissed((v) => [...v, "subs"])}
                  onView={() => showToast("Subscription tip opened")}
                />
              )}
            </div>
            <div className="ai-follow">
              <Icon name="info" size={16} />
              <span>
                Potential duplicate: Chop & Go delivery on Sep 20 looks similar
                to a previous entry.
              </span>
              <button
                type="button"
                onClick={() => navigate("/transactions?search=Chop%20%26%20Go")}
              >
                Review
              </button>
            </div>
          </div>
          <aside className="insight-side">
            <h3>Highlights</h3>
            {[
              ["Spent", formatMoney(742.80)],
              ["Biggest category", "Hostel/Rent"],
              ["Food", formatMoney(214.60)],
              ["Remaining", formatMoney(127.20)],
            ].map(([a, b]) => (
              <div key={a}>
                <span>{a}</span>
                <strong>{b}</strong>
              </div>
            ))}
            <div className="side-tip">
              <strong>Keep going</strong>
              <p>You have 8 days left and about {formatMoney(15.90)}/day available.</p>
            </div>
          </aside>
        </div>
      </PageFrame>
      <ActionToast message={toast} />
    </ToolsShell>
  );
}
function Opportunity({ title, value, text, tone, icon, onDismiss, onView }) {
  return (
    <div className="opportunity">
      {" "}
      <div className="opp-head">
        {toneIcon(tone, icon)}
        <div>
          <strong>{title}</strong>
          <small>Flexible spend</small>
        </div>
        <b>{value}</b>
      </div>
      <p>{text}</p>
      <button className="tool-primary" type="button" onClick={onView}>
        View tip
      </button>
      <button className="ghost-btn" type="button" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
function SavingTipsPage() {
  const [dark, setDark] = useState(false),
    [notify, setNotify] = useState(false),
    [tab, setTab] = useState("All"),
    [saved, setSaved] = useState([false, true, false, false, false]),
    [dismissed, setDismissed] = useState([]),
    [toast, showToast] = useToast();
  const visible = useMemo(
    () =>
      tips
        .map((t, i) => ({ ...t, i }))
        .filter((t) => !dismissed.includes(t.i))
        .filter(
          (t) =>
            tab === "All" ||
            (tab === "Saved" && saved[t.i]) ||
            (tab === "Recommended" && !saved[t.i]) ||
            (tab === "Dismissed" && dismissed.includes(t.i)),
        ),
    [tab, saved, dismissed],
  );
  return (
    <ToolsShell
      page="Saving Tips"
      dark={dark}
      setDark={setDark}
      notificationOpen={notify}
      setNotificationOpen={setNotify}
    >
      <PageFrame
        eyebrow="SMART MONEY"
        title="Saving tips"
        description="Small changes tailored to your current spending and budget targets."
        actions={
          <button
            className="tool-btn"
            type="button"
            onClick={() => showToast("Showing September recommendations")}
          >
            This month⌄
          </button>
        }
      >
        <div className="saving-metrics">
          <div className="saving-score">
            <Icon name="zap" size={16} />
            <span>Potential monthly savings</span>
            <strong>{formatMoney(61)}</strong>
          </div>
          <Metric label="Tips ready" value={String(visible.length)} />
          <Metric label="Saved" value={String(saved.filter(Boolean).length)} />
          <Metric label="Dismissed" value={String(dismissed.length)} />
        </div>
        <div className="tip-tabs">
          {["All", "Recommended", "Saved", "Dismissed"].map((x) => (
            <button
              type="button"
              key={x}
              className={tab === x ? "active" : ""}
              onClick={() => setTab(x)}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="tip-list">
          {visible.map((t) => (
            <TipRow
              key={t.title}
              {...t}
              featured={t.i === 0}
              saved={saved[t.i]}
              onSave={() =>
                setSaved((v) => v.map((x, j) => (j === t.i ? !x : x)))
              }
              onDismiss={() => {
                setDismissed((v) => [...v, t.i]);
                showToast("Tip dismissed");
              }}
            />
          ))}
          {visible.length === 0 && (
            <div className="empty-state">
              <strong>No tips here yet</strong>
              <span>Try another filter.</span>
            </div>
          )}
        </div>
        <div className="saving-note">
          <Icon name="info" size={14} /> New tips appear as your transaction
          patterns change.
        </div>
      </PageFrame>
      <ActionToast message={toast} />
    </ToolsShell>
  );
}
function TipRow({
  title,
  text,
  amount,
  tone,
  icon,
  featured,
  saved,
  onSave,
  onDismiss,
}) {
  return (
    <div className={`tip-row ${featured ? "featured" : ""}`}>
      <span className="tip-check">{saved ? "✓" : "○"}</span>
      {toneIcon(tone, icon)}
      <div className="tip-copy">
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
      <div className="tip-save">
        <b>Save {amount}</b>
        <span>per month</span>
      </div>
      <button className="tool-primary" type="button" onClick={onSave}>
        {saved ? "Saved" : "Save"}
      </button>
      <button className="ghost-btn" type="button" onClick={onDismiss}>
        Dismiss
      </button>
      <Icon name="chevron" size={14} />
    </div>
  );
}
function BookmarksPage() {
  const [dark, setDark] = useState(false),
    [notify, setNotify] = useState(false),
    [tab, setTab] = useState("All"),
    [sort, setSort] = useState("Newest"),
    [items, setItems] = useState(bookmarks),
    [modal, setModal] = useState(false),
    [toast, showToast] = useToast();
  const filtered = useMemo(
    () =>
      items
        .filter(
          (x) =>
            tab === "All" ||
            (tab === "Tips" && x[2] === "amber") ||
            (tab === "Insights" && x[2] === "blue") ||
            (tab === "Notes" && x[2] === "teal"),
        )
        .sort((a, b) => (sort === "A–Z" ? a[0].localeCompare(b[0]) : 0)),
    [items, tab, sort],
  );
  const remove = (title) => {
    setItems((v) => v.filter((x) => x[0] !== title));
    showToast("Bookmark removed");
  };
  return (
    <ToolsShell
      page="Bookmarks"
      dark={dark}
      setDark={setDark}
      notificationOpen={notify}
      setNotificationOpen={setNotify}
    >
      <PageFrame
        eyebrow="SAVED ITEMS"
        title="Bookmarks & notes"
        description="Keep useful insights, tips and planning notes close at hand."
        actions={
          <>
            <button
              className="tool-primary"
              type="button"
              onClick={() => setModal(true)}
            >
              <Icon name="bookmark" size={14} /> New bookmark
            </button>
            <select
              className="tool-btn-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option>Newest</option>
              <option>A–Z</option>
            </select>
          </>
        }
      >
        <div className="bookmark-tabs">
          {["All", "Tips", "Insights", "Notes"].map((x) => (
            <button
              type="button"
              key={x}
              className={tab === x ? "active" : ""}
              onClick={() => setTab(x)}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="bookmark-grid">
          {filtered.map(([title, text, tone, icon]) => (
            <div className="bookmark-card" key={title}>
              {toneIcon(tone, icon)}
              <div className="bookmark-head">
                <strong>{title}</strong>
                <span aria-hidden="true">•••</span>
              </div>
              <p>{text}</p>
              <div className="bookmark-actions">
                <button
                  type="button"
                  onClick={() => showToast(`Opened ${title}`)}
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => showToast("Bookmark editing is ready")}
                >
                  <Icon name="edit" size={13} /> Edit
                </button>
                <button type="button" onClick={() => remove(title)}>
                  <Icon name="trash" size={13} /> Remove
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <strong>No bookmarks match</strong>
              <span>Choose another tab or add a new bookmark.</span>
            </div>
          )}
        </div>
      </PageFrame>
      {modal && (
        <Modal
          title="New bookmark"
          description="Save a useful note for later."
          onClose={() => setModal(false)}
        >
          <BookmarkForm
            onClose={() => setModal(false)}
            onSave={(title, text) => {
              setItems((v) => [[title, text, "blue", "bookmark"], ...v]);
              setModal(false);
              showToast("Bookmark added");
            }}
          />
        </Modal>
      )}
      <ActionToast message={toast} />
    </ToolsShell>
  );
}
function BookmarkForm({ onClose, onSave }) {
  const [title, setTitle] = useState(""),
    [text, setText] = useState("");
  return (
    <form
      className="cc-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim() && text.trim()) onSave(title.trim(), text.trim());
      }}
    >
      <label>
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. October budget plan"
          required
        />
      </label>
      <label>
        Note
        <textarea
          rows="4"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What should you remember?"
          required
        />
      </label>
      <div className="modal-actions">
        <button type="button" className="ghost-btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="tool-primary">
          Save bookmark
        </button>
      </div>
    </form>
  );
}
function ImportPage() {
  const [dark, setDark] = useState(false),
    [notify, setNotify] = useState(false),
    [file, setFile] = useState(null),
    [error, setError] = useState(""),
    [toast, showToast] = useToast();
  const inputRef = useRef(null);
  const choose = (e) => {
    const f = e.target.files?.[0];
    setError("");
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a CSV file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("CSV files must be 5 MB or smaller.");
      return;
    }
    setFile(f);
  };
  const downloadSample = () => {
    const blob = new Blob(
      [
        `Date,Description,Amount,Category
2026-09-23,Printing,4.50,Academics
2026-09-22,Ride to library,6.20,Transport
`,
      ],
      { type: "text/csv" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "campuscoin-sample.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <ToolsShell
      page="Import CSV"
      dark={dark}
      setDark={setDark}
      notificationOpen={notify}
      setNotificationOpen={setNotify}
    >
      <PageFrame
        eyebrow="IMPORT DATA"
        title="Import transactions from CSV"
        description="Bring your existing transaction history into CampusCoin in a few simple steps."
      >
        <div className="import-steps">
          <span className="active">
            1 <b>Upload file</b>
          </span>
          <i />
          <span>
            2 <b>Review transactions</b>
          </span>
          <i />
          <span>
            3 <b>Done</b>
          </span>
        </div>
        <div className="import-layout">
          <div>
            <label className={`upload-zone ${file ? "has-file" : ""}`}>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={choose}
              />
              <span className="upload-icon">
                <Icon name="upload" size={20} />
              </span>
              <strong>{file ? file.name : "Drop your CSV here"}</strong>
              <small>
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB · ready to review`
                  : "or choose a file from your computer"}
              </small>
              <b>{file ? "Choose another file" : "Browse files"}</b>
            </label>
            {error && <p className="form-error">{error}</p>}
            {file && (
              <div className="file-row">
                <span>{toneIcon("mint", "receipt")}</span>
                <div>
                  <strong>{file.name}</strong>
                  <small>CSV file · {(file.size / 1024).toFixed(1)} KB</small>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            )}
            <button
              className="tool-primary import-button"
              type="button"
              disabled={!file}
              onClick={() =>
                file &&
                navigate(
                  "/review-categories?file=" + encodeURIComponent(file.name),
                )
              }
            >
              {file ? "Continue to review" : "Choose a CSV file"}
            </button>
          </div>
          <aside className="import-help">
            <h3>CSV format</h3>
            <p>Use one transaction per row with the following columns.</p>
            <strong>Date · Description · Amount · Category</strong>
            <button type="button" onClick={downloadSample}>
              Download sample CSV
            </button>
          </aside>
        </div>
        <div className="import-note">
          <Icon name="info" size={15} />
          <span>
            Your original transactions will not be changed. CampusCoin will
            preview and validate the import before saving it.
          </span>
        </div>
      </PageFrame>
      <ActionToast message={toast} />
    </ToolsShell>
  );
}
function ReviewPage() {
  const [dark, setDark] = useState(false),
    [notify, setNotify] = useState(false),
    [selected, setSelected] = useState(() =>
      Object.fromEntries(reviewRows.map((_, i) => [i, true])),
    ),
    [tab, setTab] = useState("AI suggestions 8"),
    [done, setDone] = useState(false),
    [toast, showToast] = useToast();
  const rows = reviewRows.filter(
    (_, i) =>
      tab === "All 10" ||
      tab === "AI suggestions 8" ||
      (tab === "Needs review 2" && (i === 3 || i === 8)) ||
      (tab === "Excluded 0" && !selected[i]),
  );
  const selectedCount = Object.values(selected).filter(Boolean).length;
  return (
    <ToolsShell
      page="Import CSV"
      dark={dark}
      setDark={setDark}
      notificationOpen={notify}
      setNotificationOpen={setNotify}
    >
      <PageFrame
        eyebrow="IMPORT REVIEW"
        title="Review AI categories"
        description="Review the suggested categories before adding these transactions to your history."
        actions={
          <>
            <button
              className="tool-btn"
              type="button"
              onClick={() => navigate("/import-csv")}
            >
              <Icon name="arrowleft" size={14} /> Back
            </button>
            <button
              className="tool-primary"
              type="button"
              disabled={!selectedCount}
              onClick={() => {
                setDone(true);
                showToast(`${selectedCount} transactions ready to import`);
              }}
            >
              {done ? "Imported" : "Import " + selectedCount + " transactions"}
            </button>
          </>
        }
      >
        <div className="review-steps">
          <span className="done">✓ Upload file</span>
          <span className="done">✓ Review transactions</span>
          <span className="active">3 Done</span>
        </div>
        <div className="review-tabs">
          {["All 10", "AI suggestions 8", "Needs review 2", "Excluded 0"].map(
            (x) => (
              <button
                type="button"
                key={x}
                className={tab === x ? "active" : ""}
                onClick={() => setTab(x)}
              >
                {x}
              </button>
            ),
          )}
        </div>
        <div className="review-table">
          <div className="review-head">
            <span>Transaction</span>
            <span>Amount</span>
            <span>Suggested category</span>
            <span>Confidence</span>
          </div>
          {rows.map((r) => {
            const i = reviewRows.indexOf(r);
            const low = i === 3 || i === 8;
            return (
              <div
                className={`review-row ${low ? "needs-review" : ""}`}
                key={r[0] + r[1]}
              >
                <input
                  type="checkbox"
                  checked={selected[i] !== false}
                  onChange={(e) =>
                    setSelected((v) => ({ ...v, [i]: e.target.checked }))
                  }
                />
                <span>
                  <small>{r[0]}</small>
                  <strong>{r[1]}</strong>
                </span>
                <b>{r[2]}</b>
                <button
                  className="category-suggest"
                  type="button"
                  onClick={() => showToast("Category picker opened")}
                >
                  {r[3]}⌄
                </button>
                <span className="confidence">
                  <i style={{ "--confidence": r[4] }} />
                  {r[4]}
                </span>
              </div>
            );
          })}
        </div>
        <div className="review-footer">
          <span>
            {selectedCount} of 10 transactions selected. AI categorized 8
            confidently; two entries need review.
          </span>
          <button
            className="text-link"
            type="button"
            onClick={() => setTab("Needs review 2")}
          >
            Review flagged
          </button>
        </div>
      </PageFrame>
      <ActionToast message={toast} />
    </ToolsShell>
  );
}
function SettingsPage() {
  const [dark, setDark] = useState(false),
    [notify, setNotify] = useState(false),
    [saved, setSaved] = useState(false),
    [active, setActive] = useState("Profile"),
    [toast, showToast] = useToast(),
    [passwordOpen, setPasswordOpen] = useState(false),
    [twoFA, setTwoFA] = useState(false);
  const sections = {
    Profile: "settings-profile",
    Preferences: "settings-preferences",
    Notifications: "settings-notifications",
    Security: "settings-security",
  };
  const jump = (name) => {
    setActive(name);
    document
      .getElementById(sections[name])
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <ToolsShell
      page="Settings"
      dark={dark}
      setDark={setDark}
      notificationOpen={notify}
      setNotificationOpen={setNotify}
    >
      <PageFrame
        eyebrow="ACCOUNT"
        title="Profile & settings"
        description="Manage your profile, preferences, notifications and security."
      >
        <div className="settings-layout">
          <aside className="settings-nav">
            {[
              "Profile",
              "Preferences",
              "Notifications",
              "Security",
              "Connected apps",
            ].map((x) => (
              <button
                type="button"
                key={x}
                className={active === x ? "active" : ""}
                onClick={() =>
                  x === "Connected apps"
                    ? showToast("Connected apps settings coming next")
                    : jump(x)
                }
              >
                {x}
              </button>
            ))}
          </aside>
          <div className="settings-main">
            <div id="settings-profile">
              <SettingsProfile />
            </div>
            <div id="settings-preferences">
              <SettingsPreferences />
            </div>
            <div id="settings-notifications">
              <SettingsNotifications />
            </div>
            <div id="settings-security">
              <SettingsSecurity
                twoFA={twoFA}
                setTwoFA={setTwoFA}
                onPassword={() => setPasswordOpen(true)}
              />
              <div className="settings-card">
                <h3>Session</h3>
                <p>Sign out of CampusCoin on this device.</p>
                <button
                  className="settings-signout"
                  type="button"
                  onClick={() => {
                    clearStudentSession();
                    navigate("/");
                  }}
                >
                  <Icon name="logout" size={14} /> Sign out
                </button>
              </div>
            </div>
            <div className="settings-footer">
              <button
                className="tool-primary"
                type="button"
                onClick={() => {
                  setSaved(true);
                  showToast("Changes saved");
                }}
              >
                Save changes
              </button>
              {saved && <span>Changes saved</span>}
              <button
                className="ghost-btn"
                type="button"
                onClick={() => setSaved(false)}
              >
                Reset status
              </button>
            </div>
          </div>
        </div>
      </PageFrame>
      {passwordOpen && (
        <Modal
          title="Change password"
          description="Use a strong password you do not reuse elsewhere."
          onClose={() => setPasswordOpen(false)}
        >
          <PasswordForm
            onClose={() => setPasswordOpen(false)}
            onSave={() => {
              setPasswordOpen(false);
              showToast("Password updated");
            }}
          />
        </Modal>
      )}
      <ActionToast message={toast} />
    </ToolsShell>
  );
}
function SettingsProfile() {
  const [name, setName] = useState("Jordan Davis"),
    [email, setEmail] = useState("jordan.davis@example.com");
  return (
    <div className="settings-card">
      <h3>Profile</h3>
      <p>Keep your student profile and account details up to date.</p>
      <div className="profile-line">
        <span className="large-avatar">JD</span>
        <div>
          <strong>{name}</strong>
          <small>{email}</small>
        </div>
        <button
          className="ghost-btn"
          type="button"
          onClick={() => document.getElementById("profile-name")?.focus()}
        >
          Edit details
        </button>
      </div>
      <div className="form-grid">
        <label>
          Full name
          <input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          School
          <input value="Aptech" readOnly />
        </label>
        <label>
          Study level
          <select defaultValue="Year 2">
            <option>Year 1</option>
            <option>Year 2</option>
            <option>Year 3</option>
          </select>
        </label>
      </div>
    </div>
  );
}
function SettingsPreferences() {
  const [currency, setCurrency] = useState("USD · $");
  const [week, setWeek] = useState("Monday");
  return (
    <div className="settings-card">
      <h3>Money preferences</h3>
      <p>Choose how CampusCoin displays and summarizes your finances.</p>
      <div className="pref-grid">
        <label>
          <strong>Currency</strong>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option>USD · $</option>
            <option>NGN · ₦</option>
            <option>GBP · £</option>
          </select>
        </label>
        <div>
          <strong>Monthly budget</strong>
          <span>{formatMoney(870)}</span>
        </div>
        <label>
          <strong>Week starts</strong>
          <select value={week} onChange={(e) => setWeek(e.target.value)}>
            <option>Monday</option>
            <option>Sunday</option>
          </select>
        </label>
        <div>
          <strong>Default view</strong>
          <span>Dashboard</span>
        </div>
      </div>
    </div>
  );
}
function SettingsNotifications() {
  const [a, setA] = useState([false, false, true]);
  return (
    <div className="settings-card">
      <h3>Notifications</h3>
      <p>Choose when CampusCoin should send you useful reminders.</p>
      <div className="notification-settings-row">
        <span>
          <strong>Budget alerts</strong>
          <small>Notify me when a category is close to its limit.</small>
        </span>
        <button
          className={a[0] ? "on" : ""}
          onClick={() => setA((v) => v.map((x, i) => (i === 0 ? !x : x)))}
        >
          <i />
        </button>
      </div>
      <div className="notification-settings-row">
        <span>
          <strong>Weekly summary</strong>
          <small>
            Send a weekly overview of spending and remaining budget.
          </small>
        </span>
        <button
          className={a[1] ? "on" : ""}
          onClick={() => setA((v) => v.map((x, i) => (i === 1 ? !x : x)))}
        >
          <i />
        </button>
      </div>
      <div className="notification-settings-row">
        <span>
          <strong>AI insights</strong>
          <small>Show new insights when a useful pattern is detected.</small>
        </span>
        <button
          className={a[2] ? "on" : ""}
          onClick={() => setA((v) => v.map((x, i) => (i === 2 ? !x : x)))}
        >
          <i />
        </button>
      </div>
    </div>
  );
}
function SettingsSecurity({ twoFA, setTwoFA, onPassword }) {
  return (
    <div className="settings-card">
      <h3>Security</h3>
      <p>Keep your CampusCoin account protected.</p>
      <div className="security-row">
        <span>
          <strong>Password</strong>
          <small>Last changed 28 days ago.</small>
        </span>
        <button className="tool-btn" type="button" onClick={onPassword}>
          Change password
        </button>
      </div>
      <div className="security-row">
        <span>
          <strong>Two-factor authentication</strong>
          <small>Protect your account with an additional sign-in step.</small>
        </span>
        <button
          type="button"
          className={twoFA ? "on" : ""}
          onClick={() => setTwoFA((v) => !v)}
        >
          <i />
        </button>
        <b className="security-status">{twoFA ? "Enabled" : "Not enabled"}</b>
      </div>
    </div>
  );
}
function PasswordForm({ onClose, onSave }) {
  const [current, setCurrent] = useState(""),
    [next, setNext] = useState(""),
    [confirm, setConfirm] = useState("");
  const valid = next.length >= 8 && next === confirm && current.length > 0;
  return (
    <form
      className="cc-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave();
      }}
    >
      <label>
        Current password
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </label>
      <label>
        New password
        <input
          type="password"
          minLength="8"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
        />
        <small>Use at least 8 characters.</small>
      </label>
      <label>
        Confirm new password
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </label>
      {next && confirm && next !== confirm && (
        <span className="form-error">Passwords do not match.</span>
      )}
      <div className="modal-actions">
        <button type="button" className="ghost-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="tool-primary" type="submit" disabled={!valid}>
          Update password
        </button>
      </div>
    </form>
  );
}

const pageMap = {
  "/budgets": BudgetsPage,
  "/reports": ReportsPage,
  "/ai-insights": AIInsightsPage,
  "/saving-tips": SavingTipsPage,
  "/bookmarks": BookmarksPage,
  "/import-csv": ImportPage,
  "/review-categories": ReviewPage,
  "/settings": SettingsPage,
};
export default function MoneyToolsPage({ type }) {
  const Page = pageMap[type] || BudgetsPage;
  return <Page />;
}
