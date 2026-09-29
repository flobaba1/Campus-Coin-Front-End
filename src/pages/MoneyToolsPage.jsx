import { useMemo, useRef, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { navigate } from "../routes/AppRoutes";
import Icon from "../components/Icon";
import Logo from "../components/Logo";
import { clearStudentSession, getStudentSession } from "../utils";
import ThemeToggle from "../components/ThemeToggle";
import { formatMoney } from "../utils/currency";
import { getNotifications, markNotificationAsRead } from "../api/notificationApi";
import { generateMonthlyReport } from "../api/aiApi";
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
import { getNotes, createNote, updateNote, deleteNote } from "../api/noteApi";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  loadProfilePhoto,
} from "../api/profileApi";

import {
  getBookmarks,
  createBookmark,
  deleteBookmark,
} from "../api/bookmarkApi";

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

  // Shared authenticated profile used by the top avatar and sidebar.
  // Settings updates dispatch "campuscoin:profile-updated" so this shell
  // refreshes immediately without affecting the other tool pages.
  const initialSession = getStudentSession() || {};
  const [shellProfile, setShellProfile] = useState(initialSession);
  const [shellPhoto, setShellPhoto] = useState(null);

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
  {
    label: "Import CSV",
    icon: "upload",
    path: "/import-csv",
  },
  {
    label: "Site Map",
    icon: "grid",
    path: "/app/sitemap",
  },
  {
    label: "Settings",
    icon: "settings",
    path: "/settings",
  },
];

  useEffect(() => {
    let mounted = true;

    const loadShellProfile = async () => {
      try {
        const profile = await getProfile();
        if (!mounted) return;

        setShellProfile((current) => ({
          ...current,
          ...profile,
        }));

        if (profile?.profilePhotoAvailable) {
          const photoUrl = await loadProfilePhoto();
          if (mounted) {
            setShellPhoto((previous) => {
              if (previous?.startsWith?.("blob:") && previous !== photoUrl) {
                URL.revokeObjectURL(previous);
              }
              return photoUrl;
            });
          }
        } else {
          setShellPhoto((previous) => {
            if (previous?.startsWith?.("blob:")) URL.revokeObjectURL(previous);
            return null;
          });
        }
      } catch (error) {
        // Keep the values returned by login if the profile request fails.
        console.warn("Unable to load shared profile:", error);
      }
    };

    const handleProfileUpdated = () => {
      loadShellProfile();
    };

    loadShellProfile();
    window.addEventListener("campuscoin:profile-updated", handleProfileUpdated);

    return () => {
      mounted = false;
      window.removeEventListener(
        "campuscoin:profile-updated",
        handleProfileUpdated,
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      if (shellPhoto?.startsWith?.("blob:")) {
        URL.revokeObjectURL(shellPhoto);
      }
    };
  }, [shellPhoto]);

  const displayName = shellProfile?.name || "CampusCoin User";
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CC";

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

{account.map((item) => (
  <button
    key={item.label}
    className={`side-link ${
      page === item.label ||
      (item.label === "Site Map" &&
        window.location.pathname === "/app/sitemap")
        ? "active"
        : ""
    }`}
    onClick={() => navigate(item.path)}
    type="button"
  >
    <Icon name={item.icon} size={18} />
    <span>{item.label}</span>
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
          <span className="avatar">
            {shellPhoto ? (
              <img
                src={shellPhoto}
                alt={`${displayName} profile`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "inherit",
                  display: "block",
                }}
              />
            ) : (
              initials
            )}
          </span>
          <span>
            <strong>{displayName}</strong>
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
              aria-label="Open profile settings"
              title={displayName}
            >
              {shellPhoto ? (
                <img
                  src={shellPhoto}
                  alt={`${displayName} profile`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "inherit",
                    display: "block",
                  }}
                />
              ) : (
                initials
              )}
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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unread = notifications.filter(
    (notification) => notification.status === "UNREAD"
  );

  const markRead = async (notification) => {
    try {
      if (notification.status === "UNREAD") {
        await markNotificationAsRead(notification.notificationId);
        setNotifications((current) =>
          current.map((item) =>
            item.notificationId === notification.notificationId
              ? { ...item, status: "READ" }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllRead = async () => {
    await Promise.all(
      unread.map((notification) =>
        markNotificationAsRead(notification.notificationId).catch((error) => {
          console.error("Failed to mark notification as read:", error);
        })
      )
    );

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        status: "READ",
      }))
    );
  };

  const openNotification = async (notification) => {
    await markRead(notification);

    const placement = String(
      notification?.placement || ""
    ).toUpperCase();

    const category = String(
      notification?.category || ""
    ).toLowerCase();

    if (placement === "TIPS" || category.includes("tip")) {
      onClose();
      navigate("/saving-tips");
      return;
    }

    if (
      placement === "ANNOUNCEMENT" ||
      category.includes("ai") ||
      category.includes("insight")
    ) {
      onClose();
      navigate("/ai-insights");
      return;
    }

    onClose();
  };

  return (
    <div className="money-notifications" role="dialog" aria-label="Notifications">
      <div className="notification-head">
        <strong>Notifications</strong>
        <b>{unread.length} new</b>
        <button type="button" onClick={markAllRead} disabled={!unread.length}>
          Mark all read
        </button>
        <button type="button" onClick={onClose} aria-label="Close">
          <Icon name="close" size={14} />
        </button>
      </div>

      <div className="money-notification-list">
        {loading ? (
          <div className="money-notification-empty">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="money-notification-empty">
            You're all caught up.
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.notificationId}
              type="button"
              className={`money-notification-item ${
                notification.status === "READ" ? "read" : ""
              }`}
              onClick={() => openNotification(notification)}
            >
              <span className="money-notification-copy">
                <strong>{notification.title}</strong>
                <small>{notification.message}</small>
                <em>
                  {notification.createdAt
                    ? new Date(notification.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )
                    : ""}
                </em>
              </span>
              {notification.status === "UNREAD" && (
                <i aria-hidden="true" />
              )}
              <Icon name="chevron" size={13} />
            </button>
          ))
        )}
      </div>
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
    showLoading = true,
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

  const monthName = new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "long",
  });

  const monthShortName = new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "short",
  });

  const totalBudget = budgets.reduce(
    (sum, budget) => sum + Number(budget.amount || 0),
    0,
  );

  const totalSpent = budgets.reduce(
    (sum, budget) => sum + Number(budget.spent || 0),
    0,
  );

  const totalRemaining = totalBudget - totalSpent;

  const alertBudgets = budgets.filter(
    (budget) =>
      budget.status === "OVER_BUDGET" ||
      budget.status === "AT_LIMIT" ||
      budget.status === "APPROACHING_LIMIT",
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

      setBudgets((current) => [...current, created]);

      setBudgetModal(false);

      showToast(
        `${created.categoryName} budget set to ${money(created.amount)}`,
      );
    } catch (error) {
      console.error("Failed to create budget:", error);
      showToast(error.message || "Failed to create budget");
    }
  };

  const handleUpdateBudget = async (budgetId, payload) => {
    try {
      const updated = await updateBudget(budgetId, payload);

      setBudgets((current) =>
        current.map((budget) =>
          budget.budgetId === budgetId ? updated : budget,
        ),
      );

      setEditing(null);

      showToast(
        `${updated.categoryName} budget updated to ${money(updated.amount)}`,
      );
    } catch (error) {
      console.error("Failed to update budget:", error);
      showToast(error.message || "Failed to update budget");
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    const budget = budgets.find((item) => item.budgetId === budgetId);

    if (!budget) return;

    const confirmed = window.confirm(
      `Delete the ${budget.categoryName} budget for ${monthName} ${year}?`,
    );

    if (!confirmed) return;

    try {
      await deleteBudget(budgetId);

      setBudgets((current) =>
        current.filter((item) => item.budgetId !== budgetId),
      );

      setEditing(null);

      showToast("Budget deleted successfully");
    } catch (error) {
      console.error("Failed to delete budget:", error);
      showToast(error.message || "Failed to delete budget");
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
                onClick={() => setPlanOpen((value) => !value)}
              >
                <Icon name="target" size={14} /> {monthName} {year}⌄
              </button>

              {planOpen && (
                <div className="tool-dropdown">
                  <button
                    type="button"
                    onClick={() => handleMonthChange(month, year)}
                  >
                    {monthName} {year}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const nextMonth = month === 12 ? 1 : month + 1;

                      const nextYear = month === 12 ? year + 1 : year;

                      handleMonthChange(nextMonth, nextYear);
                    }}
                  >
                    {new Date(year, month, 1).toLocaleString("en-US", {
                      month: "long",
                    })}{" "}
                    {month === 12 ? year + 1 : year}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const previousMonth = month === 1 ? 12 : month - 1;

                      const previousYear = month === 1 ? year - 1 : year;

                      handleMonthChange(previousMonth, previousYear);
                    }}
                  >
                    {new Date(year, month - 2, 1).toLocaleString("en-US", {
                      month: "long",
                    })}{" "}
                    {month === 1 ? year - 1 : year}
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
              {syncing ? "Syncing…" : "Sync now"}
            </button>

            <button
              className="tool-primary"
              type="button"
              onClick={() => setBudgetModal(true)}
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

          <Metric label="Spent" value={money(totalSpent)} />

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
            <span>Fetching your {monthName} budget plan.</span>
          </div>
        ) : (
          <>
            <div className="alert-list">
              {alertBudgets.map((budget) => {
                const alertInfo = getBudgetAlertInfo(budget);

                return (
                  <div className="alert-row" key={budget.budgetId}>
                    {toneIcon(alertInfo.tone, alertInfo.icon)}

                    <div>
                      <strong>{alertInfo.title}</strong>

                      <small>{alertInfo.description}</small>
                    </div>

                    <b>{alertInfo.tag}</b>
                  </div>
                );
              })}

              {alertBudgets.length === 0 && (
                <div className="alert-row">
                  {toneIcon("teal", "check")}

                  <div>
                    <strong>No budget alerts</strong>

                    <small>
                      Your budgets are currently within their limits.
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
                    onEdit={() => setEditing(budget)}
                  />
                ))}

                {budgets.length === 0 && (
                  <div className="empty-state">
                    <strong>No budgets for {monthName}</strong>

                    <span>
                      Add your first category budget to start tracking spending.
                    </span>
                  </div>
                )}
              </div>

              <BudgetAutomation alertCount={alertBudgets.length} />
            </div>

            <div className="budget-view-toggle">
              <button
                type="button"
                className={progress ? "active" : ""}
                onClick={() => setProgress(true)}
              >
                Show progress
              </button>

              <button
                type="button"
                className={!progress ? "active" : ""}
                onClick={() => setProgress(false)}
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
          onClose={() => setBudgetModal(false)}
        >
          <BudgetForm
            categories={categories}
            month={month}
            year={year}
            onClose={() => setBudgetModal(false)}
            onSave={handleCreateBudget}
          />
        </Modal>
      )}

      {editing && (
        <Modal
          title={`Edit ${editing.categoryName} budget`}
          description={`Update the monthly limit for ${monthName} ${year}.`}
          onClose={() => setEditing(null)}
        >
          <BudgetForm
            categories={categories}
            month={editing.month}
            year={editing.year}
            initialCategoryId={editing.categoryId}
            initialAmount={editing.amount}
            editing
            onClose={() => setEditing(null)}
            onDelete={() => handleDeleteBudget(editing.budgetId)}
            onSave={(payload) => handleUpdateBudget(editing.budgetId, payload)}
          />
        </Modal>
      )}

      <ActionToast message={toast} />
    </ToolsShell>
  );
}

function Metric({ label, value, green, danger }) {
  return (
    <div className="metric-card">
      <span>{label}</span>

      <strong className={green ? "green-text" : danger ? "danger-text" : ""}>
        {value}
      </strong>
    </div>
  );
}

function getCategoryPresentation(categoryName) {
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

function BudgetCategory({ budget, progress, onEdit }) {
  const spent = Number(budget.spent || 0);

  const amount = Number(budget.amount || 0);

  const used = Math.min(100, Math.round(Number(budget.percentageUsed || 0)));

  const presentation = getCategoryPresentation(budget.categoryName);

  const remaining = Number(budget.remaining || 0);

  const statusLabels = {
    ON_TRACK: "On track",
    APPROACHING_LIMIT: "Approaching limit",
    AT_LIMIT: "At limit",
    OVER_BUDGET: "Over budget",
  };

  const status = statusLabels[budget.status] || budget.status || "On track";

  return (
    <div className="budget-category">
      <div className="budget-cat-head">
        {toneIcon(presentation.tone, presentation.icon)}

        <div>
          <strong>{budget.categoryName}</strong>

          <small>{status}</small>
        </div>

        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${budget.categoryName} budget`}
        >
          <Icon name="edit" size={13} />
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
        <span>{money(spent)} spent</span>

        <b>{money(amount)}</b>
      </div>

      <small className="budget-percent">
        {used}% used · {money(Math.max(0, remaining))} left
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
  const firstCategoryId = initialCategoryId || categories[0]?.categoryId || "";

  const [categoryId, setCategoryId] = useState(firstCategoryId);

  const [amount, setAmount] = useState(
    initialAmount !== "" ? String(initialAmount) : "",
  );

  const [saving, setSaving] = useState(false);

  const selectedCategory = categories.find(
    (category) => category.categoryId === categoryId,
  );

  const submit = async (e) => {
    e.preventDefault();

    const numericAmount = Number(amount);

    if (!categoryId || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    try {
      setSaving(true);

      await onSave({
        categoryId,
        amount: Number(numericAmount.toFixed(2)),
        month,
        year,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="cc-form" onSubmit={submit}>
      <label>
        Category
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={editing}
        >
          <option value="">Select category</option>

          {categories.map((category) => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      {selectedCategory && (
        <small>
          Budgeting <strong>{selectedCategory.name}</strong> for{" "}
          {new Date(year, month - 1, 1).toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          })}
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
          onChange={(e) => setAmount(e.target.value)}
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
          disabled={saving || !categoryId || !amount}
        >
          {saving ? "Saving…" : editing ? "Update budget" : "Save budget"}
        </button>
      </div>
    </form>
  );
}

function getBudgetAlertInfo(budget) {
  switch (budget.status) {
    case "OVER_BUDGET":
      return {
        title: `${budget.categoryName} is over budget`,
        description: `${money(
          Math.abs(Number(budget.remaining || 0)),
        )} over the monthly limit.`,
        tag: "Over budget",
        icon: "alert",
        tone: "pink",
      };

    case "AT_LIMIT":
      return {
        title: `${budget.categoryName} is at its limit`,
        description: `You've used the full ${money(budget.amount)} budget.`,
        tag: "At limit",
        icon: "alert",
        tone: "amber",
      };

    case "APPROACHING_LIMIT":
      return {
        title: `${budget.categoryName} is approaching its limit`,
        description: `${money(
          Math.max(0, Number(budget.remaining || 0)),
        )} remaining.`,
        tag: "Watch",
        icon: "alert",
        tone: "blue",
      };

    default:
      return {
        title: `${budget.categoryName} is on track`,
        description: `${money(
          Math.max(0, Number(budget.remaining || 0)),
        )} remaining.`,
        tag: "On track",
        icon: "check",
        tone: "teal",
      };
  }
}

function BudgetAutomation({ alertCount = 0 }) {
  const [a, setA] = useState([true, true, true, false]);

  return (
    <aside className="automation-card">
      <h3>AI alerts</h3>

      <p>Let CampusCoin watch your budgets and flag changes early.</p>

      {[
        "Approaching budget limit",
        "Unusual spend detected",
        "Weekly budget check",
        "Auto-adjust suggestions",
      ].map((x, i) => (
        <div className="toggle-row" key={x}>
          <span>{x}</span>

          <button
            type="button"
            className={a[i] ? "on" : ""}
            onClick={() =>
              setA((value) =>
                value.map((item, index) => (index === i ? !item : item)),
              )
            }
          >
            <i />
          </button>
        </div>
      ))}

      <div className="automation-note">
        <Icon name="sparkle" size={15} />

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

 const [category, setCategory] = useState("All categories");
const [kind, setKind] = useState("All transactions");
const [view, setView] = useState("Month");
const [selectedDate, setSelectedDate] = useState(now);

  const [toast, showToast] = useToast();

  useEffect(() => {
    loadReportData();
  }, []);

  async function loadReportData() {
    try {
      setLoading(true);

      const [transactionData, categoryData, budgetData] = await Promise.all([
        getTransactions(),
        getCategories(),
        getBudgets(),
      ]);

      setTransactions(Array.isArray(transactionData) ? transactionData : []);

      setCategories(Array.isArray(categoryData) ? categoryData : []);

      setBudgets(Array.isArray(budgetData) ? budgetData : []);
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
        (c) => String(c.type || "").toUpperCase() === "EXPENSE",
      ),
    [categories],
  );

  const periodTransactions = useMemo(() => {
  const selected = new Date(selectedDate);

  let start;
  let end;

  if (view === "Month") {
    start = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      1,
    );

    end = new Date(
      selected.getFullYear(),
      selected.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
  } else if (view === "Week") {
    const day = selected.getDay();

    // Monday = 0 ... Sunday = 6
    const mondayOffset = day === 0 ? -6 : 1 - day;

    start = new Date(selected);
    start.setDate(selected.getDate() + mondayOffset);
    start.setHours(0, 0, 0, 0);

    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else {
    start = new Date(selected);
    start.setHours(0, 0, 0, 0);

    end = new Date(selected);
    end.setHours(23, 59, 59, 999);
  }

  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);

    return date >= start && date <= end;
  });
}, [transactions, selectedDate, view]);

const filteredTransactions = useMemo(() => {
  let result = [...periodTransactions];

  if (category !== "All categories") {
    result = result.filter(
      (transaction) =>
        transaction.categoryName === category ||
        transaction.category?.name === category,
    );
  }

  if (kind === "Expenses") {
    result = result.filter(
      (transaction) =>
        String(transaction.type || "").toUpperCase() === "EXPENSE",
    );
  }

  if (kind === "Income") {
    result = result.filter(
      (transaction) =>
        String(transaction.type || "").toUpperCase() === "INCOME",
    );
  }

  return result;
}, [periodTransactions, category, kind]);

  const expenseTransactions = useMemo(
    () =>
      filteredTransactions.filter(
        (transaction) =>
          String(transaction.type || "").toUpperCase() === "EXPENSE",
      ),
    [filteredTransactions],
  );

  const incomeTransactions = useMemo(
    () =>
      filteredTransactions.filter(
        (transaction) =>
          String(transaction.type || "").toUpperCase() === "INCOME",
      ),
    [filteredTransactions],
  );

  const totalSpend = useMemo(
    () =>
      expenseTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount || 0),
        0,
      ),
    [expenseTransactions],
  );

  const totalIncome = useMemo(
    () =>
      incomeTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount || 0),
        0,
      ),
    [incomeTransactions],
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
  const selected = new Date(selectedDate);
  const month = selected.getMonth() + 1;
  const year = selected.getFullYear();

  return budgets
    .filter(
      (budget) =>
        Number(budget.month) === month &&
        Number(budget.year) === year,
    )
    .reduce(
      (sum, budget) => sum + Number(budget.amount || 0),
      0,
    );
}, [budgets, selectedDate]);

const monthlyBudgetSpent = useMemo(() => {
  const selected = new Date(selectedDate);
  const month = selected.getMonth();
  const year = selected.getFullYear();

  return transactions
    .filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        date.getMonth() === month &&
        date.getFullYear() === year &&
        String(transaction.type || "").toUpperCase() === "EXPENSE"
      );
    })
    .reduce(
      (sum, transaction) =>
        sum + Number(transaction.amount || 0),
      0,
    );
}, [transactions, selectedDate]);

  const remainingBudget = selectedMonthBudget - monthlyBudgetSpent;

 const monthlyData = useMemo(() => {
  const result = [];
  const selected = new Date(selectedDate);

  for (let offset = 4; offset >= 0; offset--) {
    const date = new Date(
      selected.getFullYear(),
      selected.getMonth() - offset,
      1,
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
      0,
    );

    const budget = budgets
      .filter(
        (item) =>
          Number(item.month) === month &&
          Number(item.year) === year,
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0,
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
}, [transactions, budgets, selectedDate]);

  const topCategories = categorySpending.slice(0, 5);

  const monthLabel = now.toLocaleString("en-US", {
    month: "long",
  });

  const yearLabel = now.getFullYear();

  const movePeriod = (direction) => {
  setSelectedDate((current) => {
    const next = new Date(current);

    if (view === "Month") {
      next.setMonth(next.getMonth() + direction);
    } else if (view === "Week") {
      next.setDate(next.getDate() + direction * 7);
    } else {
      next.setDate(next.getDate() + direction);
    }

    return next;
  });
};

const getPeriodLabel = () => {
  const selected = new Date(selectedDate);

  if (view === "Month") {
    return selected.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  if (view === "Week") {
    const day = selected.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    const start = new Date(selected);
    start.setDate(selected.getDate() + mondayOffset);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startLabel = start.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
    });

    const endLabel = end.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${startLabel} – ${endLabel}`;
  }

  return selected.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getInputValue = () => {
  const selected = new Date(selectedDate);

  if (view === "Month") {
    return `${selected.getFullYear()}-${String(
      selected.getMonth() + 1,
    ).padStart(2, "0")}`;
  }

  return `${selected.getFullYear()}-${String(
    selected.getMonth() + 1,
  ).padStart(2, "0")}-${String(
    selected.getDate(),
  ).padStart(2, "0")}`;
};

const handlePeriodInput = (value) => {
  if (!value) return;

  if (view === "Month") {
    const [year, month] = value.split("-").map(Number);

    setSelectedDate(
      new Date(year, month - 1, 1),
    );
    return;
  }

  const [year, month, day] = value.split("-").map(Number);

  setSelectedDate(
    new Date(year, month - 1, day),
  );
};

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

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replaceAll('"', '""')}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `campuscoin-report-${getPeriodLabel()
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setExportOpen(false);
    showToast("CSV report downloaded");
    return;
  }

  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 16;
    let y = 18;

    const green = [0, 139, 98];
    const dark = [23, 43, 77];
    const muted = [105, 119, 137];
    const light = [243, 247, 246];

    const selectedPeriod = getPeriodLabel();

    const addPageIfNeeded = (space = 12) => {
      if (y + space > pageHeight - 15) {
        doc.addPage();
        y = 18;
      }
    };

    const addSectionTitle = (title) => {
      addPageIfNeeded(18);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...dark);

      doc.text(title, margin, y);

      y += 8;
    };

    const addDivider = () => {
      doc.setDrawColor(220, 228, 232);
      doc.line(
        margin,
        y,
        pageWidth - margin,
        y,
      );

      y += 7;
    };

    // ---------------------------------------
    // HEADER
    // ---------------------------------------

    doc.setFillColor(...green);
    doc.roundedRect(
      margin,
      y,
      pageWidth - margin * 2,
      24,
      4,
      4,
      "F",
    );

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.text(
      "CampusCoin",
      margin + 8,
      y + 10,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      "Financial Report",
      margin + 8,
      y + 17,
    );

    y += 34;

    // ---------------------------------------
    // PERIOD
    // ---------------------------------------

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    doc.text(
      "Spending Report",
      margin,
      y,
    );

    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...muted);

    doc.text(
      selectedPeriod,
      margin,
      y,
    );

    y += 10;

    doc.setFontSize(8);
    doc.text(
      `View: ${view}   •   Category: ${category}   •   Type: ${kind}`,
      margin,
      y,
    );

    y += 10;

    addDivider();

    // ---------------------------------------
    // SUMMARY
    // ---------------------------------------

    addSectionTitle("Spending summary");

    const summaryWidth =
      (pageWidth - margin * 2 - 8) / 2;

    const summaryItems = [
      ["Total spending", money(totalSpend)],
      ["Total income", money(totalIncome)],
      [
        "Transactions",
        String(filteredTransactions.length),
      ],
      [
        "Remaining budget",
        selectedMonthBudget > 0
          ? money(Math.max(remainingBudget, 0))
          : "—",
      ],
    ];

    summaryItems.forEach((item, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);

      const x =
        margin +
        column * (summaryWidth + 8);

      const boxY =
        y + row * 25;

      doc.setFillColor(...light);
      doc.roundedRect(
        x,
        boxY,
        summaryWidth,
        20,
        3,
        3,
        "F",
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...muted);

      doc.text(
        item[0],
        x + 6,
        boxY + 7,
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...dark);

      doc.text(
        item[1],
        x + 6,
        boxY + 15,
      );
    });

    y += 58;

    // ---------------------------------------
    // CATEGORY BREAKDOWN
    // ---------------------------------------

    addSectionTitle("Category breakdown");

    if (categorySpending.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...muted);

      doc.text(
        "No expense data for this period.",
        margin,
        y,
      );

      y += 12;
    } else {
      categorySpending
        .slice(0, 10)
        .forEach((item) => {
          addPageIfNeeded(14);

          const percentage =
            totalSpend > 0
              ? (
                  (item.spent / totalSpend) *
                  100
                ).toFixed(1)
              : "0.0";

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...dark);

          doc.text(
            item.name,
            margin,
            y,
          );

          doc.text(
            `${money(item.spent)} (${percentage}%)`,
            pageWidth - margin,
            y,
            { align: "right" },
          );

          y += 5;

          doc.setFillColor(232, 239, 236);

          doc.roundedRect(
            margin,
            y,
            pageWidth - margin * 2,
            3,
            1.5,
            1.5,
            "F",
          );

          const barWidth =
            totalSpend > 0
              ? ((item.spent / totalSpend) *
                  (pageWidth - margin * 2))
              : 0;

          doc.setFillColor(...green);

          if (barWidth > 0) {
            doc.roundedRect(
              margin,
              y,
              barWidth,
              3,
              1.5,
              1.5,
              "F",
            );
          }

          y += 9;
        });
    }

    // ---------------------------------------
    // BUDGET
    // ---------------------------------------

    addSectionTitle("Budget vs actual");

    const budgetRows = [
      ["Budget", selectedMonthBudget > 0
        ? money(selectedMonthBudget)
        : "—"],
      ["Spent", monthlyBudgetSpent > 0
        ? money(monthlyBudgetSpent)
        : "—"],
      ["Remaining", selectedMonthBudget > 0
        ? money(Math.max(remainingBudget, 0))
        : "—"],
    ];

    budgetRows.forEach(([label, value]) => {
      addPageIfNeeded(12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...muted);

      doc.text(
        label,
        margin,
        y,
      );

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);

      doc.text(
        value,
        pageWidth - margin,
        y,
        { align: "right" },
      );

      y += 8;
    });

    y += 3;

    // ---------------------------------------
    // TRANSACTIONS
    // ---------------------------------------

    addSectionTitle("Transactions");

    if (filteredTransactions.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...muted);

      doc.text(
        "No transactions found for this period.",
        margin,
        y,
      );

      y += 12;
    } else {
      filteredTransactions.forEach(
        (transaction) => {
          addPageIfNeeded(18);

          const date = transaction.date
            ? new Date(
                transaction.date,
              ).toLocaleDateString(
                "en-NG",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                },
              )
            : "—";

          const description =
            transaction.description ||
            "Transaction";

          const transactionCategory =
            transaction.categoryName ||
            transaction.category?.name ||
            "Uncategorized";

          const amount = money(
            Number(transaction.amount || 0),
          );

          doc.setFont(
            "helvetica",
            "bold",
          );
          doc.setFontSize(8.5);
          doc.setTextColor(...dark);

          doc.text(
            description.slice(0, 55),
            margin,
            y,
          );

          doc.text(
            amount,
            pageWidth - margin,
            y,
            { align: "right" },
          );

          y += 5;

          doc.setFont(
            "helvetica",
            "normal",
          );
          doc.setFontSize(7.5);
          doc.setTextColor(...muted);

          doc.text(
            `${date}  •  ${transactionCategory}  •  ${transaction.type || ""}`,
            margin,
            y,
          );

          y += 8;
        },
      );
    }

    // ---------------------------------------
    // FOOTER
    // ---------------------------------------

    const totalPages =
      doc.internal.getNumberOfPages();

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      doc.setPage(page);

      doc.setDrawColor(
        220,
        228,
        232,
      );

      doc.line(
        margin,
        pageHeight - 12,
        pageWidth - margin,
        pageHeight - 12,
      );

      doc.setFont(
        "helvetica",
        "normal",
      );
      doc.setFontSize(7);
      doc.setTextColor(...muted);

      doc.text(
        "CampusCoin · Personal finance report",
        margin,
        pageHeight - 7,
      );

      doc.text(
        `Page ${page} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 7,
        { align: "right" },
      );
    }

    const filename =
      `campuscoin-report-${selectedPeriod
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase()}.pdf`;

    doc.save(filename);

    setExportOpen(false);
    showToast("PDF report downloaded");
  } catch (error) {
    console.error(
      "Failed to generate PDF report:",
      error,
    );

    showToast(
      "Unable to generate PDF report",
    );
  }
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
          </>
        }
      >
        <div className="report-period-controls">
  <div className="report-view-toggle">
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

  <div className="report-period-picker">
    <button
      type="button"
      className="period-arrow"
      onClick={() => movePeriod(-1)}
      aria-label={`Previous ${view.toLowerCase()}`}
    >
      ‹
    </button>

    <div className="period-current">
      <strong>{getPeriodLabel()}</strong>

      <input
        type={view === "Month" ? "month" : "date"}
        value={getInputValue()}
        onChange={(e) =>
          handlePeriodInput(e.target.value)
        }
        aria-label={`Select ${view.toLowerCase()}`}
      />
    </div>

    <button
      type="button"
      className="period-arrow"
      onClick={() => movePeriod(1)}
      aria-label={`Next ${view.toLowerCase()}`}
    >
      ›
    </button>
  </div>

  <div className="report-filter-selects">
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
  </div>
</div>

<div className="report-filter-summary">
  Showing <strong>{category}</strong> ·{" "}
  <strong>{kind}</strong> ·{" "}
  <strong>{getPeriodLabel()}</strong>
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
  transactions={transactions}
  selectedDate={selectedDate}
  view={view}
  category={category}
  kind={kind}
/>

            <TopSpenders topCategories={topCategories} />
          </div>
        )}

        <div className="report-banner">
          <Icon name="sparkle" size={16} />

          <div>
            <strong>AI report ready</strong>

            <span>
              Your report is based on your latest CampusCoin transactions and
              budgets.
            </span>
          </div>

          <button type="button" onClick={() => navigate("/ai-insights")}>
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

function CategoryReport({ categorySpending, totalSpend }) {
  const max = Math.max(...categorySpending.map((item) => item.spent), 1);

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
          <span>No expense data for this period.</span>
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
    ...monthlyData.flatMap((item) => [item.budget, item.spent]),
    1,
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
                    item.budget > 0 ? `${(item.budget / max) * 100}%` : "4%",
                }}
              />

              <b
                style={{
                  height:
                    item.spent > 0 ? `${(item.spent / max) * 100}%` : "4%",
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
          <b>{selectedMonthBudget > 0 ? money(selectedMonthBudget) : "—"}</b>
        </span>

        <span>
          Spent
          <b>{monthlyBudgetSpent > 0 ? money(monthlyBudgetSpent) : "—"}</b>
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
  transactions,
  selectedDate,
  view,
  category,
  kind,
}) {
  const data = useMemo(() => {
    const selected = new Date(selectedDate);

    let start;
    let count;

    if (view === "Month") {
      start = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        1,
      );

      count = new Date(
        selected.getFullYear(),
        selected.getMonth() + 1,
        0,
      ).getDate();
    } else if (view === "Week") {
      const day = selected.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;

      start = new Date(selected);
      start.setDate(
        selected.getDate() + mondayOffset,
      );

      count = 7;
    } else {
      start = new Date(selected);
      count = 1;
    }

    start.setHours(0, 0, 0, 0);

    const values = [];

    for (let index = 0; index < count; index++) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      const total = transactions
        .filter((transaction) => {
          const transactionDate = new Date(
            transaction.date,
          );

          if (
            transactionDate.getFullYear() !==
              date.getFullYear() ||
            transactionDate.getMonth() !==
              date.getMonth() ||
            transactionDate.getDate() !==
              date.getDate()
          ) {
            return false;
          }

          if (
            String(transaction.type || "").toUpperCase() !==
            "EXPENSE"
          ) {
            return false;
          }

          if (category !== "All categories") {
            const transactionCategory =
              transaction.categoryName ||
              transaction.category?.name;

            if (
              transactionCategory !== category
            ) {
              return false;
            }
          }

          return true;
        })
        .reduce(
          (sum, transaction) =>
            sum + Number(transaction.amount || 0),
          0,
        );

      values.push({
        date,
        total,
      });
    }

    return values;
  }, [transactions, selectedDate, view, category, kind]);

  const max = Math.max(
    ...data.map((item) => item.total),
    1,
  );

  const formatLabel = (date) => {
    if (view === "Month") {
      return String(date.getDate());
    }

    if (view === "Week") {
      return date.toLocaleString("en-US", {
        weekday: "short",
      });
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (date) =>
    date.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const periodTotal = data.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  return (
    <div className="report-card daily-card">
      <div className="report-card-title">
        <div>
          <strong>Daily spending</strong>

          <small>
            {view === "Month"
              ? "Each day of the selected month"
              : view === "Week"
                ? "Each day of the selected week"
                : "Selected day"}
          </small>
        </div>

        <div className="daily-total">
          {money(periodTotal)}
        </div>
      </div>

      <div
        className={`daily-chart daily-chart-${view.toLowerCase()}`}
      >
        <div className="daily-bars filled">
          {data.map((item) => (
            <i
              key={item.date.toISOString()}
              style={{
                height:
                  item.total > 0
                    ? `${Math.max(
                        (item.total / max) * 100,
                        5,
                      )}%`
                    : "3%",
              }}
              title={`${formatFullDate(item.date)} · ${money(
                item.total,
              )}`}
            />
          ))}
        </div>

        <div className="daily-day-labels">
          {data.map((item) => (
            <span
              key={item.date.toISOString()}
              title={formatFullDate(item.date)}
            >
              {formatLabel(item.date)}
            </span>
          ))}
        </div>
      </div>

      {view === "Day" && (
        <div className="daily-selected-date">
          {formatFullDate(selectedDate)}
        </div>
      )}

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

function ExportModal({ onClose, onExport }) {
  const [format, setFormat] = useState("PDF report");
  const [ai, setAi] = useState(true);

  const [items, setItems] = useState([true, true, true, true]);

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
              name={item.startsWith("PDF") ? "receipt" : "download"}
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
                    itemIndex === index ? event.target.checked : value,
                  ),
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
        <button type="button" onClick={onClose}>
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
  : "Download PDF"}
        </button>
      </div>
    </Modal>
  );
}

function getCurrentReportMonth() {
  const now = new Date();
  return `${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
}

function isReportInsight(notification) {
  return (
    String(notification?.placement || "").toUpperCase() ===
    "ANNOUNCEMENT"
  );
}

function isReportTip(notification) {
  return (
    String(notification?.placement || "").toUpperCase() === "TIPS"
  );
}

function AIInsightsPage() {
  const [dark, setDark] = useState(false);
  const [notify, setNotify] = useState(false);
  const [insight, setInsight] = useState(null);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, showToast] = useToast();

  const loadReport = async () => {
    try {
      setLoading(true);
      const notifications = await getNotifications();
      const list = Array.isArray(notifications) ? notifications : [];

      setInsight(
        list.find(isReportInsight) || null
      );
      setTips(
        list.filter(isReportTip).slice(0, 2)
      );

      try {
        const bookmarks = await getBookmarks();
        setSaved(
          Array.isArray(bookmarks) &&
            Boolean(
              list.find(isReportInsight) &&
                bookmarks.some(
                  (bookmark) =>
                    bookmark.type === "INSIGHT" &&
                    bookmark.title ===
                      list.find(isReportInsight)?.title
                )
            )
        );
      } catch {
        setSaved(false);
      }
    } catch (error) {
      console.error("Failed to load AI report:", error);
      showToast(error.message || "Unable to load AI insight");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  useEffect(() => {
    const handleAiUpdated = () => loadReport();
    window.addEventListener("campuscoin:ai-updated", handleAiUpdated);
    return () =>
      window.removeEventListener(
        "campuscoin:ai-updated",
        handleAiUpdated
      );
  }, []);

  const generateReport = async () => {
    if (generating) return;

    try {
      setGenerating(true);
      await generateMonthlyReport(getCurrentReportMonth());
      window.dispatchEvent(new CustomEvent("campuscoin:ai-updated"));
      await loadReport();
      showToast("Your financial insight and saving tips are ready");
    } catch (error) {
      console.error("Failed to generate AI report:", error);
      showToast(
        error.message || "Unable to generate your financial report"
      );
    } finally {
      setGenerating(false);
    }
  };

  const saveInsight = async () => {
    if (!insight || saved) return;

    try {
      await createBookmark({
        type: "INSIGHT",
        title: insight.title,
        content: insight.message,
      });
      setSaved(true);
      showToast("Insight saved to Bookmarks");
    } catch (error) {
      showToast(error.message || "Unable to save insight");
    }
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
        description="Clear, useful patterns generated from your actual financial activity."
        actions={
          <>
            <button
              className="tool-btn"
              type="button"
              onClick={saveInsight}
              disabled={!insight || saved}
            >
              <Icon name="bookmark" size={14} />
              {saved ? "Saved" : "Save insight"}
            </button>

            <button
              className="tool-primary"
              type="button"
              onClick={generateReport}
              disabled={generating}
            >
              <Icon name="refresh" size={14} />
              {generating ? "Generating…" : "Generate insight"}
            </button>
          </>
        }
      >
        {loading ? (
          <div className="ai-state-card">
            <strong>Loading your latest financial insight…</strong>
            <span>Reading the latest AI report from your account.</span>
          </div>
        ) : !insight ? (
          <div className="ai-state-card">
            <div className="ai-state-icon">
              <Icon name="sparkle" size={20} />
            </div>
            <strong>No AI insight has been generated yet</strong>
            <span>
              Generate a report to analyze your income, expenses, budgets and
              savings activity.
            </span>
            <button
              type="button"
              className="tool-primary"
              onClick={generateReport}
              disabled={generating}
            >
              {generating ? "Generating…" : "Generate my insight"}
            </button>
          </div>
        ) : (
          <div className="ai-layout">
            <div>
              <article className="insight-hero ai-readable-card">
                <div className="insight-icon">
                  <Icon name="sparkle" size={19} />
                </div>

                <div className="ai-readable-copy">
                  <span className="ai-content-kind">AI Insight</span>
                  <strong>{insight.title}</strong>

                  <small>
                    Generated{" "}
                    {new Date(insight.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </small>

                  <p>{insight.message}</p>

                  <div className="insight-actions">
                    <button type="button" onClick={saveInsight}>
                      {saved ? "Saved" : "Save insight"}
                    </button>
                  </div>
                </div>
              </article>

              <h3 className="section-mini-title">
                Personalized saving tips
              </h3>

              <div className="opportunity-grid">
                {tips.length ? (
                  tips.map((tip) => (
                    <article
                      className="opportunity ai-readable-card"
                      key={tip.notificationId}
                    >
                      <div className="opp-head">
                        {toneIcon("mint", "bulb")}
                        <div>
                          <strong>{tip.title}</strong>
                          <small>AI saving tip</small>
                        </div>
                      </div>

                      <p>{tip.message}</p>

                      <button
                        className="tool-primary"
                        type="button"
                        onClick={() =>
                          navigate("/saving-tips")
                        }
                      >
                        View saving tips
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="ai-state-card compact">
                    <strong>No saving tips yet</strong>
                    <span>
                      Generate a new report to create personalized tips.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <aside className="insight-side">
              <h3>Report actions</h3>

              <div className="ai-side-message">
                <strong>Insight and tips are linked</strong>
                <p>
                  Generating a new report creates the matching insight and
                  saving tips automatically.
                </p>
              </div>

              <button
                type="button"
                className="tool-primary"
                onClick={() => navigate("/saving-tips")}
              >
                View saving tips
              </button>
            </aside>
          </div>
        )}
      </PageFrame>

      <ActionToast message={toast} />
    </ToolsShell>
  );
}

function SavingTipsPage() {
  const [dark, setDark] = useState(false);
  const [notify, setNotify] = useState(false);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [toast, showToast] = useToast();

  const loadTips = async () => {
    try {
      setLoading(true);
      const notifications = await getNotifications();
      const list = Array.isArray(notifications) ? notifications : [];
      setTips(list.filter(isReportTip).slice(0, 10));
    } catch (error) {
      console.error("Failed to load saving tips:", error);
      showToast(error.message || "Unable to load saving tips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTips();
  }, []);

  useEffect(() => {
    const handleAiUpdated = () => loadTips();
    window.addEventListener("campuscoin:ai-updated", handleAiUpdated);
    return () =>
      window.removeEventListener(
        "campuscoin:ai-updated",
        handleAiUpdated
      );
  }, []);

  const generateTips = async () => {
    if (generating) return;

    try {
      setGenerating(true);

      await generateMonthlyReport(getCurrentReportMonth());

      window.dispatchEvent(new CustomEvent("campuscoin:ai-updated"));

      // The requested flow: after generating tips, take the user to
      // the newly generated insight automatically.
      navigate("/ai-insights");
    } catch (error) {
      console.error("Failed to generate saving tips:", error);
      showToast(
        error.message || "Unable to generate saving tips"
      );
    } finally {
      setGenerating(false);
    }
  };

  const saveTip = async (tip) => {
    try {
      await createBookmark({
        type: "TIP",
        title: tip.title,
        content: tip.message,
      });
      showToast("Saving tip saved to Bookmarks");
    } catch (error) {
      showToast(error.message || "Unable to save saving tip");
    }
  };

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
        description="Personalized suggestions generated from your latest financial activity."
        actions={
          <button
            className="tool-primary"
            type="button"
            onClick={generateTips}
            disabled={generating}
          >
            <Icon name="sparkle" size={14} />
            {generating ? "Generating…" : "Generate tips"}
          </button>
        }
      >
        <div className="saving-metrics">
          <div className="saving-score">
            <Icon name="sparkle" size={16} />
            <span>Personalized tips</span>
            <strong>{tips.length}</strong>
          </div>
          <Metric label="Tips ready" value={String(tips.length)} />
          <Metric label="Source" value="AI report" />
          <Metric label="Updated" value="Latest" />
        </div>

        <div className="tip-list ai-tip-list">
          {loading ? (
            <div className="ai-state-card">
              <strong>Loading your saving tips…</strong>
              <span>Getting the latest AI recommendations.</span>
            </div>
          ) : tips.length === 0 ? (
            <div className="ai-state-card">
              <div className="ai-state-icon">
                <Icon name="bulb" size={20} />
              </div>
              <strong>No saving tips have been generated yet</strong>
              <span>
                Generate your monthly report and CampusCoin will create
                personalized tips from your actual spending.
              </span>
              <button
                type="button"
                className="tool-primary"
                onClick={generateTips}
                disabled={generating}
              >
                {generating ? "Generating…" : "Generate tips"}
              </button>
            </div>
          ) : (
            tips.map((tip) => (
              <article
                className="tip-row tip-row-clickable"
                key={tip.notificationId}
                onClick={() => setSelectedTip(tip)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedTip(tip);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {toneIcon("mint", "bulb")}

                <div className="tip-copy">
                  <strong>{tip.title}</strong>
                  <small>{tip.message}</small>
                </div>

                <span className="tip-open-label">Read</span>
                <Icon name="chevron" size={14} />
              </article>
            ))
          )}
        </div>

        <div className="saving-note">
          <Icon name="info" size={14} />
          Generate a new report whenever you want fresh advice based on your
          latest financial activity.
        </div>
      </PageFrame>

      {selectedTip && (
        <Modal
          title={selectedTip.title}
          description="Personalized saving tip"
          onClose={() => setSelectedTip(null)}
        >
          <div className="ai-modal-content">
            <div className="ai-modal-icon">
              <Icon name="bulb" size={19} />
            </div>
            <p>{selectedTip.message}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setSelectedTip(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="tool-primary"
                onClick={() => saveTip(selectedTip)}
              >
                Save to Bookmarks
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ActionToast message={toast} />
    </ToolsShell>
  );
}

function BookmarksPage() {
  const [dark, setDark] = useState(false);
  const [notify, setNotify] = useState(false);

  const [tab, setTab] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [search, setSearch] = useState("");

 const [items, setItems] = useState([]);
const [bookmarksLoading, setBookmarksLoading] = useState(true);
const [bookmarksError, setBookmarksError] = useState("");

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");

  const [modal, setModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [viewingBookmark, setViewingBookmark] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);

  const [toast, showToast] = useToast();

  const getBookmarkPresentation = (bookmark) => {
  if (bookmark.type === "INSIGHT") {
    return {
      type: "Insights",
      tone: "blue",
      icon: "sparkle",
      label: "Saved insight",
    };
  }

  return {
    type: "Tips",
    tone: "amber",
    icon: "bulb",
    label: "Saving tip",
  };
};

  const loadBookmarks = async () => {
  try {
    setBookmarksLoading(true);
    setBookmarksError("");

    const data = await getBookmarks();

    setItems(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error(
      "Failed to load bookmarks:",
      error,
    );

    setBookmarksError(
      error.message ||
        "Unable to load your bookmarks.",
    );
  } finally {
    setBookmarksLoading(false);
  }
};

  const loadNotes = async () => {
    try {
      setNotesLoading(true);
      setNotesError("");

      const data = await getNotes();

      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load notes:", error);

      setNotesError(
        error.message || "Unable to load your notes.",
      );
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
  loadNotes();
  loadBookmarks();
}, []);

  const normalizedSearch = search.trim().toLowerCase();

const filteredBookmarks = useMemo(() => {
  let result = [...items];

  if (tab === "Tips") {
    result = result.filter(
      (item) => item.type === "TIP",
    );
  }

  if (tab === "Insights") {
    result = result.filter(
      (item) => item.type === "INSIGHT",
    );
  }

  if (sort === "Newest") {
    result.sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0),
    );
  }

  if (sort === "A–Z") {
    result.sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }

  return result;
}, [items, tab, sort]);

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (normalizedSearch) {
      result = result.filter(
        (note) =>
          note.title
            ?.toLowerCase()
            .includes(normalizedSearch) ||
          note.content
            ?.toLowerCase()
            .includes(normalizedSearch),
      );
    }

    if (sort === "Newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0),
      );
    }

    if (sort === "Oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0),
      );
    }

    if (sort === "A–Z") {
      result.sort((a, b) =>
        a.title.localeCompare(b.title),
      );
    }

    if (sort === "Z–A") {
      result.sort((a, b) =>
        b.title.localeCompare(a.title),
      );
    }

    if (sort === "Recently updated") {
      result.sort(
        (a, b) =>
          new Date(b.updatedAt || 0) -
          new Date(a.updatedAt || 0),
      );
    }

    return result;
  }, [
    notes,
    sort,
    normalizedSearch,
  ]);

  const totalSaved =
    items.length + notes.length;

  const isNotesTab = tab === "Notes";
  const isAllTab = tab === "All";

  const showBookmarks =
  tab === "All" ||
  tab === "Tips" ||
  tab === "Insights";

const showNotes =
  tab === "All" ||
  tab === "Notes";

  const handleRemoveBookmark = async (bookmarkId) => {
  try {
    await deleteBookmark(bookmarkId);

    setItems((current) =>
      current.filter(
        (item) =>
          item.bookmarkId !== bookmarkId,
      ),
    );

    showToast("Bookmark removed");
  } catch (error) {
    console.error(
      "Failed to remove bookmark:",
      error,
    );

    showToast(
      error.message ||
        "Failed to remove bookmark",
    );
  }
};

const handleCreateBookmark = async (
  type,
  title,
  content,
) => {
  try {
    const created = await createBookmark({
      type,
      title,
      content,
    });

    setItems((current) => [
      created,
      ...current,
    ]);

    setModal(false);

    showToast("Bookmark saved");
  } catch (error) {
    console.error(
      "Failed to create bookmark:",
      error,
    );

    showToast(
      error.message ||
        "Failed to save bookmark",
    );
  }
};

  const handleOpenBookmark = (item) => {
    if (item.type === "INSIGHT") {
      navigate("/ai-insights");
      return;
    }

    if (item.type === "TIP") {
      navigate("/saving-tips");
      return;
    }
  };

  const handleCreateNote = async ({
    title,
    content,
  }) => {
    try {
      const created = await createNote({
        title,
        content,
      });

      setNotes((current) => [
        created,
        ...current,
      ]);

      setModal(false);

      showToast("Note saved");
    } catch (error) {
      console.error(
        "Failed to create note:",
        error,
      );

      showToast(
        error.message || "Failed to save note",
      );
    }
  };

  const handleUpdateNote = async ({
    title,
    content,
  }) => {
    if (!editingNote) return;

    try {
      const updated = await updateNote(
        editingNote.noteId,
        {
          title,
          content,
        },
      );

      setNotes((current) =>
        current.map((note) =>
          note.noteId === updated.noteId
            ? updated
            : note,
        ),
      );

      setEditingNote(null);

      showToast("Note updated");
    } catch (error) {
      console.error(
        "Failed to update note:",
        error,
      );

      showToast(
        error.message ||
          "Failed to update note",
      );
    }
  };

  const handleDeleteNote = async () => {
    if (!deletingNote) return;

    try {
      await deleteNote(
        deletingNote.noteId,
      );

      setNotes((current) =>
        current.filter(
          (note) =>
            note.noteId !==
            deletingNote.noteId,
        ),
      );

      setDeletingNote(null);

      showToast("Note removed");
    } catch (error) {
      console.error(
        "Failed to delete note:",
        error,
      );

      showToast(
        error.message ||
          "Failed to remove note",
      );
    }
  };

  const clearSearch = () => {
    setSearch("");
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
        description="Keep useful insights, tips and personal notes close at hand."
        actions={
          <>
            <button
  className="tool-primary"
  type="button"
  onClick={() => {
    if (isNotesTab) {
      setEditingNote(null);
      setModal(true);
    } else {
      setModal(true);
    }
  }}
>
  <Icon
    name={isNotesTab ? "edit" : "bookmark"}
    size={14}
  />
  {isNotesTab ? "New note" : "New bookmark"}
</button>

            <select
              className="tool-btn-select"
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
              aria-label="Sort saved items"
            >
              <option value="Newest">
                Newest
              </option>
              <option value="Oldest">
                Oldest
              </option>
              <option value="A–Z">
                A–Z
              </option>
              <option value="Z–A">
                Z–A
              </option>
              <option value="Recently updated">
                Recently updated
              </option>
            </select>
          </>
        }
      >
        <div className="bookmark-toolbar">
          <div className="bookmark-search">
            <Icon
              name="search"
              size={14}
            />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search bookmarks and notes..."
              aria-label="Search bookmarks and notes"
            />

            {search && (
              <button
                type="button"
                className="bookmark-search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="bookmark-count">
            {totalSaved} saved item
            {totalSaved === 1 ? "" : "s"}
          </div>
        </div>

 <div className="bookmark-tabs">
  {[
    ["All", items.length],
    [
      "Tips",
      items.filter(
        (item) => item.type === "TIP",
      ).length,
    ],
    [
      "Insights",
      items.filter(
        (item) => item.type === "INSIGHT",
      ).length,
    ],
    ["Notes", notes.length],
  ].map(([name, count]) => (
    <button
      type="button"
      key={name}
      className={tab === name ? "active" : ""}
      onClick={() => setTab(name)}
    >
      {name}
      <span>{count}</span>
    </button>
  ))}
</div>

        <div className="saved-sections">
          {showNotes && (
            <section className="saved-section">
              <div className="saved-section-heading">
                <div>
                  <h2>Personal notes</h2>
                  <p>Private reminders you created.</p>
                </div>
                <span>{notes.length}</span>
              </div>

              <div className="bookmark-grid notes-grid">
                {notesLoading && (
                  <div className="bookmark-empty" role="status">
                    <strong>Loading your notes…</strong>
                    <span>Getting your saved notes.</span>
                  </div>
                )}

                {!notesLoading && notesError && (
                  <div className="bookmark-empty bookmark-empty-error">
                    <strong>We couldn't load your notes</strong>
                    <span>{notesError}</span>
                    <button
                      type="button"
                      className="tool-primary"
                      onClick={loadNotes}
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!notesLoading &&
                  !notesError &&
                  filteredNotes.length === 0 && (
                    <div className="bookmark-empty">
                      <div className="bookmark-empty-icon">
                        <Icon name="edit" size={18} />
                      </div>
                      <strong>
                        {search ? "No notes found" : "No notes yet"}
                      </strong>
                      <span>
                        {search
                          ? "Try a different search term."
                          : "Create a personal note to keep an important reminder close at hand."}
                      </span>
                      {!search && (
                        <button
                          type="button"
                          className="tool-primary"
                          onClick={() => {
                            setEditingNote(null);
                            setModal(true);
                          }}
                        >
                          Create note
                        </button>
                      )}
                    </div>
                  )}

                {!notesLoading &&
                  !notesError &&
                  filteredNotes.map((note) => (
                    <article
                      className="bookmark-card note-card"
                      key={note.noteId}
                    >
                      <div className="bookmark-card-icon teal">
                        <Icon name="edit" size={16} />
                      </div>

                      <div className="bookmark-head">
                        <strong>{note.title}</strong>
                        <button
                          className="bookmark-menu-button"
                          type="button"
                          onClick={() => setViewingNote(note)}
                          aria-label={`Open ${note.title}`}
                        >
                          •••
                        </button>
                      </div>

                      <div className="bookmark-type-label">
                        <Icon name="receipt" size={11} />
                        Personal note
                      </div>

                      <p>{note.content}</p>

                      <small className="note-updated">
                        Updated {formatNoteDate(note.updatedAt)}
                      </small>

                      <div className="bookmark-actions">
                        <button
                          type="button"
                          onClick={() => setViewingNote(note)}
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNote(note)}
                        >
                          <Icon name="edit" size={12} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="bookmark-danger-action"
                          onClick={() => setDeletingNote(note)}
                        >
                          <Icon name="trash" size={12} />
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          )}

          {showBookmarks && (
            <section className="saved-section">
              <div className="saved-section-heading">
                <div>
                  <h2>Bookmarks</h2>
                  <p>Save a saving tip or monthly insight for later reference.</p>
                </div>
                <span>{items.length}</span>
              </div>

              <div className="bookmark-grid">
                {bookmarksLoading && (
                  <div className="bookmark-empty" role="status">
                    <strong>Loading bookmarks…</strong>
                    <span>Getting your saved items.</span>
                  </div>
                )}

                {!bookmarksLoading && bookmarksError && (
                  <div className="bookmark-empty">
                    <strong>We couldn't load your bookmarks.</strong>
                    <span>{bookmarksError}</span>
                    <button
                      type="button"
                      className="tool-primary"
                      onClick={loadBookmarks}
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!bookmarksLoading &&
                  !bookmarksError &&
                  filteredBookmarks.length === 0 && (
                    <div className="bookmark-empty">
                      <div className="bookmark-empty-icon">
                        <Icon name="bookmark" size={18} />
                      </div>
                      <strong>No bookmarks yet</strong>
                      <span>
                        Save a useful saving tip or monthly insight to see it here.
                      </span>
                    </div>
                  )}

                {!bookmarksLoading &&
                  !bookmarksError &&
                  filteredBookmarks.map((bookmark) => {
                    const isInsight = bookmark.type === "INSIGHT";
                    return (
                      <article
                        className="bookmark-card bookmark-card-clickable"
                        key={bookmark.bookmarkId}
                        onClick={() => setViewingBookmark(bookmark)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setViewingBookmark(bookmark);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {toneIcon(
                          isInsight ? "blue" : "amber",
                          isInsight ? "sparkle" : "bulb"
                        )}

                        <div className="bookmark-head">
                          <strong>{bookmark.title}</strong>
                          <span className="bookmark-type-chip">
                            {isInsight ? "Insight" : "Tip"}
                          </span>
                        </div>

                        <p>{bookmark.content}</p>

                        <small className="note-updated">
                          Saved {formatNoteDate(bookmark.createdAt)}
                        </small>

                        <div className="bookmark-actions">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setViewingBookmark(bookmark);
                            }}
                          >
                            Open
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setViewingBookmark(bookmark);
                            }}
                          >
                            Read
                          </button>

                          <button
                            type="button"
                            className="bookmark-danger-action"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemoveBookmark(bookmark.bookmarkId);
                            }}
                          >
                            <Icon name="trash" size={13} />
                            Remove
                          </button>
                        </div>
                      </article>
                    );
                  })}
              </div>
            </section>
          )}
        </div>
      </PageFrame>

      {!isNotesTab && modal && (
  <Modal
    title="New bookmark"
    description="Save a useful tip or insight for later."
    onClose={() => setModal(false)}
  >
    <BookmarkForm
      onClose={() => setModal(false)}
      onSave={handleCreateBookmark}
    />
  </Modal>
)}

{isNotesTab && modal && (
  <Modal
    title="New note"
    description="Keep a useful personal reminder close at hand."
    onClose={() => setModal(false)}
  >
    <NoteForm
      submitLabel="Save note"
      onClose={() => setModal(false)}
      onSave={handleCreateNote}
    />
  </Modal>
)}

      {viewingBookmark && (
        <Modal
          title={viewingBookmark.title}
          description={
            viewingBookmark.type === "INSIGHT"
              ? "Saved AI insight"
              : "Saved saving tip"
          }
          onClose={() => setViewingBookmark(null)}
        >
          <div className="ai-modal-content bookmark-viewer">
            <div
              className={`ai-modal-icon ${
                viewingBookmark.type === "INSIGHT" ? "blue" : "mint"
              }`}
            >
              <Icon
                name={
                  viewingBookmark.type === "INSIGHT"
                    ? "sparkle"
                    : "bulb"
                }
                size={19}
              />
            </div>

            <div className="bookmark-type-label">
              {viewingBookmark.type === "INSIGHT"
                ? "Monthly insight"
                : "Saving tip"}
            </div>

            <p>{viewingBookmark.content}</p>

            <div className="modal-actions">
              <button
                type="button"
                className="tool-primary"
                onClick={() => {
                  const path =
                    viewingBookmark.type === "INSIGHT"
                      ? "/ai-insights"
                      : "/saving-tips";
                  setViewingBookmark(null);
                  navigate(path);
                }}
              >
                Open full page
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setViewingBookmark(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editingNote && (
        <Modal
          title="Edit note"
          description="Update your note and save your changes."
          onClose={() =>
            setEditingNote(null)
          }
        >
          <NoteForm
            initialNote={editingNote}
            submitLabel="Save changes"
            onClose={() =>
              setEditingNote(null)
            }
            onSave={
              handleUpdateNote
            }
          />
        </Modal>
      )}

      {viewingNote && (
        <Modal
          title={viewingNote.title}
          description={`Updated ${formatNoteDate(
            viewingNote.updatedAt,
          )}`}
          onClose={() =>
            setViewingNote(null)
          }
        >
          <div className="note-viewer">
            <div className="bookmark-type-label">
              <Icon
                name="receipt"
                size={11}
              />
              Personal note
            </div>

            <p>
              {viewingNote.content}
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setViewingNote(null);
                  setEditingNote(
                    viewingNote,
                  );
                }}
              >
                Edit note
              </button>

              <button
                type="button"
                className="tool-primary"
                onClick={() =>
                  setViewingNote(null)
                }
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deletingNote && (
        <Modal
          title="Remove note?"
          description={`This will permanently remove “${deletingNote.title}”.`}
          onClose={() =>
            setDeletingNote(null)
          }
        >
          <div className="modal-actions">
            <button
              type="button"
              className="ghost-btn"
              onClick={() =>
                setDeletingNote(null)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="danger-btn"
              onClick={
                handleDeleteNote
              }
            >
              Remove note
            </button>
          </div>
        </Modal>
      )}

      <ActionToast message={toast} />
    </ToolsShell>
  );
}

function formatNoteDate(value) {
  if (!value) return "just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function NoteForm({ initialNote = null, onClose, onSave, submitLabel }) {
  const [title, setTitle] = useState(initialNote?.title || "");
  const [content, setContent] = useState(initialNote?.content || "");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || saving) return;

    try {
      setSaving(true);
      await onSave({
        title: title.trim(),
        content: content.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="cc-form" onSubmit={submit}>
      <label>
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Lecture week checklist"
          maxLength={255}
          required
        />
      </label>
      <label>
        Note
        <textarea
          rows="6"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What should you remember?"
          maxLength={10000}
          required
        />
      </label>
      <div className="modal-actions">
        <button type="button" className="ghost-btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          className="tool-primary"
          disabled={saving || !title.trim() || !content.trim()}
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function BookmarkForm({ onClose, onSave }) {
  const [type, setType] = useState("TIP");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  return (
    <form
      className="cc-form"
      onSubmit={(e) => {
        e.preventDefault();

        if (
          type &&
          title.trim() &&
          text.trim()
        ) {
          onSave(
            type,
            title.trim(),
            text.trim(),
          );
        }
      }}
    >
      <label>
        Type

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
          required
        >
          <option value="TIP">
            Saving Tip
          </option>

          <option value="INSIGHT">
            AI Insight
          </option>
        </select>
      </label>

      <label>
        Title

        <input
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="e.g. October budget plan"
          required
        />
      </label>

      <label>
        Note

        <textarea
          rows="4"
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          placeholder="What should you remember?"
          required
        />
      </label>

      <div className="modal-actions">
        <button
          type="button"
          className="ghost-btn"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="tool-primary"
        >
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
  const [dark, setDark] = useState(false);
  const [notify, setNotify] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [active, setActive] = useState("Profile & goals");
  const [toast, showToast] = useToast();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [mobileSectionOpen, setMobileSectionOpen] = useState(false);

  const profileSaveRef = useRef(null);
  const profileDiscardRef = useRef(null);

  const sections = [
    ["Profile & goals", "settings-profile", "settings"],
    ["Budget preferences", "settings-preferences", "target"],
    ["Notifications", "settings-notifications", "bell"],
    ["Security", "settings-security", "settings"],
  ];

  const jump = (name) => {
    setActive(name);
    setMobileSectionOpen(false);

    const id = sections.find((x) => x[0] === name)?.[1];

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const save = async () => {
    if (!hasChanges) return;

    try {
      await profileSaveRef.current?.();

      setSaved(true);
      setHasChanges(false);

      showToast("Your settings have been saved");
    } catch (error) {
      setSaved(false);

      showToast(
        error?.message || "Unable to save your settings",
      );
    }
  };

  const discard = () => {
    if (!hasChanges) return;

    profileDiscardRef.current?.();

    setSaved(false);
    setHasChanges(false);

    showToast("Unsaved changes discarded");
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
        description="Your details, goals, preferences and security."
      >
        <div className="settings-mobile-selector">
          <button
            type="button"
            onClick={() =>
              setMobileSectionOpen((v) => !v)
            }
          >
            <span>{active}</span>
            <Icon name="chevron" size={14} />
          </button>

          {mobileSectionOpen && (
            <div className="settings-mobile-menu">
              {sections.map(([label, , icon]) => (
                <button
                  type="button"
                  key={label}
                  className={
                    active === label ? "active" : ""
                  }
                  onClick={() => jump(label)}
                >
                  <Icon name={icon} size={14} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="settings-layout settings-layout-v2">
          <aside className="settings-nav">
            {sections.map(([label, , icon]) => (
              <button
                type="button"
                key={label}
                className={
                  active === label ? "active" : ""
                }
                onClick={() => jump(label)}
              >
                <Icon name={icon} size={15} />
                <span>{label}</span>
              </button>
            ))}
          </aside>

          <div className="settings-main settings-main-v2">
            <div id="settings-profile">
              <SettingsProfileV2
                saveRef={profileSaveRef}
                discardRef={profileDiscardRef}
                showToast={showToast}
                onDirtyChange={setHasChanges}
              />
            </div>

            {/* 
              <div id="settings-preferences">
                <SettingsGoals />
                <SettingsBudgetPreferences
                  showToast={showToast}
                />
              </div>
            */}

            <div id="settings-preferences">
              <SettingsBudgetPreferences
                showToast={showToast}
              />
            </div>

            <div id="settings-notifications">
              <SettingsNotificationsV2 />
            </div>

            <div id="settings-security">
              <SettingsSecurityV2
                onPassword={() =>
                  setPasswordOpen(true)
                }
                showToast={showToast}
              />
            </div>

            <div className="settings-footer settings-footer-v2">
              <button
                className="tool-primary"
                type="button"
                onClick={save}
                disabled={!hasChanges}
              >
                <Icon name="check" size={14} />
                Save changes
              </button>

              {saved && !hasChanges && (
                <span className="settings-saved">
                  <Icon name="check" size={12} />
                  Changes saved
                </span>
              )}

              <button
                className="ghost-btn"
                type="button"
                onClick={discard}
                disabled={!hasChanges}
              >
                Discard
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
            onClose={() =>
              setPasswordOpen(false)
            }
            onSave={() => {
              setPasswordOpen(false);
              showToast(
                "Password updated successfully",
              );
            }}
          />
        </Modal>
      )}

      <ActionToast message={toast} />
    </ToolsShell>
  );
}


function SettingsProfileV2({
  saveRef,
  discardRef,
  showToast,
  onDirtyChange,
}) {
  const session = getStudentSession();

  const [name, setName] = useState(
    session?.name || "",
  );

  const [email, setEmail] = useState(
    session?.email || "",
  );

  const [year, setYear] = useState(
    session?.academicYear || "Year 1",
  );

  const [currency, setCurrency] = useState(
    "NGN · ₦",
  );

  const [photo, setPhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
   * Stores the last successfully saved profile values.
   *
   * This is what Discard will restore.
   */
  const savedProfileRef = useRef({
    name: session?.name || "",
    year: session?.academicYear || "Year 1",
  });

  // --------------------------------------------------
  // LOAD PROFILE
  // --------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        setProfileLoading(true);
        setError("");

        const profile = await getProfile();

        if (!mounted) return;

        const loadedName = profile?.name || "";
        const loadedEmail = profile?.email || "";
        const loadedYear =
          profile?.academicYear || "Year 1";

        setName(loadedName);
        setEmail(loadedEmail);
        setYear(loadedYear);

        /*
         * These values came from the backend,
         * therefore they are the current saved values.
         */
        savedProfileRef.current = {
          name: loadedName,
          year: loadedYear,
        };

        // Profile is clean when first loaded.
        onDirtyChange?.(false);

        const currentSession =
          getStudentSession() || {};

        localStorage.setItem(
          "campuscoin.student.auth",
          JSON.stringify({
            ...currentSession,
            name: profile?.name,
            email: profile?.email,
            academicYear:
              profile?.academicYear,
            monthlySavingsGoal:
              profile?.monthlySavingsGoal,
            monthlyIncome:
              profile?.monthlyIncome,
          }),
        );

        if (profile?.profilePhotoAvailable) {
          const photoUrl =
            await loadProfilePhoto();

          if (mounted) {
            setPhoto(photoUrl);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.message ||
              "Unable to load your profile",
          );
        }
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [onDirtyChange]);

  // --------------------------------------------------
  // CLEAN UP PHOTO URL
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      if (photo?.startsWith("blob:")) {
        URL.revokeObjectURL(photo);
      }
    };
  }, [photo]);

  // --------------------------------------------------
  // CHECK FOR UNSAVED CHANGES
  // --------------------------------------------------

  const checkForChanges = (
    nextName,
    nextYear,
  ) => {
    const saved =
      savedProfileRef.current;

    const dirty =
      nextName.trim() !==
        saved.name.trim() ||
      nextYear !== saved.year;

    onDirtyChange?.(dirty);

    return dirty;
  };

  // --------------------------------------------------
  // NAME CHANGE
  // --------------------------------------------------

  const handleNameChange = (event) => {
    const value = event.target.value;

    setName(value);

    checkForChanges(
      value,
      year,
    );
  };

  // --------------------------------------------------
  // ACADEMIC YEAR CHANGE
  // --------------------------------------------------

  const handleYearChange = (event) => {
    const value = event.target.value;

    setYear(value);

    checkForChanges(
      name,
      value,
    );
  };

  // --------------------------------------------------
  // INITIALS
  // --------------------------------------------------

  const initials = (
    name || "CampusCoin"
  )
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase(),
    )
    .join("");

  // --------------------------------------------------
  // SAVE PROFILE
  // --------------------------------------------------

  const saveProfile = async () => {
    if (!name.trim()) {
      throw new Error(
        "Full name is required",
      );
    }

    setSaving(true);

    try {
      const profile =
        await updateProfile({
          name: name.trim(),
          academicYear: year,
        });

      const savedName =
        profile?.name ||
        name.trim();

      const savedEmail =
        profile?.email ||
        email;

      const savedYear =
        profile?.academicYear ||
        year;

      /*
       * Update the saved snapshot.
       *
       * From this point, these values become
       * the values that Discard returns to.
       */
      savedProfileRef.current = {
        name: savedName,
        year: savedYear,
      };

      const currentSession =
        getStudentSession() || {};

      localStorage.setItem(
        "campuscoin.student.auth",
        JSON.stringify({
          ...currentSession,
          name: savedName,
          email: savedEmail,
          academicYear: savedYear,
          monthlySavingsGoal:
            profile?.monthlySavingsGoal,
          monthlyIncome:
            profile?.monthlyIncome,
        }),
      );

      setName(savedName);
      setEmail(savedEmail);
      setYear(savedYear);
      setError("");

      // No unsaved changes remain.
      onDirtyChange?.(false);

      window.dispatchEvent(
        new Event(
          "campuscoin:profile-updated",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DISCARD CHANGES
  // --------------------------------------------------

  const discardChanges = () => {
    const saved =
      savedProfileRef.current;

    /*
     * Restore the last saved values.
     */
    setName(saved.name);
    setYear(saved.year);
    setError("");

    // Profile is clean again.
    onDirtyChange?.(false);
  };

  // --------------------------------------------------
  // CONNECT SAVE REF
  // --------------------------------------------------

  useEffect(() => {
    if (!saveRef) return undefined;

    saveRef.current = saveProfile;

    return () => {
      if (
        saveRef.current ===
        saveProfile
      ) {
        saveRef.current = null;
      }
    };
  }, [
    saveRef,
    name,
    year,
  ]);

  // --------------------------------------------------
  // CONNECT DISCARD REF
  // --------------------------------------------------

  useEffect(() => {
    if (!discardRef) return undefined;

    discardRef.current =
      discardChanges;

    return () => {
      if (
        discardRef.current ===
        discardChanges
      ) {
        discardRef.current = null;
      }
    };
  }, [
    discardRef,
    name,
    year,
  ]);

  // --------------------------------------------------
  // CHANGE PROFILE PHOTO
  // --------------------------------------------------

  const handlePhotoChange = async (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      showToast(
        "Please choose an image file",
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      showToast(
        "Profile photo must be 5 MB or smaller",
      );

      return;
    }

    const preview =
      URL.createObjectURL(file);

    setPhotoLoading(true);
    setError("");

    try {
      await uploadProfilePhoto(
        file,
      );

      const oldPhoto = photo;

      setPhoto(preview);

      if (
        oldPhoto?.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          oldPhoto,
        );
      }

      window.dispatchEvent(
        new Event(
          "campuscoin:profile-updated",
        ),
      );

      showToast(
        "Profile photo updated",
      );
    } catch (err) {
      URL.revokeObjectURL(
        preview,
      );

      showToast(
        err?.message ||
          "Unable to upload profile photo",
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  // --------------------------------------------------
  // REMOVE PROFILE PHOTO
  // --------------------------------------------------

  const handleRemovePhoto =
    async () => {
      setPhotoLoading(true);

      try {
        await deleteProfilePhoto();

        if (
          photo?.startsWith(
            "blob:",
          )
        ) {
          URL.revokeObjectURL(
            photo,
          );
        }

        setPhoto(null);

        window.dispatchEvent(
          new Event(
            "campuscoin:profile-updated",
          ),
        );

        showToast(
          "Profile photo removed",
        );
      } catch (err) {
        showToast(
          err?.message ||
            "Unable to remove profile photo",
        );
      } finally {
        setPhotoLoading(false);
      }
    };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="settings-card settings-card-v2">
      <div className="settings-card-heading">
        <div>
          <h3>Profile</h3>

          <p>
            Used to personalise tips
            and insights
          </p>
        </div>
      </div>

      {error && (
        <div className="settings-profile-error">
          {error}
        </div>
      )}

      <div className="settings-profile-header">
        <div className="large-avatar settings-avatar">
          {photo ? (
            <img
              src={photo}
              alt="Profile"
            />
          ) : (
            initials
          )}
        </div>

        <div className="profile-summary">
          <strong>
            {profileLoading
              ? "Loading profile..."
              : name ||
                "Your name"}
          </strong>

          <small>
            {email ||
              "your@email.com"}
          </small>
        </div>

        <label
          className={`ghost-btn settings-photo-btn ${
            photoLoading
              ? "disabled"
              : ""
          }`}
        >
          {photoLoading
            ? "Uploading..."
            : "Change photo"}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={
              photoLoading ||
              profileLoading
            }
            onChange={
              handlePhotoChange
            }
          />
        </label>

        {photo &&
          !photoLoading && (
            <button
              className="text-link settings-remove-photo"
              type="button"
              onClick={
                handleRemovePhoto
              }
            >
              Remove
            </button>
          )}
      </div>

      <div className="settings-form-grid-v2">
        <label>
          <span>
            Full name
          </span>

          <input
            value={name}
            onChange={
              handleNameChange
            }
            placeholder="Your full name"
            disabled={
              profileLoading ||
              saving
            }
          />
        </label>

        <label>
          <span>
            Email
          </span>

          <input
            type="email"
            value={email}
            readOnly
            disabled={
              profileLoading
            }
            placeholder="you@university.edu"
          />

          <small className="field-hint">
            <Icon
              name="check"
              size={11}
            />

            Verified
          </small>
        </label>

        <label>
          <span>
            Academic year
          </span>

          <select
            value={year}
            onChange={
              handleYearChange
            }
            disabled={
              profileLoading ||
              saving
            }
          >
            <option>
              Year 1
            </option>

            <option>
              Year 2
            </option>

            <option>
              Year 3
            </option>

            <option>
              Year 4
            </option>
          </select>
        </label>

        <label>
          <span>
            Currency
          </span>

          <select
            value={currency}
            onChange={(e) =>
              setCurrency(
                e.target.value,
              )
            }
            disabled={
              profileLoading ||
              saving
            }
          >
            <option>
              NGN · ₦
            </option>

            <option>
              USD · $
            </option>

            <option>
              GBP · £
            </option>
          </select>
        </label>
      </div>

      {saving && (
        <div className="settings-profile-saving">
          Saving profile...
        </div>
      )}
    </div>
  );
}



function SettingsBudgetPreferences({ showToast }) {
  const [defaultPage, setDefaultPage] = useState("Dashboard");
  const [weekStarts, setWeekStarts] = useState("Monday");
  const [alertThreshold, setAlertThreshold] = useState("80%");

  return (
    <div className="settings-card settings-card-v2">
      <div className="settings-card-heading">
        <div>
          <h3>Budget preferences</h3>
          <p>
            Choose how CampusCoin plans, tracks and presents your money.
          </p>
        </div>
      </div>

      <div className="settings-preferences-grid">
        <label className="settings-preference-field">
          <span>Default start page</span>

          <select
            value={defaultPage}
            onChange={(e) => {
              setDefaultPage(e.target.value);
              showToast(
                `Default page set to ${e.target.value}`,
              );
            }}
          >
            <option>Dashboard</option>
            <option>Transactions</option>
            <option>Budgets</option>
            <option>Reports</option>
          </select>

          <small>
            Choose the page CampusCoin opens first.
          </small>
        </label>

        <label className="settings-preference-field">
          <span>Week starts</span>

          <select
            value={weekStarts}
            onChange={(e) => {
              setWeekStarts(e.target.value);
              showToast(
                `Week starts on ${e.target.value}`,
              );
            }}
          >
            <option>Sunday</option>
            <option>Monday</option>
          </select>

          <small>
            Used for weekly spending summaries and reports.
          </small>
        </label>

        <label className="settings-preference-field">
          <span>Budget alert threshold</span>

          <select
            value={alertThreshold}
            onChange={(e) => {
              setAlertThreshold(e.target.value);
              showToast(
                `Budget alerts now start at ${e.target.value}`,
              );
            }}
          >
            <option>70%</option>
            <option>80%</option>
            <option>90%</option>
            <option>100%</option>
          </select>

          <small>
            Get notified before a category reaches its limit.
          </small>
        </label>
      </div>
    </div>
  );
}

function SettingsNotificationsV2() {
  const [values, setValues] = useState([true, true, true]);
  const items = [
    ["Budget alerts", "Notify me when a category is close to its limit."],
    [
      "Weekly summary",
      "Send a weekly overview of spending and remaining budget.",
    ],
    ["AI insights", "Show new insights when a useful pattern is detected."],
  ];
  return (
    <div className="settings-card settings-card-v2">
      <div className="settings-card-heading">
        <div>
          <h3>Notifications</h3>
          <p>Choose which updates CampusCoin should send you.</p>
        </div>
      </div>
      <div className="settings-option-list">
        {items.map(([label, description], i) => (
          <div className="settings-option-row" key={label}>
            <div>
              <strong>{label}</strong>
              <small>{description}</small>
            </div>
            <button
              type="button"
              aria-pressed={values[i]}
              className={`cc-switch ${values[i] ? "on" : ""}`}
              onClick={() =>
                setValues((v) => v.map((x, j) => (j === i ? !x : x)))
              }
            >
              <i />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsSecurityV2({ onPassword, showToast }) {
  const [sessions, setSessions] = useState(true);
  return (
    <div className="settings-card settings-card-v2">
      <div className="settings-card-heading">
        <div>
          <h3>Security</h3>
          <p>Password and active sessions</p>
        </div>
      </div>
      <div className="security-v2-row">
        <div>
          <strong>Password</strong>
          <small>Last changed 3 months ago</small>
        </div>
        <button className="tool-btn" type="button" onClick={onPassword}>
          Change password
        </button>
      </div>
      <div className="security-v2-row">
        <div>
          <strong>Active sessions</strong>
          <small>Chrome on Windows · iPhone app</small>
        </div>
        <button
          className="tool-btn"
          type="button"
          onClick={() => {
            setSessions(false);
            showToast("Other sessions signed out");
          }}
          disabled={!sessions}
        >
          {sessions
            ? "Sign out other devices"
            : "All other sessions signed out"}
        </button>
      </div>
      <div className="security-tip">
        <Icon name="shield" size={15} />
        <span>
          Keep your password private and sign out of devices you no longer use.
        </span>
      </div>
    </div>
  );
}

function SettingsProfile() {
  return <SettingsProfileV2 />;
}

function SettingsNotifications() {
  return <SettingsNotificationsV2 />;
}

function SettingsSecurity({ onPassword }) {
  return (
    <SettingsSecurityV2
      onPassword={onPassword}
      showToast={() => {}}
    />
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
