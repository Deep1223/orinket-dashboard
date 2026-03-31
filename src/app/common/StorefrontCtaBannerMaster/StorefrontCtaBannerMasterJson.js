import { textField, textareaField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontCtaBannerMasterJson = [
    {
        tabname: 'CTA banner',
        pagename: 'Storefront CTA Banner Master',
        aliasname: 'storefrontctabannermaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', 'CTA banner', { showingrid: true, sorting: true, required: true }),
            textareaField('description', 'Description', 'CTA banner'),
            textField('ctaText', 'CTA Text', 'CTA banner'),
            textField('ctaHref', 'CTA Link', 'CTA banner'),
        ],
    },
];

export default StorefrontCtaBannerMasterJson;
