import { textField, textareaField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontFineGoldMasterJson = [
    {
        tabname: 'Fine gold section',
        pagename: 'Storefront Fine Gold Master',
        aliasname: 'storefrontfinegoldmaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', 'Fine gold', { showingrid: true, sorting: true }),
            textareaField('description', 'Description', 'Fine gold'),
            textareaField('filters', 'Filters (comma or new line)', 'Fine gold'),
            textField('emptyStateTitle', 'Empty State Title', 'Fine gold'),
            textareaField('emptyStateDescriptionAll', 'Empty Description (All)', 'Fine gold'),
            textareaField('emptyStateDescriptionFiltered', 'Empty Description (Filtered)', 'Fine gold'),
        ],
    },
];

export default StorefrontFineGoldMasterJson;
