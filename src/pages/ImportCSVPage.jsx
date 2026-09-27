import { useEffect, useMemo, useRef, useState } from "react";
import { navigate } from "../routes/AppRoutes";
import Icon from "../components/Icon";
import { DashboardShell } from "./DashboardPage";

import { getCategories } from "../api/categoryApi";
import { createTransaction } from "../api/transactionApi";

const REQUIRED_COLUMNS = [
  "description",
  "amount",
  "type",
  "category",
  "date",
];

const SAMPLE_CSV = `description,amount,type,category,date
Campus Cafe,8.50,EXPENSE,Food,2026-09-23
Library desk shift,160.00,INCOME,Part-time Work,2026-09-21
Scholarship stipend,250.00,INCOME,Scholarship,2026-09-05
Hostel rent,300.00,EXPENSE,Hostel/Rent,2026-09-01`;

function ImportCSVPage() {
  const fileInputRef = useRef(null);

  const [dark, setDark] = useState(false);
  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoadingCategories(true);

      const data = await getCategories();

      setCategories(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load categories:",
        err
      );

      setError(
        err.message ||
          "Failed to load categories."
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  function normalizeHeader(header) {
    return header
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
  }

  function normalizeValue(value) {
    return String(value ?? "").trim();
  }

  /*
   * Basic CSV parser that supports:
   * - comma separated values
   * - quoted values
   * - commas inside quoted values
   */
  function parseCSV(text) {
    const result = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"' && insideQuotes && nextChar === '"') {
        value += '"';
        i++;
        continue;
      }

      if (char === '"') {
        insideQuotes = !insideQuotes;
        continue;
      }

      if (char === "," && !insideQuotes) {
        row.push(value);
        value = "";
        continue;
      }

      if (
        (char === "\n" || char === "\r") &&
        !insideQuotes
      ) {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }

        row.push(value);
        value = "";

        if (
          row.some(
            (cell) =>
              String(cell).trim() !== ""
          )
        ) {
          result.push(row);
        }

        row = [];
        continue;
      }

      value += char;
    }

    if (value !== "" || row.length > 0) {
      row.push(value);

      if (
        row.some(
          (cell) =>
            String(cell).trim() !== ""
        )
      ) {
        result.push(row);
      }
    }

    return result;
  }

  function findCategory(categoryName) {
    const normalized =
      categoryName.trim().toLowerCase();

    return categories.find(
      (category) =>
        category.name?.trim().toLowerCase() ===
        normalized
    );
  }

  function validateRow(row, rowNumber) {
    const errors = [];

    const description =
      normalizeValue(row.description);

    const amountText =
      normalizeValue(row.amount);

    const type =
      normalizeValue(row.type).toUpperCase();

    const categoryName =
      normalizeValue(row.category);

    const date =
      normalizeValue(row.date);

    if (!description) {
      errors.push("Description is required");
    }

    const amount = Number(
      amountText.replace(/[$,]/g, "")
    );

    if (
      !amountText ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      errors.push("Amount must be greater than 0");
    }

    if (
      type !== "INCOME" &&
      type !== "EXPENSE"
    ) {
      errors.push(
        "Type must be INCOME or EXPENSE"
      );
    }

    const category = findCategory(
      categoryName
    );

    if (!categoryName) {
      errors.push("Category is required");
    } else if (!category) {
      errors.push(
        `Category "${categoryName}" was not found`
      );
    } else if (
      category.type !== type
    ) {
      errors.push(
        `Category "${category.name}" is an ${category.type.toLowerCase()} category`
      );
    }

    if (!date) {
      errors.push("Date is required");
    } else if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      errors.push(
        "Date must use YYYY-MM-DD"
      );
    } else {
      const parsed = new Date(
        `${date}T00:00:00`
      );

      if (Number.isNaN(parsed.getTime())) {
        errors.push("Invalid date");
      }
    }

    return {
      ...row,
      rowNumber,
      description,
      amount,
      type,
      categoryName,
      date,
      category,
      errors,
      valid: errors.length === 0,
    };
  }

  async function processFile(selectedFile) {
    setError("");
    setSuccess("");
    setRows([]);

    if (!selectedFile) {
      return;
    }

    if (
      !selectedFile.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setError(
        "Please select a CSV file."
      );
      return;
    }

    setFile(selectedFile);
    setParsing(true);

    try {
      const text =
        await selectedFile.text();

      const parsed =
        parseCSV(text);

      if (!parsed.length) {
        throw new Error(
          "The CSV file is empty."
        );
      }

      const headers =
        parsed[0].map(normalizeHeader);

      const missingColumns =
        REQUIRED_COLUMNS.filter(
          (column) =>
            !headers.includes(column)
        );

      if (missingColumns.length) {
        throw new Error(
          `Missing required column${
            missingColumns.length > 1
              ? "s"
              : ""
          }: ${missingColumns.join(", ")}`
        );
      }

      const dataRows = parsed.slice(1);

      if (!dataRows.length) {
        throw new Error(
          "The CSV contains headers but no transaction rows."
        );
      }

      const mappedRows =
        dataRows.map(
          (values, index) => {
            const raw = {};

            headers.forEach(
              (header, columnIndex) => {
                raw[header] =
                  values[columnIndex] ?? "";
              }
            );

            return validateRow(
              raw,
              index + 2
            );
          }
        );

      setRows(mappedRows);
    } catch (err) {
      console.error(
        "CSV parsing failed:",
        err
      );

      setFile(null);

      setError(
        err.message ||
          "Unable to read this CSV file."
      );
    } finally {
      setParsing(false);
    }
  }

  function handleFileChange(event) {
    const selectedFile =
      event.target.files?.[0];

    processFile(selectedFile);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    processFile(droppedFile);
  }

  function removeFile() {
    setFile(null);
    setRows([]);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function downloadTemplate() {
    const blob = new Blob(
      [SAMPLE_CSV],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "campuscoin-transactions-template.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  const validRows = useMemo(
    () =>
      rows.filter(
        (row) => row.valid
      ),
    [rows]
  );

  const invalidRows = useMemo(
    () =>
      rows.filter(
        (row) => !row.valid
      ),
    [rows]
  );

  const totalAmount = useMemo(
    () =>
      validRows.reduce(
        (total, row) =>
          total + Number(row.amount || 0),
        0
      ),
    [validRows]
  );

  async function handleImport() {
    setError("");
    setSuccess("");

    if (!validRows.length) {
      setError(
        "There are no valid transactions to import."
      );
      return;
    }

    setImporting(true);

    let imported = 0;
    const failed = [];

    for (const row of validRows) {
      try {
        await createTransaction({
          categoryId:
            row.category.categoryId,
          amount: row.amount,
          type: row.type,
          description:
            row.description,
          date: row.date,
        });

        imported++;
      } catch (err) {
        console.error(
          `Failed to import row ${row.rowNumber}:`,
          err
        );

        failed.push({
          ...row,
          importError:
            err.message ||
            "Failed to import row",
        });
      }
    }

    setImporting(false);

    if (failed.length === 0) {
      setSuccess(
        `Import complete. ${imported} transaction${
          imported === 1
            ? ""
            : "s"
        } imported successfully.`
      );

      setRows([]);
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSuccess(
      `${imported} transaction${
        imported === 1
          ? ""
          : "s"
      } imported successfully.`
    );

    setRows(
      failed.map((row) => ({
        ...row,
        errors: [
          ...(row.errors || []),
          row.importError,
        ],
        valid: false,
      }))
    );
  }

  return (
    <DashboardShell
      dark={dark}
      setDark={setDark}
      notificationOpen={notificationOpen}
      setNotificationOpen={
        setNotificationOpen
      }
      page="Import CSV"
      search=""
      setSearch={() => {}}
    >
      <section className="dash-content transaction-page">
        <div className="dash-heading">
          <div>
            <label>TRANSACTIONS</label>

            <h1>Import CSV</h1>

            <p>
              Import your income and expense
              records from a CSV file.
            </p>
          </div>

          <div className="heading-actions">
            <button
              className="outline-btn"
              onClick={() =>
                navigate("/transactions")
              }
            >
              <Icon
                name="arrowleft"
                size={15}
              />
              Back to transactions
            </button>
          </div>
        </div>

        {error && (
          <div className="alert-row">
            <div className="alert duplicate">
              <span>⚠</span>

              <div>
                <b>Import issue</b>
                <small>{error}</small>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="alert-row">
            <div className="alert large">
              <span>✓</span>

              <div>
                <b>Import successful</b>
                <small>{success}</small>
              </div>
            </div>
          </div>
        )}

        <div className="csv-import-grid">
          <div className="table-card csv-main-card">
            <div className="csv-card-header">
              <div>
                <h2>Upload transactions</h2>

                <p>
                  Choose a CSV file containing
                  your transaction records.
                </p>
              </div>

              <button
                className="outline-btn"
                onClick={
                  downloadTemplate
                }
              >
                <Icon
                  name="download"
                  size={15}
                />
                Download template
              </button>
            </div>

            {!file ? (
              <div
                className={`csv-dropzone ${
                  dragActive
                    ? "drag-active"
                    : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() =>
                  setDragActive(false)
                }
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <div className="csv-upload-icon">
                  <Icon
                    name="upload"
                    size={26}
                  />
                </div>

                <h3>
                  Drop your CSV here
                </h3>

                <p>
                  or click to browse from
                  your computer
                </p>

                <small>
                  CSV files only
                </small>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={
                    handleFileChange
                  }
                  hidden
                />
              </div>
            ) : (
              <div className="csv-file-card">
                <div className="csv-file-icon">
                  <Icon
                    name="file"
                    size={22}
                  />
                </div>

                <div>
                  <b>{file.name}</b>

                  <small>
                    {(
                      file.size / 1024
                    ).toFixed(1)}{" "}
                    KB
                  </small>
                </div>

                <button
                  onClick={removeFile}
                  disabled={parsing}
                >
                  <Icon
                    name="close"
                    size={16}
                  />
                </button>
              </div>
            )}

            {parsing && (
              <div className="csv-status">
                Reading CSV...
              </div>
            )}

            {rows.length > 0 && (
              <>
                <div className="csv-summary">
                  <div>
                    <span>Total rows</span>
                    <b>{rows.length}</b>
                  </div>

                  <div>
                    <span>Valid</span>
                    <b>
                      {validRows.length}
                    </b>
                  </div>

                  <div>
                    <span>Issues</span>
                    <b>
                      {invalidRows.length}
                    </b>
                  </div>

                  <div>
                    <span>Total amount</span>
                    <b>
                      $
                      {totalAmount.toFixed(
                        2
                      )}
                    </b>
                  </div>
                </div>

                <div className="csv-preview-header">
                  <div>
                    <h3>
                      Transaction preview
                    </h3>

                    <p>
                      Review the records before
                      importing them.
                    </p>
                  </div>
                </div>

                <div className="csv-table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ROW</th>
                        <th>DESCRIPTION</th>
                        <th>AMOUNT</th>
                        <th>TYPE</th>
                        <th>CATEGORY</th>
                        <th>DATE</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={
                            row.rowNumber
                          }
                        >
                          <td>
                            {row.rowNumber}
                          </td>

                          <td>
                            <b>
                              {
                                row.description
                              }
                            </b>
                          </td>

                          <td>
                            $
                            {Number(
                              row.amount || 0
                            ).toFixed(2)}
                          </td>

                          <td>
                            {row.type}
                          </td>

                          <td>
                            {
                              row.categoryName
                            }
                          </td>

                          <td>
                            {row.date}
                          </td>

                          <td>
                            {row.valid ? (
                              <span className="csv-valid">
                                ✓ Valid
                              </span>
                            ) : (
                              <span className="csv-invalid">
                                ⚠{" "}
                                {row.errors.join(
                                  " · "
                                )}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="csv-import-footer">
                  <button
                    className="outline-btn"
                    onClick={removeFile}
                    disabled={
                      importing
                    }
                  >
                    Start over
                  </button>

                  <button
                    className="primary-btn"
                    onClick={
                      handleImport
                    }
                    disabled={
                      importing ||
                      validRows.length ===
                        0 ||
                      loadingCategories
                    }
                  >
                    {importing
                      ? "Importing..."
                      : `Import ${validRows.length} transaction${
                          validRows.length ===
                          1
                            ? ""
                            : "s"
                        }`}
                  </button>
                </div>
              </>
            )}
          </div>

          <aside className="transaction-side">
            <div className="dash-card csv-help-card">
              <h3>
                CSV format
              </h3>

              <small>
                Your file should contain these
                five columns.
              </small>

              <div className="csv-column-list">
                <div>
                  <b>
                    description
                  </b>
                  <span>
                    Campus Cafe
                  </span>
                </div>

                <div>
                  <b>amount</b>
                  <span>8.50</span>
                </div>

                <div>
                  <b>type</b>
                  <span>
                    EXPENSE
                  </span>
                </div>

                <div>
                  <b>category</b>
                  <span>
                    Food
                  </span>
                </div>

                <div>
                  <b>date</b>
                  <span>
                    2026-09-23
                  </span>
                </div>
              </div>
            </div>

            <div className="dash-card csv-help-card">
              <h3>
                Before importing
              </h3>

              <small>
                Make sure your file follows
                these rules.
              </small>

              <ul className="csv-rules">
                <li>
                  Amount must be greater
                  than zero.
                </li>

                <li>
                  Type must be INCOME or
                  EXPENSE.
                </li>

                <li>
                  Category must already
                  exist in CampusCoin.
                </li>

                <li>
                  Category type must match
                  the transaction type.
                </li>

                <li>
                  Date must use
                  YYYY-MM-DD.
                </li>
              </ul>
            </div>

            <div className="dash-card csv-help-card">
              <h3>
                Your data
              </h3>

              <small>
                CampusCoin only creates
                transaction records from
                your CSV. It does not move
                money or connect to your bank.
              </small>
            </div>
          </aside>
        </div>
      </section>
    </DashboardShell>
  );
}

export default ImportCSVPage;