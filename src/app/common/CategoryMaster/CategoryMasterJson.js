const CategoryMasterJson = [
  {
    tabname: 'Category Master',
    pagename: 'Category',
    aliasname: 'category',
    rightsidebarsize: 'sm',
    fields: [
      {
        field: 'categoryname',
        text: 'Category Name',
        type: 'text',
        disabled: false,
        required: true,
        defaultvisibility: true,
        size: 'col-12',
        placeholder: 'Enter Category Name',
        defaultvalue: '',

        showingrid: true,
        sorting: true,
        tablesize: 'tbl-w-250p',

        filter: 1,
        filtertype: 'text',
        filterplaceholder: 'Enter Category Name',
        label: 'Category Name',
      },
      {
        field: 'description',
        text: 'Description',
        type: 'textarea',
        disabled: false,
        required: true,
        defaultvisibility: true,
        size: 'col-12',
        placeholder: 'Enter Description',
        defaultvalue: '',

        showingrid: true,
        sorting: false,
        tablesize: 'tbl-w-250p',

        filter: 0,
      },
      {
        field: 'categoryimage',
        text: 'Category Image',
        type: 'image',
        disabled: false,
        required: false,
        defaultvisibility: true,
        size: 'col-12',
        placeholder: 'Upload Category Image',
        defaultvalue: '',
        showingrid: true,
        sorting: false,
        tablesize: 'tbl-w-150p',
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

export default CategoryMasterJson;
