const SubCategoryMasterJson = [
  {
    tabname: 'Sub Category Master',
    pagename: 'Sub Category Master',
    aliasname: 'subcategorymaster',
    rightsidebarsize: 'md',
    fields: [
      {
        field: 'subcategoryname',
        text: 'Sub Category Name',
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
        label: 'Sub Category',
      },
      {
        field: 'categoryid',
        text: 'Category',
        type: 'dropdown',
        disabled: false,
        required: true,
        defaultvisibility: true,
        size: 'col-12',
        defaultvalue: '',
        masterdata: 'category',
        masterdatafield: 'categoryname',
        formdatafield: 'category',
        staticfilter: {status: 1},
        projection: {
          categoryname: 1,
          _id: 1,
        },

        showingrid: true,
        sorting: true,
        tablesize: 'tbl-w-250p',

        filter: 1,
        filtertype: 'text',
        label: 'Category',
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

export default SubCategoryMasterJson;
