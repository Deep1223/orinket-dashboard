const grid = (showingrid = false, tablesize = 'tbl-w-220p', sorting = false) => ({
    showingrid,
    tablesize,
    sorting,
    filter: showingrid ? 1 : 0,
    filtertype: showingrid ? 'text' : undefined,
});

const base = (field, text, type, sectionTitle, size = 'col-12') => ({
    field,
    text,
    type,
    disabled: false,
    required: false,
    defaultvisibility: true,
    size,
    defaultvalue: type === 'number' ? 0 : '',
    sectionTitle,
    ...grid(false),
});

export const textField = (field, text, sectionTitle, options = {}) => ({
    ...base(field, text, 'text', sectionTitle, options.size || 'col-12'),
    required: !!options.required,
    defaultvalue: options.defaultvalue ?? '',
    ...grid(!!options.showingrid, options.tablesize || 'tbl-w-220p', !!options.sorting),
    label: options.label || text,
});

export const imageField = (field, text, sectionTitle, options = {}) => ({
    ...base(field, text, 'image', sectionTitle, options.size || 'col-12 col-md-6'),
    required: !!options.required,
    defaultvalue: options.defaultvalue ?? '',
    ...grid(!!options.showingrid, options.tablesize || 'tbl-w-220p', !!options.sorting),
    label: options.label || text,
});

export const textareaField = (field, text, sectionTitle, options = {}) => ({
    ...base(field, text, 'textarea', sectionTitle, options.size || 'col-12'),
    required: !!options.required,
    defaultvalue: options.defaultvalue ?? '',
    ...grid(!!options.showingrid, options.tablesize || 'tbl-w-260p', !!options.sorting),
    label: options.label || text,
});

export const numberField = (field, text, sectionTitle, options = {}) => ({
    ...base(field, text, 'number', sectionTitle, options.size || 'col-12 col-md-6'),
    required: !!options.required,
    defaultvalue: options.defaultvalue ?? 0,
    ...grid(!!options.showingrid, options.tablesize || 'tbl-w-140p', !!options.sorting),
    label: options.label || text,
});
