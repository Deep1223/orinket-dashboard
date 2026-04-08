import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Tooltip, Whisper, Drawer } from 'rsuite';
import { BiFilterAlt } from 'react-icons/bi';
import { TbGridDots } from 'react-icons/tb';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaRegCopy } from 'react-icons/fa';
import Config from '../config/config';
import StorageService from '../utils/StorageService';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

function authHeaders() {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = StorageService.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

const STATUSES = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const SORT_FIELDS = {
  id: 'id',
  product: 'product',
  createdAt: 'createdAt',
  customer: 'customer',
  paymentStatus: 'paymentStatus',
  totalAmount: 'totalAmount',
  orderStatus: 'orderStatus',
};

function formatRs(n) {
  const v = Number(n || 0);
  return `Rs ${v.toLocaleString('en-IN')}`;
}

function customerLabel(row) {
  if (row.user?.email) return row.user.email;
  if (row.user?.name) return row.user.name;
  if (row.sessionId) return `Guest · ${String(row.sessionId).slice(0, 12)}…`;
  return '—';
}

function customerDisplayName(row) {
  const ship = row.shippingAddress || {};
  if (ship.name && String(ship.name).trim()) return String(ship.name).trim();
  if (row.user?.name) return row.user.name;
  if (row.sessionId) return `Guest`;
  return '—';
}

function customerEmail(row) {
  const ship = row.shippingAddress || {};
  return row.user?.email || ship.email || '';
}

function customerPhone(row) {
  return row.shippingAddress?.phone || '';
}

function customerSortKey(row) {
  return (customerLabel(row) || '').toLowerCase();
}

function formatOrderDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (_e) {
    return '—';
  }
}

function productSortKey(row) {
  const first = row.items?.[0];
  return ((first?.name || '') + String(first?.product || '')).toLowerCase();
}

const TooltipWhisper = ({ children, tooltip }) => (
  <Whisper placement="top" controlId="order-sort-tip" trigger="hover" speaker={<Tooltip>{tooltip}</Tooltip>}>
    {children}
  </Whisper>
);

const EcomOrdersPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(-1);
  const [pageNo, setPageNo] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [draftStatus, setDraftStatus] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftStatusFilter, setDraftStatusFilter] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('');
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const dropdownRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders?limit=500&page=1`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setRows(json.data);
        const next = {};
        json.data.forEach((r) => {
          next[r._id] = r.orderStatus;
        });
        setDraftStatus(next);
        if (json.total > 500) {
          toast.info('Showing first 500 orders. Refine search in a future update for more.');
        }
      } else {
        toast.error(json?.message || 'Could not load orders');
        setRows([]);
      }
    } catch (_e) {
      toast.error('Could not load orders');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpenId(null);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const handleSearch = (term) => {
    setSearchApplied(term.trim());
    setPageNo(1);
  };

  const filteredRows = useMemo(() => {
    const q = searchApplied.trim().toLowerCase();
    return rows.filter((r) => {
      if (appliedStatusFilter && r.orderStatus !== appliedStatusFilter) return false;
      if (!q) return true;
      const id = String(r._id).toLowerCase();
      const cust = customerSortKey(r);
      const phone = String(r.shippingAddress?.phone || '').toLowerCase();
      const pay = String(r.paymentStatus || '').toLowerCase();
      const ref = String(r.paymentReference || '').toLowerCase();
      const itemHay = (r.items || [])
        .map((it) => `${it.name || ''} ${it.product || ''}`.toLowerCase())
        .join(' ');
      const email = customerEmail(r).toLowerCase();
      const dispName = customerDisplayName(r).toLowerCase();
      return (
        id.includes(q) ||
        cust.includes(q) ||
        phone.includes(q) ||
        pay.includes(q) ||
        ref.includes(q) ||
        itemHay.includes(q) ||
        email.includes(q) ||
        dispName.includes(q)
      );
    });
  }, [rows, searchApplied, appliedStatusFilter]);

  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    const field = sortField;
    const order = sortOrder;
    list.sort((a, b) => {
      let va;
      let vb;
      if (field === 'id') {
        va = String(a._id);
        vb = String(b._id);
      } else if (field === 'createdAt') {
        va = new Date(a.createdAt || 0).getTime();
        vb = new Date(b.createdAt || 0).getTime();
      } else if (field === 'customer') {
        va = customerSortKey(a);
        vb = customerSortKey(b);
      } else if (field === 'product') {
        va = productSortKey(a);
        vb = productSortKey(b);
      } else if (field === 'paymentStatus') {
        va = (a.paymentStatus || '').toLowerCase();
        vb = (b.paymentStatus || '').toLowerCase();
      } else if (field === 'totalAmount') {
        va = Number(a.totalAmount || 0);
        vb = Number(b.totalAmount || 0);
      } else if (field === 'orderStatus') {
        va = (a.orderStatus || '').toLowerCase();
        vb = (b.orderStatus || '').toLowerCase();
      } else {
        return 0;
      }
      if (va < vb) return order === 1 ? -1 : 1;
      if (va > vb) return order === 1 ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredRows, sortField, sortOrder]);

  const totalCount = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageLimit) || 1);
  const pageSlice = useMemo(
    () => sortedRows.slice((pageNo - 1) * pageLimit, pageNo * pageLimit),
    [sortedRows, pageNo, pageLimit]
  );

  useEffect(() => {
    if (pageNo > totalPages) setPageNo(totalPages);
  }, [pageNo, totalPages]);

  const toggleSort = (fieldName) => {
    if (sortField === fieldName) {
      setSortOrder((o) => (o === 1 ? -1 : 1));
    } else {
      setSortField(fieldName);
      setSortOrder(fieldName === 'createdAt' ? -1 : 1);
    }
  };

  const sortIcon = (fieldName) => {
    if (sortField !== fieldName) {
      return <i className="fi fi-rr-sort-alt text-secondary text-14" />;
    }
    return sortOrder === 1 ? (
      <i className="fi fi-rr-sort-alpha-up text-primary text-14" />
    ) : (
      <i className="fi fi-rr-sort-alpha-down-alt text-primary text-14" />
    );
  };

  const applyStatus = async (orderId, nextStatus) => {
    if (!nextStatus) return;
    const prevRow = rows.find((r) => String(r._id) === String(orderId));
    const previous = prevRow?.orderStatus;
    if (nextStatus === previous) return;

    setDraftStatus((prev) => ({ ...prev, [orderId]: nextStatus }));
    setSavingId(orderId);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/${orderId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ orderStatus: nextStatus }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success('Order status updated');
        setRows((prev) =>
          prev.map((r) =>
            String(r._id) === String(orderId) ? { ...r, orderStatus: nextStatus } : r
          )
        );
      } else {
        if (previous !== undefined) {
          setDraftStatus((prev) => ({ ...prev, [orderId]: previous }));
        }
        toast.error(json?.message || 'Update failed');
      }
    } catch (_e) {
      if (previous !== undefined) {
        setDraftStatus((prev) => ({ ...prev, [orderId]: previous }));
      }
      toast.error('Update failed');
    } finally {
      setSavingId(null);
    }
  };

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch (_e) {
      toast.error('Could not copy');
    }
    setDropdownOpenId(null);
  };

  const applyFilterDrawer = () => {
    setAppliedStatusFilter(draftStatusFilter);
    setPageNo(1);
    setFilterOpen(false);
  };

  const statusBadgeClass = (s) => {
    switch (s) {
      case 'delivered':
        return 'bg-success';
      case 'shipped':
        return 'bg-primary';
      case 'cancelled':
        return 'bg-danger';
      case 'confirmed':
        return 'bg-info text-dark';
      case 'processing':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  };

  const showingCount = loading ? 0 : pageSlice.length;

  return (
    <div className="h-100 d-flex flex-column min-h-0 overflow-hidden">
      <div className="master-view d-flex flex-column h-100">
        <div className="d-flex align-items-center justify-content-between pb-2 gap-2 flex-wrap">
          <h1 className="h4 fw-medium text-dark mb-0">Order Management</h1>
          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
            <button type="button" className="btn btn-primary btn-sm" disabled title="Coming soon">
              Bulk actions
            </button>
            <div className="d-flex align-items-center gap-2 flex-nowrap">
              <SearchBar
                handleSearch={handleSearch}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
              <button
                type="button"
                className="btn btn-primary py-4p px-9p d-flex align-items-center flex-shrink-0"
                onClick={() => {
                  setDraftStatusFilter(appliedStatusFilter);
                  setFilterOpen(true);
                }}
                aria-label="Open filters"
              >
                <BiFilterAlt className="text-white text-20" />
              </button>
            </div>
          </div>
        </div>

        {searchApplied ? (
          <div className="filter-display d-flex flex-wrap gap-2 mb-2 px-1">
            <div className="d-flex align-items-center bg-primary bg-opacity-10 border border-primary border-opacity-25 px-2 py-1 shadow-sm text-12 rounded">
              <span className="text-primary fw-bold me-1">SEARCH:</span>
              <span className="text-dark fw-medium">{searchApplied}</span>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 ms-2 text-danger"
                onClick={() => {
                  setSearchTerm('');
                  setSearchApplied('');
                }}
              >
                Clear
              </button>
            </div>
          </div>
        ) : null}

        {appliedStatusFilter ? (
          <div className="px-1 mb-2">
            <span className="badge bg-dark bg-opacity-10 text-dark border text-capitalize">
              Status: {appliedStatusFilter}
              <button
                type="button"
                className="btn btn-link btn-sm p-0 ms-2 text-danger"
                onClick={() => setAppliedStatusFilter('')}
              >
                Clear
              </button>
            </span>
          </div>
        ) : null}

        <div className="flex-grow-1 d-flex flex-column min-h-0">
          <section className="table-section flex-grow-1 d-flex flex-column min-h-0">
            <div className="bg-white position-relative table-custom overflow-hidden mt-0 flex-grow-1 d-flex flex-column min-h-0 h-100p">
              <div className="flex-grow-1 min-h-0 overflow-hidden">
                <div className="overflow-y-auto table-content grid-table-scroll bg-white shadow table-custom border h-100">
                  <table className="table table-striped table-hover w-100 mb-0" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: 44 }} />
                      <col style={{ width: 180 }} />
                      <col style={{ width: 120 }} />
                      <col />
                      <col style={{ width: 100 }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 128 }} />
                      <col style={{ width: 100 }} />
                      <col />
                    </colgroup>
                    <thead className="table-light border-bottom position-sticky top-0 z-1 z-index-2">
                      <tr>
                        <th className="px-2 py-2 tbl-w-50p text-center">
                          <div className="d-flex justify-content-center align-items-center">
                            <TbGridDots className="text-secondary fs-5" aria-hidden />
                          </div>
                        </th>
                        <th className="px-2 pt-12p pb-12p text-start align-middle" style={{ minWidth: 180 }}>
                          <span className="text-14">ACTION</span>
                        </th>
                        <th
                          className="px-2 pt-12p pb-12p cursor-pointer"
                          onClick={() => toggleSort(SORT_FIELDS.orderStatus)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100 gap-1">
                            <span className="text-14 text-truncate">STATUS</span>
                            <TooltipWhisper
                              tooltip={sortField === 'orderStatus' ? (sortOrder === 1 ? 'Ascending' : 'Descending') : 'Sort'}
                            >
                              <span className="d-inline-flex align-items-center flex-shrink-0">{sortIcon(SORT_FIELDS.orderStatus)}</span>
                            </TooltipWhisper>
                          </div>
                        </th>
                        <th
                          className="px-2 pt-12p pb-12p cursor-pointer min-w-0"
                          onClick={() => toggleSort(SORT_FIELDS.product)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100 gap-1">
                            <span className="text-14 text-truncate">PRODUCT</span>
                            <TooltipWhisper
                              tooltip={sortField === 'product' ? (sortOrder === 1 ? 'Ascending' : 'Descending') : 'Sort'}
                            >
                              <span className="d-inline-flex align-items-center flex-shrink-0">{sortIcon(SORT_FIELDS.product)}</span>
                            </TooltipWhisper>
                          </div>
                        </th>
                        <th
                          className="px-2 pt-12p pb-12p cursor-pointer"
                          onClick={() => toggleSort(SORT_FIELDS.paymentStatus)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100 gap-1">
                            <span className="text-14 text-truncate">PAYMENT</span>
                            <TooltipWhisper
                              tooltip={
                                sortField === 'paymentStatus' ? (sortOrder === 1 ? 'Ascending' : 'Descending') : 'Sort'
                              }
                            >
                              <span className="d-inline-flex align-items-center flex-shrink-0">{sortIcon(SORT_FIELDS.paymentStatus)}</span>
                            </TooltipWhisper>
                          </div>
                        </th>
                        <th
                          className="px-2 pt-12p pb-12p cursor-pointer min-w-0"
                          onClick={() => toggleSort(SORT_FIELDS.id)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100 gap-1">
                            <span className="text-14 text-truncate">ORDER ID</span>
                            <TooltipWhisper tooltip={sortField === 'id' ? (sortOrder === 1 ? 'Ascending' : 'Descending') : 'Sort'}>
                              <span className="d-inline-flex align-items-center flex-shrink-0">{sortIcon(SORT_FIELDS.id)}</span>
                            </TooltipWhisper>
                          </div>
                        </th>
                        <th
                          className="px-2 pt-12p pb-12p cursor-pointer"
                          onClick={() => toggleSort(SORT_FIELDS.createdAt)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100 gap-1">
                            <span className="text-14 text-truncate">DATE</span>
                            <TooltipWhisper
                              tooltip={sortField === 'createdAt' ? (sortOrder === 1 ? 'Ascending' : 'Descending') : 'Sort'}
                            >
                              <span className="d-inline-flex align-items-center flex-shrink-0">{sortIcon(SORT_FIELDS.createdAt)}</span>
                            </TooltipWhisper>
                          </div>
                        </th>
                        <th
                          className="px-2 pt-12p pb-12p text-end cursor-pointer"
                          onClick={() => toggleSort(SORT_FIELDS.totalAmount)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100 gap-1">
                            <span className="text-14 text-truncate">TOTAL</span>
                            <TooltipWhisper
                              tooltip={sortField === 'totalAmount' ? (sortOrder === 1 ? 'Ascending' : 'Descending') : 'Sort'}
                            >
                              <span className="d-inline-flex align-items-center flex-shrink-0">{sortIcon(SORT_FIELDS.totalAmount)}</span>
                            </TooltipWhisper>
                          </div>
                        </th>
                        <th
                          className="px-2 pt-12p pb-12p cursor-pointer min-w-0"
                          onClick={() => toggleSort(SORT_FIELDS.customer)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100 gap-1">
                            <span className="text-14 text-truncate">CUSTOMER</span>
                            <TooltipWhisper
                              tooltip={sortField === 'customer' ? (sortOrder === 1 ? 'Ascending' : 'Descending') : 'Sort'}
                            >
                              <span className="d-inline-flex align-items-center flex-shrink-0">{sortIcon(SORT_FIELDS.customer)}</span>
                            </TooltipWhisper>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="position-relative z-index-1">
                      {loading ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-5 text-center text-secondary">
                            Loading…
                          </td>
                        </tr>
                      ) : pageSlice.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-5 text-center text-secondary">
                            No matching orders. Adjust search or filters.
                          </td>
                        </tr>
                      ) : (
                        pageSlice.map((row) => {
                          const id = String(row._id);
                          return (
                            <tr key={id} className="border-bottom position-relative" style={{ height: 'auto' }}>
                              <td className="px-2 py-1 text-center align-middle position-relative tbl-w-50p">
                                <div className="d-flex justify-content-center align-items-center h-100 minh-30p">
                                  <TooltipWhisper tooltip="Actions">
                                    <button
                                      type="button"
                                      onClick={() => setDropdownOpenId(dropdownOpenId === id ? null : id)}
                                      className="btn btn-outline-secondary btn-sm p-1 d-inline-flex align-items-center justify-content-center h-30p w-30p"
                                      aria-label="Row actions"
                                    >
                                      <BsThreeDotsVertical className="text-secondary text-18" />
                                    </button>
                                  </TooltipWhisper>
                                </div>
                                {dropdownOpenId === id && (
                                  <div
                                    ref={dropdownRef}
                                    className="dropdown-menu show position-absolute shadow-lg border rounded-3 border-radius-4 top-32 w-200p"
                                    style={{ zIndex: 20 }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      className="dropdown-item d-flex align-items-center gap-2 py-2"
                                      onClick={() => copyText(id, 'Order ID')}
                                    >
                                      <FaRegCopy /> Copy order ID
                                    </button>
                                    <button
                                      type="button"
                                      className="dropdown-item d-flex align-items-center gap-2 py-2"
                                      onClick={() => copyText(customerDisplayName(row), 'Name')}
                                    >
                                      <FaRegCopy /> Copy name
                                    </button>
                                    {customerEmail(row) ? (
                                      <button
                                        type="button"
                                        className="dropdown-item d-flex align-items-center gap-2 py-2"
                                        onClick={() => copyText(customerEmail(row), 'Email')}
                                      >
                                        <FaRegCopy /> Copy email
                                      </button>
                                    ) : null}
                                    {customerPhone(row) ? (
                                      <button
                                        type="button"
                                        className="dropdown-item d-flex align-items-center gap-2 py-2"
                                        onClick={() => copyText(customerPhone(row), 'Phone')}
                                      >
                                        <FaRegCopy /> Copy phone
                                      </button>
                                    ) : null}
                                    {row.sessionId ? (
                                      <button
                                        type="button"
                                        className="dropdown-item d-flex align-items-center gap-2 py-2"
                                        onClick={() => copyText(String(row.sessionId), 'Session ID')}
                                      >
                                        <FaRegCopy /> Copy session ID
                                      </button>
                                    ) : null}
                                  </div>
                                )}
                              </td>
                              <td className="px-2 py-2 align-middle min-w-0" style={{ width: 180 }}>
                                <select
                                  className="form-select form-select-sm w-100"
                                  aria-busy={savingId === id}
                                  value={draftStatus[id] ?? row.orderStatus}
                                  onChange={(e) => applyStatus(id, e.target.value)}
                                  disabled={savingId === id}
                                >
                                  {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                                {savingId === id ? (
                                  <div className="small text-muted mt-1">Saving…</div>
                                ) : null}
                              </td>
                              <td className="px-2 py-1 align-middle">
                                <span className={`badge rounded-pill ${statusBadgeClass(row.orderStatus)}`}>
                                  {row.orderStatus || '—'}
                                </span>
                              </td>
                              <td className="px-2 py-1 align-middle min-w-0">
                                {(row.items || []).length === 0 ? (
                                  <span className="small text-muted">—</span>
                                ) : (
                                  <div className="d-flex flex-column gap-1">
                                    {(row.items || []).map((it, idx) => {
                                      const pid = it.product ? String(it.product) : '';
                                      return (
                                        <div key={idx} className="small min-w-0">
                                          <div
                                            className="text-dark text-truncate fw-normal"
                                            title={it.name || ''}
                                          >
                                            {it.name || '—'}
                                            {it.quantity > 1 ? (
                                              <span className="text-muted"> ×{it.quantity}</span>
                                            ) : null}
                                          </div>
                                          <div
                                            className="font-monospace text-10 text-secondary text-truncate"
                                            title={pid}
                                          >
                                            {pid || '—'}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>
                              <td className="px-2 py-1 align-middle">
                                <span className="text-capitalize small fw-normal">{row.paymentStatus || '—'}</span>
                              </td>
                              <td className="px-2 py-1 align-middle min-w-0">
                                <span className="font-monospace small text-dark fw-normal text-truncate d-block" title={id}>
                                  {id}
                                </span>
                              </td>
                              <td className="px-2 py-1 align-middle small text-secondary fw-normal text-truncate" title={formatOrderDate(row.createdAt)}>
                                {formatOrderDate(row.createdAt)}
                              </td>
                              <td
                                className="px-2 py-1 align-middle text-end text-dark fw-normal"
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {formatRs(row.totalAmount)}
                              </td>
                              <td className="px-2 py-1 align-middle min-w-0">
                                <div className="text-dark text-truncate fw-normal small" title={customerDisplayName(row)}>
                                  {customerDisplayName(row)}
                                </div>
                                {customerEmail(row) ? (
                                  <div className="small text-secondary text-truncate" title={customerEmail(row)}>
                                    {customerEmail(row)}
                                  </div>
                                ) : null}
                                {customerPhone(row) ? (
                                  <div className="small text-muted text-truncate">{customerPhone(row)}</div>
                                ) : null}
                                {row.sessionId && !row.user ? (
                                  <div className="small text-muted font-monospace text-truncate" title={row.sessionId}>
                                    Session: {String(row.sessionId).slice(0, 18)}…
                                  </div>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <Pagination
            totalCount={totalCount}
            showingCount={showingCount}
            pageSize={pageLimit}
            loading={loading}
            onPageSizeChange={(v) => {
              if (v) {
                setPageLimit(Number(v));
                setPageNo(1);
              }
            }}
          />
        </div>
      </div>

      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} size="xs">
        <Drawer.Header>
          <Drawer.Title>Filter orders</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <div className="d-flex flex-column gap-3 p-1">
            <div>
              <label className="form-label small fw-semibold">Order status</label>
              <select
                className="form-select"
                value={draftStatusFilter}
                onChange={(e) => setDraftStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn btn-primary w-100" onClick={applyFilterDrawer}>
              Apply filters
            </button>
          </div>
        </Drawer.Body>
      </Drawer>
    </div>
  );
};

export default EcomOrdersPage;
