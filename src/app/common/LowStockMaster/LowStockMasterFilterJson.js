/** Filter metadata for Low Stock Master — consumed by FilterRightSidebar + FilteredDataBadge. */
const LowStockMasterFilterJson = [
  {
    tabname: 'Low Stock Master',
    pagename: 'Low Stock Master',
    aliasname: 'lowstockproductsmaster',
    rightsidebarsize: 'sm',
    fields: [
      {
        field: 'categoryName',
        text: 'Category',
        type: 'dropdown',
        filter: 1,
        filtertype: 'dropdown',
        masterdata: 'lowstockcategories',
        label: 'Category',
        filterplaceholder: 'Select Category',
      },
      {
        field: 'productText',
        text: 'Product / SKU',
        type: 'text',
        filter: 1,
        filtertype: 'text',
        label: 'Product / SKU',
        filterplaceholder: 'Enter product name or SKU',
      },
    ],
  },
];

export default LowStockMasterFilterJson;
