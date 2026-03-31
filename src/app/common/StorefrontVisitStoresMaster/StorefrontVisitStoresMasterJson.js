import { textField, imageField } from '../StorefrontHomeMasters/sharedFields';

const storeFields = (index) => [
    textField(`store${index}Name`, `Store ${index} Name`, `Store ${index}`),
    textField(`store${index}City`, `Store ${index} City`, `Store ${index}`),
    textField(`store${index}Address`, `Store ${index} Address`, `Store ${index}`),
    imageField(`store${index}Image`, `Store ${index} Image`, `Store ${index}`),
    textField(`store${index}Href`, `Store ${index} Link`, `Store ${index}`),
];

const StorefrontVisitStoresMasterJson = [
    {
        tabname: 'Visit stores',
        pagename: 'Storefront Visit Stores Master',
        aliasname: 'storefrontvisitstoresmaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', 'Visit stores', { showingrid: true, sorting: true, required: true }),
            textField('subtitle', 'Subtitle', 'Visit stores'),
            ...storeFields(1),
            ...storeFields(2),
            textField('buttonText', 'Button Text', 'Visit stores'),
            textField('buttonHref', 'Button Link', 'Visit stores'),
        ],
    },
];

export default StorefrontVisitStoresMasterJson;
