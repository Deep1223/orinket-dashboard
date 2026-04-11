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

const ReturnRefundCenterPage = () => {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refundStatusFilter, setRefundStatusFilter] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (searchApplied) qs.set('q', searchApplied);
      if (statusFilter) qs.set('status', statusFilter);
      if (refundStatusFilter) qs.set('refundStatus', refundStatusFilter);
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/return-refund-center?${qs.toString()}`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        setRows(Array.isArray(json.data) ? json.data : []);
      } else {
        toast.error(json?.message || 'Could not load return & refund center');
      }
    } catch (_e) {
      toast.error('Could not load return & refund center');
    } finally {
      setLoading(false);
    }
  }, [searchApplied, statusFilter, refundStatusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setProps({ pagename: 'Return & Refund Center' });
    dispatch(setPageName('Return & Refund Center'));
    return () => {
      dispatch(setPageName(''));
    };
  }, [dispatch]);

  useEffect(() => {
    setPageNo(1);
  }, [searchApplied, statusFilter, refundStatusFilter, pageLimit]);

  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageLimit) || 1);
  const pageSlice = useMemo(
    () => rows.slice((pageNo - 1) * pageLimit, pageNo * pageLimit),
    [rows, pageNo, pageLimit]
  );

  useEffect(() => {
    if (pageNo > totalPages) setPageNo(totalPages);
  }, [pageNo, totalPages]);

  const review = async (orderId, action) => {
    setSavingId(`${orderId}:${action}`);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/${orderId}/return-refund/review`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ action, note: action === 'approve' ? 'Approved from Return Center' : 'Rejected from Return Center' }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success(action === 'approve' ? 'Return approved' : 'Return rejected');
        await load();
      } else {
        toast.error(json?.message || 'Update failed');
      }
    } catch (_e) {
      toast.error('Update failed');
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
    setStatusFilter('');
    setRefundStatusFilter('');
    setPageNo(1);
  };

  const pendingCasesCount = useMemo(
    () => rows.filter((row) => ['requested', 'approved', 'pickup_scheduled'].includes(String(row.status || '').toLowerCase())).length,
    [rows]
  );
  const refundedCount = useMemo(
    () => rows.filter((row) => String(row.refundStatus || '').toLowerCase() === 'processed').length,
    [rows]
  );
  const proofsCount = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.proofCount || 0), 0),
    [rows]
  );
  const showingCount = loading ? 0 : pageSlice.length;

  return (
    <div className="h-100 d-flex flex-column min-h-0 overflow-hidden">
      <div className="master-view d-flex flex-column h-100">
        <div className="d-flex align-items-center justify-content-between pb-2 gap-2 flex-wrap">
          <div>
            <h1 className="h4 fw-medium text-dark mb-0">Return & Refund Center</h1>
            <p className="small text-secondary mb-0">
              Approval, receiving, refund status tracking, and proof management.
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
                <div className="fw-bold text-dark text-16">{pendingCasesCount}</div>
                <div className="text-12 text-muted">Pending Review</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 rounded border bg-white px-3 py-2 shadow-sm">
              <div>
                <div className="fw-bold text-dark text-16">{refundedCount}</div>
                <div className="text-12 text-muted">Refund Processed</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 rounded border bg-white px-3 py-2 shadow-sm">
              <div>
                <div className="fw-bold text-dark text-16">{proofsCount}</div>
                <div className="text-12 text-muted">Proof Files</div>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end mb-2">
            <div style={{ width: 240 }}>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All case statuses</option>
                <option value="requested">Requested</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="pickup_scheduled">Pickup scheduled</option>
                <option value="received">Received</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div style={{ width: 240 }}>
              <select
                className="form-select form-select-sm"
                value={refundStatusFilter}
                onChange={(e) => setRefundStatusFilter(e.target.value)}
              >
                <option value="">All refund statuses</option>
                <option value="not_started">Not started</option>
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {(searchApplied || statusFilter || refundStatusFilter) && (
          <div className="filter-display d-flex flex-wrap gap-2 mb-2 px-1 align-items-center">
            {searchApplied && (
              <div className="d-flex align-items-center bg-primary bg-opacity-10 border border-primary border-opacity-25 px-2 py-1 shadow-sm text-12 rounded">
                <span className="text-primary fw-bold me-1">SEARCH:</span>
                <span className="text-dark fw-medium">{searchApplied}</span>
              </div>
            )}
            {statusFilter && (
              <div className="d-flex align-items-center bg-primary bg-opacity-10 border border-primary border-opacity-25 px-2 py-1 shadow-sm text-12 rounded">
                <span className="text-primary fw-bold me-1">CASE:</span>
                <span className="text-dark fw-medium text-capitalize">{statusFilter.replace(/_/g, ' ')}</span>
              </div>
            )}
            {refundStatusFilter && (
              <div className="d-flex align-items-center bg-primary bg-opacity-10 border border-primary border-opacity-25 px-2 py-1 shadow-sm text-12 rounded">
                <span className="text-primary fw-bold me-1">REFUND:</span>
                <span className="text-dark fw-medium text-capitalize">{refundStatusFilter.replace(/_/g, ' ')}</span>
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
                        <th className="px-4 pt-12p pb-12p">CASE STATUS</th>
                        <th className="px-4 pt-12p pb-12p">REASON</th>
                        <th className="px-4 pt-12p pb-12p">REFUND</th>
                        <th className="px-4 pt-12p pb-12p">PROOFS</th>
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
                              <div className="text-capitalize fw-medium">{String(row.status || '').replace(/_/g, ' ') || '—'}</div>
                              <div className="small text-muted">{formatDate(row.requestedAt)}</div>
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <div className="text-truncate small" style={{ maxWidth: 240 }}>{row.reason || '—'}</div>
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <div className="text-capitalize fw-medium">{String(row.refundStatus || '').replace(/_/g, ' ') || '—'}</div>
                              <div className="small text-muted">Rs {Number(row.refundAmount || 0).toLocaleString('en-IN')}</div>
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <span className="badge bg-secondary">{row.proofCount || 0}</span>
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <div className="small text-muted">{formatDate(row.updatedAt)}</div>
                            </td>
                            <td className="px-3 py-2 align-middle text-end pe-4">
                              <div className="d-flex gap-2 justify-content-end flex-wrap">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success"
                                  disabled={savingId === `${row.orderId}:approve`}
                                  onClick={() => review(row.orderId, 'approve')}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  disabled={savingId === `${row.orderId}:reject`}
                                  onClick={() => review(row.orderId, 'reject')}
                                >
                                  Reject
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

export default ReturnRefundCenterPage;
