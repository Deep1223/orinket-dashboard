import { store } from '../store/store';
import { setPendingProductMasterSearch, clearPendingProductMasterSearch } from '../store/reducer';

/**
 * Search string to pre-fill on Product Master when opening a notification.
 */
export function getProductMasterSearchQuery(notification) {
  if (!notification) return '';
  const m = notification.meta || {};
  if (m.productSearch) return String(m.productSearch).trim();
  if (m.productName) return String(m.productName).trim();
  if (notification.type === 'low_stock' || notification.type === 'out_of_stock') {
    return String(notification.boldName || notification.name || '').trim();
  }
  return String(notification.boldName || notification.name || '').trim();
}

/**
 * Redux: queue Product Master grid search (consumed once in MasterController).
 */
export function navigateFromNotification(navigate, notification, options = {}) {
  const rawPath = notification?.redirectPath || '/dashboard';
  const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;

  if (path === '/productmaster' || path.startsWith('/productmaster')) {
    const q = getProductMasterSearchQuery(notification);
    if (q) {
      store.dispatch(setPendingProductMasterSearch(q));
    }
  } else {
    store.dispatch(clearPendingProductMasterSearch());
  }

  options.onClose?.();
  navigate(path);
}
