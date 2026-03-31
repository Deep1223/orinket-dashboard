import { textField, textareaField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontDemifineMasterJson = [
    {
        tabname: 'Demifine section',
        pagename: 'Storefront Demifine Master',
        aliasname: 'storefrontdemifinemaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('subtitle', 'Subtitle', 'Demifine', { showingrid: true, sorting: true, required: true }),
            textField('title', 'Title', 'Demifine', { showingrid: true, sorting: true, required: true }),
            textareaField('description', 'Description', 'Demifine', { required: true }),
            textField('ctaText', 'CTA Text', 'Demifine'),
            textField('ctaHref', 'CTA Link', 'Demifine'),
        ],
    },
];

export default StorefrontDemifineMasterJson;
