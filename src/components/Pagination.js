import { SelectPicker } from 'rsuite';

const PAGE_SIZE_OPTIONS = [20, 50, 100, 500, 1000].map((n) => ({ label: String(n), value: n }));

const Pagination = ({
  totalCount = 0,
  showingCount,
  pageSize = 20,
  onPageSizeChange,
  loading = false,
}) => {
  const value = PAGE_SIZE_OPTIONS.some((o) => o.value === pageSize) ? pageSize : 20;
  const displayCount = showingCount !== undefined ? showingCount : Math.min(pageSize, totalCount) || 0;

  return (
    <nav
      className="d-flex flex-row justify-content-between align-items-center gap-2 pt-2"
      aria-label="Table pagination"
    >
      <span className="small text-secondary">
        {loading ? (
          'Loading...'
        ) : (
          <>
            Showing <span className="fw-semibold text-dark">{displayCount}</span> entries out of{' '}
            <span className="fw-semibold text-dark">{totalCount}</span>
          </>
        )}
      </span>

      <div className="d-flex align-items-center gap-2">
        <span className="small text-secondary">Show</span>
        <SelectPicker
          data={PAGE_SIZE_OPTIONS}
          value={value}
          onChange={onPageSizeChange}
          disabled={loading}
          cleanable={false}
          searchable={false}
          size="sm"
          placement="topStart"
          style={{ minWidth: 80 }}
        />
        <span className="small text-secondary">per page</span>
      </div>
    </nav>
  );
};

export default Pagination;
