import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Tooltip, Whisper } from 'rsuite';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { BiFilterAlt } from 'react-icons/bi';
import { TbGridDots } from 'react-icons/tb';
import { FaRegCopy } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import Config from '../config/config';
import StorageService from '../utils/StorageService';
import IISMethods from '../utils/IISMethods';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import FilterRightSidebar from '../components/FilterRightSidebar';
import FilteredDataBadge from '../components/FilteredDataBadge';
import LowStockMasterFilterJson from '../app/common/LowStockMaster/LowStockMasterFilterJson';
import { getCurrentState, setProps } from '../utils/reduxUtils';
import { useAppDispatch } from '../store/hooks';
import {
  clearFilterData,
  clearOldFilterData,
  setPageName,
  setPendingProductMasterSearch,
  setRightSidebarFormData,
} from '../store/reducer';

function authHeaders() {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = StorageService.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

const TooltipWhisper = ({ children, tooltip }) => (
  <Whisper placement="top" controlId="low-stock-sort-tip" trigger="hover" speaker={<Tooltip>{tooltip}</Tooltip>}>
    {children}
  </Whisper>
);

const SORT_FIELDS = {
  name: 'name',
  productSeries: 'productSeries',
  categoryName: 'categoryName',
  stock: 'stock',
};

function productMasterSearchQuery(row) {
  const series = row?.productSeries != null ? String(row.productSeries).trim() : '';
  if (series) return series;
  return row?.name || row?.slug || '';
}

const LowStockProductsMasterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [threshold, setThreshold] = useState(null);
  const [rows, setRows] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [appliedCategory, setAppliedCategory] = useState('');
  const [appliedProductText, setAppliedProductText] = useState('');

  const [sortField, setSortField] = useState('stock');
  const [sortOrder, setSortOrder] = useState(1);

  const [pageNo, setPageNo] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/low-stock-products`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setThreshold(json.threshold ?? null);
        setRows(json.data);
        const next = {};
        json.data.forEach((r) => {
          next[r.id] = String(r.stock ?? 0);
        });
        setDrafts(next);
      } else {
        toast.error(json?.message || 'Could not load low-stock products');
        setRows([]);
      }
    } catch (_e) {
      toast.error('Could not load low-stock products');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const data = IISMethods.getcopy(LowStockMasterFilterJson);
    dispatch(clearFilterData());
    dispatch(clearOldFilterData());
    setProps({
      pagename: 'Low Stock Master',
      rightsidebarformdata: data,
      filterdata: { categoryName: '', productText: '' },
      oldfilterdata: { categoryName: '', productText: '' },
    });
    setAppliedCategory('');
    setAppliedProductText('');
    return () => {
      dispatch(clearFilterData());
      dispatch(clearOldFilterData());
      dispatch(setRightSidebarFormData([]));
      dispatch(setPageName(''));
    };
  }, [dispatch]);

  useEffect(() => {
    const opts = [...new Set(rows.map((r) => r.categoryName).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
      .map((c) => ({ label: c, value: c }));
    setProps({ masterdata: { lowstockcategories: opts } });
  }, [rows]);

  const applyFiltersFromRedux = useCallback(() => {
    const fd = getCurrentState().filterdata;
    const cat = fd.categoryName;
    setAppliedCategory(cat != null && String(cat).trim() !== '' ? String(cat) : '');
    setAppliedProductText(String(fd.productText ?? '').trim());
    setPageNo(1);
  }, []);

  useEffect(() => {
    setPageNo(1);
  }, [searchApplied, appliedCategory, appliedProductText, rows.length]);

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpenId(null);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filteredRows = useMemo(() => {
    const q = searchApplied.trim().toLowerCase();
    const p = appliedProductText.trim().toLowerCase();
    return rows.filter((r) => {
      if (appliedCategory && r.categoryName !== appliedCategory) return false;
      if (p) {
        const name = (r.name || '').toLowerCase();
        const slug = (r.slug || '').toLowerCase();
        const series = (r.productSeries || '').toLowerCase();
        if (!name.includes(p) && !slug.includes(p) && !series.includes(p)) return false;
      }
      if (!q) return true;
      const name = (r.name || '').toLowerCase();
      const slug = (r.slug || '').toLowerCase();
      const series = (r.productSeries || '').toLowerCase();
      const cat = (r.categoryName || '').toLowerCase();
      return name.includes(q) || slug.includes(q) || series.includes(q) || cat.includes(q);
    });
  }, [rows, searchApplied, appliedCategory, appliedProductText]);

  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    const field = sortField;
    const order = sortOrder;
    list.sort((a, b) => {
      let va = a[field];
      let vb = b[field];
      if (va == null && vb == null) return 0;
      if (va == null) return order === 1 ? 1 : -1;
      if (vb == null) return order === 1 ? -1 : 1;
      if (typeof va === 'string') {
        va = va.toLowerCase();
        vb = (vb || '').toLowerCase();
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
      setSortOrder(1);
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

  const handleSearch = (term) => {
    setSearchApplied(term.trim());
  };

  const openProductMaster = (query) => {
    dispatch(setPendingProductMasterSearch(query));
    navigate('/productmaster');
    setDropdownOpenId(null);
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

  const saveRow = async (id) => {
    const raw = drafts[id];
    const stock = Math.floor(Number(raw));
    if (!Number.isFinite(stock) || stock < 0) {
      toast.error('Enter a valid stock number (0 or greater)');
      return;
    }
    setSavingId(id);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/low-stock-products/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ stock }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        toast.error(json?.message || 'Update failed');
        return;
      }
      toast.success('Stock updated');
      const newStock = json.data?.stock ?? stock;
      const th = json.data?.threshold ?? threshold;
      setRows((prev) => {
        if (th != null && newStock >= th) {
          return prev.filter((r) => r.id !== id);
        }
        return prev.map((r) =>
          r.id === id ? { ...r, stock: newStock, isLowStock: json.data?.isLowStock } : r
        );
      });
      setDrafts((d) => ({ ...d, [id]: String(newStock) }));
      if (th != null && newStock >= th) {
        setDrafts((d) => {
          const copy = { ...d };
          delete copy[id];
          return copy;
        });
      }
    } catch (_e) {
      toast.error('Update failed');
    } finally {
      setSavingId(null);
    }
  };

  const showingCount = loading ? 0 : pageSlice.length;

  return (
    <div className="h-100 d-flex flex-column min-h-0 overflow-hidden">
      <div className="master-view d-flex flex-column h-100">
        <div className="d-flex align-items-center justify-content-between pb-2">
          <h1 className="h4 fw-medium text-dark">Low Stock Master</h1>
          <div className="d-flex align-items-center gap-2">
            <SearchBar
              handleSearch={handleSearch}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <button type="button" className="btn btn-primary" onClick={load} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <div>
              <button
                type="button"
                className="btn btn-primary py-4p px-9p d-flex align-items-center"
                onClick={() => IISMethods.handleGrid(true, 'filterdrawer', 1)}
              >
                <BiFilterAlt className="text-white text-20" />
              </button>
            </div>
          </div>
        </div>

        {searchApplied && (
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
        )}

        <FilteredDataBadge getlist={applyFiltersFromRedux} />

        {threshold != null && (
          <p className="small text-secondary mb-2 px-1">
            Low stock rule: <span className="text-danger fw-semibold">stock &lt; {threshold}</span>. Showing{' '}
            <strong className="text-dark">{filteredRows.length}</strong> of <strong className="text-dark">{rows.length}</strong> loaded SKU(s).{' '}
            <Link to="/low-stock-threshold-master" className="text-decoration-none">
              Edit threshold
            </Link>
          </p>
        )}

        <div className="flex-grow-1 d-flex flex-column min-h-0">
          <section className="table-section flex-grow-1 d-flex flex-column min-h-0">
            <div className="bg-white position-relative table-custom overflow-hidden mt-0 flex-grow-1 d-flex flex-column min-h-0 h-100p">
              <div className="overflow-x-auto flex-grow-1 min-h-0">
                <div className="overflow-x-auto overflow-y-auto table-content grid-table-scroll bg-white shadow table-custom border h-100">
                  <table className="table table-striped table-hover w-100 mb-0">
                    <thead className="table-light border-bottom position-sticky top-0 z-1 z-index-2">
                      <tr>
                        <th className="px-3 py-2 min-w-0 tbl-w-50p text-center">
                          <div className="d-flex justify-content-center align-items-center">
                            <TbGridDots className="text-secondary fs-5" />
                          </div>
                        </th>
                        <th
                          className="px-3 py-2 min-w-0 tbl-w-60p text-center"
                          scope="col"
                          aria-label="Product Master shortcut"
                        >
                          <div className="d-flex justify-content-center align-items-center">
                            <FiExternalLink className="text-secondary fs-5 opacity-75" aria-hidden />
                          </div>
                        </th>
                        <th
                          className="px-4 pt-12p pb-12p cursor-pointer"
                          onClick={() => toggleSort(SORT_FIELDS.name)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100">
                            <span className="text-14">PRODUCT NAME</span>
                            <TooltipWhisper tooltip={sortField === 'name' ? (sortOrder === 1 ? 'Ascending' : 'Descending') : 'Sort'}>
                              <span className="d-inline-flex align-items-center">{sortIcon(SORT_FIELDS.name)}</span>
                            </TooltipWhisper>
                          </div>
                        </th>
                        <th
                          className="px-4 pt-12p pb-12p cursor-pointer"
                          onClick={() => toggleSort(SORT_FIELDS.productSeries)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100">
                            <span className="text-14">PRODUCT SERIES</span>
                            <TooltipWhisper
                              tooltip={sortField === 'productSeries' ? (sortOrder === 1 ? 'Ascending' : 'Descending') : 'Sort'}
                            >
                              <span className="d-inline-flex align-items-center">{sortIcon(SORT_FIELDS.productSeries)}</span>
                            </TooltipWhisper>
                          </div>
                        </th>
                        <th
                          className="px-4 pt-12p pb-12p cursor-pointer"
                          onClick={() => toggleSort(SORT_FIELDS.categoryName)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100">
                            <span className="text-14">CATEGORY</span>
                            <TooltipWhisper tooltip={sortField === 'categoryName' ? (sortOrder === 1 ? 'Ascending' : 'Descending') : 'Sort'}>
                              <span className="d-inline-flex align-items-center">{sortIcon(SORT_FIELDS.categoryName)}</span>
                            </TooltipWhisper>
                          </div>
                        </th>
                        <th
                          className="px-4 pt-12p pb-12p cursor-pointer"
                          onClick={() => toggleSort(SORT_FIELDS.stock)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100">
                            <span className="text-14">CURRENT QTY</span>
                            <TooltipWhisper tooltip={sortField === 'stock' ? (sortOrder === 1 ? 'Ascending' : 'Descending') : 'Sort'}>
                              <span className="d-inline-flex align-items-center">{sortIcon(SORT_FIELDS.stock)}</span>
                            </TooltipWhisper>
                          </div>
                        </th>
                        <th className="px-4 pt-12p pb-12p">
                          <span className="text-14">THRESHOLD</span>
                        </th>
                        <th className="px-4 pt-12p pb-12p">
                          <span className="text-14">NEW QTY</span>
                        </th>
                        <th className="px-4 pt-12p pb-12p text-end pe-4">
                          <span className="text-14">ACTION</span>
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
                          <td colSpan={9} className="px-4 py-5">
                            <p className="mb-1 fw-semibold text-dark">No matching products</p>
                            <p className="small text-muted mb-0">
                              Adjust search or filters, refresh the list, or change the threshold.{' '}
                              <Link to="/low-stock-threshold-master">Low stock threshold</Link>
                            </p>
                          </td>
                        </tr>
                      ) : (
                        pageSlice.map((r) => (
                          <tr key={r.id} className="border-bottom position-relative" style={{ height: 'auto' }}>
                            <td className="px-3 py-1 text-center align-middle position-relative tbl-w-50p">
                              <div className="d-flex justify-content-center align-items-center h-100 minh-30p">
                                <TooltipWhisper tooltip="Actions">
                                  <button
                                    type="button"
                                    onClick={() => setDropdownOpenId(dropdownOpenId === r.id ? null : r.id)}
                                    className="btn btn-outline-secondary btn-sm p-1 d-inline-flex align-items-center justify-content-center h-30p w-30p"
                                    aria-label="Row actions"
                                  >
                                    <BsThreeDotsVertical className="text-secondary text-18" />
                                  </button>
                                </TooltipWhisper>
                              </div>
                              {dropdownOpenId === r.id && (
                                <div
                                  ref={dropdownRef}
                                  className="dropdown-menu show position-absolute shadow-lg border rounded-3 border-radius-4 top-32 w-200p"
                                  style={{ zIndex: 20 }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    className="dropdown-item d-flex align-items-center gap-2 py-2"
                                    onClick={() => copyText(r.slug || '', 'SKU')}
                                  >
                                    <FaRegCopy /> Copy SKU
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-1 text-center align-middle tbl-w-60p">
                              <div className="d-flex justify-content-center align-items-center h-100 minh-30p">
                                <TooltipWhisper tooltip="Open Product Master">
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm p-1 d-inline-flex align-items-center justify-content-center h-30p w-30p"
                                    aria-label="Open Product Master"
                                    onClick={() => openProductMaster(productMasterSearchQuery(r))}
                                  >
                                    <FiExternalLink className="text-14" />
                                  </button>
                                </TooltipWhisper>
                              </div>
                            </td>
                            <td className="px-3 py-1 align-middle">
                              <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: 280 }} title={r.name}>
                                {r.name}
                              </div>
                              <div className="small text-muted font-monospace text-truncate" style={{ maxWidth: 280 }} title={r.slug}>
                                {r.slug}
                              </div>
                            </td>
                            <td className="px-3 py-1 align-middle small font-monospace">
                              {r.productSeries ? (
                                <span title={r.productSeries}>{r.productSeries}</span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td className="px-3 py-1 align-middle small">{r.categoryName || '—'}</td>
                            <td className="px-3 py-1 align-middle">
                              <span className="badge bg-warning text-dark">{r.stock}</span>
                            </td>
                            <td className="px-3 py-1 align-middle small text-muted">{threshold ?? '—'}</td>
                            <td className="px-3 py-1 align-middle" style={{ minWidth: 120 }}>
                              <input
                                type="number"
                                min={0}
                                className="form-control form-control-sm"
                                value={drafts[r.id] ?? ''}
                                onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                                aria-label={`New stock for ${r.name}`}
                              />
                            </td>
                            <td className="px-3 py-1 align-middle text-end pe-4">
                              <button
                                type="button"
                                className="btn btn-primary btn-sm shadow-sm"
                                disabled={savingId === r.id || String(drafts[r.id]) === String(r.stock)}
                                onClick={() => saveRow(r.id)}
                              >
                                {savingId === r.id ? 'Saving…' : 'Save'}
                              </button>
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

      <FilterRightSidebar getlist={applyFiltersFromRedux} />
    </div>
  );
};

export default LowStockProductsMasterPage;
