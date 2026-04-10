import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Config from '../config/config';
import StorageService from '../utils/StorageService';
import { formatOrderDate, statusBadgeClass, orderLabel } from '../app/common/OrderManagement/OrderManagementGridList';

function authHeaders() {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = StorageService.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function formatRs(n) {
  const v = Number(n || 0);
  return `Rs ${v.toLocaleString('en-IN')}`;
}

function isAutomationHistoryEntry(entry) {
  const note = String(entry?.note || '').toLowerCase();
  return note.includes('auto-') || note.includes('automation') || note.includes('webhook') || note.includes('late payment');
}

function historyActorLabel(entry) {
  if (entry?.changedBy) return `By ${entry.changedBy}`;
  if (isAutomationHistoryEntry(entry)) return 'By automation';
  return 'By system';
}

// Status action buttons — what makes sense to show for each current status
function nextActionsFor(currentStatus) {
  switch (currentStatus) {
    case 'pending':
    case 'processing':
      return [
        { status: 'confirmed', label: 'Confirm', variant: 'btn-outline-primary' },
        { status: 'cancelled', label: 'Cancel', variant: 'btn-outline-danger', needsReason: true },
      ];
    case 'confirmed':
      return [
        { status: 'packed', label: 'Mark packed', variant: 'btn-outline-primary' },
        { status: 'cancelled', label: 'Cancel', variant: 'btn-outline-danger', needsReason: true },
      ];
    case 'packed':
      return [
        { status: 'shipped', label: 'Ship', variant: 'btn-outline-primary', needsTracking: true },
        { status: 'cancelled', label: 'Cancel', variant: 'btn-outline-danger', needsReason: true },
      ];
    case 'shipped':
      return [
        { status: 'delivered', label: 'Mark delivered', variant: 'btn-outline-success' },
      ];
    case 'return_requested':
      return [
        { status: 'returned', label: 'Mark returned', variant: 'btn-outline-warning' },
      ];
    case 'returned':
      return [
        { status: 'refunded', label: 'Process refund', variant: 'btn-outline-success' },
      ];
    default:
      return [];
  }
}

const OrderManagementDetailPage = () => {
  const { orderId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/detail/${orderId}`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      const json = await res.json();
      if (res.ok && json?.success && json.data) {
        setData(json.data);
        setTrackingUrl(json.data.trackingUrl || '');
      } else {
        toast.error(json?.message || 'Could not load order');
        setData(null);
      }
    } catch (_e) {
      toast.error('Could not load order');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const patchStatus = async (orderStatus, extra = {}) => {
    if (!orderId) return;
    setSaving(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/${orderId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ orderStatus, note, ...extra }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success('Order updated');
        setNote('');
        await load();
      } else {
        toast.error(json?.message || 'Update failed');
      }
    } catch (_e) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleActionClick = (action) => {
    const extra = {};
    if (action.needsTracking) extra.trackingUrl = trackingUrl;
    if (action.needsReason) extra.cancelReason = cancelReason;
    patchStatus(action.status, extra);
  };

  const printInvoice = () => window.print();

  const printLabel = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/print-labels`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ ids: [orderId] }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.message || 'Could not generate PDF');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (_e) {
      toast.error('Could not generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="master-view p-4">
        <p className="text-secondary">Loading order…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="master-view p-4">
        <p className="text-danger">Order not found.</p>
        <Link to="/order-management" className="btn btn-sm btn-primary mt-2">
          Back to orders
        </Link>
      </div>
    );
  }

  const ship = data.shippingAddress || {};
  const display = data.displayStatus || (data.orderStatus === 'processing' ? 'pending' : data.orderStatus);
  const actions = nextActionsFor(data.orderStatus);
  const hasTracking = actions.some((a) => a.needsTracking);
  const hasCancelReason = actions.some((a) => a.needsReason);

  return (
    <div className="master-view h-100 d-flex flex-column min-h-0">
      {/* ── Header ── */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pb-3 d-print-none">
        <div>
          <Link to="/order-management" className="small text-primary text-decoration-none">
            ← All orders
          </Link>
          <h1 className="h4 fw-medium text-dark mb-0 mt-1">Order {orderLabel(data)}</h1>
          <p className="small text-secondary mb-0 font-monospace">{String(data._id)}</p>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <span className={`badge rounded-pill ${statusBadgeClass(display)}`} style={{ fontSize: '0.8rem' }}>
            {display?.replace(/_/g, ' ')}
          </span>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={printInvoice}>
            Print invoice
          </button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={printLabel}>
            Print label
          </button>
        </div>
      </div>

      <div className="row g-3 flex-grow-1 min-h-0 d-print-none">
        {/* ── Left column ── */}
        <div className="col-lg-8 d-flex flex-column gap-3">
          {/* Customer */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-secondary mb-3">Customer</h2>
              <p className="mb-1 fw-medium">{ship.name || data.user?.name || '—'}</p>
              <p className="mb-1 small text-secondary">{data.user?.email || ship.email || '—'}</p>
              <p className="mb-0 small text-secondary">{ship.phone || '—'}</p>
            </div>
          </div>

          {/* Shipping address */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-secondary mb-3">Shipping address</h2>
              <p className="mb-1">{ship.line1 || '—'}</p>
              <p className="mb-0">
                {[ship.city, ship.state, ship.pincode].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-secondary mb-3">Items</h2>
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-end">Qty</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Line total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <div>{it.name}</div>
                          {it.productSeries ? <div className="text-10 text-muted">{it.productSeries}</div> : null}
                        </td>
                        <td className="text-end">{it.quantity}</td>
                        <td className="text-end">{formatRs(it.price)}</td>
                        <td className="text-end">{formatRs(it.quantity * it.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-top">
                    {data.discountAmount > 0 && (
                      <tr>
                        <td colSpan={3} className="text-end text-muted small">
                          Subtotal: {formatRs(data.subtotalAmount)}
                        </td>
                        <td className="text-end text-muted small">{formatRs(data.subtotalAmount)}</td>
                      </tr>
                    )}
                    {data.discountAmount > 0 && (
                      <tr>
                        <td colSpan={3} className="text-end text-success small">
                          Discount{data.promoCode ? ` (${data.promoCode})` : ''}
                        </td>
                        <td className="text-end text-success small">−{formatRs(data.discountAmount)}</td>
                      </tr>
                    )}
                    <tr className="fw-bold">
                      <td colSpan={3} className="text-end">Total</td>
                      <td className="text-end">{formatRs(data.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Return note (if return_requested) */}
          {data.orderStatus === 'return_requested' && (
            <div className="card border-warning border-0 shadow-sm">
              <div className="card-body bg-warning bg-opacity-10 rounded">
                <h2 className="h6 text-uppercase text-warning mb-2">Return request</h2>
                <p className="small mb-0">
                  Customer has requested a return.{data.cancelReason ? ` Reason: ${data.cancelReason}` : ''}
                </p>
                <p className="small text-secondary mt-1 mb-0">
                  Use the "Mark returned" action to proceed once items are received.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="col-lg-4 d-flex flex-column gap-3">
          {/* Payment */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-secondary mb-3">Payment</h2>
              <dl className="row small mb-0">
                <dt className="col-5">Method</dt>
                <dd className="col-7 text-capitalize">{data.paymentMethod === 'cod' ? 'Cash on Delivery' : data.paymentMethod}</dd>
                <dt className="col-5">Status</dt>
                <dd className="col-7 text-capitalize">
                  <span className={`badge ${data.paymentStatus === 'paid' ? 'bg-success' : data.paymentStatus === 'failed' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                    {data.paymentStatus}
                  </span>
                </dd>
                <dt className="col-5">Total</dt>
                <dd className="col-7 fw-semibold">{formatRs(data.totalAmount)}</dd>
                {data.paymentReference && (
                  <>
                    <dt className="col-5">Ref</dt>
                    <dd className="col-7 font-monospace text-truncate small">{data.paymentReference}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* Status actions */}
          {actions.length > 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h6 text-uppercase text-secondary mb-3">Actions</h2>

                {hasTracking && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Tracking URL</label>
                    <input
                      className="form-control form-control-sm mb-1"
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                      placeholder="https://…"
                    />
                    <p className="text-10 text-muted mb-0">Required when shipping</p>
                  </div>
                )}

                {hasCancelReason && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Cancel reason</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Note (optional)</label>
                  <input
                    className="form-control form-control-sm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Internal note for timeline"
                  />
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {actions.map((action) => (
                    <button
                      key={action.status}
                      type="button"
                      className={`btn btn-sm ${action.variant}`}
                      disabled={saving}
                      onClick={() => handleActionClick(action)}
                    >
                      {saving ? '…' : action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tracking URL (for shipped orders - edit/update) */}
          {data.orderStatus === 'shipped' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h6 text-uppercase text-secondary mb-2">Tracking link</h2>
                <input
                  className="form-control form-control-sm mb-2"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://…"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary w-100"
                  disabled={saving}
                  onClick={() => patchStatus('shipped', { trackingUrl })}
                >
                  Update tracking URL
                </button>
                {data.trackingUrl && (
                  <a
                    href={data.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-block small text-primary mt-2 text-truncate"
                  >
                    Current: {data.trackingUrl}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-secondary mb-3">Timeline</h2>
              <ul className="list-unstyled small mb-0">
                {(data.statusHistory || []).length === 0 ? (
                  <li className="text-secondary">No history yet.</li>
                ) : (
                  data.statusHistory.map((h) => (
                    <li key={h._id} className="mb-2 border-start border-2 border-primary ps-2">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="fw-medium text-capitalize">{h.status?.replace(/_/g, ' ')}</div>
                        {isAutomationHistoryEntry(h) ? (
                          <span className="badge bg-info text-dark">Automation</span>
                        ) : null}
                      </div>
                      <div className="text-muted">{formatOrderDate(h.createdAt)}</div>
                      {h.note ? <div className="text-10 text-secondary fst-italic">"{h.note}"</div> : null}
                      <div className="text-10 text-muted">{historyActorLabel(h)}</div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Print invoice */}
      <div className="d-none d-print-block border-top mt-4 pt-3 print-invoice">
        <h1 className="h5">Invoice — {orderLabel(data)}</h1>
        <p className="small">{String(data._id)}</p>
        <p>{ship.name} · {ship.phone}</p>
        <p>{ship.line1}, {[ship.city, ship.state, ship.pincode].filter(Boolean).join(', ')}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th>Item</th><th>Qty</th><th>Price</th><th>Total</th>
            </tr>
          </thead>
          <tbody>
            {(data.items || []).map((it, i) => (
              <tr key={i}>
                <td>{it.name}</td>
                <td>{it.quantity}</td>
                <td>{formatRs(it.price)}</td>
                <td>{formatRs(it.price * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2">
          Total {formatRs(data.totalAmount)} · {data.paymentMethod} · {data.paymentStatus}
        </p>
      </div>
    </div>
  );
};

export default OrderManagementDetailPage;
