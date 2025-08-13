const KEY = "pay_order_code";

export const saveOrderCode = (orderCode: string | number) => {
  try { sessionStorage.setItem(KEY, String(orderCode)); } catch {}
};

export const loadOrderCode = (): string | null => {
  try { return sessionStorage.getItem(KEY); } catch { return null; }
};

export const clearOrderCode = () => {
  try { sessionStorage.removeItem(KEY); } catch {}
};

export const getQueryParam = (name: string): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
};
