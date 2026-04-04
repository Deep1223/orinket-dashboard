import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { FiTrendingUp, FiShoppingBag, FiAlertTriangle, FiBarChart2 } from 'react-icons/fi';
import { FLAT_ROUTES_META } from '../config/flatRoutesMeta';
import Config from '../config/config';

const TREND_CHART_HEIGHT = 360;
const DONUT_CHART_HEIGHT = 400;
const HBAR_CHART_HEIGHT = 320;

const APEX_PALETTE = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#26a69a', '#F43F5E'];

function numberCompact(value) {
  const n = Number(value || 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

function useTrendData(values, labels) {
  return useMemo(() => {
    const clean =
      Array.isArray(values) && values.length > 0 ? values.map((v) => Number(v || 0)) : [0];
    const categories =
      labels.length === clean.length && labels.length > 0
        ? labels.map(String)
        : clean.map((_, i) => String(i + 1));
    return { clean, categories };
  }, [values, labels]);
}

/** 7-day revenue — ApexCharts area (axes, grid, smooth fill, tooltips). */
function RevenueAreaChart({ values, labels = [], color = '#2563eb', seriesName = 'Revenue (Rs)' }) {
  const { clean, categories } = useTrendData(values, labels);

  const options = useMemo(
    () => ({
      chart: {
        type: 'area',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        fontFamily: 'inherit',
        zoom: { enabled: true },
      },
      colors: [color],
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.06,
          stops: [0, 92, 100],
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        labels: {
          style: { fontSize: '11px', colors: '#64748b' },
          rotate: -35,
          rotateAlways: categories.some((c) => String(c).length > 10),
        },
        axisBorder: { show: true, color: '#e2e8f0' },
        axisTicks: { show: true, color: '#e2e8f0' },
      },
      yaxis: {
        labels: {
          style: { fontSize: '11px', colors: '#64748b' },
          formatter: (val) => numberCompact(val),
        },
      },
      grid: {
        borderColor: '#e5e7eb',
        strokeDashArray: 4,
        padding: { top: 8, right: 12, bottom: 0, left: 8 },
      },
      tooltip: {
        theme: 'light',
        x: { show: true },
        y: {
          formatter: (val) =>
            typeof val === 'number' ? `Rs ${Number(val).toLocaleString()}` : String(val),
        },
      },
      legend: { show: false },
    }),
    [categories, color]
  );

  const series = useMemo(() => [{ name: seriesName, data: clean }], [seriesName, clean]);

  return (
    <div className="dashboard-apex-wrap">
      <ReactApexChart options={options} series={series} type="area" height={TREND_CHART_HEIGHT} width="100%" />
    </div>
  );
}

/** 7-day orders — ApexCharts column (rounded bars, axes, data labels). */
function OrdersColumnChart({ values, labels = [], color = '#16a34a', seriesName = 'Orders' }) {
  const { clean, categories } = useTrendData(values, labels);

  const options = useMemo(
    () => ({
      chart: {
        type: 'bar',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        fontFamily: 'inherit',
      },
      colors: [color],
      plotOptions: {
        bar: {
          borderRadius: 8,
          borderRadiusApplication: 'end',
          columnWidth: '58%',
          dataLabels: { position: 'top' },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => (Number(val) > 0 ? Math.round(Number(val)) : ''),
        offsetY: -22,
        style: { fontSize: '11px', fontWeight: 600, colors: ['#334155'] },
      },
      xaxis: {
        categories,
        labels: {
          style: { fontSize: '11px', colors: '#64748b' },
          rotate: -35,
          rotateAlways: categories.some((c) => String(c).length > 10),
        },
        axisBorder: { show: true, color: '#e2e8f0' },
      },
      yaxis: {
        labels: {
          style: { fontSize: '11px', colors: '#64748b' },
          formatter: (val) => `${Math.round(Number(val))}`,
        },
        min: 0,
        forceNiceScale: true,
      },
      grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
      tooltip: {
        y: {
          formatter: (val) => `${Math.round(Number(val))} orders`,
        },
      },
      legend: { show: false },
    }),
    [categories, color]
  );

  const series = useMemo(() => [{ name: seriesName, data: clean }], [seriesName, clean]);

  return (
    <div className="dashboard-apex-wrap">
      <ReactApexChart options={options} series={series} type="bar" height={TREND_CHART_HEIGHT} width="100%" />
    </div>
  );
}

/** Horizontal bar chart — optional per-row colors (e.g. stock health). */
function HorizontalBarChart({ rows, color = '#7c3aed', barColors }) {
  const categories = useMemo(() => rows.map((r) => r.label), [rows]);
  const data = useMemo(() => rows.map((r) => Number(r.value || 0)), [rows]);
  const distributed = Array.isArray(barColors) && barColors.length >= rows.length;

  const options = useMemo(
    () => ({
      chart: {
        type: 'bar',
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed,
          borderRadius: 6,
          barHeight: '72%',
          dataLabels: { position: 'center' },
        },
      },
      colors: distributed ? barColors : [color],
      dataLabels: {
        enabled: true,
        formatter: (val) => (Number(val) > 0 ? numberCompact(val) : ''),
        style: { fontSize: '11px', fontWeight: 600, colors: distributed ? ['#fff'] : ['#fff'] },
      },
      xaxis: {
        categories,
        labels: {
          style: { fontSize: '12px', colors: '#475569' },
          formatter: (val) => numberCompact(val),
        },
      },
      yaxis: {
        labels: {
          style: { fontSize: '12px', colors: '#334155' },
          maxWidth: 320,
        },
      },
      grid: { borderColor: '#e5e7eb', strokeDashArray: 4, xaxis: { lines: { show: true } } },
      tooltip: {
        y: {
          formatter: (val) => numberCompact(val),
        },
      },
      legend: { show: false },
    }),
    [categories, color, barColors, distributed]
  );

  const series = useMemo(() => [{ name: 'Count', data }], [data]);

  return (
    <div className="dashboard-apex-wrap">
      <ReactApexChart options={options} series={series} type="bar" height={HBAR_CHART_HEIGHT} width="100%" />
    </div>
  );
}

/** Catalog / mode mix — ApexCharts donut with legend and center total. */
function DonutChart({ rows, centerLabel = 'Total' }) {
  const series = useMemo(() => rows.map((r) => Number(r.value || 0)), [rows]);
  const labels = useMemo(() => rows.map((r) => r.label), [rows]);
  const colors = useMemo(
    () => rows.map((_, i) => APEX_PALETTE[i % APEX_PALETTE.length]),
    [rows]
  );

  const options = useMemo(
    () => ({
      chart: {
        type: 'donut',
        fontFamily: 'inherit',
      },
      labels,
      colors,
      stroke: { width: 2, colors: ['#fff'] },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${Number(val).toFixed(0)}%`,
        style: { fontSize: '11px', fontWeight: 700, colors: ['#fff'] },
        dropShadow: { enabled: false },
      },
      plotOptions: {
        pie: {
          expandOnClick: true,
          donut: {
            size: '62%',
            labels: {
              show: true,
              name: { show: true, fontSize: '13px', color: '#64748b' },
              value: {
                show: true,
                fontSize: '22px',
                fontWeight: 600,
                color: '#0f172a',
                formatter: (val) => String(val),
              },
              total: {
                show: true,
                showAlways: true,
                label: centerLabel,
                fontSize: '12px',
                color: '#64748b',
                formatter: (w) => {
                  const t = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                  return t % 1 === 0 ? String(t) : t.toFixed(1);
                },
              },
            },
          },
        },
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '12px',
        fontWeight: 500,
        markers: { width: 10, height: 10, radius: 10 },
        itemMargin: { horizontal: 10, vertical: 6 },
      },
      tooltip: {
        fillSeriesColor: true,
        y: {
          formatter: (val) => `${numberCompact(val)} units`,
        },
      },
      responsive: [
        {
          breakpoint: 576,
          options: {
            plotOptions: { pie: { donut: { labels: { name: { fontSize: '11px' } } } } },
          },
        },
      ],
    }),
    [labels, colors, centerLabel]
  );

  if (!rows.length || series.every((s) => s === 0)) {
    return <p className="small text-muted mb-0">No data to display.</p>;
  }

  return (
    <div className="dashboard-apex-wrap">
      <ReactApexChart options={options} series={series} type="donut" height={DONUT_CHART_HEIGHT} width="100%" />
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
    path: '/low-stock-threshold-master',
    title: 'Low stock threshold',
    hint: 'Set the unit cutoff for low-stock KPI, digest notifications, and Product Master alerts.',
  },
  {
    path: '/low-stock-products-master',
    title: 'Low Stock Master',
    hint: 'See every storefront SKU below the threshold and update stock counts in one place.',
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
    lowStockThreshold: 5,
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
            lowStockThreshold: json.data.lowStockThreshold ?? 5,
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
    <div className="dashboard-home">
      <header className="dashboard-hero dashboard-hero--premium mb-4 mb-xl-5">
        <div className="dashboard-hero-inner">
          <div className="dashboard-hero-accent" aria-hidden />
          <div className="dashboard-hero-copy">
            <p className="dashboard-eyebrow mb-2">Command center</p>
            <h1 className="dashboard-hero-title">Overview</h1>
            <p className="dashboard-hero-lead mb-0">
              Sales, inventory, and storefront at a glance — refined for clarity and fast decisions.
            </p>
          </div>
        </div>
      </header>

      <div className="row g-4 dashboard-home-row">
        <div className="col-12">
          <div className="row g-3 g-xl-4">
            <div className="col-md-4">
              <div className="dashboard-kpi dashboard-kpi--sales h-100">
                <div className="dashboard-kpi-icon" aria-hidden>
                  <FiTrendingUp size={22} />
                </div>
                <div className="dashboard-kpi-label">Total sales</div>
                <div className="dashboard-kpi-value">Rs {Number(summary.totalSales || 0).toLocaleString()}</div>
                <div className="dashboard-kpi-foot">{summary.tooltip}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="dashboard-kpi dashboard-kpi--orders h-100">
                <div className="dashboard-kpi-icon" aria-hidden>
                  <FiShoppingBag size={22} />
                </div>
                <div className="dashboard-kpi-label">Orders</div>
                <div className="dashboard-kpi-value">{summary.totalOrders}</div>
                <div className="dashboard-kpi-foot">Auto-calculated from fulfilled orders</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="dashboard-kpi dashboard-kpi--stock h-100">
                <div className="dashboard-kpi-icon" aria-hidden>
                  <FiAlertTriangle size={22} />
                </div>
                <div className="dashboard-kpi-label">Low stock alerts</div>
                <div className={`dashboard-kpi-value ${stockState}`}>{summary.lowStockCount}</div>
                <div className="dashboard-kpi-foot">
                  Storefront SKUs with stock &lt; {summary.lowStockThreshold}.{' '}
                  <Link to="/low-stock-products-master" className="text-decoration-none">
                    View list
                  </Link>
                  {' · '}
                  <Link to="/low-stock-threshold-master" className="text-decoration-none">
                    Edit threshold
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <section className="dashboard-panel">
            <div className="dashboard-panel-head">
              <div className="d-flex align-items-start gap-3">
                <div className="dashboard-panel-icon">
                  <FiBarChart2 size={20} />
                </div>
                <div>
                  <h2 className="dashboard-panel-title mb-1">Top products</h2>
                  <p className="dashboard-panel-desc mb-0">Best performers by units sold</p>
                </div>
              </div>
            </div>
            {summary.topProducts.length > 0 ? (
              <div className="row g-3">
                {summary.topProducts.map((p) => (
                  <div key={p.id} className="col-md-6 col-xl-4">
                    <div className="dashboard-mini-tile h-100">
                      <div className="dashboard-mini-tile-title">{p.name}</div>
                      <div className="dashboard-mini-tile-meta">
                        Sold {p.soldUnits} · Stock {p.stock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dashboard-empty mb-0">No analytics yet. Run <code>npm run seed:ecom</code> in the backend first.</p>
            )}
          </section>
        </div>

        <div className="col-12">
          <section className="dashboard-panel dashboard-panel--chart">
            <div className="dashboard-chart-head">
              <div>
                <p className="dashboard-eyebrow mb-1">Performance</p>
                <h3 className="dashboard-chart-title mb-1">Revenue trend</h3>
                <p className="dashboard-chart-desc mb-0">Last 7 days · rolling window</p>
              </div>
              <span className="dashboard-pill">Auto</span>
            </div>
            <RevenueAreaChart
              values={trendRows.map((d) => d.revenue)}
              labels={trendRows.map((d) => d.date)}
              color="#1d4ed8"
              seriesName="Revenue (Rs)"
            />
            <div className="dashboard-chart-foot">
              <span>{trendRows[0]?.date || ''}</span>
              <span className="text-muted">—</span>
              <span>{trendRows[trendRows.length - 1]?.date || ''}</span>
            </div>
          </section>
        </div>

        <div className="col-12">
          <section className="dashboard-panel dashboard-panel--chart">
            <div className="dashboard-chart-head">
              <div>
                <p className="dashboard-eyebrow mb-1">Performance</p>
                <h3 className="dashboard-chart-title mb-1">Orders trend</h3>
                <p className="dashboard-chart-desc mb-0">Last 7 days · order volume</p>
              </div>
              <span className="dashboard-pill">Auto</span>
            </div>
            <OrdersColumnChart
              values={trendRows.map((d) => d.orders)}
              labels={trendRows.map((d) => d.date)}
              color="#059669"
              seriesName="Orders"
            />
            <div className="dashboard-chart-foot">
              <span>{trendRows[0]?.date || ''}</span>
              <span className="text-muted">—</span>
              <span>{trendRows[trendRows.length - 1]?.date || ''}</span>
            </div>
          </section>
        </div>

        <div className="col-12">
          <section className="dashboard-panel dashboard-panel--chart">
            <div className="dashboard-chart-head">
              <div>
                <p className="dashboard-eyebrow mb-1">Catalog</p>
                <h3 className="dashboard-chart-title mb-1">Category mix</h3>
                <p className="dashboard-chart-desc mb-0">Share of products by category</p>
              </div>
            </div>
            {categoryMix.length > 0 ? (
              <DonutChart rows={categoryMix} centerLabel="Products" />
            ) : (
              <p className="dashboard-empty mb-0">No category data available yet.</p>
            )}
          </section>
        </div>

        <div className="col-12">
          <section className="dashboard-panel dashboard-panel--chart">
            <div className="dashboard-chart-head">
              <div>
                <p className="dashboard-eyebrow mb-1">Inventory</p>
                <h3 className="dashboard-chart-title mb-1">Stock health</h3>
                <p className="dashboard-chart-desc mb-0">Healthy, low, and out of stock counts</p>
              </div>
            </div>
            <HorizontalBarChart
              rows={stockHealthRows}
              barColors={['#16a34a', '#ea580c', '#dc2626']}
            />
          </section>
        </div>

        <div className="col-12">
          <section className="dashboard-panel dashboard-panel--chart">
            <div className="dashboard-chart-head">
              <div>
                <p className="dashboard-eyebrow mb-1">Sales depth</p>
                <h3 className="dashboard-chart-title mb-1">Top products by sold units</h3>
                <p className="dashboard-chart-desc mb-0">Up to six leaders from analytics</p>
              </div>
            </div>
            <HorizontalBarChart
              rows={(summary.topProducts || []).slice(0, 6).map((p) => ({
                label: p.name,
                value: p.soldUnits || 0,
              }))}
              color="#6d28d9"
            />
          </section>
        </div>

        <div className="col-12">
          <section className="dashboard-panel dashboard-panel--chart">
            <div className="dashboard-chart-head">
              <div>
                <p className="dashboard-eyebrow mb-1">Storefront</p>
                <h3 className="dashboard-chart-title mb-1">Section mode split</h3>
                <p className="dashboard-chart-desc mb-0">AUTO vs CUSTOM configuration</p>
              </div>
            </div>
            <DonutChart rows={sectionModeRows} centerLabel="Sections" />
          </section>
        </div>

        <div className="col-12">
          <section className="dashboard-panel">
            <div className="dashboard-panel-head">
              <div>
                <h2 className="dashboard-panel-title mb-1">Storefront control</h2>
                <p className="dashboard-panel-desc mb-0">AUTO / CUSTOM · tooltip: last 7 days sales</p>
              </div>
            </div>
            {saveMessage ? <p className="small text-success mb-3 mb-md-4">{saveMessage}</p> : null}
            {sectionsLoading ? (
              <p className="dashboard-empty mb-0">Loading section controls…</p>
            ) : (
              <div className="row g-3">
                {sections.map((s) => (
                  <div key={s.key} className="col-md-6 col-xl-4">
                    <div className="dashboard-nested-card h-100">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="fw-semibold text-capitalize dashboard-nested-title">{s.key}</div>
                        <select
                          className="form-select form-select-sm dashboard-select"
                          value={s.mode}
                          onChange={(e) => updateSectionField(s.key, { mode: e.target.value })}
                        >
                          <option value="auto">AUTO</option>
                          <option value="custom">CUSTOM</option>
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small dashboard-label mb-1">Pinned product IDs (comma separated)</label>
                        <input
                          className="form-control form-control-sm dashboard-input"
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
                        <label className="form-label small dashboard-label mb-1">Hidden product IDs</label>
                        <input
                          className="form-control form-control-sm dashboard-input"
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
                        <label className="form-label small dashboard-label mb-1">Tooltip text</label>
                        <input
                          className="form-control form-control-sm dashboard-input"
                          value={s.tooltip || ''}
                          onChange={(e) => updateSectionField(s.key, { tooltip: e.target.value })}
                        />
                      </div>
                      <button type="button" className="btn dashboard-btn-save w-100" onClick={() => saveSection(s)}>
                        Save {s.key}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
