import { textField, numberField, textareaField } from '../StorefrontHomeMasters/sharedFields';

const featureFields = (index) => [
    textField(`feature${index}Title`, `Feature ${index} Title`, `Feature ${index}`),
    textareaField(`feature${index}Description`, `Feature ${index} Description`, `Feature ${index}`),
    numberField(`feature${index}Threshold`, `Feature ${index} Free Shipping Threshold (INR)`, `Feature ${index}`),
];

const StorefrontShopWithConfidenceMasterJson = [
    {
        tabname: 'Shop with confidence',
        pagename: 'Storefront Shop With Confidence Master',
        aliasname: 'storefrontshopwithconfidencemaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', 'Shop with confidence', { showingrid: true, sorting: true, required: true }),
            ...featureFields(1),
            ...featureFields(2),
            ...featureFields(3),
            ...featureFields(4),
        ],
    },
];

export default StorefrontShopWithConfidenceMasterJson;
