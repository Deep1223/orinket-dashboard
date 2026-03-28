const UserRoleJson = [
  {
    tabname: 'User Role Master',
    pagename: 'User Role',
    aliasname: 'userrole',
    rightsidebarsize: 'sm',
    fields: [
      {
        field: 'userrole',
        text: 'User Role',
        type: 'text',
        disabled: false,
        required: true,
        defaultvisibility: true,
        size: 'col-12',
        placeholder: 'Enter User Role',
        defaultvalue: '',

        showingrid: true,
        sorting: true,
        tablesize: 'tbl-w-250p',

        filter: 1,
        filtertype: 'text',
        filterplaceholder: 'Enter User Role',
        label: 'User Role',
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

export default UserRoleJson;
