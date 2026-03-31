import { textField, textareaField, numberField } from '../StorefrontHomeMasters/sharedFields';

const reviewFields = (index) => [
    textField(`review${index}Id`, `Review ${index} Id`, `Review ${index}`),
    textField(`review${index}Name`, `Review ${index} Name`, `Review ${index}`),
    textField(`review${index}Location`, `Review ${index} Location`, `Review ${index}`),
    numberField(`review${index}Rating`, `Review ${index} Rating`, `Review ${index}`, { defaultvalue: 5 }),
    textareaField(`review${index}Text`, `Review ${index} Text`, `Review ${index}`),
    textField(`review${index}Product`, `Review ${index} Product`, `Review ${index}`),
];

const StorefrontReviewsMasterJson = [
    {
        tabname: 'Reviews',
        pagename: 'Storefront Reviews Master',
        aliasname: 'storefrontreviewsmaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', 'Reviews', { showingrid: true, sorting: true, required: true }),
            textField('subtitle', 'Subtitle', 'Reviews'),
            ...reviewFields(1),
            ...reviewFields(2),
            ...reviewFields(3),
        ],
    },
];

export default StorefrontReviewsMasterJson;
