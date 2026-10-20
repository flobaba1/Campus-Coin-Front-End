
import { useSyncExternalStore } from "react";
import { getTransactions } from "../api/transactionApi";
import { getCategories } from "../api/categoryApi";

const listeners = new Set();

let state = {
  transactions: [],
  categories: [],
  loaded: false,
  loading: false,
  error: "",
};

let loadPromise = null;

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function updateState(updates) {
  state = {
    ...state,
    ...updates,
  };

  notify();
}

export function useTransactionStore() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
}

export async function loadTransactionData({ force = false } = {}) {
  if (state.loaded && !force) {
    return state;
  }

  if (loadPromise && !force) {
    return loadPromise;
  }

  updateState({
    loading: true,
    error: "",
  });

  loadPromise = Promise.all([
    getTransactions(),
    getCategories(),
  ])
    .then(([transactionData, categoryData]) => {
      updateState({
        transactions: Array.isArray(transactionData)
          ? transactionData
          : [],
        categories: Array.isArray(categoryData)
          ? categoryData
          : [],
        loaded: true,
        loading: false,
        error: "",
      });

      return state;
    })
    .catch((error) => {
      updateState({
        loading: false,
        error: error?.message || "Failed to load transaction data.",
      });

      throw error;
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

export function setSharedTransactions(updater) {
  const transactions =
    typeof updater === "function"
      ? updater(state.transactions)
      : updater;

  updateState({
    transactions: Array.isArray(transactions)
      ? transactions
      : [],
  });
}

export function setSharedCategories(updater) {
  const categories =
    typeof updater === "function"
      ? updater(state.categories)
      : updater;

  updateState({
    categories: Array.isArray(categories)
      ? categories
      : [],
  });
}

export function clearTransactionStore() {
  loadPromise = null;

  updateState({
    transactions: [],
    categories: [],
    loaded: false,
    loading: false,
    error: "",
  });
}
