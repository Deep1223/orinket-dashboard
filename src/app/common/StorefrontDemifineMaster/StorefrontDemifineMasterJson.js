import { textField, textareaField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontDemifineMasterJson = [
    {
        tabname: 'Demifine section',
        pagename: 'Demifine Master',
        aliasname: 'storefrontdemifinemaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('subtitle', 'Subtitle', { showingrid: true, sorting: true, required: true }),
            textField('title', 'Title', { showingrid: true, sorting: true, required: true }),
            textareaField('description', 'Description', { required: true }),
            textField('ctaText', 'CTA Text'),
        ],
    },
];

export default StorefrontDemifineMasterJson;
