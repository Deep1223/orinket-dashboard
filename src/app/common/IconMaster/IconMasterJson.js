const IconMasterJson = [
    {
        tabname: 'Icon Master',
        pagename: 'Icon Master',
        aliasname: 'iconmaster',
        rightsidebarsize: 'sm',
        fields: [
            {
                field: 'icon',
                text: 'Icon Name',
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
                label: 'Icon Name',
            },
            {
                field: 'iconclass',
                text: 'Icon Class',
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
                label: 'Icon Class',
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

export default IconMasterJson;
