import { textField, textareaField, numberField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontTopStylesMasterJson = [
    {
        tabname: 'Top styles section',
        pagename: 'Storefront Top Styles Master',
        aliasname: 'storefronttopstylesmaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', 'Top styles', { showingrid: true, sorting: true, required: true }),
            {
                field: 'categoryid',
                text: 'Category',
                type: 'dropdown',
                disabled: false,
                required: false,
                defaultvisibility: true,
                size: 'col-12',
                defaultvalue: '',
                masterdata: 'category',
                masterdatafield: 'categoryname',
                formdatafield: 'category',
                staticfilter: { status: 1 },
                projection: {
                    categoryname: 1,
                    _id: 1,
                },
                showingrid: true,
                sorting: true,
                tablesize: 'tbl-w-220p',
                filter: 1,
                filtertype: 'text',
                label: 'Category',
            },
            textareaField('categories', 'Tab labels (comma or new line)', 'Top styles', {
                required: false,
                label: 'Tab labels (optional; e.g. ALL, NECKLACES)',
            }),
            textareaField('productIds', 'Product IDs from Product Master (one per line, max 50)', 'Top styles', {
                required: false,
                label: 'Product IDs (max 50)',
            }),
            numberField('discount', 'Discount (%)', 'Top styles', { showingrid: true, required: true }),
        ],
    },
];

export default StorefrontTopStylesMasterJson;
