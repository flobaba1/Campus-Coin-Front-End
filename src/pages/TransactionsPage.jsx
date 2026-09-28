import { useEffect, useMemo, useState } from "react";
import { navigate } from "../routes/AppRoutes";
import Icon from "../components/Icon";
import { DashboardShell } from "./DashboardPage";
import { formatMoney } from "../utils/currency";

import {
  getTransactions,
  updateTransaction,
  createTransaction,
  deleteTransaction,
} from "../api/transactionApi";

import { getCategories } from "../api/categoryApi";

function money(amount, type) {
  const value = Number(amount || 0);
  const isIncome = type === "INCOME";

  return `${isIncome ? "+" : "−"}${formatMoney(Math.abs(value))}`;
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
    year: "numeric",
  });
}

function formatLongDate(date) {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toneForCategory(categoryName = "") {
  const name = categoryName.toLowerCase();

  const tones = {
    food: ["food"],
    transport: ["transport"],
    "hostel/rent": ["hostel/rent", "rent", "hostel"],
    academics: ["academics", "academic"],
    subscriptions: ["subscriptions", "subscription"],
    entertainment: ["entertainment"],
    miscellaneous: ["miscellaneous"],
    allowance: ["allowance"],
    scholarship: ["scholarship"],
    "part-time work": ["part-time work", "part-time job"],
    freelance: ["freelance"],
    gifts: ["gifts", "gift"],
    health: ["health"],
    shopping: ["shopping"],
    "personal care": ["personal care"],
    "bills & utilities": ["bills", "utilities"],
    other: ["other"],
  };

  for (const [tone, names] of Object.entries(tones)) {
    if (names.some((item) => name.includes(item))) {
      return tone;
    }
  }

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
  if (name.includes("allowance")) return "wallet";
  if (name.includes("scholarship")) return "grad";
  if (name.includes("part-time")) return "briefcase";
  if (name.includes("freelance")) return "briefcase";
  if (name.includes("gift")) return "gift";
  if (name.includes("health")) return "health";
  if (name.includes("shopping")) return "shopping";
  if (name.includes("personal")) return "user";
  if (name.includes("bill") || name.includes("utility")) return "receipt";

  return "more";
}

function toneIcon(tone, icon) {
  return (
    <span className={`d-icon ${tone}`}>
      <Icon name={icon} size={16} />
    </span>
  );
}

function TransactionsPage() {
  const params = new URLSearchParams(window.location.search);

  const [dark, setDark] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-30");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [drawer, setDrawer] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab, selectedCategory, startDate, endDate]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [transactionData, categoryData] = await Promise.all([
        getTransactions(),
        getCategories(),
      ]);

      setTransactions(
        Array.isArray(transactionData) ? transactionData : []
      );

      setCategories(
        Array.isArray(categoryData) ? categoryData : []
      );

      /*
       * If the page was opened with ?drawer=1,
       * open the first available transaction after loading.
       */
      if (params.get("drawer") === "1" && transactionData?.length) {
        setDrawer(transactionData[0]);
      }
    } catch (err) {
      console.error("Failed to load transaction data:", err);

      setError(
        err.message || "Failed to load transactions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      /*
       * Search
       */
      if (query) {
        const matchesSearch =
          transaction.description?.toLowerCase().includes(query) ||
          transaction.categoryName?.toLowerCase().includes(query) ||
          transaction.amount?.toString().includes(query);

        if (!matchesSearch) {
          return false;
        }
      }

      /*
       * Income / Expense / All
       */
      if (
        activeTab !== "ALL" &&
        transaction.type !== activeTab
      ) {
        return false;
      }

      /*
       * Category
       */
      if (
        selectedCategory !== "ALL" &&
        transaction.categoryId !== selectedCategory
      ) {
        return false;
      }

      /*
       * Date range
       */
      if (startDate && transaction.date < startDate) {
        return false;
      }

      if (endDate && transaction.date > endDate) {
        return false;
      }

      return true;
    });
  }, [
    transactions,
    search,
    activeTab,
    selectedCategory,
    startDate,
    endDate,
  ]);

  /*
   * September metrics
   */
  const septemberTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) =>
        transaction.date >= "2026-09-01" &&
        transaction.date <= "2026-09-30"
    );
  }, [transactions]);

  const septemberIncome = useMemo(() => {
    return septemberTransactions
      .filter((transaction) => transaction.type === "INCOME")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }, [septemberTransactions]);

  const septemberExpenses = useMemo(() => {
    return septemberTransactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }, [septemberTransactions]);

  const netBalance = septemberIncome - septemberExpenses;

  /*
   * Pagination
   */
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTransactions = filtered.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const firstItem =
    filtered.length === 0
      ? 0
      : (safeCurrentPage - 1) * itemsPerPage + 1;

  const lastItem = Math.min(
    safeCurrentPage * itemsPerPage,
    filtered.length
  );

  async function handleDelete(transactionId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTransaction(transactionId);

      setTransactions((current) =>
        current.filter(
          (transaction) =>
            transaction.transactionId !== transactionId
        )
      );

      setDrawer(null);
    } catch (err) {
      console.error("Failed to delete transaction:", err);

      setError(
        err.message || "Failed to delete transaction."
      );
    }
  }

  async function handleUpdate(transactionId, payload) {
    try {
      const updated = await updateTransaction(
        transactionId,
        payload
      );

      setTransactions((current) =>
        current.map((transaction) =>
          transaction.transactionId === transactionId
            ? updated
            : transaction
        )
      );

      setDrawer(updated);
      setError("");
    } catch (err) {
      console.error("Failed to update transaction:", err);

      throw err;
    }
  }

  return (
    <DashboardShell
      dark={dark}
      setDark={setDark}
      notificationOpen={notificationOpen}
      setNotificationOpen={setNotificationOpen}
      page="Transactions"
      search={search}
      setSearch={setSearch}
    >
      <section className="dash-content transaction-page">
        <div className="dash-heading">
          <div>
            <label>HISTORY</label>

            <h1>Transactions</h1>

            <p>
              Every income and expense you have logged. Edits
              keep a full version history.
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
  className="primary-btn"
  onClick={() => setDrawer({ mode: "create" })}
>
  <Icon name="plus" size={16} />
  Add transaction
</button>
          </div>
        </div>

        {error && (
          <div className="alert-row">
            <div className="alert duplicate">
              <span>⚠</span>

              <div>
                <b>Something went wrong</b>

                <small>{error}</small>
              </div>

              <button onClick={loadData}>
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="metric-row">
          <Metric
            icon="arrowup"
            tone="mint"
            label="Income · Sep"
            value={formatMoney(septemberIncome)}
          />

          <Metric
            icon="arrowdown"
            tone="blue"
            label="Expenses · Sep"
            value={formatMoney(septemberExpenses)}
          />

          <Metric
            icon="wallet"
            tone="slate"
            label="Net balance"
            value={formatMoney(netBalance)}
          />

          <Metric
            icon="receipt"
            tone="slate"
            label="Entries"
            value={transactions.length.toString()}
          />
        </div>

        <div className="transactions-layout">
          <div className="table-card">
            <div className="table-tools">
              <div className="table-search">
                <Icon name="search" size={15} />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search description or amount"
                />
              </div>

              <div className="pill-tabs">
                <button
                  className={
                    activeTab === "ALL"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab("ALL")
                  }
                >
                  All
                </button>

                <button
                  className={
                    activeTab === "INCOME"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab("INCOME")
                  }
                >
                  Income
                </button>

                <button
                  className={
                    activeTab === "EXPENSE"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab("EXPENSE")
                  }
                >
                  Expenses
                </button>
              </div>

              <select
                className="filter-btn"
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
              >
                <option value="ALL">
                  All categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category.categoryId}
                    value={category.categoryId}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <div
                className="filter-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>▣</span>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: "12px",
                  }}
                />

                <span>to</span>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: "12px",
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                }}
              >
                <p>Loading transactions...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                }}
              >
                <Icon
                  name="receipt"
                  size={28}
                />

                <h3>No transactions found</h3>

                <p>
                  Try changing your search or filters,
                  or add a new transaction.
                </p>
              </div>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>DESCRIPTION</th>
                      <th>CATEGORY</th>
                      <th>DATE</th>
                      <th>AMOUNT</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedTransactions.map(
                      (transaction) => {
                        const tone = toneForCategory(
                          transaction.categoryName
                        );

                        const icon = iconForCategory(
                          transaction.categoryName
                        );

                        return (
                          <tr
                            key={
                              transaction.transactionId
                            }
                          >
                            <td>
                              <div className="table-desc">
                                {toneIcon(
                                  tone,
                                  icon
                                )}

                                <span>
                                  <b>
                                    {transaction.description ||
                                      "Untitled transaction"}
                                  </b>
                                </span>
                              </div>
                            </td>

                            <td>
                              <span
                                className={`category-pill ${tone}`}
                              >
                                •{" "}
                                {
                                  transaction.categoryName
                                }
                              </span>
                            </td>

                            <td>
                              {formatDate(
                                transaction.date
                              )}
                            </td>

                            <td
                              className={
                                transaction.type ===
                                "INCOME"
                                  ? "positive"
                                  : ""
                              }
                            >
                              <b>
                                {money(
                                  transaction.amount,
                                  transaction.type
                                )}
                              </b>
                            </td>

                            <td>
                              <button
                                onClick={() =>
                                  setDrawer(
                                    transaction
                                  )
                                }
                              >
                                <Icon
                                  name="edit"
                                  size={15}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    transaction.transactionId
                                  )
                                }
                              >
                                <Icon
                                  name="trash"
                                  size={15}
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>

                <div className="pagination">
                  <span>
                    Showing {firstItem} to {lastItem} of{" "}
                    {filtered.length}
                  </span>

                  <div>
                    <button
                      disabled={safeCurrentPage === 1}
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(page - 1, 1)
                        )
                      }
                    >
                      ‹
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    )
                      .slice(0, 5)
                      .map((page) => (
                        <button
                          key={page}
                          className={
                            safeCurrentPage === page
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            setCurrentPage(page)
                          }
                        >
                          {page}
                        </button>
                      ))}

                    <button
                      disabled={
                        safeCurrentPage ===
                        totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              page + 1,
                              totalPages
                            )
                        )
                      }
                    >
                      ›
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className="transaction-side">
            <SideList
              title="Recently viewed"
              items={transactions
                .slice(0, 3)
                .map(
                  (transaction) =>
                    transaction.description ||
                    "Untitled transaction"
                )}
            />

            <SideList
              title="Recently edited"
              items={transactions
                .slice(0, 2)
                .map(
                  (transaction) =>
                    transaction.description ||
                    "Untitled transaction"
                )}
            />

            <div className="dash-card recurring">
              <h3>Recurring</h3>

              <small>
                Auto-logged each month
              </small>

              <div>
                <Icon name="repeat" size={14} />

                <span>Recurring transactions</span>

                <b>
                  —
                  <small>
                    Coming soon
                  </small>
                </b>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {drawer && (
  <TransactionDrawer
    transaction={
      drawer.mode === "create"
        ? null
        : drawer
    }
    categories={categories}
    onClose={() => setDrawer(null)}
    onDelete={handleDelete}
    onUpdate={handleUpdate}
    onCreate={async (payload) => {
      try {
        const created = await createTransaction(
          payload
        );

        setTransactions((current) => [
          created,
          ...current,
        ]);

        setDrawer(null);
        setError("");
      } catch (err) {
        console.error(
          "Failed to create transaction:",
          err
        );

        throw err;
      }
    }}
  />
)}
    </DashboardShell>
  );
}

function Metric({
  icon,
  tone,
  label,
  value,
}) {
  return (
    <div className="metric-card">
      {toneIcon(tone, icon)}

      <span>
        {label}

        <b>{value}</b>
      </span>
    </div>
  );
}

function SideList({
  title,
  items,
}) {
  return (
    <div className="dash-card side-list">
      <h3>{title}</h3>

      <small>
        Synced across your devices
      </small>

      {items.length === 0 ? (
        <div>
          <span>
            <small>No transactions yet</small>
          </span>
        </div>
      ) : (
        items.map((item, index) => (
          <div key={`${item}-${index}`}>
            {toneIcon(
              ["teal", "purple", "pink"][
                index % 3
              ],
              "receipt"
            )}

            <span>
              <b>{item}</b>

              <small>
                {index === 0
                  ? "Latest"
                  : "Recently viewed"}
              </small>
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function TransactionDrawer({
  transaction,
  categories,
  onClose,
  onDelete,
  onUpdate,
  onCreate,
}) {
  const isCreate = !transaction;

  const [type, setType] = useState(
    transaction?.type || "EXPENSE"
  );

  const [amount, setAmount] = useState(
    transaction?.amount?.toString() || ""
  );

  const [description, setDescription] =
    useState(
      transaction?.description || ""
    );

  const [categoryId, setCategoryId] =
    useState(
      transaction?.categoryId || ""
    );

  const [date, setDate] = useState(
    transaction?.date ||
      new Date().toISOString().split("T")[0]
  );

  const [saving, setSaving] = useState(false);
  const [drawerError, setDrawerError] =
    useState("");

  const availableCategories =
    categories.filter(
      (category) =>
        category.type === type
    );

  function handleTypeChange(newType) {
    setType(newType);

    const currentCategory =
      categories.find(
        (category) =>
          category.categoryId ===
            categoryId &&
          category.type === newType
      );

    if (!currentCategory) {
      const firstCategory =
        categories.find(
          (category) =>
            category.type === newType
        );

      setCategoryId(
        firstCategory?.categoryId || ""
      );
    }
  }

  async function handleSave() {
    setDrawerError("");

    if (!amount || Number(amount) <= 0) {
      setDrawerError(
        "Please enter a valid amount."
      );
      return;
    }

    if (!description.trim()) {
      setDrawerError(
        "Please enter a description."
      );
      return;
    }

    if (!categoryId) {
      setDrawerError(
        "Please select a category."
      );
      return;
    }

    if (!date) {
      setDrawerError(
        "Please select a date."
      );
      return;
    }

    const payload = {
      categoryId,
      amount: Number(amount),
      type,
      description:
        description.trim(),
      date,
    };

    try {
      setSaving(true);

      if (isCreate) {
        await onCreate(payload);
      } else {
        await onUpdate(
          transaction.transactionId,
          payload
        );
        onClose();
      }
    } catch (err) {
      console.error(
        "Failed to save transaction:",
        err
      );

      setDrawerError(
        err.message ||
          "Failed to save transaction."
      );
    } finally {
      setSaving(false);
    }
  }

  const tone = transaction
    ? toneForCategory(
        transaction.categoryName
      )
    : "slate";

  const icon = transaction
    ? iconForCategory(
        transaction.categoryName
      )
    : "receipt";

  return (
    <div className="modal-backdrop">
      <aside className="transaction-drawer">
        <div className="drawer-head">
          <h2>
            {isCreate
              ? "Add transaction"
              : "Transaction details"}
          </h2>

          <button onClick={onClose}>
            <Icon
              name="close"
              size={18}
            />
          </button>
        </div>

        <div className="drawer-summary">
          {toneIcon(tone, icon)}

          <div>
            <b>
              {isCreate
                ? "New transaction"
                : transaction.description ||
                  "Untitled transaction"}
            </b>

            <small>
              {type === "INCOME"
                ? "Income"
                : "Expense"}{" "}
              · {formatDate(date)}
            </small>
          </div>

          <strong>
            {amount
              ? money(amount, type)
              : type === "INCOME"
                ? `+${formatMoney(0)}`
                : `−${formatMoney(0)}`}
          </strong>
        </div>

        <div className="expense-tabs">
          <button
            className={
              type === "EXPENSE"
                ? "active"
                : ""
            }
            onClick={() =>
              handleTypeChange("EXPENSE")
            }
          >
            Expense
          </button>

          <button
            className={
              type === "INCOME"
                ? "active"
                : ""
            }
            onClick={() =>
              handleTypeChange("INCOME")
            }
          >
            Income
          </button>
        </div>

        {drawerError && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 12px",
              borderRadius: "10px",
              fontSize: "12px",
            }}
          >
            {drawerError}
          </div>
        )}

        <label>
          Amount

          <div className="field-input">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="0.00"
            />
          </div>
        </label>

        <label>
          Description

          <div className="field-input">
            <input
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              maxLength={500}
              placeholder="What was this for?"
            />
          </div>
        </label>

        <label>
          Category

          <div className="field-input">
            <select
              value={categoryId}
              onChange={(e) =>
                setCategoryId(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                background:
                  "transparent",
              }}
            >
              <option value="">
                Select category
              </option>

              {availableCategories.map(
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
          </div>
        </label>

        <label>
          Date

          <div className="field-input">
            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />
          </div>
        </label>

        {!isCreate && (
          <div className="edit-history">
            <b>
              Transaction record
            </b>

            <p>
              Created on{" "}
              {transaction.createdAt
                ? new Date(
                    transaction.createdAt
                  ).toLocaleString()
                : "—"}
            </p>

            <p>
              Transaction ID
              <br />
              <small>
                {transaction.transactionId}
              </small>
            </p>
          </div>
        )}

        <div className="drawer-footer">
          {!isCreate && (
            <button
              className="danger"
              onClick={() =>
                onDelete(
                  transaction.transactionId
                )
              }
              disabled={saving}
            >
              Delete
            </button>
          )}

          <button
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="primary-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isCreate
                ? "✓ Add transaction"
                : "✓ Save changes"}
          </button>
        </div>
      </aside>
    </div>
  );
}

export default TransactionsPage;