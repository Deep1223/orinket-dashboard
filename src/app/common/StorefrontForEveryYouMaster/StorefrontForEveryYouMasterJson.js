import { textField, textareaField, imageField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontForEveryYouMasterJson = [
    {
        tabname: 'For every you',
        pagename: 'Storefront For Every You Master',
        aliasname: 'storefrontforeveryyoumaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', 'For every you', { showingrid: true, sorting: true, required: true }),
            textareaField('description', 'Description', 'For every you'),

            textField('occasion1Title', 'Occasion 1 Title', 'Occasion 1'),
            textField('occasion1Subtitle', 'Occasion 1 Subtitle', 'Occasion 1'),
            imageField('occasion1Image', 'Occasion 1 Image', 'Occasion 1'),
            textField('occasion1Href', 'Occasion 1 Link', 'Occasion 1'),

            textField('occasion2Title', 'Occasion 2 Title', 'Occasion 2'),
            textField('occasion2Subtitle', 'Occasion 2 Subtitle', 'Occasion 2'),
            imageField('occasion2Image', 'Occasion 2 Image', 'Occasion 2'),
            textField('occasion2Href', 'Occasion 2 Link', 'Occasion 2'),

            textField('occasion3Title', 'Occasion 3 Title', 'Occasion 3'),
            textField('occasion3Subtitle', 'Occasion 3 Subtitle', 'Occasion 3'),
            imageField('occasion3Image', 'Occasion 3 Image', 'Occasion 3'),
            textField('occasion3Href', 'Occasion 3 Link', 'Occasion 3'),
        ],
    },
];

export default StorefrontForEveryYouMasterJson;
