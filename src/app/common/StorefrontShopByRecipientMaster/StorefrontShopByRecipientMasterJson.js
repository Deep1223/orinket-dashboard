import { textField, imageField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontShopByRecipientMasterJson = [
    {
        tabname: 'Shop by recipient',
        pagename: 'Storefront Shop By Recipient Master',
        aliasname: 'storefrontshopbyrecipientmaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', 'Shop by recipient', { showingrid: true, sorting: true, required: true }),
            textField('recipient1Title', 'Recipient 1 Title', 'Recipient 1', { showingrid: true }),
            imageField('recipient1Image', 'Recipient 1 Image', 'Recipient 1'),
            textField('recipient1Href', 'Recipient 1 Link', 'Recipient 1'),
            textField('recipient2Title', 'Recipient 2 Title', 'Recipient 2', { showingrid: true }),
            imageField('recipient2Image', 'Recipient 2 Image', 'Recipient 2'),
            textField('recipient2Href', 'Recipient 2 Link', 'Recipient 2'),
        ],
    },
];

export default StorefrontShopByRecipientMasterJson;
