import { NavLink } from 'react-router-dom';
import { BiFilterAlt } from 'react-icons/bi';
import { Modal, Drawer } from 'rsuite';
import SearchBar from '../../../components/SearchBar';
import Pagination from '../../../components/Pagination';
import OrderManagementGridList from './OrderManagementGridList';

const NAV = [
  { to: '/order-management', label: 'All', end: true },
  { to: '/order-management/pending', label: 'Pending' },
  { to: '/order-management/confirmed', label: 'Confirmed' },
  { to: '/order-management/packed', label: 'Packed' },
  { to: '/order-management/shipped', label: 'Shipped' },
  { to: '/order-management/delivered', label: 'Delivered' },
  { to: '/order-management/cancelled', label: 'Cancelled' },
  { to: '/order-management/return_requested', label: 'Returns' },
  { to: '/order-management/refunded', label: 'Refunded' },
];

const BULK_ACTION_LABELS = {
  confirm: 'Confirm orders',
  packed: 'Mark as packed',
  shipped: 'Mark as shipped',
  delivered: 'Mark as delivered',
  cancel: 'Cancel orders',
  return_received: 'Mark return received',
  refund: 'Process refund',
};

const OrderManagementView = ({
  // Bulk picker
  bulkPickerOpen,
  setBulkPickerOpen,
  bulkPickerDraft,
  setBulkPickerDraft,
  onBulkPickerConfirm,
  // Bulk mode
  bulkModeActive,
  bulkModeAction,
  onExitBulkMode,
  onBulkApply,
  // Bulk confirm modal
  bulkConfirmOpen,
  setBulkConfirmOpen,
  bulkCancelReason,
  setBulkCancelReason,
  onBulkSubmit,
  bulkSubmitting,
  // Grid state
  filterOpen,
  setFilterOpen,
  draftPaymentFilter,
  setDraftPaymentFilter,
  appliedPaymentFilter,
  onApplyFilters,
  searchTerm,
  setSearchTerm,
  onSearch,
  searchApplied,
  onClearSearch,
  onPrintLabels,
  printLoading,
  onExportCsv,
  exportLoading,
  selectedCount,
  onBulkClick,
  rows,
  eligibleRows,
  loading,
  loadingMore,
  hasMore,
  handleScroll,
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
  totalCount,
  showingCount,
  pageLimit,
  onPageSizeChange,
}) => {
  return (
    <div className="h-100 d-flex flex-column min-h-0 overflow-hidden">
      <div className="master-view d-flex flex-column h-100">

        {/* ── Header row ── */}
        <div className="d-flex align-items-center justify-content-between pb-2 gap-2 flex-wrap">
          <h1 className="h4 fw-medium text-dark mb-0">Order management</h1>
          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={exportLoading}
              onClick={onExportCsv}
              title="Export current view as CSV"
            >
              {exportLoading ? 'Exporting…' : 'Export CSV'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={printLoading}
              onClick={onPrintLabels}
              title={
                selectedCount > 0
                  ? `Print shipping labels for ${selectedCount} selected order(s)`
                  : 'Open Bulk action, then select orders to print labels'
              }
            >
              {printLoading ? 'Preparing…' : 'Print labels'}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${bulkModeActive ? 'btn-warning' : 'btn-primary'}`}
              onClick={bulkModeActive ? onExitBulkMode : onBulkClick}
            >
              {bulkModeActive ? 'Exit bulk mode' : 'Bulk action'}
            </button>
            <div className="d-flex align-items-center gap-2 flex-nowrap">
              <SearchBar handleSearch={onSearch} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              <button
                type="button"
                className="btn btn-primary py-4p px-9p d-flex align-items-center flex-shrink-0"
                onClick={() => setFilterOpen(true)}
                aria-label="Open filters"
              >
                <BiFilterAlt className="text-white text-20" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Bulk mode banner ── */}
        {bulkModeActive && (
          <div className="alert alert-warning d-flex align-items-center justify-content-between gap-2 py-2 px-3 mb-2 rounded-3 flex-wrap">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <i className="fi fi-rr-cursor text-warning" />
              <span className="fw-semibold small">
                Bulk mode: <span className="text-capitalize">{BULK_ACTION_LABELS[bulkModeAction] || bulkModeAction}</span>
              </span>
              {eligibleRows.length > 0 ? (
                <span className="text-secondary small">
                  — {eligibleRows.length} eligible row{eligibleRows.length !== 1 ? 's' : ''} on this page
                </span>
              ) : (
                <span className="text-danger small">— No eligible orders on this page</span>
              )}
            </div>
            <div className="d-flex gap-2 align-items-center">
              {selectedCount > 0 && (
                <span className="badge bg-primary">{selectedCount} selected</span>
              )}
              <button
                type="button"
                className="btn btn-sm btn-primary"
                disabled={selectedCount === 0}
                onClick={onBulkApply}
              >
                Apply to {selectedCount || 0} order{selectedCount !== 1 ? 's' : ''}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={onExitBulkMode}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Status tabs ── */}
        <nav className="d-flex flex-wrap gap-2 mb-3" aria-label="Order status">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `badge btn btn-sm px-3 py-2 ork-filter-pill ${isActive ? 'ork-filter-pill--active' : 'ork-filter-pill--inactive'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Active filter chips ── */}
        {searchApplied ? (
          <div className="filter-display d-flex flex-wrap gap-2 mb-2 px-1">
            <div className="d-flex align-items-center bg-primary bg-opacity-10 border border-primary border-opacity-25 px-2 py-1 shadow-sm text-12 rounded">
              <span className="text-primary fw-bold me-1">SEARCH:</span>
              <span className="text-dark fw-medium">{searchApplied}</span>
              <button type="button" className="btn btn-link btn-sm p-0 ms-2 text-danger" onClick={onClearSearch}>
                Clear
              </button>
            </div>
          </div>
        ) : null}

        {appliedPaymentFilter ? (
          <div className="px-1 mb-2">
            <span className="badge bg-dark bg-opacity-10 text-dark border text-capitalize">
              Payment: {appliedPaymentFilter}
              <button
                type="button"
                className="btn btn-link btn-sm p-0 ms-2 text-danger"
                onClick={() => {
                  setDraftPaymentFilter('');
                  onApplyFilters('');
                }}
              >
                Clear
              </button>
            </span>
          </div>
        ) : null}

        {/* ── Grid + scroll indicator ── */}
        <div className="flex-grow-1 d-flex flex-column min-h-0">
          <OrderManagementGridList
            rows={rows}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            handleScroll={handleScroll}
            bulkModeActive={bulkModeActive}
            eligibleRows={eligibleRows}
            selectedIds={selectedIds}
            allEligibleSelected={allEligibleSelected}
            someEligibleSelected={someEligibleSelected}
            onToggleAll={onToggleAll}
            onToggleOne={onToggleOne}
            draftStatus={draftStatus}
            savingId={savingId}
            onRowStatusChange={onRowStatusChange}
            sortField={sortField}
            sortOrder={sortOrder}
            onToggleSort={onToggleSort}
            sortIcon={sortIcon}
          />

          {/* Scroll-based load indicator */}
          <div className="px-2 py-2 border-top">
            <Pagination
              totalCount={totalCount}
              showingCount={showingCount}
              pageSize={pageLimit}
              onPageSizeChange={onPageSizeChange}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* ── Bulk action PICKER modal (Step 1: choose action) ── */}
      <Modal open={bulkPickerOpen} onClose={() => setBulkPickerOpen(false)} size="sm">
        <Modal.Header>
          <Modal.Title>Select bulk action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-secondary mb-3">
            Choose an action. Checkboxes will appear only on eligible orders.
          </p>
          <label className="form-label small fw-semibold">Action</label>
          <select
            className="form-select"
            value={bulkPickerDraft}
            onChange={(e) => setBulkPickerDraft(e.target.value)}
          >
            <option value="">Select action…</option>
            <option value="confirm">Confirm orders (pending → confirmed)</option>
            <option value="packed">Mark as packed (confirmed → packed)</option>
            <option value="shipped">Mark as shipped (packed → shipped)</option>
            <option value="delivered">Mark as delivered (shipped → delivered)</option>
            <option value="cancel">Cancel orders</option>
            <option value="return_received">Mark return received</option>
            <option value="refund">Process refund</option>
          </select>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light btn-sm" onClick={() => setBulkPickerOpen(false)}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={!bulkPickerDraft}
            onClick={onBulkPickerConfirm}
          >
            Start selecting
          </button>
        </Modal.Footer>
      </Modal>

      {/* ── Bulk CONFIRM modal (Step 4: confirm + submit) ── */}
      <Modal open={bulkConfirmOpen} onClose={() => setBulkConfirmOpen(false)} size="sm">
        <Modal.Header>
          <Modal.Title>Confirm bulk action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-secondary mb-3">
            You are about to apply <strong>{BULK_ACTION_LABELS[bulkModeAction] || bulkModeAction}</strong> to{' '}
            <strong>{selectedCount}</strong> order(s). This cannot be undone.
          </p>
          {bulkModeAction === 'cancel' ? (
            <div className="mb-2">
              <label className="form-label small fw-semibold">Cancel reason (optional)</label>
              <textarea
                className="form-control form-control-sm"
                rows={2}
                value={bulkCancelReason}
                onChange={(e) => setBulkCancelReason(e.target.value)}
                placeholder="Optional reason"
              />
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light btn-sm" onClick={() => setBulkConfirmOpen(false)}>
            Go back
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={bulkSubmitting}
            onClick={onBulkSubmit}
          >
            {bulkSubmitting ? 'Applying…' : `Apply to ${selectedCount} order(s)`}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ── Filter drawer ── */}
      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} size="xs">
        <Drawer.Header>
          <Drawer.Title>Filters</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <div className="d-flex flex-column gap-3 p-1">
            <div>
              <label className="form-label small fw-semibold">Payment status</label>
              <select
                className="form-select"
                value={draftPaymentFilter}
                onChange={(e) => setDraftPaymentFilter(e.target.value)}
              >
                <option value="">Any</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <button type="button" className="btn btn-primary w-100" onClick={() => onApplyFilters(draftPaymentFilter)}>
              Apply filters
            </button>
          </div>
        </Drawer.Body>
      </Drawer>
    </div>
  );
};

export default OrderManagementView;
