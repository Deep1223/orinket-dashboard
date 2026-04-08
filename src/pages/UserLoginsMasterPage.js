import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Config from '../config/config';
import StorageService from '../utils/StorageService';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { setProps } from '../utils/reduxUtils';
import { useAppDispatch } from '../store/hooks';
import { setPageName } from '../store/reducer';

function authHeaders() {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = StorageService.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function deviceLabel(userAgent) {
  if (!userAgent) return '—';
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
  return 'Desktop';
}

function deviceIcon(userAgent) {
  const label = deviceLabel(userAgent);
  if (label === 'Mobile') return '📱';
  if (label === 'Tablet') return '📋';
  return '💻';
}

function browserLabel(userAgent) {
  if (!userAgent) return '';
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('opera') || ua.includes('opr/')) return 'Opera';
  return 'Browser';
}

const SORT_FIELDS = { name: 'name', email: 'email', loginCount: 'loginCount', lastLogin: 'lastLogin' };

const UserLoginsMasterPage = () => {
  const dispatch = useAppDispatch();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchApplied, setSearchApplied] = useState('');

  const [sortField, setSortField] = useState('lastLogin');
  const [sortOrder, setSortOrder] = useState(-1);

  const [pageNo, setPageNo] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/auth/admin/user-logins?limit=500`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setRows(json.data);
        setLastRefresh(new Date());
      } else {
        toast.error(json?.message || 'Could not load user logins');
        setRows([]);
      }
    } catch {
      toast.error('Could not load user logins');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    setProps({ pagename: 'User Login History' });
    dispatch(setPageName('User Login History'));
    return () => { dispatch(setPageName('')); };
  }, [load, dispatch]);

  const toggleSort = (field) => {
    if (sortField === field) setSortOrder((o) => (o === 1 ? -1 : 1));
    else { setSortField(field); setSortOrder(-1); }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return <i className="fi fi-rr-sort-alt text-secondary text-14" />;
    return sortOrder === 1
      ? <i className="fi fi-rr-sort-alpha-up text-primary text-14" />
      : <i className="fi fi-rr-sort-alpha-down-alt text-primary text-14" />;
  };

  const filtered = useMemo(() => {
    const q = searchApplied.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.username || '').toLowerCase().includes(q)
    );
  }, [rows, searchApplied]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];
      if (va == null && vb == null) return 0;
      if (va == null) return sortOrder === 1 ? 1 : -1;
      if (vb == null) return sortOrder === 1 ? -1 : 1;
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (va < vb) return sortOrder === 1 ? -1 : 1;
      if (va > vb) return sortOrder === 1 ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortField, sortOrder]);

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageLimit));
  const pageSlice = useMemo(
    () => sorted.slice((pageNo - 1) * pageLimit, pageNo * pageLimit),
    [sorted, pageNo, pageLimit]
  );

  useEffect(() => {
    if (pageNo > totalPages) setPageNo(totalPages);
  }, [pageNo, totalPages]);

  const handleSearch = (term) => {
    setSearchApplied(term.trim());
    setPageNo(1);
  };

  const loggedInCount = rows.filter((r) => r.loginCount > 0).length;

  return (
    <div className="h-100 d-flex flex-column min-h-0 overflow-hidden">
      <div className="master-view d-flex flex-column h-100">

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between pb-2">
          <div>
            <h1 className="h4 fw-medium text-dark mb-0">User Login History</h1>
            {lastRefresh && (
              <span className="small text-muted">
                Last updated: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
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

        {/* Stats row */}
        <div className="d-flex gap-3 mb-3 flex-wrap">
          <div className="d-flex align-items-center gap-2 rounded border bg-white px-3 py-2 shadow-sm">
            <span className="text-20">👥</span>
            <div>
              <div className="fw-bold text-dark text-16">{rows.length}</div>
              <div className="text-12 text-muted">Total Users</div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 rounded border bg-white px-3 py-2 shadow-sm">
            <span className="text-20">✅</span>
            <div>
              <div className="fw-bold text-dark text-16">{loggedInCount}</div>
              <div className="text-12 text-muted">Ever Logged In</div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 rounded border bg-white px-3 py-2 shadow-sm">
            <span className="text-20">🚫</span>
            <div>
              <div className="fw-bold text-dark text-16">{rows.length - loggedInCount}</div>
              <div className="text-12 text-muted">Never Logged In</div>
            </div>
          </div>
        </div>

        {/* Active search badge */}
        {searchApplied && (
          <div className="d-flex flex-wrap gap-2 mb-2 px-1">
            <div className="d-flex align-items-center bg-primary bg-opacity-10 border border-primary border-opacity-25 px-2 py-1 shadow-sm text-12 rounded">
              <span className="text-primary fw-bold me-1">SEARCH:</span>
              <span className="text-dark fw-medium">{searchApplied}</span>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 ms-2 text-danger"
                onClick={() => { setSearchTerm(''); setSearchApplied(''); }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-grow-1 d-flex flex-column min-h-0">
          <section className="table-section flex-grow-1 d-flex flex-column min-h-0">
            <div className="bg-white position-relative table-custom overflow-hidden mt-0 flex-grow-1 d-flex flex-column min-h-0 h-100p">
              <div className="overflow-x-auto flex-grow-1 min-h-0">
                <div className="overflow-x-auto overflow-y-auto table-content grid-table-scroll bg-white shadow table-custom border h-100">
                  <table className="table table-striped table-hover w-100 mb-0">
                    <thead className="table-light border-bottom position-sticky top-0 z-1">
                      <tr>
                        <th className="px-3 py-2 text-center text-14" style={{ width: 48 }}>#</th>
                        <th className="px-4 pt-12p pb-12p cursor-pointer" onClick={() => toggleSort(SORT_FIELDS.name)}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-14">USER</span>
                            <span className="d-inline-flex align-items-center ms-2">{sortIcon(SORT_FIELDS.name)}</span>
                          </div>
                        </th>
                        <th className="px-4 pt-12p pb-12p cursor-pointer" onClick={() => toggleSort(SORT_FIELDS.email)}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-14">EMAIL</span>
                            <span className="d-inline-flex align-items-center ms-2">{sortIcon(SORT_FIELDS.email)}</span>
                          </div>
                        </th>
                        <th className="px-4 pt-12p pb-12p cursor-pointer" onClick={() => toggleSort(SORT_FIELDS.lastLogin)}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-14">LAST LOGIN</span>
                            <span className="d-inline-flex align-items-center ms-2">{sortIcon(SORT_FIELDS.lastLogin)}</span>
                          </div>
                        </th>
                        <th className="px-4 pt-12p pb-12p">
                          <span className="text-14">DEVICE / BROWSER</span>
                        </th>
                        <th className="px-4 pt-12p pb-12p">
                          <span className="text-14">IP ADDRESS</span>
                        </th>
                        <th className="px-4 pt-12p pb-12p cursor-pointer text-end pe-4" onClick={() => toggleSort(SORT_FIELDS.loginCount)}>
                          <div className="d-flex justify-content-end align-items-center gap-2">
                            <span className="text-14">TOTAL LOGINS</span>
                            <span className="d-inline-flex align-items-center">{sortIcon(SORT_FIELDS.loginCount)}</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="position-relative">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-5 text-center text-secondary">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <span className="spinner-border spinner-border-sm" />
                              Loading…
                            </div>
                          </td>
                        </tr>
                      ) : pageSlice.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-5">
                            <p className="mb-1 fw-semibold text-dark">No users found</p>
                            <p className="small text-muted mb-0">
                              {searchApplied ? 'Try a different search term.' : 'No users have been created yet.'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        pageSlice.map((r, idx) => {
                          const hasLogin = !!r.lastLogin;
                          return (
                            <tr key={String(r._id)} className="border-bottom">
                              <td className="px-3 py-2 text-center align-middle text-muted small">
                                {(pageNo - 1) * pageLimit + idx + 1}
                              </td>
                              <td className="px-3 py-2 align-middle">
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary fw-bold flex-shrink-0"
                                    style={{ width: 34, height: 34, fontSize: 13 }}
                                  >
                                    {(r.name || r.email || '?')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="fw-semibold text-dark text-14 text-truncate" style={{ maxWidth: 180 }}>
                                      {r.name || '—'}
                                    </div>
                                    <div className="small text-muted font-monospace">@{r.username || '—'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 align-middle small text-truncate" style={{ maxWidth: 200 }}>
                                {r.email}
                              </td>
                              <td className="px-3 py-2 align-middle">
                                {hasLogin ? (
                                  <>
                                    <div className="fw-semibold text-dark text-14">{timeAgo(r.lastLogin)}</div>
                                    <div className="small text-muted">{formatDate(r.lastLogin)}</div>
                                  </>
                                ) : (
                                  <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 text-12">
                                    Never logged in
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 align-middle">
                                {r.lastLoginAgent ? (
                                  <div className="d-flex align-items-center gap-1">
                                    <span style={{ fontSize: 16 }}>{deviceIcon(r.lastLoginAgent)}</span>
                                    <div>
                                      <div className="text-14 text-dark">{deviceLabel(r.lastLoginAgent)}</div>
                                      <div className="small text-muted">{browserLabel(r.lastLoginAgent)}</div>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                              <td className="px-3 py-2 align-middle small font-monospace text-muted">
                                {r.lastLoginIp || '—'}
                              </td>
                              <td className="px-3 py-2 align-middle text-end pe-4">
                                {hasLogin ? (
                                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 text-13 fw-bold">
                                    {r.loginCount}
                                  </span>
                                ) : (
                                  <span className="text-muted small">0</span>
                                )}
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
            showingCount={loading ? 0 : pageSlice.length}
            pageSize={pageLimit}
            loading={loading}
            onPageSizeChange={(v) => { if (v) { setPageLimit(Number(v)); setPageNo(1); } }}
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

export default UserLoginsMasterPage;
