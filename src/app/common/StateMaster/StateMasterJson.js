const StateMasterJson = [
  {
    tabname: 'State Master',
    pagename: 'State Master',
    aliasname: 'statemaster',
    rightsidebarsize: 'sm',
    fields: [
      {
        field: 'countryid',
        text: 'Country',
        type: 'dropdown',
        disabled: false,
        required: true,
        defaultvisibility: true,
        size: 'col-12',
        defaultvalue: '',
        masterdata: 'countrymaster',
        masterdatafield: 'countryname',
        formdatafield: 'country',
        cleanable: true,
        searchable: true,
        staticfilter: { status: 1 },
        projection: {
          countryname: 1,
          _id: 1,
        },

        showingrid: true,
        sorting: true,
        tablesize: 'tbl-w-250p',

        filter: 1,
        filtertype: 'text',
        label: 'Country',
      },
      {
        field: 'statename',
        text: 'State Name',
        type: 'text',
        disabled: false,
        required: true,
        defaultvisibility: true,
        size: 'col-12',
        defaultvalue: '',

        showingrid: true,
        sorting: true,
        tablesize: 'tbl-w-250p',

        filter: 1,
        filtertype: 'text',
        label: 'State',
      },
      {
        field: 'status',
        text: 'Status',
        type: 'checkbox',
        disabled: false,
        required: false,
        defaultvisibility: true,
        size: 'col-12',
        placeholder: 'Select Status',
        defaultvalue: 1,

        showingrid: true,
        sorting: false,
        tablesize: 'tbl-w-250p',

        filter: 0,
      },
    ],
  },
];

export default StateMasterJson;
