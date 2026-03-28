const MenuAssignMasterJson = [
    {
        tabname: 'Menu Assign',
        pagename: 'Menu Assign',
        aliasname: 'menuassignmaster',
        rightsidebarsize: 'sm',
        fields: [
            {
                field: 'moduleid',
                text: 'Module',
                type: 'dropdown',
                disabled: false,
                required: true,
                defaultvisibility: true,
                size: 'col-12',
                defaultvalue: '',
                masterdata: 'modulemaster',
                masterdatafield: 'module',
                formdatafield: 'module',
                staticfilter: { status: 1 },
                projection: {
                    module: 1,
                    _id: 1,
                    icon: 1,
                    iconid: 1
                },
                // sort: { field: 'icon', order: 1 },

                showingrid: true,
                sorting: true,
                tablesize: 'tbl-w-250p',

                filter: 1,
                filtertype: 'text',
                label: 'Module',
            },
            {
                field: 'menuid',
                text: 'Menu',
                type: 'dropdown',
                disabled: false,
                required: true,
                defaultvisibility: true,
                size: 'col-12',
                defaultvalue: '',
                masterdata: 'menumaster',
                masterdatafield: 'menuname',
                formdatafield: 'menu',
                staticfilter: { status: 1 },
                projection: {
                    menuname: 1,
                    _id: 1,
                    icon: 1,
                    iconid: 1
                },
                // sort: { field: 'icon', order: 1 },

                showingrid: true,
                sorting: true,
                tablesize: 'tbl-w-250p',

                filter: 1,
                filtertype: 'text',
                label: 'Menu',
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

export default MenuAssignMasterJson;
