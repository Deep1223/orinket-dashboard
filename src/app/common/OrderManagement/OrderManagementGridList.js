import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoEyeOutline } from 'react-icons/io5';
import { TbGridDots } from 'react-icons/tb';
import { Tooltip, Whisper, Placeholder } from 'rsuite';

const TooltipWhisper = ({ children, tooltip }) => (
  <Whisper placement="top" trigger="hover" speaker={<Tooltip>{tooltip}</Tooltip>}>
    {children}
  </Whisper>
);

const ALL_STATUSES = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'return_requested',
  'returned',
  'refunded',
];

// Only forward/valid transitions per status
const NEXT_STATUSES = {
  pending:          ['pending', 'confirmed', 'cancelled'],
  confirmed:        ['confirmed', 'packed', 'cancelled'],
  packed:           ['packed', 'shipped', 'cancelled'],
  shipped:          ['shipped', 'delivered', 'cancelled'],
  delivered:        ['delivered', 'return_requested'],
  cancelled:        ['cancelled'],
  return_requested: ['return_requested', 'returned'],
  returned:         ['returned', 'refunded'],
  refunded:         ['refunded'],
  processing:       ['processing', 'confirmed', 'cancelled'],
};

function getNextStatuses(current) {
  return NEXT_STATUSES[current] || ALL_STATUSES;
}

function formatRs(n) {
  const v = Number(n || 0);
  return `Rs ${v.toLocaleString('en-IN')}`;
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

function customerDisplayName(row) {
  const ship = row.shippingAddress || {};
  if (ship.name && String(ship.name).trim()) return String(ship.name).trim();
  if (row.user?.name) return row.user.name;
  return '—';
}

function orderLabel(row) {
  return row.orderNumber || String(row._id);
}

function orderProductTitle(row) {
  const items = Array.isArray(row.items) ? row.items : [];
  if (!items.length) return '—';
  const first = items[0]?.name?.trim() || '—';
  if (items.length === 1) return first;
  return `${first} (+${items.length - 1})`;
}

function orderProductSeries(row) {
  const items = Array.isArray(row.items) ? row.items : [];
  if (!items.length) return '';
  return String(items[0]?.productSeries || '').trim();
}

/** @deprecated use orderProductTitle */
function orderProductSummary(row) {
  return orderProductTitle(row);
}

async function copyTextToClipboard(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (_e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (_e2) { /* ignore */ }
  }
}

function statusBadgeClass(s) {
  const x = String(s || '').toLowerCase();
  if (x === 'delivered' || x === 'paid') return 'bg-success';
  if (x === 'shipped') return 'bg-primary';
  if (x === 'cancelled' || x === 'failed') return 'bg-danger';
  if (x === 'confirmed' || x === 'packed') return 'bg-info text-dark';
  if (x === 'pending' || x === 'processing') return 'bg-warning text-dark';
  if (x === 'return_requested') return 'bg-orange text-dark';
  if (x === 'returned') return 'bg-secondary';
  if (x === 'refunded') return 'bg-success bg-opacity-75';
  return 'bg-secondary';
}

function displayStatus(row) {
  return row.displayStatus || (row.orderStatus === 'processing' ? 'pending' : row.orderStatus);
}

function paymentPaidBadge(row) {
  const ps = String(row.paymentStatus || '').toLowerCase();
  if (ps === 'paid') return { label: 'Paid', className: 'bg-success' };
  if (ps === 'failed') return { label: 'Failed', className: 'bg-danger' };
  return { label: 'Unpaid', className: 'bg-warning text-dark' };
}

const OrderRowActionMenu = ({ id, open, onClose }) => {
  if (open !== id) return null;
  return (
    <div
      className="dropdown-menu show position-absolute shadow-lg border rounded-3 border-radius-4 top-32 start-0 w-200p"
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <Link
        to={`/order-management/detail/${id}`}
        className="dropdown-item d-flex align-items-center gap-2 py-2"
        onClick={onClose}
      >
        <IoEyeOutline /> View order
      </Link>
    </div>
  );
};

/**
 * Order grid list.
 * Checkbox column is hidden by default; appears only when bulkModeActive=true.
 * Checkboxes on non-eligible rows are disabled with a muted style.
 */
const OrderManagementGridList = ({
  rows,
  loading,
  loadingMore,
  hasMore,
  handleScroll,
  bulkModeActive,
  eligibleRows,
  selectedIds,
  allEligibleSelected,
  someEligibleSelected,
  onToggleAll,
  onToggleOne,
  draftStatus,
  savingId,
  onRowStatusChange,
  sortField,
  sortOrder,
  onToggleSort,
  sortIcon,
}) => {
  const eligibleIdSet = new Set((eligibleRows || []).map((r) => String(r._id)));

  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    if (!dropdownOpen) return undefined;
    const handler = (e) => {
      const el = document.querySelector(`[data-order-row-actions="${CSS.escape(dropdownOpen)}"]`);
      if (el && !el.contains(e.target)) setDropdownOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const toggleDropdown = (rowId) => {
    setDropdownOpen((prev) => (prev === rowId ? null : rowId));
  };

  // Total columns count changes based on bulk mode
  const totalCols = bulkModeActive ? 10 : 9;

  return (
    <section className="table-section flex-grow-1 d-flex flex-column min-h-0">
      <div className="bg-white position-relative table-custom overflow-hidden mt-2 flex-grow-1 d-flex flex-column min-h-0 h-100p">
        <div className="overflow-x-auto flex-grow-1 min-h-0">
          <div className="overflow-x-auto overflow-y-auto table-content grid-table-scroll bg-white shadow table-custom border h-100" onScroll={handleScroll}>
            <table className="table table-striped table-hover w-100 mb-0">
              <thead className="table-light border-bottom position-sticky top-0 z-1 z-index-2">
                <tr>
                  {/* Actions */}
                  <th className="px-3 py-2 min-w-0 tbl-w-50p text-center">
                    <div className="d-flex justify-content-center align-items-center">
                      <TbGridDots className="text-secondary fs-5" aria-hidden />
                    </div>
                  </th>

                  {/* Checkbox column — only in bulk mode */}
                  {bulkModeActive && (
                    <th className="px-2 py-2 min-w-0 tbl-w-80p text-center">
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input cursor-pointer m-0 w-16p h-16p"
                          checked={allEligibleSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someEligibleSelected && !allEligibleSelected;
                          }}
                          onChange={onToggleAll}
                          title="Select all eligible on this page"
                          disabled={loading || !eligibleRows.length}
                        />
                        <span className="text-14 fw-medium text-secondary">All</span>
                      </div>
                    </th>
                  )}

                  <th className="px-4 pt-12p pb-12p text-start min-w-0 tbl-w-240p">
                    <span className="text-14">CHANGE STATUS</span>
                  </th>
                  <th className="px-2 pt-12p pb-12p min-w-0" style={{ maxWidth: 280 }}>
                    <span className="text-14 text-truncate d-block">PRODUCT</span>
                  </th>
                  <th className="px-2 pt-12p pb-12p min-w-0">
                    <span className="text-14 text-truncate">CUSTOMER</span>
                  </th>
                  <th className="px-2 pt-12p pb-12p text-start cursor-pointer" onClick={() => onToggleSort('totalAmount')}>
                    <div className="d-flex justify-content-between align-items-center gap-1">
                      <span className="text-14 text-truncate">AMOUNT</span>
                      <span className="flex-shrink-0">{sortIcon('totalAmount')}</span>
                    </div>
                  </th>
                  <th className="px-2 pt-12p pb-12p cursor-pointer" onClick={() => onToggleSort('paymentStatus')}>
                    <div className="d-flex justify-content-between align-items-center gap-1">
                      <span className="text-14 text-truncate">PAY</span>
                      <span className="flex-shrink-0">{sortIcon('paymentStatus')}</span>
                    </div>
                  </th>
                  <th className="px-2 pt-12p pb-12p cursor-pointer" onClick={() => onToggleSort('orderStatus')}>
                    <div className="d-flex justify-content-between align-items-center gap-1">
                      <span className="text-14 text-truncate">STATUS</span>
                      <span className="flex-shrink-0">{sortIcon('orderStatus')}</span>
                    </div>
                  </th>
                  <th className="px-2 pt-12p pb-12p cursor-pointer" onClick={() => onToggleSort('createdAt')}>
                    <div className="d-flex justify-content-between align-items-center gap-1">
                      <span className="text-14 text-truncate">DATE</span>
                      <span className="flex-shrink-0">{sortIcon('createdAt')}</span>
                    </div>
                  </th>
                  <th className="px-2 pt-12p pb-12p cursor-pointer" onClick={() => onToggleSort('orderNumber')}>
                    <div className="d-flex justify-content-between align-items-center gap-1">
                      <span className="text-14 text-truncate">ORDER ID</span>
                      <span className="flex-shrink-0">{sortIcon('orderNumber')}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="position-relative z-index-1">
                {loading ? (
                  <tr>
                    <td colSpan={totalCols} className="px-4 py-5 text-center text-secondary">
                      Loading…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={totalCols} className="px-4 py-5 text-center text-secondary">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const id = String(row._id);
                    const checked = selectedIds.has(id);
                    const isEligible = eligibleIdSet.has(id);
                    const ds = displayStatus(row);
                    const payBadge = paymentPaidBadge(row);
                    const productTitle = orderProductTitle(row);
                    const series = orderProductSeries(row);

                    // Highlight eligible rows in bulk mode
                    const rowHighlight = bulkModeActive && isEligible ? 'table-active' : '';
                    const rowDimmed = bulkModeActive && !isEligible ? 'opacity-50' : '';

                    return (
                      <tr key={id} className={`border-bottom position-relative ${rowHighlight} ${rowDimmed}`}>
                        {/* Actions menu */}
                        <td className="px-3 py-1 align-middle text-center position-relative">
                          <div className="d-flex justify-content-center align-items-center w-100 minh-30p">
                            <div
                              className="d-inline-flex position-relative justify-content-center"
                              data-order-row-actions={id}
                            >
                              <TooltipWhisper tooltip="Actions">
                                <button
                                  type="button"
                                  onClick={() => toggleDropdown(id)}
                                  className="btn btn-outline-secondary btn-sm p-1 d-flex align-items-center justify-content-center h-30p w-30p"
                                  aria-expanded={dropdownOpen === id}
                                  aria-label="Row actions"
                                >
                                  <BsThreeDotsVertical />
                                </button>
                              </TooltipWhisper>
                              <OrderRowActionMenu id={id} open={dropdownOpen} onClose={() => setDropdownOpen(null)} />
                            </div>
                          </div>
                        </td>

                        {/* Checkbox — only rendered in bulk mode */}
                        {bulkModeActive && (
                          <td className="px-3 py-1 align-middle text-center tbl-w-80p">
                            <div className="d-flex justify-content-center align-items-center w-100 minh-30p">
                              <input
                                type="checkbox"
                                className="form-check-input cursor-pointer m-0 w-16p h-16p"
                                checked={checked}
                                onChange={() => isEligible && onToggleOne(id)}
                                disabled={!isEligible}
                                title={isEligible ? 'Select this order' : 'Not eligible for this action'}
                              />
                            </div>
                          </td>
                        )}

                        {/* Change status dropdown */}
                        <td className="px-3 py-1 align-middle min-w-0 tbl-w-240p">
                          <select
                            className="form-select form-select-sm w-100 min-w-0"
                            aria-busy={savingId === id}
                            value={draftStatus[id] ?? row.orderStatus}
                            onChange={(e) => onRowStatusChange(id, e.target.value)}
                            disabled={savingId === id}
                          >
                            {getNextStatuses(row.orderStatus).map((s) => (
                              <option key={s} value={s}>
                                {s.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Product */}
                        <td className="px-3 py-1 align-middle min-w-0" style={{ maxWidth: 280 }}>
                          <div className="d-flex flex-column gap-0 min-w-0" style={{ maxWidth: '100%' }}>
                            <div
                              className="text-dark small text-truncate"
                              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={productTitle}
                            >
                              {productTitle}
                            </div>
                            <div
                              role="button"
                              tabIndex={0}
                              className={`text-10 text-muted text-truncate ${series ? 'cursor-pointer user-select-all' : ''}`}
                              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={series ? 'Double-click to copy series' : undefined}
                              onDoubleClick={(e) => {
                                e.preventDefault();
                                copyTextToClipboard(series);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && series) copyTextToClipboard(series);
                              }}
                            >
                              {series || ''}
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-3 py-1 align-middle min-w-0">
                          <div className="text-dark text-truncate small">{customerDisplayName(row)}</div>
                          {row.shippingAddress?.phone ? (
                            <div className="small text-muted text-truncate">{row.shippingAddress.phone}</div>
                          ) : null}
                        </td>

                        {/* Amount */}
                        <td className="px-3 py-1 align-middle text-start text-dark small" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatRs(row.totalAmount)}
                        </td>

                        {/* Payment */}
                        <td className="px-3 py-1 align-middle">
                          <span className={`badge ${payBadge.className}`}>{payBadge.label}</span>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-1 align-middle">
                          <span className={`badge ${statusBadgeClass(ds)}`}>{ds?.replace(/_/g, ' ')}</span>
                        </td>

                        {/* Date */}
                        <td className="px-3 py-1 align-middle small text-secondary text-truncate" title={formatOrderDate(row.createdAt)}>
                          {formatOrderDate(row.createdAt)}
                        </td>

                        {/* Order ID */}
                        <td className="px-3 py-1 align-middle min-w-0">
                          <TooltipWhisper tooltip="Open order detail">
                            <Link
                              className="font-monospace small text-primary text-truncate d-block"
                              title={id}
                              to={`/order-management/detail/${id}`}
                            >
                              {orderLabel(row)}
                            </Link>
                          </TooltipWhisper>
                        </td>
                      </tr>
                    );
                  })
                )}
                {/* Loading-more shimmer rows */}
                {loadingMore && [0, 1, 2].map((i) => (
                  <tr key={`shimmer-${i}`} className="shimmer-effect-row border-bottom">
                    <td className="px-3 py-1 min-w-0 tbl-w-50p text-center">
                      <Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-30p mx-auto" />
                    </td>
                    {bulkModeActive && (
                      <td className="px-3 py-1 min-w-0 tbl-w-80p text-center">
                        <Placeholder.Grid rows={1} columns={1} active className="h-10p p-0 w-40p mx-auto" />
                      </td>
                    )}
                    <td><Placeholder.Graph active className="h-10p p-0 w-100" /></td>
                    <td><Placeholder.Graph active className="h-10p p-0 w-100" /></td>
                    <td><Placeholder.Graph active className="h-10p p-0 w-100" /></td>
                    <td><Placeholder.Graph active className="h-10p p-0 w-100" /></td>
                    <td><Placeholder.Graph active className="h-10p p-0 w-100" /></td>
                    <td><Placeholder.Graph active className="h-10p p-0 w-100" /></td>
                    <td><Placeholder.Graph active className="h-10p p-0 w-100" /></td>
                    <td><Placeholder.Graph active className="h-10p p-0 w-100" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderManagementGridList;
export {
  ALL_STATUSES,
  formatOrderDate,
  customerDisplayName,
  orderLabel,
  orderProductTitle,
  orderProductSeries,
  orderProductSummary,
  statusBadgeClass,
  displayStatus,
};
