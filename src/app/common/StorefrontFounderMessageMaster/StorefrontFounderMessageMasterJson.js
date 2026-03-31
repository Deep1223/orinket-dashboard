import { textField, textareaField, imageField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontFounderMessageMasterJson = [
    {
        tabname: 'Founder message',
        pagename: 'Storefront Founder Message Master',
        aliasname: 'storefrontfoundermessagemaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', 'Founder message', { showingrid: true, sorting: true, required: true }),
            textareaField('quote', 'Quote', 'Founder message'),
            textareaField('description', 'Description', 'Founder message'),
            textField('name', 'Founder Name', 'Founder message'),
            textField('role', 'Role', 'Founder message'),
            imageField('image', 'Founder Image', 'Founder message'),
            textField('alt', 'Image Alt', 'Founder message'),
        ],
    },
];

export default StorefrontFounderMessageMasterJson;
