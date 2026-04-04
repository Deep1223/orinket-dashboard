import { textField, textareaField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontForEveryYouMasterJson = [
    {
        tabname: 'For every you',
        pagename: 'Storefront For Every You Master',
        aliasname: 'storefrontforeveryyoumaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('eyebrow', 'Eyebrow', 'Shop by Occasion', { showingrid: true, sorting: false, required: false }),
            textField('title', 'Title', 'FOR EVERY YOU', { showingrid: true, sorting: true, required: true }),
            textareaField('description', 'Description', 'For every you'),
            textField('ornament', 'Bottom ornament', '— Orinket —', { showingrid: false, sorting: false, required: false }),
        ],
    },
];

export default StorefrontForEveryYouMasterJson;
