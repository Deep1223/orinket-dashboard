import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { FLAT_ROUTES_META } from '../config/flatRoutesMeta';
import Config from '../config/config';

const CHART_HEIGHT = 120;

function numberCompact(value) {
  const n = Number(value || 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

/** 7-day revenue trend — ApexCharts line (sparkline-style, axes hidden). */
function MiniLineChart({ values, labels = [], color = '#3b82f6', seriesName = 'Revenue' }) {
  const clean = useMemo(
    () => (Array.isArray(values) && values.length > 0 ? values.map((v) => Number(v || 0)) : [0]),
    [values]
  );
  const categories = useMemo(() => {
    if (labels.length === clean.length && labels.length > 0) return labels.map(String);
    return clean.map((_, i) => String(i + 1));
  }, [labels, clean]);

  const options = useMemo(
    () => ({
      chart: {
        type: 'line',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true },
        fontFamily: 'inherit',
      },
      stroke: {
        curve: 'smooth',
        width: 2.5,
        colors: [color],
      },
      colors: [color],
      grid: {
        show: false,
        padding: { top: 4, right: 8, bottom: 4, left: 8 },
      },
      xaxis: {
        categories,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
      },
      yaxis: { show: false },
      dataLabels: { enabled: false },
      markers: {
        size: 0,
        strokeWidth: 0,
        hover: { size: 5, sizeOffset: 0 },
      },
      tooltip: {
        theme: 'light',
        x: { show: true },
        y: {
          formatter: (val) => (typeof val === 'number' ? Number(val).toLocaleString() : String(val)),
        },
      },
    }),
    [categories, color]
  );

  const series = useMemo(() => [{ name: seriesName, data: clean }], [seriesName, clean]);

  return <ReactApexChart options={options} series={series} type="line" height={CHART_HEIGHT} width="100%" />;
}

function MiniBarChart({ values, color = '#16a34a' }) {
  const clean = values.map((v) => Number(v || 0));
  const max = Math.max(1, ...clean);
  return (
    <div className="d-flex align-items-end gap-1" style={{ height: CHART_HEIGHT }}>
      {clean.map((v, i) => (
        <div
          key={`${i}_${v}`}
          className="rounded-top"
          style={{
            width: `${100 / Math.max(1, clean.length)}%`,
            height: `${Math.max(6, (v / max) * 100)}%`,
            background: color,
            opacity: 0.85,
          }}
          title={String(v)}
        />
      ))}
    </div>
  );
}

function HorizontalBars({ rows, color = '#4f46e5' }) {
  const max = Math.max(1, ...rows.map((r) => Number(r.value || 0)));
  return (
    <div className="d-flex flex-column gap-2">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="d-flex justify-content-between small mb-1">
            <span className="text-truncate pe-2">{row.label}</span>
            <span>{numberCompact(row.value)}</span>
          </div>
          <div className="progress" style={{ height: 8 }}>
            <div
              className="progress-bar"
              style={{
                width: `${Math.max(4, (Number(row.value || 0) / max) * 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ rows }) {
  const total = Math.max(1, rows.reduce((sum, r) => sum + Number(r.value || 0), 0));
  const palette = ['#3b82f6', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f43f5e'];
  let cursor = 0;
  const segments = rows.map((r, i) => {
    const start = cursor;
    const share = (Number(r.value || 0) / total) * 100;
    cursor += share;
    return {
      ...r,
      color: palette[i % palette.length],
      start,
      end: cursor,
    };
  });
  const gradient = segments
    .map((s) => `${s.color} ${s.start.toFixed(2)}% ${s.end.toFixed(2)}%`)
    .join(', ');
  return (
    <div className="d-flex gap-3 align-items-center">
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: `conic-gradient(${gradient || '#e5e7eb 0% 100%'})`,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 74,
            height: 74,
            borderRadius: '50%',
            background: '#fff',
            inset: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid #e5e7eb',
          }}
        />
      </div>
      <div className="flex-grow-1">
        {segments.map((s) => (
          <div key={s.label} className="d-flex justify-content-between align-items-center small mb-1">
            <span className="d-flex align-items-center gap-2">
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
              <span>{s.label}</span>
            </span>
            <span className="text-muted">{Math.round((Number(s.value || 0) / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const GUIDE_CARDS = [
  {
    path: '/generalsetting',
    title: 'Store details & settings',
    hint: 'Name, contact, banners, footer links, SEO, payments — core store configuration.',
  },
  {
    path: '/storefronthomepage',
    title: 'Storefront homepage',
    hint: 'Hero banner slides and optional JSON for homepage and policy-page blocks.',
  },
  {
    path: '/storefrontsections',
    title: 'Storefront sections',
    hint: 'Section-wise JSON blocks for home and inner pages (blog, stores, careers, support pages).',
  },
  {
    path: '/productmaster',
    title: 'Products & stock',
    hint: 'Photos, prices, categories, and “Available qty” — customers can only buy what you allow.',
  },
  {
    path: '/category',
    title: 'Categories',
    hint: 'Organise how products appear in the shop menu and filters.',
  },
  {
    path: '/subcategorymaster',
    title: 'Subcategories',
    hint: 'Finer grouping under each category.',
  },
  {
    path: '/countrymaster',
    title: 'Countries & currency',
    hint: 'Used with default currency in General Settings.',
  },
];

const masterRoutes = FLAT_ROUTES_META.filter((r) => r.pageKey && r.showInSidebar !== false);
const STOREFRONT_KEYS = ['top-styles', 'trending', 'recommended', 'new-arrivals'];

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    lowStockCount: 0,
    topProducts: [],
    analyticsLast7Days: [],
    tooltip: 'Based on last 7 days sales',
  });
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [catalogProducts, setCatalogProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${Config.apiBaseUrl}/ecom/analytics/summary`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        const json = await res.json();
        if (json?.success && json.data) {
          setSummary({
            totalSales: json.data.totalSales || 0,
            totalOrders: json.data.totalOrders || 0,
            lowStockCount: json.data.lowStockCount || 0,
            topProducts: json.data.topProducts || [],
            analyticsLast7Days: json.data.analyticsLast7Days || [],
            tooltip: json.data.tooltip || 'Based on last 7 days sales',
          });
        }
      } catch (_err) {
        // Keep dashboard usable even if summary API is unavailable.
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadSections = async () => {
      setSectionsLoading(true);
      try {
        const rows = await Promise.all(
          STOREFRONT_KEYS.map(async (key) => {
            const res = await fetch(`${Config.apiBaseUrl}/ecom/storefront/${key}`, {
              credentials: 'include',
              headers: { Accept: 'application/json' },
            });
            const json = await res.json();
            const data = json?.data || {};
            return {
              key,
              mode: data.mode || 'auto',
              tooltip: data.tooltip || 'Based on last 7 days sales',
              products: Array.isArray(data.products) ? data.products.map((p) => p.id) : [],
              hiddenProducts: [],
            };
          })
        );
        setSections(rows);
      } catch (_err) {
        setSections([]);
      } finally {
        setSectionsLoading(false);
      }
    };
    loadSections();
  }, []);

  useEffect(() => {
    const loadCatalogProducts = async () => {
      try {
        const res = await fetch(`${Config.apiBaseUrl}/ecom/products?page=1&limit=1000`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          setCatalogProducts(json.data);
        }
      } catch (_err) {
        setCatalogProducts([]);
      }
    };
    loadCatalogProducts();
  }, []);

  const stockState =
    summary.lowStockCount === 0 ? 'text-success' : summary.lowStockCount < 10 ? 'text-warning' : 'text-danger';

  const trendRows =
    summary.analyticsLast7Days.length > 0
      ? summary.analyticsLast7Days
      : [
          { date: 'D-6', revenue: 0, orders: 0, views: 0, sales: 0 },
          { date: 'D-5', revenue: 0, orders: 0, views: 0, sales: 0 },
          { date: 'D-4', revenue: 0, orders: 0, views: 0, sales: 0 },
          { date: 'D-3', revenue: 0, orders: 0, views: 0, sales: 0 },
          { date: 'D-2', revenue: 0, orders: 0, views: 0, sales: 0 },
          { date: 'D-1', revenue: 0, orders: 0, views: 0, sales: 0 },
          { date: 'Today', revenue: 0, orders: 0, views: 0, sales: 0 },
        ];

  const categoryMix = Object.entries(
    catalogProducts.reduce((acc, p) => {
      const key = p.categoryName || p.category || 'Uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  const stockHealthRows = [
    { label: 'Healthy stock', value: catalogProducts.filter((p) => Number(p.stock || 0) >= 10).length },
    { label: 'Low stock', value: catalogProducts.filter((p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) < 10).length },
    { label: 'Out of stock', value: catalogProducts.filter((p) => Number(p.stock || 0) <= 0).length },
  ];

  const sectionModeRows = [
    { label: 'AUTO sections', value: sections.filter((s) => s.mode === 'auto').length },
    { label: 'CUSTOM sections', value: sections.filter((s) => s.mode === 'custom').length },
  ];

  const updateSectionField = (key, patch) => {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  };

  const saveSection = async (section) => {
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/storefront/sections/${section.key}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          mode: section.mode,
          products: section.products,
          hiddenProducts: section.hiddenProducts,
          note: section.tooltip,
        }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        setSaveMessage(`Saved ${section.key} in ${section.mode.toUpperCase()} mode`);
      } else {
        setSaveMessage(`Failed to save ${section.key}`);
      }
    } catch (_err) {
      setSaveMessage(`Failed to save ${section.key}`);
    }
  };

  return (
    <div className="min-vh-100 p-4">
      <div className="row g-4">
        <div className="col-12">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="bg-white rounded-custom-lg shadow-custom p-3 h-100">
                <div className="small text-muted">Total Sales</div>
                <div className="h4 fw-semibold mb-0">Rs {Number(summary.totalSales || 0).toLocaleString()}</div>
                <div className="small text-muted">{summary.tooltip}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-white rounded-custom-lg shadow-custom p-3 h-100">
                <div className="small text-muted">Orders</div>
                <div className="h4 fw-semibold mb-0">{summary.totalOrders}</div>
                <div className="small text-muted">Auto-calculated</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-white rounded-custom-lg shadow-custom p-3 h-100">
                <div className="small text-muted">Low Stock Alerts</div>
                <div className={`h4 fw-semibold mb-0 ${stockState}`}>{summary.lowStockCount}</div>
                <div className="small text-muted">Green/Yellow/Red traffic light logic</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="bg-white rounded-custom-lg shadow-custom p-4">
            <h2 className="h6 fw-semibold text-dark mb-3">Top products</h2>
            {summary.topProducts.length > 0 ? (
              <div className="row g-2">
                {summary.topProducts.map((p) => (
                  <div key={p.id} className="col-md-6 col-xl-4">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="fw-semibold">{p.name}</div>
                      <div className="small text-muted">Sold: {p.soldUnits} | Stock: {p.stock}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="small text-muted mb-0">No analytics yet. Run `npm run seed:ecom` in backend first.</p>
            )}
          </div>
        </div>

        <div className="col-12">
          <div className="row g-3">
            <div className="col-xl-6">
              <div className="bg-white rounded-custom-lg shadow-custom p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="h6 fw-semibold mb-0">Revenue trend (7 days)</h3>
                  <span className="small text-muted">Auto</span>
                </div>
                <MiniLineChart
                  values={trendRows.map((d) => d.revenue)}
                  labels={trendRows.map((d) => d.date)}
                  color="#2563eb"
                  seriesName="Revenue (Rs)"
                />
                <div className="d-flex justify-content-between small text-muted mt-2">
                  <span>{trendRows[0]?.date || ''}</span>
                  <span>{trendRows[trendRows.length - 1]?.date || ''}</span>
                </div>
              </div>
            </div>
            <div className="col-xl-6">
              <div className="bg-white rounded-custom-lg shadow-custom p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="h6 fw-semibold mb-0">Orders trend (7 days)</h3>
                  <span className="small text-muted">Auto</span>
                </div>
                <MiniBarChart values={trendRows.map((d) => d.orders)} color="#16a34a" />
                <div className="d-flex justify-content-between small text-muted mt-2">
                  <span>{trendRows[0]?.date || ''}</span>
                  <span>{trendRows[trendRows.length - 1]?.date || ''}</span>
                </div>
              </div>
            </div>
            <div className="col-xl-6">
              <div className="bg-white rounded-custom-lg shadow-custom p-4 h-100">
                <h3 className="h6 fw-semibold mb-3">Catalog category mix</h3>
                {categoryMix.length > 0 ? (
                  <DonutChart rows={categoryMix} />
                ) : (
                  <p className="small text-muted mb-0">No category data available yet.</p>
                )}
              </div>
            </div>
            <div className="col-xl-6">
              <div className="bg-white rounded-custom-lg shadow-custom p-4 h-100">
                <h3 className="h6 fw-semibold mb-3">Stock health distribution</h3>
                <HorizontalBars rows={stockHealthRows} color="#f59e0b" />
              </div>
            </div>
            <div className="col-xl-6">
              <div className="bg-white rounded-custom-lg shadow-custom p-4 h-100">
                <h3 className="h6 fw-semibold mb-3">Top products by sold units</h3>
                <HorizontalBars
                  rows={(summary.topProducts || []).slice(0, 6).map((p) => ({
                    label: p.name,
                    value: p.soldUnits || 0,
                  }))}
                  color="#7c3aed"
                />
              </div>
            </div>
            <div className="col-xl-6">
              <div className="bg-white rounded-custom-lg shadow-custom p-4 h-100">
                <h3 className="h6 fw-semibold mb-3">Storefront mode split</h3>
                <DonutChart rows={sectionModeRows} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="bg-white rounded-custom-lg shadow-custom p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <h2 className="h6 fw-semibold text-dark mb-0">Storefront control (AUTO / CUSTOM)</h2>
              <span className="small text-muted">Tooltip: Based on last 7 days sales</span>
            </div>
            {saveMessage ? <p className="small text-success mb-3">{saveMessage}</p> : null}
            {sectionsLoading ? (
              <p className="small text-muted mb-0">Loading section controls...</p>
            ) : (
              <div className="row g-3">
                {sections.map((s) => (
                  <div key={s.key} className="col-md-6">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="fw-semibold text-capitalize">{s.key}</div>
                        <select
                          className="form-select form-select-sm"
                          style={{ maxWidth: 150 }}
                          value={s.mode}
                          onChange={(e) => updateSectionField(s.key, { mode: e.target.value })}
                        >
                          <option value="auto">AUTO</option>
                          <option value="custom">CUSTOM</option>
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted mb-1">Pinned product IDs (comma separated)</label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="prodId1,prodId2"
                          value={(s.products || []).join(',')}
                          onChange={(e) =>
                            updateSectionField(s.key, {
                              products: e.target.value
                                .split(',')
                                .map((x) => x.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted mb-1">Hidden product IDs</label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="prodId3,prodId4"
                          value={(s.hiddenProducts || []).join(',')}
                          onChange={(e) =>
                            updateSectionField(s.key, {
                              hiddenProducts: e.target.value
                                .split(',')
                                .map((x) => x.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small text-muted mb-1">Tooltip text</label>
                        <input
                          className="form-control form-control-sm"
                          value={s.tooltip || ''}
                          onChange={(e) => updateSectionField(s.key, { tooltip: e.target.value })}
                        />
                      </div>
                      <button className="btn btn-dark btn-sm w-100" onClick={() => saveSection(s)}>
                        Save {s.key}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-12">
          <div className="bg-white rounded-custom-lg shadow-custom p-4 p-md-5">
            <h1 className="h4 fw-semibold text-dark mb-2">Welcome to your admin</h1>
            <p className="text-muted mb-0" style={{ maxWidth: '42rem' }}>
              Use the sidebar to open each master. Below are the most important screens for running your shop — open
              them in order once if you are new here.
            </p>
          </div>
        </div>

        <div className="col-12">
          <h2 className="h6 fw-semibold text-dark mb-3 border-bottom pb-2">Start here</h2>
          <div className="row g-3">
            {GUIDE_CARDS.map((c) => (
              <div key={c.path} className="col-md-6 col-xl-4">
                <Link
                  to={c.path}
                  className="text-decoration-none d-block h-100 rounded-3 border p-4 bg-white shadow-sm hover-shadow transition"
                >
                  <div className="fw-semibold text-dark mb-2">{c.title}</div>
                  <p className="small text-muted mb-0">{c.hint}</p>
                  <span className="small text-primary mt-2 d-inline-block">Open →</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12">
          <h2 className="h6 fw-semibold text-dark mb-3 border-bottom pb-2">All masters in this app</h2>
          <div className="row g-2">
            {masterRoutes.map((r) => (
              <div key={r.path} className="col-sm-6 col-md-4 col-lg-3">
                <Link to={r.path} className="btn btn-outline-secondary btn-sm w-100 text-start text-truncate">
                  {r.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
