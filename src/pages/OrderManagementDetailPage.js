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
  const [shipmentForm, setShipmentForm] = useState({
    courierName: '',
    courierCode: '',
    serviceLevel: '',
    awbNumber: '',
    trackingUrl: '',
    assignmentStatus: 'unassigned',
    assignedTo: '',
    assignmentNotes: '',
    pickupStatus: 'pending',
    pickupScheduledAt: '',
    pickupReference: '',
    exceptionStatus: 'none',
    exceptionCode: '',
    exceptionMessage: '',
  });
  const [returnForm, setReturnForm] = useState({
    status: 'requested',
    reason: '',
    customerNote: '',
    pickupScheduledAt: '',
    pickupReference: '',
    receivingNote: '',
    qualityCheckPassed: false,
    qualityCheckNote: '',
    refundStatus: 'not_started',
    refundAmount: '',
    refundMethod: '',
    refundReference: '',
    refundNote: '',
    refundProofUrlsText: '',
    requestProofUrlsText: '',
  });

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
        const shipment = json.data.shipment || {};
        const rr = json.data.returnRefund || {};
        setShipmentForm({
          courierName: shipment.courierName || '',
          courierCode: shipment.courierCode || '',
          serviceLevel: shipment.serviceLevel || '',
          awbNumber: shipment.awbNumber || '',
          trackingUrl: shipment.trackingUrl || json.data.trackingUrl || '',
          assignmentStatus: shipment.assignmentStatus || 'unassigned',
          assignedTo: shipment.assignedTo || '',
          assignmentNotes: shipment.assignmentNotes || '',
          pickupStatus: shipment.pickupStatus || 'pending',
          pickupScheduledAt: shipment.pickupScheduledAt ? new Date(shipment.pickupScheduledAt).toISOString().slice(0, 16) : '',
          pickupReference: shipment.pickupReference || '',
          exceptionStatus: shipment.exceptionStatus || 'none',
          exceptionCode: shipment.exceptionCode || '',
          exceptionMessage: shipment.exceptionMessage || '',
        });
        setReturnForm({
          status: rr.status || 'requested',
          reason: rr.reason || '',
          customerNote: rr.customerNote || '',
          pickupScheduledAt: rr.pickupScheduledAt ? new Date(rr.pickupScheduledAt).toISOString().slice(0, 16) : '',
          pickupReference: rr.pickupReference || '',
          receivingNote: rr.receivingNote || '',
          qualityCheckPassed: Boolean(rr.qualityCheckPassed),
          qualityCheckNote: rr.qualityCheckNote || '',
          refundStatus: rr.refund?.status || 'not_started',
          refundAmount: rr.refund?.amount != null ? String(rr.refund.amount) : '',
          refundMethod: rr.refund?.method || '',
          refundReference: rr.refund?.reference || '',
          refundNote: rr.refund?.note || '',
          refundProofUrlsText: Array.isArray(rr.refund?.proofUrls) ? rr.refund.proofUrls.join('\n') : '',
          requestProofUrlsText: Array.isArray(rr.requestProofUrls) ? rr.requestProofUrls.join('\n') : '',
        });
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

  const updateShipment = async () => {
    if (!orderId) return;
    setSaving(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/${orderId}/shipping`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify(shipmentForm),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success('Shipping workflow updated');
        await load();
      } else {
        toast.error(json?.message || 'Shipping update failed');
      }
    } catch (_e) {
      toast.error('Shipping update failed');
    } finally {
      setSaving(false);
    }
  };

  const runShippingAction = async (action, body = {}, successMessage = 'Shipping action completed') => {
    if (!orderId) return;
    setSaving(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/${orderId}/shipping/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success(successMessage);
        await load();
      } else {
        toast.error(json?.message || 'Shipping action failed');
      }
    } catch (_e) {
      toast.error('Shipping action failed');
    } finally {
      setSaving(false);
    }
  };

  const updatePickup = async () => {
    if (!orderId) return;
    setSaving(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/${orderId}/shipping/pickup`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({
          pickupStatus: shipmentForm.pickupStatus,
          pickupScheduledAt: shipmentForm.pickupScheduledAt || null,
          pickupReference: shipmentForm.pickupReference,
          note: shipmentForm.assignmentNotes,
        }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success('Pickup updated');
        await load();
      } else {
        toast.error(json?.message || 'Pickup update failed');
      }
    } catch (_e) {
      toast.error('Pickup update failed');
    } finally {
      setSaving(false);
    }
  };

  const updateException = async () => {
    if (!orderId) return;
    setSaving(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/${orderId}/shipping/exception`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({
          exceptionStatus: shipmentForm.exceptionStatus,
          exceptionCode: shipmentForm.exceptionCode,
          exceptionMessage: shipmentForm.exceptionMessage,
        }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success('Exception updated');
        await load();
      } else {
        toast.error(json?.message || 'Exception update failed');
      }
    } catch (_e) {
      toast.error('Exception update failed');
    } finally {
      setSaving(false);
    }
  };

  const reviewReturn = async (action) => {
    if (!orderId) return;
    setSaving(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/${orderId}/return-refund/review`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ action, note: returnForm.qualityCheckNote || returnForm.receivingNote || returnForm.refundNote }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success(action === 'approve' ? 'Return approved' : 'Return rejected');
        await load();
      } else {
        toast.error(json?.message || 'Return review failed');
      }
    } catch (_e) {
      toast.error('Return review failed');
    } finally {
      setSaving(false);
    }
  };

  const updateReturnRefund = async () => {
    if (!orderId) return;
    setSaving(true);
    try {
      const res = await fetch(`${Config.apiBaseUrl}/ecom/admin/orders/${orderId}/return-refund`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({
          status: returnForm.status,
          reason: returnForm.reason,
          customerNote: returnForm.customerNote,
          pickupScheduledAt: returnForm.pickupScheduledAt || null,
          pickupReference: returnForm.pickupReference,
          receivingNote: returnForm.receivingNote,
          qualityCheckPassed: returnForm.qualityCheckPassed,
          qualityCheckNote: returnForm.qualityCheckNote,
          requestProofUrls: returnForm.requestProofUrlsText.split('\n').map((v) => v.trim()).filter(Boolean),
          refund: {
            status: returnForm.refundStatus,
            amount: Number(returnForm.refundAmount || 0),
            method: returnForm.refundMethod,
            reference: returnForm.refundReference,
            note: returnForm.refundNote,
            processedAt: returnForm.refundStatus === 'processed' ? new Date().toISOString() : null,
            proofUrls: returnForm.refundProofUrlsText.split('\n').map((v) => v.trim()).filter(Boolean),
          },
        }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        toast.success('Return/refund case updated');
        await load();
      } else {
        toast.error(json?.message || 'Return/refund update failed');
      }
    } catch (_e) {
      toast.error('Return/refund update failed');
    } finally {
      setSaving(false);
    }
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
  const shipment = data.shipment || {};
  const returnRefund = data.returnRefund || null;

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

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h6 text-uppercase text-secondary mb-0">Shipping workflow</h2>
                <span className="badge bg-light text-dark border text-capitalize">{shipment.assignmentStatus || 'unassigned'}</span>
              </div>
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Courier name</label>
                  <input className="form-control form-control-sm" value={shipmentForm.courierName} onChange={(e) => setShipmentForm((s) => ({ ...s, courierName: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Courier code</label>
                  <input className="form-control form-control-sm" value={shipmentForm.courierCode} onChange={(e) => setShipmentForm((s) => ({ ...s, courierCode: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">AWB number</label>
                  <input className="form-control form-control-sm" value={shipmentForm.awbNumber} onChange={(e) => setShipmentForm((s) => ({ ...s, awbNumber: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Assigned to</label>
                  <input className="form-control form-control-sm" value={shipmentForm.assignedTo} onChange={(e) => setShipmentForm((s) => ({ ...s, assignedTo: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Tracking URL</label>
                  <input className="form-control form-control-sm" value={shipmentForm.trackingUrl} onChange={(e) => setShipmentForm((s) => ({ ...s, trackingUrl: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Pickup status</label>
                  <select className="form-select form-select-sm" value={shipmentForm.pickupStatus} onChange={(e) => setShipmentForm((s) => ({ ...s, pickupStatus: e.target.value }))}>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="booked">Booked</option>
                    <option value="picked_up">Picked up</option>
                    <option value="missed">Missed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Pickup schedule</label>
                  <input type="datetime-local" className="form-control form-control-sm" value={shipmentForm.pickupScheduledAt} onChange={(e) => setShipmentForm((s) => ({ ...s, pickupScheduledAt: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Exception status</label>
                  <select className="form-select form-select-sm" value={shipmentForm.exceptionStatus} onChange={(e) => setShipmentForm((s) => ({ ...s, exceptionStatus: e.target.value }))}>
                    <option value="none">None</option>
                    <option value="open">Open</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Exception code</label>
                  <input className="form-control form-control-sm" value={shipmentForm.exceptionCode} onChange={(e) => setShipmentForm((s) => ({ ...s, exceptionCode: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Exception / assignment note</label>
                  <textarea className="form-control form-control-sm" rows={2} value={shipmentForm.exceptionMessage || shipmentForm.assignmentNotes} onChange={(e) => setShipmentForm((s) => ({ ...s, exceptionMessage: e.target.value, assignmentNotes: e.target.value }))} />
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <button type="button" className="btn btn-sm btn-outline-primary" disabled={saving} onClick={updateShipment}>Save shipping</button>
                <button type="button" className="btn btn-sm btn-outline-secondary" disabled={saving} onClick={updatePickup}>Save pickup</button>
                <button type="button" className="btn btn-sm btn-outline-warning" disabled={saving} onClick={updateException}>Save exception</button>
                <button type="button" className="btn btn-sm btn-primary" disabled={saving} onClick={() => runShippingAction('generate-awb', {}, 'AWB generated')}>Generate AWB</button>
                <button type="button" className="btn btn-sm btn-secondary" disabled={saving} onClick={() => runShippingAction('book-pickup', {}, 'Pickup booked')}>Book pickup</button>
              </div>
            </div>
          </div>
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

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h6 text-uppercase text-secondary mb-0">Return / Refund Center</h2>
                <span className="badge bg-light text-dark border text-capitalize">{returnRefund?.status || 'no case yet'}</span>
              </div>
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Case status</label>
                  <select className="form-select form-select-sm" value={returnForm.status} onChange={(e) => setReturnForm((s) => ({ ...s, status: e.target.value }))}>
                    <option value="requested">Requested</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="pickup_scheduled">Pickup scheduled</option>
                    <option value="received">Received</option>
                    <option value="refund_pending">Refund pending</option>
                    <option value="refunded">Refunded</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Refund status</label>
                  <select className="form-select form-select-sm" value={returnForm.refundStatus} onChange={(e) => setReturnForm((s) => ({ ...s, refundStatus: e.target.value }))}>
                    <option value="not_started">Not started</option>
                    <option value="pending">Pending</option>
                    <option value="processed">Processed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Reason</label>
                  <input className="form-control form-control-sm" value={returnForm.reason} onChange={(e) => setReturnForm((s) => ({ ...s, reason: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Pickup schedule</label>
                  <input type="datetime-local" className="form-control form-control-sm" value={returnForm.pickupScheduledAt} onChange={(e) => setReturnForm((s) => ({ ...s, pickupScheduledAt: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Pickup reference</label>
                  <input className="form-control form-control-sm" value={returnForm.pickupReference} onChange={(e) => setReturnForm((s) => ({ ...s, pickupReference: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Refund amount</label>
                  <input className="form-control form-control-sm" value={returnForm.refundAmount} onChange={(e) => setReturnForm((s) => ({ ...s, refundAmount: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Refund method</label>
                  <input className="form-control form-control-sm" value={returnForm.refundMethod} onChange={(e) => setReturnForm((s) => ({ ...s, refundMethod: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Refund reference</label>
                  <input className="form-control form-control-sm" value={returnForm.refundReference} onChange={(e) => setReturnForm((s) => ({ ...s, refundReference: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Receiving / QC note</label>
                  <textarea className="form-control form-control-sm" rows={2} value={returnForm.receivingNote || returnForm.qualityCheckNote || returnForm.refundNote} onChange={(e) => setReturnForm((s) => ({ ...s, receivingNote: e.target.value, qualityCheckNote: e.target.value, refundNote: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Customer proof URLs</label>
                  <textarea className="form-control form-control-sm" rows={2} value={returnForm.requestProofUrlsText} onChange={(e) => setReturnForm((s) => ({ ...s, requestProofUrlsText: e.target.value }))} placeholder="One URL per line" />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Refund proof URLs</label>
                  <textarea className="form-control form-control-sm" rows={2} value={returnForm.refundProofUrlsText} onChange={(e) => setReturnForm((s) => ({ ...s, refundProofUrlsText: e.target.value }))} placeholder="One URL per line" />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={returnForm.qualityCheckPassed} onChange={(e) => setReturnForm((s) => ({ ...s, qualityCheckPassed: e.target.checked }))} id="rrQcPassed" />
                    <label className="form-check-label small" htmlFor="rrQcPassed">Quality check passed</label>
                  </div>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <button type="button" className="btn btn-sm btn-outline-success" disabled={saving} onClick={() => reviewReturn('approve')}>Approve</button>
                <button type="button" className="btn btn-sm btn-outline-danger" disabled={saving} onClick={() => reviewReturn('reject')}>Reject</button>
                <button type="button" className="btn btn-sm btn-primary" disabled={saving} onClick={updateReturnRefund}>Save case</button>
              </div>
            </div>
          </div>

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
