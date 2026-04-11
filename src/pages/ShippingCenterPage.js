import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import NoDataFound from '../components/NoDataFound';
import Config from '../config/config';
import StorageService from '../utils/StorageService';
import { setProps } from '../utils/reduxUtils';
import { useAppDispatch } from '../store/hooks';
import { setPageName } from '../store/reducer';

function authHeaders() {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = StorageService.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-IN', {
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

const ShippingCenterPage = () => {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState([]);
  const [provider, setProvider] = useState('manual');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [pickupFilter, setPickupFilter] = useState('');
  const [exceptionFilter, setExceptionFilter] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (searchApplied) qs.set('q', searchApplied);
      if (pickupFilter) qs.set('pickupStatus', pickupFilter);
      if (exceptionFilter) qs.set('exceptionStatus', exceptionFilter);
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/shipping-center?${qs.toString()}`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        setRows(Array.isArray(json.data) ? json.data : []);
        setProvider(json.provider || 'manual');
      } else {
        toast.error(json?.message || 'Could not load shipping center');
      }
    } catch (_e) {
      toast.error('Could not load shipping center');
    } finally {
      setLoading(false);
    }
  }, [searchApplied, pickupFilter, exceptionFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setProps({ pagename: 'Shipping Center' });
    dispatch(setPageName('Shipping Center'));
    return () => {
      dispatch(setPageName(''));
    };
  }, [dispatch]);

  useEffect(() => {
    setPageNo(1);
  }, [searchApplied, pickupFilter, exceptionFilter, pageLimit]);

  const filtered = rows;
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageLimit) || 1);
  const pageSlice = useMemo(
    () => filtered.slice((pageNo - 1) * pageLimit, pageNo * pageLimit),
    [filtered, pageNo, pageLimit]
  );

  useEffect(() => {
    if (pageNo > totalPages) setPageNo(totalPages);
  }, [pageNo, totalPages]);

  const runAction = async (orderId, action, body = {}, successText) => {
    setSavingId(`${orderId}:${action}`);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/${orderId}/shipping/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success(successText);
        await load();
      } else {
        toast.error(json?.message || 'Action failed');
      }
    } catch (_e) {
      toast.error('Action failed');
    } finally {
      setSavingId('');
    }
  };

  const handleSearch = (term) => {
    setSearchApplied(term.trim());
    setPageNo(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchApplied('');
    setPickupFilter('');
    setExceptionFilter('');
    setPageNo(1);
  };

  const exceptionOpenCount = useMemo(
    () => rows.filter((row) => ['open', 'monitoring'].includes(String(row.exceptionStatus || '').toLowerCase())).length,
    [rows]
  );
  const assignedCount = useMemo(
    () => rows.filter((row) => Boolean(row.courierName || row.awbNumber)).length,
    [rows]
  );
  const showingCount = loading ? 0 : pageSlice.length;

  return (
    <div className="h-100 d-flex flex-column min-h-0 overflow-hidden">
      <div className="master-view d-flex flex-column h-100">
        <div className="d-flex align-items-center justify-content-between pb-2 gap-2 flex-wrap">
          <div>
            <h1 className="h4 fw-medium text-dark mb-0">Shipping Center</h1>
            <p className="small text-secondary mb-0">
              Courier assignment, AWB, pickup booking, and exception handling.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-nowrap">
            <SearchBar
              handleSearch={handleSearch}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <button type="button" className="btn btn-primary" onClick={load} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap">
          <div className="d-flex gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-2 rounded border bg-white px-3 py-2 shadow-sm">
              <div>
                <div className="fw-bold text-dark text-16">{rows.length}</div>
                <div className="text-12 text-muted">Total Cases</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 rounded border bg-white px-3 py-2 shadow-sm">
              <div>
                <div className="fw-bold text-dark text-16 text-capitalize">{provider || 'manual'}</div>
                <div className="text-12 text-muted">Shipping Provider</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 rounded border bg-white px-3 py-2 shadow-sm">
              <div>
                <div className="fw-bold text-dark text-16">{assignedCount}</div>
                <div className="text-12 text-muted">Assigned / AWB Ready</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 rounded border bg-white px-3 py-2 shadow-sm">
              <div>
                <div className="fw-bold text-dark text-16">{exceptionOpenCount}</div>
                <div className="text-12 text-muted">Open Exceptions</div>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end mb-2">
            <div style={{ width: 240 }}>
              <select
                className="form-select form-select-sm"
                value={pickupFilter}
                onChange={(e) => setPickupFilter(e.target.value)}
              >
                <option value="">All pickup statuses</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="booked">Booked</option>
                <option value="picked_up">Picked up</option>
                <option value="missed">Missed</option>
              </select>
            </div>
            <div style={{ width: 240 }}>
              <select
                className="form-select form-select-sm"
                value={exceptionFilter}
                onChange={(e) => setExceptionFilter(e.target.value)}
              >
                <option value="">All exception states</option>
                <option value="none">No exception</option>
                <option value="open">Open</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {(searchApplied || pickupFilter || exceptionFilter) && (
          <div className="filter-display d-flex flex-wrap gap-2 mb-2 px-1 align-items-center">
            {searchApplied && (
              <div className="d-flex align-items-center bg-primary bg-opacity-10 border border-primary border-opacity-25 px-2 py-1 shadow-sm text-12 rounded">
                <span className="text-primary fw-bold me-1">SEARCH:</span>
                <span className="text-dark fw-medium">{searchApplied}</span>
              </div>
            )}
            {pickupFilter && (
              <div className="d-flex align-items-center bg-primary bg-opacity-10 border border-primary border-opacity-25 px-2 py-1 shadow-sm text-12 rounded">
                <span className="text-primary fw-bold me-1">PICKUP:</span>
                <span className="text-dark fw-medium text-capitalize">{pickupFilter.replace(/_/g, ' ')}</span>
              </div>
            )}
            {exceptionFilter && (
              <div className="d-flex align-items-center bg-primary bg-opacity-10 border border-primary border-opacity-25 px-2 py-1 shadow-sm text-12 rounded">
                <span className="text-primary fw-bold me-1">EXCEPTION:</span>
                <span className="text-dark fw-medium text-capitalize">{exceptionFilter.replace(/_/g, ' ')}</span>
              </div>
            )}
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}

        <div className="flex-grow-1 d-flex flex-column min-h-0">
          <section className="table-section flex-grow-1 d-flex flex-column min-h-0">
            <div className="bg-white position-relative table-custom overflow-hidden mt-0 flex-grow-1 d-flex flex-column min-h-0 h-100p">
              <div className="overflow-x-auto flex-grow-1 min-h-0">
                <div className="overflow-x-auto overflow-y-auto table-content grid-table-scroll bg-white shadow table-custom border h-100">
                  <table className="table table-striped table-hover w-100 mb-0">
                    <thead className="table-light border-bottom position-sticky top-0 z-1">
                      <tr>
                        <th className="px-4 pt-12p pb-12p">ORDER</th>
                        <th className="px-4 pt-12p pb-12p">CUSTOMER</th>
                        <th className="px-4 pt-12p pb-12p">COURIER</th>
                        <th className="px-4 pt-12p pb-12p">AWB</th>
                        <th className="px-4 pt-12p pb-12p">PICKUP</th>
                        <th className="px-4 pt-12p pb-12p">EXCEPTION</th>
                        <th className="px-4 pt-12p pb-12p">UPDATED</th>
                        <th className="px-4 pt-12p pb-12p text-end pe-4">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-5 text-center text-secondary">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <span className="spinner-border spinner-border-sm" />
                              Loading…
                            </div>
                          </td>
                        </tr>
                      ) : pageSlice.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-5" style={{ height: 280 }}>
                            <NoDataFound />
                          </td>
                        </tr>
                      ) : (
                        pageSlice.map((row) => (
                          <tr key={row.id} className="border-bottom">
                            <td className="px-3 py-2 align-middle">
                              <div className="fw-semibold text-dark text-14">{row.orderNumber || row.orderId}</div>
                              <div className="small text-muted text-capitalize">{row.orderStatus || '—'}</div>
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <div className="fw-medium text-dark">{row.customerName || '—'}</div>
                              <div className="small text-muted">{row.phone || '—'}</div>
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <div className="fw-medium">{row.courierName || 'Unassigned'}</div>
                              <div className="small text-muted text-capitalize">{row.assignmentStatus || 'pending'}</div>
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <div className="fw-medium">{row.awbNumber || '—'}</div>
                              {row.trackingUrl ? (
                                <a
                                  href={row.trackingUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="small text-primary text-decoration-none"
                                >
                                  Track shipment
                                </a>
                              ) : (
                                <div className="small text-muted">No tracking</div>
                              )}
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <div className="text-capitalize fw-medium">
                                {String(row.pickupStatus || '').replace(/_/g, ' ') || '—'}
                              </div>
                              <div className="small text-muted">{formatDate(row.pickupScheduledAt)}</div>
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <div className="text-capitalize fw-medium">
                                {String(row.exceptionStatus || 'none').replace(/_/g, ' ')}
                              </div>
                              <div className="small text-muted text-truncate" style={{ maxWidth: 220 }}>
                                {row.exceptionMessage || '—'}
                              </div>
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <div className="small text-muted">{formatDate(row.updatedAt)}</div>
                            </td>
                            <td className="px-3 py-2 align-middle text-end pe-4">
                              <div className="d-flex gap-2 justify-content-end flex-wrap">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  disabled={savingId === `${row.orderId}:generate-awb`}
                                  onClick={() => runAction(row.orderId, 'generate-awb', {}, 'AWB generated')}
                                >
                                  Generate AWB
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  disabled={savingId === `${row.orderId}:book-pickup`}
                                  onClick={() => runAction(row.orderId, 'book-pickup', {}, 'Pickup booked')}
                                >
                                  Book pickup
                                </button>
                                <Link to={`/order-management/detail/${row.orderId}`} className="btn btn-sm btn-primary">
                                  Open order
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))
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
          {totalPages > 1 && (
            <div className="d-flex align-items-center gap-2 justify-content-end flex-wrap pt-1">
              <span className="small text-secondary text-nowrap">
                Page <span className="fw-semibold text-dark">{pageNo}</span> / {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={pageNo <= 1 || loading}
                onClick={() => setPageNo((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={pageNo >= totalPages || loading}
                onClick={() => setPageNo((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingCenterPage;
