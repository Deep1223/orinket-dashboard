import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Config from '../../config/config';
import StorageService from '../../utils/StorageService';
import OrderManagementView from '../common/OrderManagement/OrderManagementView';
import { buildThermalShippingLabelHtml } from '../../utils/thermalShippingLabelHtml';

function authHeaders() {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = StorageService.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

const API_SORT_FIELDS = new Set(['orderNumber', 'totalAmount', 'orderStatus', 'paymentStatus', 'createdAt']);
const SCROLL_THRESHOLD = 50; // px from bottom to trigger next page

function routeSegmentToApiStatus(segment) {
  const s = String(segment || '').toLowerCase();
  const allowed = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'];
  if (!s || s === 'all') return '';
  if (allowed.includes(s)) return s;
  return '';
}

function normalizeRowStatusForSelect(status) {
  if (status === 'processing') return 'pending';
  return status;
}

function eligibleStatusesForAction(action) {
  switch (action) {
    case 'confirm':         return new Set(['pending', 'processing']);
    case 'packed':          return new Set(['confirmed']);
    case 'shipped':         return new Set(['packed']);
    case 'delivered':       return new Set(['shipped']);
    case 'cancel':          return new Set(['pending', 'processing', 'confirmed', 'packed', 'shipped']);
    case 'return_received': return new Set(['return_requested']);
    case 'refund':          return new Set(['returned']);
    default:                return null;
  }
}

const OrderManagementController = () => {
  const { status: routeStatus } = useParams();
  const apiStatusFilter = routeSegmentToApiStatus(routeStatus);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [draftStatus, setDraftStatus] = useState({});

  // Bulk mode
  const [bulkModeActive, setBulkModeActive] = useState(false);
  const [bulkModeAction, setBulkModeAction] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [appliedPaymentFilter, setAppliedPaymentFilter] = useState('');
  const [draftPaymentFilter, setDraftPaymentFilter] = useState('');

  const [pageNo, setPageNo] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(0);

  const [bulkPickerOpen, setBulkPickerOpen] = useState(false);
  const [bulkPickerDraft, setBulkPickerDraft] = useState('');
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkCancelReason, setBulkCancelReason] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Track if current load is a "fresh" load (page 1) or append (page > 1)
  const pageNoRef = useRef(1);
  const abortRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const sortParam = sortField && sortOrder !== 0 && API_SORT_FIELDS.has(sortField) ? sortField : 'none';
  const orderParam = sortOrder === 1 ? 'asc' : sortOrder === -1 ? 'desc' : 'none';

  /** Core fetch — appends when page > 1, replaces when page === 1 */
  const load = useCallback(async (page) => {
    const isAppend = page > 1;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    if (!isAppend) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      qs.set('limit', String(pageLimit));
      qs.set('sort', sortParam);
      qs.set('order', orderParam);
      if (apiStatusFilter) qs.set('orderStatus', apiStatusFilter);
      if (searchApplied.trim()) qs.set('q', searchApplied.trim());
      if (appliedPaymentFilter) qs.set('paymentStatus', appliedPaymentFilter);

      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders?${qs.toString()}`, {
        credentials: 'include',
        headers: authHeaders(),
        signal: abortRef.current.signal,
      });
      const json = await res.json();

      if (!isMounted.current) return;

      if (json?.success && Array.isArray(json.data)) {
        const incoming = json.data;
        const totalCount = Number(json.total || 0);
        const totalPages = json.totalPages || Math.ceil(totalCount / pageLimit) || 0;
        const nextHasMore = page < totalPages;

        setTotal(totalCount);
        setHasMore(nextHasMore);

        // Merge draft status map
        setDraftStatus((prev) => {
          const next = isAppend ? { ...prev } : {};
          incoming.forEach((r) => {
            next[String(r._id)] = normalizeRowStatusForSelect(r.orderStatus);
          });
          return next;
        });

        // Append or replace
        if (isAppend) {
          setRows((prev) => [...prev, ...incoming]);
        } else {
          setRows(incoming);
        }
      } else {
        if (!isAppend) {
          setRows([]);
          setTotal(0);
        }
        toast.error(json?.message || 'Could not load orders');
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      if (!isMounted.current) return;
      if (!isAppend) { setRows([]); }
      toast.error('Could not load orders');
    } finally {
      if (!isMounted.current) return;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageLimit, sortParam, orderParam, apiStatusFilter, searchApplied, appliedPaymentFilter]);

  // Initial load / filter change — always reset to page 1
  useEffect(() => {
    pageNoRef.current = 1;
    setPageNo(1);
    setSelectedIds(new Set());
    load(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortParam, orderParam, apiStatusFilter, searchApplied, appliedPaymentFilter, pageLimit]);

  // When pageNo increments via scroll, load the next page
  useEffect(() => {
    if (pageNo <= 1) return;
    pageNoRef.current = pageNo;
    load(pageNo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo]);

  /** Reload from page 1 (after status update etc.) */
  const reload = useCallback(async () => {
    pageNoRef.current = 1;
    setPageNo(1);
    await load(1);
  }, [load]);

  /** Infinite scroll handler — attach to the table scroll container */
  const handleScroll = useCallback((e) => {
    const el = e.target;
    const distFromBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight);
    if (distFromBottom < SCROLL_THRESHOLD && hasMore && !loading && !loadingMore) {
      setPageNo((prev) => prev + 1);
    }
  }, [hasMore, loading, loadingMore]);

  const exitBulkMode = () => {
    setBulkModeActive(false);
    setBulkModeAction('');
    setSelectedIds(new Set());
    setBulkCancelReason('');
  };

  const handleSearch = (term) => {
    setSearchApplied(term.trim());
  };

  const onClearSearch = () => {
    setSearchTerm('');
    setSearchApplied('');
  };

  const onApplyFilters = (payment) => {
    setAppliedPaymentFilter(payment || '');
    setDraftPaymentFilter(payment || '');
    setFilterOpen(false);
  };

  const onPageSizeChange = (nextLimit) => {
    const n = Number(nextLimit);
    if (!Number.isFinite(n) || n <= 0 || n === pageLimit) return;
    pageNoRef.current = 1;
    setPageNo(1);
    setRows([]);
    setHasMore(false);
    setSelectedIds(new Set());
    setPageLimit(n);
  };

  const toggleSort = (fieldName) => {
    if (!API_SORT_FIELDS.has(fieldName)) return;
    if (fieldName === 'createdAt') {
      if (sortField !== 'createdAt') { setSortField('createdAt'); setSortOrder(1); }
      else if (sortOrder === 1) { setSortOrder(-1); }
      else if (sortOrder === -1) { setSortField(null); setSortOrder(0); }
      else { setSortOrder(1); }
    } else if (sortField !== fieldName) {
      setSortField(fieldName); setSortOrder(1);
    } else {
      setSortOrder((o) => (o === 1 ? -1 : 1));
    }
  };

  const sortIcon = (fieldName) => {
    if (fieldName === 'createdAt') {
      if (sortField !== 'createdAt' || sortOrder === 0)
        return <i className="fi fi-rr-sort-alt text-secondary text-14" />;
      return sortOrder === 1
        ? <i className="fi fi-rr-sort-alpha-up text-primary text-14" />
        : <i className="fi fi-rr-sort-alpha-down-alt text-primary text-14" />;
    }
    if (sortField !== fieldName)
      return <i className="fi fi-rr-sort-alt text-secondary text-14" />;
    return sortOrder === 1
      ? <i className="fi fi-rr-sort-alpha-up text-primary text-14" />
      : <i className="fi fi-rr-sort-alpha-down-alt text-primary text-14" />;
  };

  const applyStatus = async (orderId, nextStatus) => {
    if (!nextStatus) return;
    const prevRow = rows.find((r) => String(r._id) === String(orderId));
    const previous = prevRow?.orderStatus;
    if (nextStatus === normalizeRowStatusForSelect(previous)) return;

    setDraftStatus((prev) => ({ ...prev, [orderId]: nextStatus }));
    setSavingId(orderId);
    try {
      const body = { orderStatus: nextStatus };
      if (nextStatus === 'cancelled') body.cancelReason = '';
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/${orderId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success('Order updated');
        // Update the row in-place rather than full reload
        setRows((prev) =>
          prev.map((r) =>
            String(r._id) === String(orderId)
              ? { ...r, orderStatus: nextStatus, displayStatus: normalizeRowStatusForSelect(nextStatus) }
              : r
          )
        );
        setDraftStatus((prev) => ({ ...prev, [orderId]: normalizeRowStatusForSelect(nextStatus) }));
      } else {
        setDraftStatus((prev) => ({ ...prev, [orderId]: normalizeRowStatusForSelect(previous) }));
        toast.error(json?.message || 'Update failed');
      }
    } catch (_e) {
      setDraftStatus((prev) => ({ ...prev, [orderId]: normalizeRowStatusForSelect(previous) }));
      toast.error('Update failed');
    } finally {
      setSavingId(null);
    }
  };

  const eligibleSet = bulkModeActive ? eligibleStatusesForAction(bulkModeAction) : null;
  const eligibleRows = bulkModeActive
    ? (eligibleSet ? rows.filter((r) => eligibleSet.has(normalizeRowStatusForSelect(r.orderStatus))) : rows)
    : [];

  const allEligibleSelected = eligibleRows.length > 0 && eligibleRows.every((r) => selectedIds.has(String(r._id)));
  const someEligibleSelected = eligibleRows.some((r) => selectedIds.has(String(r._id)));

  const onToggleAll = () => {
    if (!eligibleRows.length) return;
    const allIds = eligibleRows.map((r) => String(r._id));
    const allOn = allIds.every((id) => selectedIds.has(id));
    setSelectedIds(allOn ? new Set() : new Set(allIds));
  };

  const onToggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onBulkClick = () => { setBulkPickerDraft(''); setBulkPickerOpen(true); };

  const onBulkPickerConfirm = () => {
    if (!bulkPickerDraft) return;
    setBulkModeAction(bulkPickerDraft);
    setBulkModeActive(true);
    setSelectedIds(new Set());
    setBulkPickerOpen(false);
  };

  const onBulkApply = () => {
    if (!selectedIds.size) return;
    setBulkCancelReason('');
    setBulkConfirmOpen(true);
  };

  const onBulkSubmit = async () => {
    if (!bulkModeAction) return;
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setBulkSubmitting(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/bulk-status`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ ids, action: bulkModeAction, cancelReason: bulkCancelReason }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success(`Updated ${json.data?.updated ?? 0} order(s)`);
        if (json.data?.failed?.length) toast.warning(`${json.data.failed.length} failed`);
        setBulkConfirmOpen(false);
        exitBulkMode();
        await reload();
      } else {
        toast.error(json?.message || 'Bulk update failed');
      }
    } catch (_e) {
      toast.error('Bulk update failed');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const onPrintLabels = async () => {
    setPrintLoading(true);
    try {
      // Always print all packed orders — no selection needed
      const body = { status: 'packed' };
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/print-labels`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        toast.error(json?.message || 'Could not generate labels');
        return;
      }
      openShippingLabelWindow(json.labels, json.store);
    } catch (_e) {
      toast.error('Could not generate labels');
    } finally {
      setPrintLoading(false);
    }
  };

  function openShippingLabelWindow(labels, store) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const html = buildThermalShippingLabelHtml(labels, store, { origin });

    const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:0;';
    document.body.appendChild(iframe);
    iframe.onload = () => {
      // Wait for JsBarcode CDN script to execute
      setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 2000);
      }, 1100);
    };
    iframe.src = blobUrl;
  }

  const onExportCsv = async () => {
    setExportLoading(true);
    try {
      const qs = new URLSearchParams();
      if (apiStatusFilter) qs.set('orderStatus', apiStatusFilter);
      if (searchApplied.trim()) qs.set('q', searchApplied.trim());
      if (appliedPaymentFilter) qs.set('paymentStatus', appliedPaymentFilter);

      const token = StorageService.getToken();
      const headers = { Accept: 'text/csv' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/export?${qs.toString()}`, {
        credentials: 'include',
        headers,
      });
      if (!res.ok) { toast.error('Export failed'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (_e) {
      toast.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  const showingCount = rows.length;
  const selectedCount = selectedIds.size;

  return (
    <OrderManagementView
      // Bulk picker
      bulkPickerOpen={bulkPickerOpen}
      setBulkPickerOpen={setBulkPickerOpen}
      bulkPickerDraft={bulkPickerDraft}
      setBulkPickerDraft={setBulkPickerDraft}
      onBulkPickerConfirm={onBulkPickerConfirm}
      // Bulk mode
      bulkModeActive={bulkModeActive}
      bulkModeAction={bulkModeAction}
      onExitBulkMode={exitBulkMode}
      onBulkApply={onBulkApply}
      // Bulk confirm
      bulkConfirmOpen={bulkConfirmOpen}
      setBulkConfirmOpen={setBulkConfirmOpen}
      bulkCancelReason={bulkCancelReason}
      setBulkCancelReason={setBulkCancelReason}
      onBulkSubmit={onBulkSubmit}
      bulkSubmitting={bulkSubmitting}
      // Grid state
      filterOpen={filterOpen}
      setFilterOpen={setFilterOpen}
      draftPaymentFilter={draftPaymentFilter}
      setDraftPaymentFilter={setDraftPaymentFilter}
      appliedPaymentFilter={appliedPaymentFilter}
      onApplyFilters={onApplyFilters}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      onSearch={handleSearch}
      searchApplied={searchApplied}
      onClearSearch={onClearSearch}
      onPrintLabels={onPrintLabels}
      printLoading={printLoading}
      onExportCsv={onExportCsv}
      exportLoading={exportLoading}
      selectedCount={selectedCount}
      onBulkClick={onBulkClick}
      rows={rows}
      eligibleRows={eligibleRows}
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMore}
      handleScroll={handleScroll}
      selectedIds={selectedIds}
      allEligibleSelected={allEligibleSelected}
      someEligibleSelected={someEligibleSelected}
      onToggleAll={onToggleAll}
      onToggleOne={onToggleOne}
      draftStatus={draftStatus}
      savingId={savingId}
      onRowStatusChange={applyStatus}
      sortField={sortField}
      sortOrder={sortOrder}
      onToggleSort={toggleSort}
      sortIcon={sortIcon}
      totalCount={total}
      showingCount={showingCount}
      pageLimit={pageLimit}
      onPageSizeChange={onPageSizeChange}
    />
  );
};

export default OrderManagementController;
