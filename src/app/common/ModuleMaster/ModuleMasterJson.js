import Config from "../../../config/config";

const ModuleMasterJson = [
    {
        tabname: 'Module Master',
        pagename: 'Module Master',
        aliasname: 'modulemaster',
        rightsidebarsize: 'sm',
        fields: [
            {
                field: 'module',
                text: 'Module Name',
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
                label: 'Module Name',
            },
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
                staticfilter: { status: 1 },
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
                field: 'bgcolor',
                text: 'Background Color',
                type: 'colorpicker',
                disabled: false,
                required: true,
                defaultvisibility: true,
                size: 'col-12',
                defaultvalue: Config.colorPicker.defaultColor,
            
                showingrid: true,
                sorting: false,
                tablesize: 'tbl-w-250p',

                filter: 0,
                filtertype: 'text',
                label: 'Background Color',
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

export default ModuleMasterJson;