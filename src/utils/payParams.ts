const KEY = "pay_order_code";

export const saveOrderCode = (orderCode: string | number) => {
  try { localStorage.setItem(KEY, String(orderCode)); } catch {}
};

export const loadOrderCode = (): string | null => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export const clearOrderCode = () => {
  try { localStorage.removeItem(KEY); } catch {}
};

export const getQueryParam = (name: string): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
};
