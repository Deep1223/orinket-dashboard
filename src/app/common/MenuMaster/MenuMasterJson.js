const MenuMasterJson = [
  {
    tabname: 'Menu Master',
    pagename: 'Menu Master',
    aliasname: 'menumaster',
    rightsidebarsize: 'md',
    fields: [
      {
        field: 'menuname',
        text: 'Menu Name',
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
        label: 'Menu Name',
      },
      {
        field: 'pagename',
        text: 'Page Name',
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
        label: 'Page Name',
      },
      {
        field: 'aliasname',
        text: 'Alias Name',
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
        label: 'Alias Name',
      },
      // {
      //   field: 'icon',
      //   text: 'Icon',
      //   type: 'dropdown',
      //   required: true,
      //   size: 'col-12 col-md-6',
      //   placeholder: 'Select Icon',
      //   masterdataarray: [
      //     { label: 'Home', value: 'FaHome' },
      //     { label: 'Users', value: 'MdPeople' },
      //     { label: 'Settings', value: 'MdSettings' },
      //     { label: 'Apps', value: 'MdApps' },
      //     { label: 'Database', value: 'FaDatabase' },
      //   ],
      //   showingrid: true,
      // },
      {
        field: 'iconid',
        text: 'Icon',
        type: 'dropdown',
        disabled: false,
        required: true,
        defaultvisibility: true,
        size: 'col-12',
        defaultvalue: '',
        masterdata: 'iconmaster',
        masterdatafield: 'icon',
        formdatafield: 'icon',
        staticfilter: {status: 1},
        projection: {
          icon: 1,
          _id: 1,
          iconclass: 1
        },
        // sort: { field: 'icon', order: 1 },

        showingrid: true,
        sorting: true,
        tablesize: 'tbl-w-250p',

        filter: 1,
        filtertype: 'text',
        label: 'Icon',
      },
      {
        field: 'showinsidebar',
        text: 'Show in Sidebar',
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

export default MenuMasterJson;
