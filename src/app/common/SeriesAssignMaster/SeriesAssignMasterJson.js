const SeriesAssignMasterJson = [
  {
    tabname: 'Series Assign Master',
    pagename: 'Series Assign Master',
    aliasname: 'seriesassignmaster',
    rightsidebarsize: 'sm',
    fields: [
      {
        field: 'seriesid',
        text: 'Series',
        type: 'dropdown',
        disabled: false,
        required: true,
        defaultvisibility: true,
        size: 'col-12',
        defaultvalue: '',
        masterdata: 'seriesmaster',
        masterdatafield: 'seriesname',
        formdatafield: 'series',
        showlableview: [
          {
            field: 'seriesname',
            // separator: ' - ',    // next field ke saath separator
          },
          {
            field: 'formatpreview',
            prefix: ' ( ',       // is field ke aage
            suffix: ' )',        // is field ke peeche
          },
        ],
        cleanable: true,
        searchable: true,
        staticfilter: { status: 1 },
        projection: {
          seriesname: 1,
          formatpreview: 1,
          _id: 1,
        },

        showingrid: true,
        sorting: true,
        tablesize: 'tbl-w-250p',

        filter: 1,
        filtertype: 'text',
        label: 'Series',
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

export default SeriesAssignMasterJson;
