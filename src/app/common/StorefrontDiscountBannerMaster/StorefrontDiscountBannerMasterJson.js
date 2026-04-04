import { textField, textareaField, imageField, numberField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontDiscountBannerMasterJson = [
    {
        tabname: 'Discount banner',
        pagename: 'Storefront Discount Banner Master',
        aliasname: 'storefrontdiscountbannermaster',
        rightsidebarsize: 'lg',
        fields: [
            imageField('image', 'Image', 'Discount banner', { showingrid: true }),
            textField('alt', 'Alt Text', 'Discount banner'),
            textField('subtitle', 'Subtitle', 'Discount banner', { showingrid: true, sorting: true }),
            textField('title', 'Title', 'Discount banner', { showingrid: true, sorting: true, required: true }),
            textareaField('description', 'Description', 'Discount banner'),
            textField('cta', 'CTA Text', 'Discount banner'),
            numberField('discountUpTo', 'Discount Up To (%)', 'Discount banner', {
                defaultvalue: 50,
                required: true,
                showingrid: true,
                sorting: true,
            }),
        ],
    },
];

export default StorefrontDiscountBannerMasterJson;
