const CountryMasterJson = [
  {
    tabname: 'Country Master',
    pagename: 'Country Master',
    aliasname: 'countrymaster',
    rightsidebarsize: 'sm',
    fields: [
      {
        field: 'countryname',
        text: 'Country',
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
        label: 'Country',
      },
      {
        field: 'countrycode',
        text: 'Country Code',
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
        label: 'Country Code',
      },
      {
        field: 'currencycode',
        text: 'Currency Code',
        type: 'text',
        disabled: false,
        required: true,
        placeholder: 'e.g. INR, USD, EUR',
        defaultvisibility: true,
        size: 'col-12',
        defaultvalue: '',

        showingrid: true,
        sorting: true,
        tablesize: 'tbl-w-180p',

        filter: 1,
        filtertype: 'text',
        label: 'Currency',
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

export default CountryMasterJson;
