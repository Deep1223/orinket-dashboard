import { textField, textareaField, numberField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontReviewsMasterJson = [
    {
        tabname: 'Customer reviews',
        pagename: 'Storefront Reviews Master',
        aliasname: 'storefrontreviewsmaster',
        rightsidebarsize: 'lg',
        readonly: true,
        fields: [
            textField('reviewerName', 'Reviewer', 'Customer review', { showingrid: true, sorting: true }),
            textField('productName', 'Product', 'Customer review', { showingrid: true, sorting: true }),
            numberField('rating', 'Rating', 'Customer review', { showingrid: true, sorting: true, defaultvalue: 0 }),
            textField('title', 'Title', 'Customer review', { showingrid: true, sorting: true }),
            textareaField('text', 'Review Text', 'Customer review'),
            textField('source', 'Source', 'Customer review', { showingrid: true, sorting: true }),
            textField('createdAt', 'Submitted At', 'Customer review', { showingrid: true, sorting: true }),
        ],
    },
];

export default StorefrontReviewsMasterJson;
