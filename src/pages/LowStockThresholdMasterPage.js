import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Drawer } from 'rsuite';
import { BiFilterAlt } from 'react-icons/bi';
import Config from '../config/config';
import StorageService from '../utils/StorageService';
import IISMethods from '../utils/IISMethods';
import SearchBar from '../components/SearchBar';

function authHeaders() {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = StorageService.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

const LowStockThresholdMasterPage = () => {
  const [threshold, setThreshold] = useState('');
  const [skuCount, setSkuCount] = useState(null);
  const [envFallback, setEnvFallback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/store-inventory-settings`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json?.success && json.data) {
        setThreshold(String(json.data.lowStockThreshold ?? ''));
        setSkuCount(json.data.lowStockSkuCount ?? 0);
        setEnvFallback(json.data.envFallback ?? null);
      } else {
        toast.error(json?.message || 'Could not load settings');
      }
    } catch (_e) {
      toast.error('Could not load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleHeaderSearch = useCallback(() => {
    /* Grid search is not used on this screen; header matches other masters. */
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const n = Math.floor(Number(threshold));
    if (!Number.isFinite(n) || n < 0 || n > 999999) {
      toast.error('Enter a whole number from 0 to 999999');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/store-inventory-settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ lowStockThreshold: n }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success('Low stock threshold saved');
        setSkuCount(json.data?.lowStockSkuCount ?? null);
        setThreshold(String(json.data?.lowStockThreshold ?? n));
      } else {
        toast.error(json?.message || 'Save failed');
      }
    } catch (_e) {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-100 d-flex flex-column min-h-0 overflow-hidden">
      <div className="master-view d-flex flex-column h-100">
        <div className="d-flex align-items-center justify-content-between pb-2">
          <h1 className="h4 fw-medium text-dark">Low stock threshold</h1>
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn btn-primary h-38p text-14 fw-medium shadow-sm px-3 text-nowrap"
                onClick={() =>
                  IISMethods.errormsg('Bulk action is not used on this screen.', 1)
                }
              >
                Bulk Action
              </button>
            </div>
            <SearchBar
              handleSearch={handleHeaderSearch}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <button
              type="submit"
              form="low-threshold-form"
              className="btn btn-primary"
              disabled={saving || loading}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <div>
              <button
                type="button"
                className="btn btn-primary py-4p px-9p d-flex align-items-center"
                onClick={() => setFilterOpen(true)}
              >
                <BiFilterAlt className="text-white text-20" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow-1 d-flex flex-column min-h-0">
          <section className="table-section flex-grow-1 d-flex flex-column min-h-0">
            <div className="bg-white position-relative table-custom overflow-hidden mt-0 flex-grow-1 d-flex flex-column min-h-0 shadow border">
              <div className="overflow-auto flex-grow-1 min-h-0 p-4">
                <p className="small text-secondary mb-4">
                  One store-wide rule: a storefront SKU is <strong className="text-dark">low stock</strong> when{' '}
                  <code>stock</code> is <strong>strictly less than</strong> the number below. This drives the dashboard
                  KPI, digest notifications, and Product Master alerts that use the same threshold.
                </p>

                {loading ? (
                  <p className="text-secondary mb-0">Loading…</p>
                ) : (
                  <form id="low-threshold-form" onSubmit={save} className="mx-auto" style={{ maxWidth: 520 }}>
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark" htmlFor="lowStockThreshold">
                        Low stock = stock below (units)
                      </label>
                      <input
                        id="lowStockThreshold"
                        type="number"
                        min={0}
                        max={999999}
                        step={1}
                        className="form-control form-control-lg"
                        value={threshold}
                        onChange={(ev) => setThreshold(ev.target.value)}
                        required
                      />
                      <div className="form-text mt-2">
                        Example: if this is <strong>5</strong>, counts <strong>4, 3, 2…</strong> are low;{' '}
                        <strong>5</strong> is not low (<code>stock &lt; threshold</code>).
                        {skuCount !== null && (
                          <>
                            {' '}
                            Currently <strong>{skuCount}</strong> storefront SKU(s) match.
                          </>
                        )}
                      </div>
                      {envFallback != null && (
                        <div className="form-text text-muted small mt-2">
                          Before the first save, the default comes from env <code>LOW_STOCK_THRESHOLD</code> ={' '}
                          {envFallback}
                        </div>
                      )}
                    </div>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <Link to="/dashboard" className="btn btn-outline-secondary">
                        Overview
                      </Link>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} size="xs">
        <Drawer.Header>
          <Drawer.Title>Filter</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="px-3 pb-4">
          <p className="small text-secondary mb-3">Related pages</p>
          <div className="d-flex flex-column gap-2">
            <Link to="/low-stock-products-master" className="btn btn-outline-primary text-start" onClick={() => setFilterOpen(false)}>
              Low Stock Master
            </Link>
            <Link to="/productmaster" className="btn btn-outline-primary text-start" onClick={() => setFilterOpen(false)}>
              Product Master
            </Link>
            <button type="button" className="btn btn-outline-secondary text-start" onClick={() => { setFilterOpen(false); load(); }}>
              Reload settings
            </button>
          </div>
        </Drawer.Body>
      </Drawer>
    </div>
  );
};

export default LowStockThresholdMasterPage;
