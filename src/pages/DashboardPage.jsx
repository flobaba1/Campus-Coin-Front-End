import { useEffect, useMemo, useState } from "react";
import { navigate } from "../routes/AppRoutes";
import Icon from "../components/Icon";
import Logo from "../components/Logo";
import { clearStudentSession, getStudentSession } from "../utils";
import ThemeToggle from "../components/ThemeToggle";
import { formatMoney, getCurrencyInfo } from "../utils/currency";

import { getProfile, loadProfilePhoto } from "../api/profileApi";
import { getTransactions, createTransaction } from "../api/transactionApi";
import { getCategories } from "../api/categoryApi";
import { getBudgetsForMonth } from "../api/budgetApi";
import { getCategorySuggestion } from "../api/aiApi";
import { createCategory } from "../api/categoryApi";
import { getNotifications, markNotificationAsRead } from "../api/notificationApi";
import { createBookmark } from "../api/bookmarkApi";

import "../styles/dashboard.css";



function money(n) {
  const value = Number(n || 0);

  return `${value < 0 ? "−" : "+"}${formatMoney(Math.abs(value))}`;
}

function toneIcon(tone, icon) {
  return (
    <span className={`d-icon ${tone}`}>
      <Icon name={icon} size={17} />
    </span>
  );
}

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function toneForCategory(categoryName = "") {
  const name = categoryName.toLowerCase();

  if (name.includes("food")) return "amber";
  if (name.includes("transport")) return "blue";
  if (name.includes("hostel") || name.includes("rent")) return "purple";
  if (name.includes("academic")) return "teal";
  if (name.includes("subscription")) return "pink";
  if (name.includes("entertainment")) return "peach";
  if (name.includes("part-time")) return "mint";
  if (name.includes("scholarship")) return "mint";
  if (name.includes("allowance")) return "mint";
  if (name.includes("freelance")) return "mint";
  if (name.includes("gift")) return "mint";
  if (name.includes("health")) return "blue";
  if (name.includes("shopping")) return "pink";

  return "slate";
}

function iconForCategory(categoryName = "") {
  const name = categoryName.toLowerCase();

  if (name.includes("food")) return "food";
  if (name.includes("transport")) return "bus";
  if (name.includes("hostel") || name.includes("rent")) return "home";
  if (name.includes("academic")) return "grad";
  if (name.includes("subscription")) return "tv";
  if (name.includes("entertainment")) return "ticket";
  if (name.includes("part-time")) return "briefcase";
  if (name.includes("scholarship")) return "grad";
  if (name.includes("allowance")) return "wallet";
  if (name.includes("freelance")) return "briefcase";
  if (name.includes("gift")) return "gift";
  if (name.includes("health")) return "health";
  if (name.includes("shopping")) return "shopping";

  return "receipt";
}

function DashboardShell({
  children,
  dark,
  setDark,
  notificationOpen,
  setNotificationOpen,
  page = "Dashboard",
}) {
  const [notifications, setNotifications] =
  useState([]);

const [notificationsLoading, setNotificationsLoading] =
  useState(false);

const loadNotifications = async () => {
  try {
    setNotificationsLoading(true);

    console.log("🔔 Calling GET /api/notifications...");

    const data = await getNotifications();

    console.log("🔔 RAW NOTIFICATION RESPONSE:", data);
    console.log(
      "🔔 RESPONSE TYPE:",
      Array.isArray(data) ? "ARRAY" : typeof data
    );

    let items = [];

    if (Array.isArray(data)) {
      items = data;
    } else if (Array.isArray(data?.notifications)) {
      items = data.notifications;
    } else if (Array.isArray(data?.data)) {
      items = data.data;
    } else if (Array.isArray(data?.content)) {
      items = data.content;
    } else if (Array.isArray(data?.data?.notifications)) {
      items = data.data.notifications;
    }

    console.log("🔔 FINAL NOTIFICATION ITEMS:", items);
    console.log("🔔 NOTIFICATION COUNT:", items.length);

    setNotifications(items);
  } catch (error) {
    console.error("❌ NOTIFICATION REQUEST FAILED:", error);
    console.error("❌ ERROR MESSAGE:", error?.message);
    console.error("❌ ERROR RESPONSE:", error?.response);

    setNotifications([]);
  } finally {
    setNotificationsLoading(false);
  }
};

useEffect(() => {
  if (!notificationOpen) return;

  loadNotifications();
}, [notificationOpen]);

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
    ["Site Map", "grid", "/app/sitemap"],
    ["Settings", "settings", "/settings"],
  ];

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

  const signOut = () => {
    clearStudentSession();
    navigate("/");
  };

  // Shared profile data for every dashboard page.
  // The Settings page persists the profile/photo through profileApi,
  // so the dashboard shell reads the same backend source.
  const [profileName, setProfileName] = useState(
    getStudentSession()?.name || "CampusCoin User",
  );
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    let mounted = true;
    let loadedPhoto = null;

    async function loadShellProfile() {
      try {
        const profile = await getProfile();

        if (!mounted) return;

        setProfileName(
          profile?.name || getStudentSession()?.name || "CampusCoin User",
        );

        // Load the photo directly instead of relying on the profile metadata flag.
        // A missing photo is handled as null by loadProfilePhoto().
        loadedPhoto = await loadProfilePhoto();

        if (mounted) {
          setProfilePhoto(loadedPhoto);
        }
      } catch (err) {
        // Keep the dashboard usable if the profile request fails.
        // The session name is still available as a fallback.
        console.error("Failed to load dashboard profile:", err);

        if (mounted) {
          setProfileName(getStudentSession()?.name || "CampusCoin User");
          setProfilePhoto(null);
        }
      }
    }

    loadShellProfile();

    return () => {
      mounted = false;

      if (loadedPhoto?.startsWith("blob:")) {
        URL.revokeObjectURL(loadedPhoto);
      }
    };
  }, []);

  const profileInitials = (profileName || "CampusCoin")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const renderAvatar = (className) => (
    <span className={className}>
      {profilePhoto ? (
        <img
          src={profilePhoto}
          alt={`${profileName} profile`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
            display: "block",
          }}
          onError={() => setProfilePhoto(null)}
        />
      ) : (
        profileInitials || "CC"
      )}
    </span>
  );

  return (
    <div className={`dashboard-app ${resolvedDark ? "dark" : ""}`}>
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
            className={`side-link ${page === label ? "active" : ""}`}
            key={label}
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
            className={`side-link ${page === label ? "active" : ""}`}
            key={label}
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
          <small>Based on your transactions</small>
        </div>

        <button
          className="profile-mini"
          type="button"
          onClick={signOut}
          title="Sign out"
        >
          {renderAvatar("avatar")}
          <span>
            <strong>{userFullName}</strong>
            <small>Sign out</small>
          </span>
          <Icon name="logout" size={16} />
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
  className={`top-btn ${
    notificationOpen ? "selected" : ""
  }`}
  type="button"
  onClick={() =>
    setNotificationOpen(
      (value) => !value
    )
  }
  aria-label="Notifications"
>
  <Icon name="bell" size={17} />

  {notifications.some(
    (notification) =>
      notification.status === "UNREAD"
  ) && <i />}
</button>

{notificationOpen && (
  <NotificationPanel
    notifications={notifications}
    loading={notificationsLoading}
    onRead={async (notificationId) => {
      try {
        await markNotificationAsRead(
          notificationId
        );

        setNotifications((current) =>
          current.map((notification) =>
            notification.notificationId ===
            notificationId
              ? {
                  ...notification,
                  status: "READ",
                }
              : notification
          )
        );
      } catch (error) {
        console.error(
          "Failed to mark notification as read:",
          error
        );
      }
    }}
  />
)}
            </div>
            <button
              className="top-avatar"
              type="button"
              onClick={() => navigate("/settings")}
              aria-label="Open settings"
            >
              {renderAvatar("top-avatar-image")}
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

function NotificationPanel({
  notifications = [],
  loading = false,
  onRead,
}) {
  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.status === "UNREAD"
    ).length;

  const formatNotificationDate = (date) => {
    if (!date) {
      return "";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  const iconForNotification = (
    notification
  ) => {
    const type =
      String(
        notification?.type || ""
      ).toUpperCase();

    if (type === "ADMIN") {
      return "bell";
    }

    if (
      notification?.category
        ?.toLowerCase()
        .includes("budget")
    ) {
      return "target";
    }

    if (
      notification?.category
        ?.toLowerCase()
        .includes("ai")
    ) {
      return "sparkle";
    }

    return "bell";
  };

  const toneForNotification = (
    notification
  ) => {
    const type =
      String(
        notification?.type || ""
      ).toUpperCase();

    if (type === "ADMIN") {
      return "blue";
    }

    if (
      notification?.category
        ?.toLowerCase()
        .includes("budget")
    ) {
      return "amber";
    }

    if (
      notification?.category
        ?.toLowerCase()
        .includes("ai")
    ) {
      return "mint";
    }

    return "slate";
  };

  return (
    <div className="notification-panel">
      <div className="notif-head">
        <strong>
          Notifications
        </strong>

        <b>
          {unreadCount} new
        </b>

        <button
          type="button"
          onClick={() =>
            notifications
              .filter(
                (notification) =>
                  notification.status ===
                  "UNREAD"
              )
              .forEach(
                (notification) =>
                  onRead(
                    notification.notificationId
                  )
              )
          }
        >
          Mark all read
        </button>
      </div>

      {loading ? (
        <div className="notif-empty">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="notif-empty">
          You're all caught up.
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map(
            (notification) => (
              <button
                type="button"
                className={`notif-item ${
                  notification.status ===
                  "READ"
                    ? "read"
                    : ""
                }`}
                key={
                  notification.notificationId
                }
                onClick={() => {
                  if (
                    notification.status !==
                    "READ"
                  ) {
                    onRead(
                      notification.notificationId
                    );
                  }

                  const placement = String(
                    notification?.placement || ""
                  ).toUpperCase();

                  if (placement === "TIPS") {
                    navigate("/saving-tips");
                  } else if (
                    placement === "ANNOUNCEMENT"
                  ) {
                    navigate("/ai-insights");
                  }
                }}
              >
                {toneIcon(
                  toneForNotification(
                    notification
                  ),
                  iconForNotification(
                    notification
                  )
                )}

                <div>
                  <strong>
                    {notification.title}
                  </strong>

                  <p>
                    {notification.message}
                  </p>

                  <small>
                    {formatNotificationDate(
                      notification.createdAt
                    )}
                  </small>
                </div>

                {notification.status ===
                  "UNREAD" && <i />}
              </button>
            )
          )}
        </div>
      )}

      <button
        type="button"
        className="notif-settings"
        onClick={() =>
          navigate("/settings")
        }
      >
        Notification settings
      </button>
    </div>
  );
}

function DashboardPage() {
  const params = new URLSearchParams(window.location.search);

  const initialAdd = params.get("add");
  const initialState = params.get("state");

  const initialAi = initialState === "ai" || params.get("ai") === "1";

  const initialSaved = initialState === "saved";

  const studentSession = getStudentSession();
  const userFullName =
    studentSession?.name ||
    studentSession?.fullName ||
    "CampusCoin User";

  const userInitials = userFullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "CU";

  const [dark, setDark] = useState(
    document.documentElement.dataset.theme === "dark"
  );

  const [notificationOpen, setNotificationOpen] = useState(
    params.get("state") === "notifications",
  );

  const [modal, setModal] = useState(
    initialAdd || (initialAi ? "expense" : null),
  );

  const [toast, setToast] = useState(initialSaved);

  const [search, setSearch] = useState("");

  const [transactions, setTransactions] = useState([]);

  const [categories, setCategories] = useState([]);

  const [budgets, setBudgets] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [expense, setExpense] = useState(initialAi ? 4.5 : 0);

  const [income, setIncome] = useState(600);

  const [saved, setSaved] = useState(initialSaved);

  const [refreshKey, setRefreshKey] = useState(0);

  const [aiNotifications, setAiNotifications] = useState([]);
  const [aiNotificationsLoading, setAiNotificationsLoading] = useState(true);
  const [selectedAiContent, setSelectedAiContent] = useState(null);

  const loadAiNotifications = async () => {
    try {
      setAiNotificationsLoading(true);
      const data = await getNotifications();
      const visible = Array.isArray(data) ? data : [];
      setAiNotifications(
        visible.filter((notification) => {
          const placement = String(notification?.placement || "").toUpperCase();
          return placement === "ANNOUNCEMENT" || placement === "TIPS";
        })
      );
    } catch (error) {
      console.error("Failed to load AI notifications:", error);
      setAiNotifications([]);
    } finally {
      setAiNotificationsLoading(false);
    }
  };

  useEffect(() => {
    loadAiNotifications();
  }, [refreshKey]);

  useEffect(() => {
    const handleAiUpdated = () => {
      loadAiNotifications();
    };

    window.addEventListener("campuscoin:ai-updated", handleAiUpdated);
    return () =>
      window.removeEventListener("campuscoin:ai-updated", handleAiUpdated);
  }, []);

  const saveAiContent = async (content) => {
    try {
      await createBookmark({
        type: content.kind === "Insight" ? "INSIGHT" : "TIP",
        title: content.title,
        content: content.content,
      });
      setSelectedAiContent((current) =>
        current ? { ...current, saved: true } : current
      );
    } catch (error) {
      console.error("Failed to save AI content:", error);
      setError(error.message || "Unable to save this item");
    }
  };

  useEffect(() => {
    const handleThemeChange = (event) => {
      const preference = event.detail?.preference;
      const resolved =
        preference === "dark"
          ? "dark"
          : preference === "light"
            ? "light"
            : document.documentElement.dataset.theme;

      setDark(resolved === "dark");
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

  useEffect(() => {
    loadDashboardData();
  }, [refreshKey]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError("");

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const [
        transactionData,
        categoryData,
        budgetData,
      ] = await Promise.all([
        getTransactions(),
        getCategories(),
        getBudgetsForMonth(
          currentYear,
          currentMonth
        ),
      ]);

      setTransactions(Array.isArray(transactionData) ? transactionData : []);

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : []
      );

      setBudgets(
        Array.isArray(budgetData)
          ? budgetData
          : []
      );
    } catch (err) {
      console.error("Failed to load dashboard data:", err);

      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const monthName = currentDate.toLocaleDateString(
    "en-US",
    { month: "long" }
  );

  const monthLabel = `${monthName} ${currentYear}`;

  const currentMonthTransactions =
    useMemo(() => {
      return transactions.filter((transaction) => {
        if (!transaction.date) return false;

        const date = new Date(`${transaction.date}T00:00:00`);

        return (
          date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
        );
      });
    }, [transactions, currentYear, currentMonth]);

  const currentMonthIncome =
    useMemo(() => {
      return currentMonthTransactions
        .filter(
          (transaction) =>
            transaction.type === "INCOME"
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount || 0),
          0
        );
    }, [currentMonthTransactions]);

  const currentMonthExpenses =
    useMemo(() => {
      return currentMonthTransactions
        .filter(
          (transaction) =>
            transaction.type === "EXPENSE"
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount || 0),
          0
        );
    }, [currentMonthTransactions]);

  const currentMonthBalance =
    currentMonthIncome - currentMonthExpenses;

  const totalBudget =
    budgets.reduce(
      (total, budget) =>
        total + Number(budget.amount || 0),
      0
    );

  const budgetPercentage =
    totalBudget > 0
      ? Math.min(
          100,
          Math.round(
            (currentMonthExpenses / totalBudget) * 100
          )
        )
      : 0;

  const budgetRemaining =
    totalBudget - currentMonthExpenses;

  /*
   * Search recent transactions
   */
  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return transactions;
    }

    return transactions.filter(
      (transaction) =>
        transaction.description?.toLowerCase().includes(query) ||
        transaction.categoryName?.toLowerCase().includes(query),
    );
  }, [transactions, search]);

  /*
   * Category spending
   */
  /*
 * Category spending
 */
const categorySpending = useMemo(() => {
  const map = {};

  currentMonthTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .forEach((transaction) => {
      const category = transaction.categoryName || "Other";
      const amount = Number(transaction.amount || 0);

      map[category] = (map[category] || 0) + amount;
    });

  return Object.entries(map)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}, [currentMonthTransactions]);

  const topCategory = categorySpending[0] || null;

  const runnerUpCategory = categorySpending[1] || null;

  /*
   * Recent transactions
   */
  const recentTransactions = filteredTransactions.slice(0, 5);

  const saveTransaction = async (payload) => {
    try {
      setError("");

      const createdTransaction = await createTransaction(payload);

      setTransactions((current) => [createdTransaction, ...current]);

      setSaved(true);
      setToast(true);
      setModal(null);

      setTimeout(() => {
        setToast(false);
      }, 3500);
    } catch (err) {
      console.error("Failed to create dashboard transaction:", err);

      setError(err.message || "Failed to save transaction.");
    }
  };

  const openTransaction = (type) => {
    setModal(type);
    setNotificationOpen(false);
  };

  return (
    <DashboardShell
      dark={dark}
      setDark={setDark}
      notificationOpen={
        notificationOpen
      }
      setNotificationOpen={
        setNotificationOpen
      }
      userFullName={userFullName}
      userInitials={userInitials}
    >
      <section className="dash-content">
        <div className="dash-heading">
          <div>
            <label>
              {monthLabel.toUpperCase()}
            </label>

            <h1>
              Good morning, {userFullName}
            </h1>

            <p>
              Here's how your {monthName}
              money is moving.
            </p>
          </div>

          <div className="heading-actions">
            <button
              className="outline-btn"
              onClick={() => navigate("/import-csv")}
            >
              <Icon name="upload" size={15} />
              Import CSV
            </button>

            <button
              className="income-btn"
              onClick={() => openTransaction("income")}
            >
              <Icon name="arrowup" size={15} />
              Add income
            </button>

            <button
              className="primary-btn"
              onClick={() => openTransaction("expense")}
            >
              <Icon name="plus" size={16} />
              Add expense
            </button>
          </div>
        </div>

        {error && (
          <div className="alert-row">
            <div className="alert duplicate">
              <span>⚠</span>

              <div>
                <b>Dashboard data issue</b>

                <small>{error}</small>
              </div>

              <button onClick={loadDashboardData}>Retry</button>
            </div>
          </div>
        )}

        <div className="dashboard-grid">
          <BalanceCard
            income={currentMonthIncome}
            spent={currentMonthExpenses}
            balance={currentMonthBalance}
            monthName={monthName}
          />

          <BudgetCard
            spent={
              currentMonthExpenses
            }
            budget={totalBudget}
            percentage={
              budgetPercentage
            }
            remaining={
              budgetRemaining
            }
            monthName={monthName}
          />

          <TopCategory
            topCategory={
              topCategory
            }
            runnerUpCategory={
              runnerUpCategory
            }
            totalSpent={
              currentMonthExpenses
            }
            monthName={monthName}
          />

          <SpendingCard
            spent={
              currentMonthExpenses
            }
            budget={totalBudget}
            monthName={monthName}
            transactions={currentMonthTransactions}
            loading={loading}
          />

          <div className="right-stack">
            <InsightCard
              loading={loading || aiNotificationsLoading}
              insight={
                aiNotifications.find(
                  (notification) =>
                    String(notification?.placement || "").toUpperCase() ===
                    "ANNOUNCEMENT"
                ) || null
              }
              monthName={monthName}
              onRead={(insight) => {
                if (insight) {
                  setSelectedAiContent({
                    kind: "Insight",
                    title: insight.title,
                    content: insight.message,
                    createdAt: insight.createdAt,
                  });
                } else {
                  navigate("/ai-insights");
                }
              }}
            />

            <SavingTips
              tips={aiNotifications.filter(
                (notification) =>
                  String(notification?.placement || "").toUpperCase() ===
                  "TIPS"
              )}
              loading={aiNotificationsLoading}
              onViewAll={() => navigate("/saving-tips")}
              onOpen={(tip) =>
                setSelectedAiContent({
                  kind: "Saving tip",
                  title: tip.title,
                  content: tip.message,
                  createdAt: tip.createdAt,
                })
              }
            />
          </div>

          <CategoryBudgets
            categorySpending={
              categorySpending
            }
            categories={
              categories
            }
            budgets={budgets}
            monthName={monthName}
            onManage={() =>
              navigate("/budgets")
            }
          />

          <RecentTransactions
            transactions={recentTransactions}
            loading={loading}
          />
        </div>
      </section>

      {selectedAiContent && (
        <AiContentModal
          content={selectedAiContent}
          onClose={() => setSelectedAiContent(null)}
          onSave={() => saveAiContent(selectedAiContent)}
          onOpenPage={() => {
            const target =
              selectedAiContent.kind === "Insight"
                ? "/ai-insights"
                : "/saving-tips";
            setSelectedAiContent(null);
            navigate(target);
          }}
        />
      )}

      {modal && (
        <TransactionModal
          type={modal}
          ai={initialAi}
          amount={modal === "income" ? income : expense}
          setAmount={modal === "income" ? setIncome : setExpense}
          categories={categories}
          onSwitch={(nextType) => setModal(nextType)}
          onClose={() => setModal(null)}
          onSave={saveTransaction}
        />
      )}

      {toast && (
        <div className="toast">
          <span>✓</span>

          <div>
            <strong>Transaction saved</strong>

            <small>Your dashboard has been refreshed.</small>
          </div>

          <button onClick={() => setToast(false)}>Undo</button>
        </div>
      )}
    </DashboardShell>
  );
}

function BalanceCard({
  income,
  spent,
  balance,
  monthName,
}) {
  const formattedBalance =
    Number(balance || 0).toFixed(2);

  const [whole, cents] = formattedBalance.split(".");

  return (
    <div className="balance-card">
      <div className="balance-top">
        <span>
          {monthName.toUpperCase()} BALANCE
        </span>

      </div>

      <div className="balance-amount">
        <strong>{formatMoney(balance)}</strong>
      </div>

      <p>
        Income minus expenses,
        {monthName}
      </p>

      <div className="balance-stats">
        <div>
          {toneIcon("blue", "downleft")}

          <span>
            Income
            <b>
              {formatMoney(income)}
            </b>
          </span>
        </div>

        <div>
          {toneIcon("blue", "upright")}

          <span>
            Expenses
            <b>
              {formatMoney(spent)}
            </b>
          </span>
        </div>
      </div>
    </div>
  );
}

function BudgetCard({
  spent,
  budget,
  percentage,
  remaining,
  monthName,
}) {
  return (
    <div className="dash-card budget-card">
      <div className="card-title">
        <div>
          <strong>Budget vs actual</strong>

          <small>
            {monthName}
          </small>
        </div>

        <Icon name="more" size={18} />
      </div>

      <div className="budget-body">
        <div
          className="donut"
          style={{
            "--p": `${percentage * 3.6}deg`,
          }}
        >
          <b>{percentage}%</b>

          <small>used</small>
        </div>

        <div>
          <span>
            Spent
            <b>
              {formatMoney(spent)}
            </b>
          </span>

          <span>
            Budget
            <b>
              {formatMoney(budget)}
            </b>
          </span>

          <span>
            Remaining
            <b className="green-text">
              {formatMoney(Math.max(0, remaining))}
            </b>
          </span>
        </div>
      </div>

      <div className="days-left">
        ◷ &nbsp;{monthName} spending
        · live transaction data
      </div>
    </div>
  );
}

function TopCategory({
  topCategory,
  runnerUpCategory,
  totalSpent,
  monthName,
}) {
  if (!topCategory) {
    return (
      <div className="dash-card top-category">
        <div className="card-title">
          <strong>Top category</strong>

          <Icon name="more" size={18} />
        </div>

        <div className="cat-highlight">
          {toneIcon("slate", "receipt")}

          <div>
            <strong>No spending yet</strong>

            <span>Add an expense to see your top category.</span>
          </div>
        </div>
      </div>
    );
  }

  const percentage =
    totalSpent > 0
      ? ((topCategory.value / totalSpent) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="dash-card top-category">
      <div className="card-title">
        <strong>Top category</strong>

        <Icon name="more" size={18} />
      </div>

      <div className="cat-highlight">
        {toneIcon(
          toneForCategory(topCategory.name),
          iconForCategory(topCategory.name),
        )}

        <div>
          <strong>{topCategory.name}</strong>

          <span>
            {formatMoney(topCategory.value)}{" "}
            · {percentage}% of spend
          </span>
        </div>
      </div>

      <div className="purple-track">
        <i
          style={{
            width: `${Math.min(100, Number(percentage))}%`,
          }}
        />
      </div>

      <small>
        Runner-up{" "}
        <b>
          {runnerUpCategory
            ? `${runnerUpCategory.name} · ${formatMoney(runnerUpCategory.value)}`
            : "—"}
        </b>
      </small>

      <p>
        Based on your {monthName}
        expense records.
      </p>
    </div>
  );
}

function SpendingCard({
  spent,
  budget,
  monthName,
  transactions = [],
  loading,
}) {
  const [view, setView] = useState("month");

  const weekTransactions = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);

    return transactions.filter((transaction) => {
      if (!transaction.date) return false;

      const date = new Date(`${transaction.date}T00:00:00`);
      return date >= start && date <= now;
    });
  }, [transactions]);

  const weekSpent = weekTransactions
    .filter(
      (transaction) =>
        transaction.type === "EXPENSE"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

  const activeSpent =
    view === "week" ? weekSpent : spent;

  const activeBudget =
    view === "week" && budget > 0
      ? budget / 4.345
      : budget;

  const percentage =
    activeBudget > 0
      ? Math.min(
          100,
          Math.round(
            (activeSpent / activeBudget) * 100
          )
        )
      : 0;

  const viewLabel =
    view === "week"
      ? "Last 7 days"
      : monthName;

  return (
    <div className="dash-card spending-card">
      <div className="card-title">
        <div>
          <strong>Spending pace</strong>

          <small>
            Cumulative spend, {viewLabel} against your
            budget
          </small>
        </div>

        <div className="seg" role="tablist" aria-label="Spending pace period">
          <button
            type="button"
            className={view === "month" ? "active" : ""}
            onClick={() => setView("month")}
          >
            Month
          </button>

          <button
            type="button"
            className={view === "week" ? "active" : ""}
            onClick={() => setView("week")}
          >
            Week
          </button>
        </div>
      </div>

      {loading ? (
        <>
          <div className="spend-loading-total">
            <span className="skeleton" />
            <span className="skeleton short" />
          </div>

          <div className="chart-skeleton">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </>
      ) : (
        <>
          <div className="spend-total">
            <strong>{formatMoney(activeSpent)}</strong>

            <span>
              Live {viewLabel.toLowerCase()} spending
            </span>
          </div>

          <div className="fake-chart">
            <div className="budget-line">
              Budget {formatMoney(activeBudget)}
            </div>

            <svg
              viewBox="0 0 520 190"
              preserveAspectRatio="none"
              aria-label={`${viewLabel} spending chart`}
            >
              <defs>
                <linearGradient id="fillg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#9de1c8" stopOpacity=".65" />

                  <stop offset="1" stopColor="#9de1c8" stopOpacity=".08" />
                </linearGradient>
              </defs>

              <path
                d={
                  view === "week"
                    ? "M0 145 C75 135 105 120 170 130 S260 105 320 110 S420 75 520 55 L520 190 L0 190Z"
                    : "M0 140 C65 112 120 120 180 105 S270 100 320 75 S420 65 520 30 L520 190 L0 190Z"
                }
                fill="url(#fillg)"
              />

              <path
                d={
                  view === "week"
                    ? "M0 145 C75 135 105 120 170 130 S260 105 320 110 S420 75 520 55"
                    : "M0 140 C65 112 120 120 180 105 S270 100 320 75 S420 65 520 30"
                }
                fill="none"
                stroke="#008b62"
                strokeWidth="2.5"
              />

              <circle
                cx="520"
                cy={view === "week" ? "55" : "30"}
                r="4"
                fill="#fff"
                stroke="#008b62"
                strokeWidth="2"
              />
            </svg>

            <div className="chart-labels">
              <span>{formatMoney(0)}</span>
              <span>{formatMoney(activeBudget * 0.33)}</span>
              <span>{formatMoney(activeBudget * 0.66)}</span>
              <span>{formatMoney(activeBudget)}</span>
            </div>
          </div>

          <div className="spend-stats">
            <span>
              Transactions
              <b>
                {view === "week"
                  ? weekTransactions.length
                  : transactions.length}
              </b>
            </span>

            <span>
              {view === "week"
                ? "7-day spend"
                : `${monthName} spend`}
              <b>{formatMoney(activeSpent)}</b>
            </span>

            <span>
              Budget used
              <b>{percentage}%</b>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function InsightCard({
  loading,
  insight,
  monthName,
  onRead,
}) {
  const hasInsight = Boolean(insight);

  return (
    <div className="insight-card">
      <button
        type="button"
        className="insight-readable"
        onClick={() => onRead(insight)}
        aria-label={
          hasInsight
            ? `Read ${insight.title}`
            : "Open AI insights"
        }
      >
        <div className="insight-title">
          {toneIcon("mint", "sparkle")}
          <strong>
            {hasInsight
              ? insight.title
              : `${monthName} insight`}
          </strong>
          <Icon name="bookmark" size={16} />
        </div>

        {loading ? (
          <>
            <div className="skeleton" />
            <div className="skeleton mid" />
            <div className="skeleton short" />
            <p className="analysing">◔ Loading your latest insight...</p>
          </>
        ) : hasInsight ? (
          <>
            <p className="ai-card-preview">
              {insight.message}
            </p>
            <span className="ai-read-link">
              Read full insight <Icon name="arrow" size={14} />
            </span>
            <small>AI suggestion · advisory only</small>
          </>
        ) : (
          <>
            <p className="ai-card-preview">
              Generate your personalized monthly report to see an AI insight
              based on your actual income, spending and budgets.
            </p>
            <span className="ai-read-link">
              Open AI Insights <Icon name="arrow" size={14} />
            </span>
          </>
        )}
      </button>
    </div>
  );
}

function SavingTips({ tips = [], loading = false, onViewAll, onOpen }) {
  return (
    <div className="dash-card tips-card">
      <div className="card-title">
        <div>
          <strong>Top saving tips</strong>
          <small>
            {tips.length
              ? "Generated from your latest financial activity"
              : "Personalized tips from your latest financial activity"}
          </small>
        </div>
        <button type="button" onClick={onViewAll}>
          View all
        </button>
      </div>

      {loading ? (
        <div className="ai-tips-loading">
          <div className="skeleton" />
          <div className="skeleton mid" />
        </div>
      ) : tips.length ? (
        <div className="dashboard-tip-list">
          {tips.map((tip) => (
            <button
              type="button"
              className="tip-row tip-row-button"
              key={tip.notificationId}
              onClick={() => onOpen(tip)}
            >
              {toneIcon("mint", "bulb")}
              <span className="tip-row-copy">
                <strong>{tip.title}</strong>
                <small>{tip.message}</small>
              </span>
              <Icon name="chevron" size={15} />
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          className="ai-empty-tip"
          onClick={onViewAll}
        >
          <span className="d-icon mint">
            <Icon name="bulb" size={17} />
          </span>
          <span>
            <strong>No AI tips yet</strong>
            <small>Generate your personalized tips to see them here.</small>
          </span>
          <Icon name="chevron" size={15} />
        </button>
      )}
    </div>
  );
}

function AiContentModal({ content, onClose, onOpenPage, onSave }) {
  const formattedDate = content.createdAt
    ? new Date(content.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div
      className="ai-content-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="ai-content-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-content-title"
      >
        <button
          type="button"
          className="ai-content-close"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="close" size={17} />
        </button>

        <div className="ai-content-icon">
          <Icon
            name={content.kind === "Insight" ? "sparkle" : "bulb"}
            size={20}
          />
        </div>

        <span className="ai-content-kind">{content.kind}</span>
        <h2 id="ai-content-title">{content.title}</h2>

        {formattedDate && (
          <small className="ai-content-date">
            Generated {formattedDate}
          </small>
        )}

        <div className="ai-content-body">
          {content.content}
        </div>

        <div className="ai-content-actions">
  <button
    type="button"
    className="outline-btn"
    onClick={onSave}
    disabled={content.saved}
  >
    {content.saved ? "Saved" : "Save for later"}
  </button>

  <button
    type="button"
    className="primary-btn"
    onClick={onOpenPage}
  >
    Open full page
  </button>
</div>
      </section>
    </div>
  );
}

function CategoryBudgets({
  categorySpending,
  categories,
  budgets,
  monthName,
  onManage,
}) {
  const expenseCategories =
    categories.filter(
      (category) =>
        category.type === "EXPENSE"
    );

  const budgetRows = budgets
    .map((budget) => {
      const category =
        expenseCategories.find(
          (item) =>
            item.categoryId ===
            budget.categoryId
        );

      if (!category) return null;

      const spending =
        Number(budget.spent || 0);

      const budgetAmount =
        Number(budget.amount || 0);

      const percentage =
        budgetAmount > 0
          ? Math.min(
              100,
              (spending / budgetAmount) *
                100
            )
          : 0;

      return {
        budget,
        category,
        spending,
        budgetAmount,
        percentage,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.spending - a.spending
    );

  return (
    <div className="dash-card category-budgets">
      <div className="card-title">
        <div>
          <strong>
            Category budgets
          </strong>

          <small>
            Real-time consumption, {monthName}
          </small>
        </div>

        <button onClick={onManage}>
          Manage
        </button>
      </div>

      {budgetRows
        .slice(0, 5)
        .map((row) => (
          <div
            className="budget-row"
            key={row.budget.budgetId}
          >
            {toneIcon(
              toneForCategory(
                row.category.name
              ),
              iconForCategory(
                row.category.name
              )
            )}

            <div className="budget-row-main">
              <div>
                <strong>
                  {row.category.name}
                </strong>

                <span>
                  {formatMoney(
                    row.spending
                  )}{" "}
                  /{" "}
                  {formatMoney(
                    row.budgetAmount
                  )}
                </span>
              </div>

              <div className="progress">
                <i
                  style={{
                    width: `${row.percentage}%`,
                  }}
                  className={
                    row.percentage >= 100
                      ? "over"
                      : ""
                  }
                />
              </div>

              <small>
                {Math.round(
                  row.percentage
                )}%
              </small>
            </div>
          </div>
        ))}

      {budgetRows.length === 0 && (
        <div
          style={{
            padding: "20px 0",
            opacity: 0.65,
          }}
        >
          No budgets set for {monthName} yet.
        </div>
      )}
    </div>
  );
}

function RecentTransactions({ transactions, loading }) {
  return (
    <div className="dash-card recent-card">
      <div className="card-title">
        <div>
          <strong>Recent transactions</strong>

          <small>Latest activity across income and expenses</small>
        </div>

        <button onClick={() => navigate("/transactions")}>View all</button>
      </div>

      {loading ? (
        <div
          style={{
            padding: "20px 0",
          }}
        >
          Loading transactions...
        </div>
      ) : transactions.length === 0 ? (
        <div
          style={{
            padding: "20px 0",
            opacity: 0.65,
          }}
        >
          No transactions yet.
        </div>
      ) : (
        transactions.map((transaction) => {
          const tone = toneForCategory(transaction.categoryName);

          const icon = iconForCategory(transaction.categoryName);

          const value = Number(transaction.amount || 0);

          return (
            <div className="recent-row" key={transaction.transactionId}>
              {toneIcon(tone, icon)}

              <div>
                <strong>
                  {transaction.description || "Untitled transaction"}
                </strong>

                <small>
                  {transaction.categoryName} · {formatDate(transaction.date)}
                </small>
              </div>

              <b className={transaction.type === "INCOME" ? "positive" : ""}>
                {money(transaction.type === "INCOME" ? value : -value)}
              </b>
            </div>
          );
        })
      )}
    </div>
  );
}

function TransactionModal({
  type = "expense",
  ai = false,
  amount,
  setAmount,
  categories = [],
  onSwitch,
  onClose,
  onSave,
}) {
  const income = type === "income";

  const [description, setDescription] = useState(
    ai && !income ? "Printing, lecture notes" : "",
  );

  const [categoryId, setCategoryId] = useState("");

  const [pendingAiCategory, setPendingAiCategory] = useState("");

  const [aiSuggestion, setAiSuggestion] = useState(null);

  const [aiLoading, setAiLoading] = useState(false);

  const [aiError, setAiError] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [repeat, setRepeat] = useState(false);

  const [formError, setFormError] = useState("");

  const [saving, setSaving] = useState(false);

  const transactionType = income ? "INCOME" : "EXPENSE";

  const availableCategories = categories.filter(
    (category) => category.type === transactionType,
  );

  /*
   * Reset the modal whenever the transaction type changes.
   */
  useEffect(() => {
    const defaultCategory = availableCategories.find(
      (category) =>
        category.name ===
        (ai && !income ? "Academics" : ""),
    );

    setCategoryId(
      defaultCategory
        ? defaultCategory.categoryId
        : availableCategories[0]?.categoryId || "",
    );

    setPendingAiCategory("");
    setAiSuggestion(null);
    setAiError("");

    if (ai && !income) {
      setDescription("Printing, lecture notes");
    } else {
      setDescription("");
    }

    setFormError("");
  }, [type, ai, income, categories]);

  /*
   * Ask AI for a category suggestion after the
   * student stops typing for a short moment.
   */
  useEffect(() => {
    const text = description.trim();

    if (text.length < 3) {
      setAiSuggestion(null);
      setAiError("");
      setAiLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setAiLoading(true);
        setAiError("");

        const result = await getCategorySuggestion(
          text,
          transactionType,
        );

        setAiSuggestion(result);
      } catch (error) {
        console.error(
          "Failed to get AI category suggestion:",
          error,
        );

        setAiSuggestion(null);

        setAiError(
          error?.message ||
            "AI category suggestion unavailable.",
        );
      } finally {
        setAiLoading(false);
      }
    }, 650);

    return () => {
      window.clearTimeout(timer);
    };
  }, [description, transactionType]);

  /*
   * Close modal / keyboard handling.
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (
        event.key === "Enter" &&
        event.target?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    onClose,
    amount,
    categoryId,
    description,
    date,
    pendingAiCategory,
  ]);

  /*
   * Existing AI category.
   */
  const existingAiCategory =
    availableCategories.find(
      (category) =>
        category.name.toLowerCase() ===
        String(
          aiSuggestion?.selectedCategory || "",
        ).toLowerCase(),
    );

  /*
   * AI suggested category that does not yet exist.
   */
  const newAiCategory =
    aiSuggestion?.suggestedCategory &&
    !availableCategories.some(
      (category) =>
        category.name.toLowerCase() ===
        String(
          aiSuggestion.suggestedCategory,
        ).toLowerCase(),
    )
      ? aiSuggestion.suggestedCategory
      : "";

  const switchType = (nextType) => {
    if (nextType !== type) {
      onSwitch(nextType);
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  /*
   * Clicking an existing AI category simply selects it.
   */
  const useExistingAiCategory = () => {
    if (!existingAiCategory) {
      return;
    }

    setCategoryId(
      existingAiCategory.categoryId,
    );

    setPendingAiCategory("");
  };

  /*
   * Clicking a new AI category DOES NOT create it.
   *
   * We only remember the category name.
   * It will be created when Save is clicked.
   */
  const useNewAiCategory = () => {
    if (!newAiCategory) {
      return;
    }

    setCategoryId("");

    setPendingAiCategory(newAiCategory);
  };

  /*
   * Save transaction.
   *
   * If the AI suggested a new category,
   * create the category first, then save
   * the transaction using its categoryId.
   */
  const handleSave = async () => {
    setFormError("");

    if (!amount || Number(amount) <= 0) {
      setFormError(
        "Please enter an amount greater than zero.",
      );
      return;
    }

    if (!description.trim()) {
      setFormError(
        "Please enter a description.",
      );
      return;
    }

    if (!categoryId && !pendingAiCategory) {
      setFormError(
        "Please select a category.",
      );
      return;
    }

    if (!date) {
      setFormError(
        "Please select a date.",
      );
      return;
    }

    setSaving(true);

    try {
      let finalCategoryId = categoryId;

      /*
       * Only create the AI category at the
       * moment the user actually saves.
       */
      if (pendingAiCategory) {
        const createdCategory =
          await createCategory({
            name: pendingAiCategory,
            type: transactionType,
          });

        finalCategoryId =
          createdCategory.categoryId;
      }

      await onSave({
        categoryId: finalCategoryId,
        amount: Number(amount),
        type: transactionType,
        description: description.trim(),
        date,
      });
    } catch (error) {
      console.error(
        "Failed to save transaction:",
        error,
      );

      setFormError(
        error?.message ||
          "Unable to save transaction.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <div
        className={`transaction-modal ${
          ai ? "ai-modal" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-head">
          <div>
            <h2 id="transaction-modal-title">
              Add {income ? "income" : "expense"}
            </h2>

            <p>
              Log it in seconds. Categories are
              suggested as you type.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close transaction form"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div
          className="expense-tabs"
          role="tablist"
          aria-label="Transaction type"
        >
          <button
            type="button"
            className={!income ? "active" : ""}
            aria-selected={!income}
            onClick={() =>
              switchType("expense")
            }
          >
            Expense
          </button>

          <button
            type="button"
            className={income ? "active" : ""}
            aria-selected={income}
            onClick={() =>
              switchType("income")
            }
          >
            Income
          </button>
        </div>

        <label>
          Amount

          <div className="amount-input">
            <span>
              {getCurrencyInfo().symbol}
            </span>

            <input
              inputMode="decimal"
              aria-label={`${
                income ? "Income" : "Expense"
              } amount`}
              value={amount || ""}
              onChange={(event) => {
                const value =
                  event.target.value.replace(
                    /[^0-9.]/g,
                    "",
                  );

                setAmount(
                  value === ""
                    ? 0
                    : Number(value),
                );
              }}
              onFocus={(event) =>
                event.target.select()
              }
            />
          </div>
        </label>

        <label>
          Description

          <div className="field-input">
            <Icon
              name="receipt"
              size={16}
            />

            <input
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder={
                income
                  ? "e.g. allowance, scholarship, freelance"
                  : "e.g. Campus Cafe, bus fare, textbook"
              }
              maxLength={500}
            />
          </div>
        </label>

        {/* AI suggestion */}
        {description.trim().length >= 3 && (
          <div className="ai-category-area">
            {aiLoading && (
              <div className="ai-category-loading">
                <Icon
                  name="sparkle"
                  size={14}
                />

                <span>
                  AI is checking your
                  categories...
                </span>
              </div>
            )}

            {!aiLoading &&
              existingAiCategory && (
                <button
                  type="button"
                  className={`ai-category-suggestion ${
                    categoryId ===
                    existingAiCategory.categoryId
                      ? "selected"
                      : ""
                  }`}
                  onClick={
                    useExistingAiCategory
                  }
                >
                  <span className="ai-category-label">
                    AI suggested
                  </span>

                  <strong>
                    {
                      existingAiCategory.name
                    }
                  </strong>

                </button>
              )}

            {!aiLoading &&
              newAiCategory && (
                <button
                  type="button"
                  className={`ai-category-suggestion ${
                    pendingAiCategory ===
                    newAiCategory
                      ? "selected"
                      : ""
                  }`}
                  onClick={
                    useNewAiCategory
                  }
                >
                  <span className="ai-category-label">
                    AI suggested
                  </span>

                  <strong>
                    {newAiCategory}
                  </strong>

                  <small>
                    New category
                  </small>
                </button>
              )}

            {!aiLoading &&
              aiError && (
                <small className="ai-category-error">
                  {aiError}
                </small>
              )}
          </div>
        )}

        {/* Category dropdown */}
        <div className="category-select">
          <div className="label-row">
            <label htmlFor="transaction-category">
              Category
            </label>

            <button
              type="button"
              onClick={() =>
                navigate("/categories")
              }
            >
              Manage categories
            </button>
          </div>

          <select
            id="transaction-category"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(
                event.target.value,
              );

              setPendingAiCategory("");
            }}
          >
            <option value="">
              {pendingAiCategory
                ? `AI: ${pendingAiCategory}`
                : "Select a category"}
            </option>

            {availableCategories.map(
              (item) => (
                <option
                  key={item.categoryId}
                  value={
                    item.categoryId
                  }
                >
                  {item.name}
                </option>
              ),
            )}
          </select>

          {pendingAiCategory && (
            <small className="pending-ai-category">
              AI category will be created when
              you save this transaction.
            </small>
          )}
        </div>

        <div className="date-grid">
          <label>
            Date

            <div className="field-input">
              <Icon
                name="calendar"
                size={16}
              />

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value,
                  )
                }
              />
            </div>
          </label>

          <label>
            Repeat

            <button
              type="button"
              className={`repeat-field ${
                repeat ? "on" : ""
              }`}
              onClick={() =>
                setRepeat(
                  (value) => !value,
                )
              }
              aria-pressed={repeat}
            >
              <Icon
                name="repeat"
                size={16}
              />

              <span>
                {repeat
                  ? "Monthly"
                  : "None"}
              </span>

              <i />
            </button>
          </label>
        </div>

        {formError && (
          <div
            className="modal-form-error"
            role="alert"
          >
            {formError}
          </div>
        )}

        <div className="modal-footer">
          <small>
            Press Enter to save · Esc to close
          </small>

          <button
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={handleSave}
            disabled={
              saving ||
              !amount ||
              (!categoryId &&
                !pendingAiCategory) ||
              !description.trim() ||
              !date
            }
          >
            {saving
              ? "Saving..."
              : `✓ Save ${
                  income
                    ? "income"
                    : "expense"
                }`}
          </button>
        </div>
      </div>
    </div>
  );
}

export { DashboardShell, NotificationPanel };

export default DashboardPage;
