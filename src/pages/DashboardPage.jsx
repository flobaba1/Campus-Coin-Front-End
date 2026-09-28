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

import "../styles/dashboard.css";

const DEMO_NOTIFICATIONS = [
  [
    "Your latest insight is ready",
    "Your spending data has been updated",
    "sparkle",
    "Today",
  ],
  [
    "Transactions synced",
    "Your latest transactions are available",
    "bell",
    "Today",
  ],
];

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

        if (profile?.profilePhotoAvailable) {
          loadedPhoto = await loadProfilePhoto();

          if (mounted) {
            setProfilePhoto(loadedPhoto);
          }
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
          <span className="avatar">{userInitials}</span>
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
                className={`top-btn ${notificationOpen ? "selected" : ""}`}
                type="button"
                onClick={() => setNotificationOpen((value) => !value)}
                aria-label="Notifications"
              >
                <Icon name="bell" size={17} />
                <i />
              </button>

              {notificationOpen && <NotificationPanel />}
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
    </div>
  );
}

function NotificationPanel() {
  return (
    <div className="notification-panel">
      <div className="notif-head">
        <strong>Notifications</strong>
        <b>2 new</b>

        <button>Mark all read</button>
      </div>

      {DEMO_NOTIFICATIONS.map((notification, index) => (
        <div className="notif-item" key={index}>
          {toneIcon(["mint", "blue"][index], notification[2])}

          <div>
            <strong>{notification[0]}</strong>

            <p>{notification[1]}</p>

            <small>{notification[3]}</small>
          </div>

          <i />
        </div>
      ))}

      <button
        type="button"
        className="notif-settings"
        onClick={() => navigate("/settings")}
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
              loading={loading}
              transactionCount={
                currentMonthTransactions.length
              }
              monthName={monthName}
              onRead={() =>
                navigate(
                  "/ai-insights"
                )
              }
            />

            <SavingTips onViewAll={() => navigate("/saving-tips")} />
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

      {modal && (
        <TransactionModal
          type={modal}
          ai={modal === "expense" && initialAi}
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
  transactionCount,
  monthName,
  onRead,
}) {
  return (
    <div className="insight-card">
      <div className="insight-title">
        {toneIcon("mint", "sparkle")}

        <strong>
          {monthName} insight
        </strong>

        <Icon name="bookmark" size={16} />
      </div>

      {loading ? (
        <>
          <div className="skeleton" />
          <div className="skeleton mid" />
          <div className="skeleton short" />

          <p className="analysing">◔ Analysing transactions...</p>
        </>
      ) : (
        <>
          <p>
            Your dashboard is using{" "}
            {transactionCount}{" "}
            {monthName} transaction
            {transactionCount === 1
              ? ""
              : "s"}{" "}
            to calculate your
            current spending picture.
          </p>

          <button type="button" onClick={onRead}>
            Read full insight <Icon name="arrow" size={15} />
          </button>

          <small>AI suggestion · advisory only</small>
        </>
      )}
    </div>
  );
}

function SavingTips({ onViewAll }) {
  return (
    <div className="dash-card tips-card">
      <div className="card-title">
        <div>
          <strong>Top saving tips</strong>

          <small>Ranked by potential monthly savings</small>
        </div>

        <button onClick={onViewAll}>View all</button>
      </div>

      {[
        [
          "food",
          "amber",
          "Review your food spending",
          "Based on your transactions",
        ],
        [
          "bus",
          "blue",
          "Review your transport spending",
          "Based on your transactions",
        ],
        [
          "tv",
          "pink",
          "Review your subscriptions",
          "Based on your transactions",
        ],
      ].map((item, index) => (
        <div className="tip-row" key={index}>
          {toneIcon(item[1], item[0])}

          <div>
            <strong>{item[2]}</strong>

            <small>{item[3]}</small>
          </div>

          <button>♧</button>
          <button>×</button>
        </div>
      ))}
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
    ai ? "Printing, lecture notes" : "",
  );

  const [categoryId, setCategoryId] = useState("");

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const [repeat, setRepeat] = useState(false);

  const [formError, setFormError] = useState("");

  const transactionType = income ? "INCOME" : "EXPENSE";

  const availableCategories = categories.filter(
    (category) => category.type === transactionType,
  );

  useEffect(() => {
    const defaultCategory = availableCategories.find(
      (category) => category.name === (ai && !income ? "Academics" : ""),
    );

    setCategoryId(
      defaultCategory
        ? defaultCategory.categoryId
        : availableCategories[0]?.categoryId || "",
    );

    if (ai && !income) {
      setDescription("Printing, lecture notes");
    } else {
      setDescription("");
    }

    setFormError("");
  }, [type, ai, income, categories]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (event.key === "Enter" && event.target?.tagName !== "TEXTAREA") {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, amount, categoryId, description, date]);

  const selectedCategory = categories.find(
    (category) => category.categoryId === categoryId,
  );

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

  const handleSave = () => {
    setFormError("");

    if (!amount || Number(amount) <= 0) {
      setFormError("Please enter an amount greater than zero.");
      return;
    }

    if (!description.trim()) {
      setFormError("Please enter a description.");
      return;
    }

    if (!categoryId) {
      setFormError("Please select a category.");
      return;
    }

    if (!date) {
      setFormError("Please select a date.");
      return;
    }

    onSave({
      categoryId,
      amount: Number(amount),
      type: transactionType,
      description: description.trim(),
      date,
    });
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <div
        className={`transaction-modal ${ai ? "ai-modal" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h2 id="transaction-modal-title">
              Add {income ? "income" : "expense"}
            </h2>

            <p>Log it in seconds. Categories are suggested as you type.</p>
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
            onClick={() => switchType("expense")}
          >
            Expense
          </button>

          <button
            type="button"
            className={income ? "active" : ""}
            aria-selected={income}
            onClick={() => switchType("income")}
          >
            Income
          </button>
        </div>

        <label>
          Amount
          <div className="amount-input">
            <span>{getCurrencyInfo().symbol}</span>

            <input
              inputMode="decimal"
              aria-label={`${income ? "Income" : "Expense"} amount`}
              value={amount || ""}
              onChange={(event) => {
                const value = event.target.value.replace(/[^0-9.]/g, "");

                setAmount(value === "" ? 0 : Number(value));
              }}
              onFocus={(event) => event.target.select()}
            />
          </div>
        </label>

        <label>
          Description
          <div className="field-input">
            <Icon name="receipt" size={16} />

            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={
                income
                  ? "e.g. allowance, scholarship, freelance"
                  : "e.g. Campus Cafe, bus fare, textbook"
              }
              maxLength={500}
            />
          </div>
        </label>

      {ai && !income && description.trim().length > 0 && (
  <div className="ai-suggestion">
    {toneIcon("mint", "sparkle")}

    <div>
      <strong>Suggested category: Academics</strong>
      <small>Based on your description</small>
    </div>
  </div>
)}

<div className="chips">
  {availableCategories.map((item) => (
    <button
      type="button"
      key={item.categoryId}
      className={categoryId === item.categoryId ? "selected" : ""}
      onClick={() => setCategoryId(item.categoryId)}
    >
      {item.name}
    </button>
  ))}

  <button type="button" onClick={() => navigate("/categories")}>
    ＋ New
  </button>
</div>

<div className="date-grid">
  <label>
    Date

    <div className="field-input">
      <Icon name="calendar" size={16} />

      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />
    </div>
  </label>

  <label>
    Repeat

    <button
      type="button"
      className={`repeat-field ${repeat ? "on" : ""}`}
      onClick={() => setRepeat((value) => !value)}
      aria-pressed={repeat}
    >
      <Icon name="repeat" size={16} />

      <span>{repeat ? "Monthly" : "None"}</span>

      <i />
    </button>
  </label>
</div>

{formError && (
  <div className="modal-form-error" role="alert">
    {formError}
  </div>
)}

<div className="modal-footer">
  <small>Press Enter to save · Esc to close</small>

  <button type="button" onClick={onClose}>
    Cancel
  </button>

  <button
    type="button"
    className="primary-btn"
    onClick={handleSave}
    disabled={!amount || !categoryId || !description.trim() || !date}
  >
    ✓ Save {income ? "income" : "expense"}
  </button>
</div>
      </div>
    </div>
  );
}

export { DashboardShell, NotificationPanel };

export default DashboardPage;
