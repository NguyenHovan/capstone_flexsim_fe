export const ORDER_CODE_KEY = "pay.orderCode";

export const saveOrderCode = (code: string | number) =>
  localStorage.setItem(ORDER_CODE_KEY, String(code));

export const loadOrderCode = () => localStorage.getItem(ORDER_CODE_KEY) || "";

export const getQueryParam = (key: string) =>
  new URLSearchParams(window.location.search).get(key) || "";
