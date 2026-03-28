const SeriesMasterJson = [
  {
    tabname: 'Series Master',
    pagename: 'Series Master',
    aliasname: 'seriesmaster',
    rightsidebarsize: 'sm',
    fields: [
      {
        field: 'menunameid',
        text: 'Menu',
        type: 'dropdown',
        disabled: false,
        required: true,
        defaultvisibility: true,
        size: 'col-12',
        defaultvalue: '',
        masterdata: 'menumaster',
        masterdatafield: 'menuname',
        formdatafield: 'menuname',
        cleanable: true,
        searchable: true,
        staticfilter: { status: 1 },
        projection: {
          menuname: 1,
          _id: 1,
        },

        showingrid: true,
        sorting: true,
        tablesize: 'tbl-w-250p',

        filter: 1,
        filtertype: 'text',
        label: 'Menu',
      },

      // ── 1. Series Code / Prefix ──────────────────────────────────
      {
        field: 'seriescode',
        text: 'Series Code / Prefix',
        type: 'text',
        disabled: false,
        required: true,
        defaultvisibility: true,
        size: 'col-12 col-md-6',
        placeholder: 'Enter Series Code / Prefix',
        defaultvalue: '',

        showingrid: true,
        sorting: true,
        tablesize: 'tbl-w-250p',

        filter: 1,
        filtertype: 'text',
        filterplaceholder: 'Search Prefix',
        label: 'Series Code',
      },

      // ── 2. Starting Number ───────────────────────────────────────
      {
        field: 'startingnumber',
        text: 'Starting Number',
        type: 'number',
        disabled: false,
        required: true,
        defaultvisibility: true,
        size: 'col-12 col-md-6',
        placeholder: 'Enter Starting Number',
        defaultvalue: 1,

        showingrid: true,
        sorting: true,
        tablesize: 'tbl-w-250p',

        filter: 0,
      },

      // ── 3. Current Number ────────────────────────────────────────
      {
        field: 'currentnumber',
        text: 'Current Number',
        type: 'number',
        disabled: false,           // read-only — system managed
        required: false,
        defaultvisibility: true,
        size: 'col-12 col-md-6',
        placeholder: 'Enter Current Number',
        defaultvalue: '',

        showingrid: true,
        sorting: false,
        tablesize: 'tbl-w-200p',

        filter: 0,
      },

      // ── 4. Number Length ─────────────────────────────────────────
      {
        field: 'numberlength',
        text: 'Number Length',
        type: 'number',
        disabled: false,
        required: true,
        defaultvisibility: true,
        size: 'col-12 col-md-6',
        placeholder: 'Enter Number Length',
        defaultvalue: 4,

        showingrid: true,
        sorting: false,
        tablesize: 'tbl-w-200p',

        filter: 0,
      },

      // ── 5. Separator ─────────────────────────────────────────────
      {
        field: 'separator',
        text: 'Separator',
        type: 'text',
        disabled: false,
        required: false,
        defaultvisibility: true,
        size: 'col-12 col-md-6',
        placeholder: 'Enter Separator',
        defaultvalue: '-',
        maxlength: 3,

        showingrid: false,
        sorting: false,
        tablesize: 'tbl-w-100p',

        filter: 0,
      },

      // ── 6. Suffix ────────────────────────────────────────────────
      {
        field: 'suffix',
        text: 'Suffix',
        type: 'text',
        disabled: false,
        required: false,
        defaultvisibility: true,
        size: 'col-12 col-md-6',
        placeholder: 'Enter Suffix',
        defaultvalue: '',
        maxlength: 20,

        showingrid: false,
        sorting: false,
        tablesize: 'tbl-w-100p',

        filter: 0,
      },

      // ── 7. Format Preview (display-only, computed) ───────────────
      // Rendered as a special read-only preview field in RightSidebar
      // Not stored in DB — computed: `{seriescode}{separator}{padded(startingnumber, numberlength)}{suffix}`
      {
        field: 'formatpreview',
        text: 'Format Preview',
        type: 'text',     // custom type — handle in RightSidebar form renderer
        disabled: true,
        required: false,
        defaultvisibility: true,
        size: 'col-12',
        placeholder: '',
        defaultvalue: '',

        showingrid: true,
        sorting: true,
        tablesize: 'tbl-w-250p',

        filter: 0,
      },
    ],
  },
];

export default SeriesMasterJson;
