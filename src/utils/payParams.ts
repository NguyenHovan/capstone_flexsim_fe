const ORDER_CODE_KEY = "pay_order_code";
const ORDER_ID_KEY   = "pay_order_id";
const ACCOUNT_ID_KEY = "pay_account_id";
const ORIGIN_KEY     = "preferred_origin";

export const saveOrderCode = (orderCode: string | number) => {
  try { localStorage.setItem(ORDER_CODE_KEY, String(orderCode)); } catch {}
};
export const loadOrderCode = (): string | null => {
  try { return localStorage.getItem(ORDER_CODE_KEY); } catch { return null; }
};
export const clearOrderCode = () => { try { localStorage.removeItem(ORDER_CODE_KEY); } catch {} };

export const saveOrderId = (orderId: string) => { try { localStorage.setItem(ORDER_ID_KEY, orderId); } catch {} };
export const loadOrderId = (): string | null => { try { return localStorage.getItem(ORDER_ID_KEY); } catch { return null; } };
export const clearOrderId = () => { try { localStorage.removeItem(ORDER_ID_KEY); } catch {} };

export const saveAccountId = (accountId: string) => { try { localStorage.setItem(ACCOUNT_ID_KEY, accountId); } catch {} };
export const loadAccountId = (): string | null => { try { return localStorage.getItem(ACCOUNT_ID_KEY); } catch { return null; } };
export const clearAccountId = () => { try { localStorage.removeItem(ACCOUNT_ID_KEY); } catch {} };

export const getQueryParam = (name: string): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
};

export const savePreferredOrigin = () => { try { localStorage.setItem(ORIGIN_KEY, window.location.origin); } catch {} };
export const loadPreferredOrigin  = (): string | null => { try { return localStorage.getItem(ORIGIN_KEY); } catch { return null; } };
export const clearPreferredOrigin = () => { try { localStorage.removeItem(ORIGIN_KEY); } catch {} };
