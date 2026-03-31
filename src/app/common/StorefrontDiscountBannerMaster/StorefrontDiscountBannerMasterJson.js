import { textField, textareaField, imageField } from '../StorefrontHomeMasters/sharedFields';

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
            textField('href', 'CTA Link', 'Discount banner'),
        ],
    },
];

export default StorefrontDiscountBannerMasterJson;
