import { textField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontShopWithConfidenceMasterJson = [
    {
        tabname: 'Shop with confidence',
        pagename: 'Shop With Confidence Master',
        aliasname: 'storefrontshopwithconfidencemaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', 'Shop with confidence', { showingrid: true, sorting: true, required: true }),
            {
                field: 'featureTitle',
                text: 'Feature Title',
                type: 'text',
                size: 'col-12 col-md-4',
                defaultvalue: '',
                sectionTitle: 'Features',
                istablefield: true,
                rightsidebartablesize: 'tbl-w-180p',
            },
            {
                field: 'featureDescription',
                text: 'Feature Description',
                type: 'text',
                size: 'col-12 col-md-4',
                defaultvalue: '',
                sectionTitle: 'Features',
                istablefield: true,
                rightsidebartablesize: 'tbl-w-220p',
            },
            {
                field: 'featureThreshold',
                text: 'Free Shipping Threshold (INR)',
                type: 'number',
                size: 'col-12 col-md-4',
                defaultvalue: '',
                sectionTitle: 'Features',
                istablefield: true,
                rightsidebartablesize: 'tbl-w-200p',
            },
            {
                field: 'features',
                text: 'Features',
                type: 'tbl-add-button',
                disabled: false,
                required: false,
                defaultvisibility: true,
                size: 'col-12',
                defaultvalue: [],
                sectionTitle: 'Features',
                tablefields: ['featureTitle', 'featureDescription', 'featureThreshold'],
                showingrid: false,
                filter: 0,
            },
        ],
    },
];

export default StorefrontShopWithConfidenceMasterJson;
