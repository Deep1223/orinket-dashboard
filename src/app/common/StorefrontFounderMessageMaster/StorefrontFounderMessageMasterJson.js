import { textField, textareaField, imageField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontFounderMessageMasterJson = [
    {
        tabname: 'Founder message',
        pagename: 'Founder Master',
        aliasname: 'storefrontfoundermessagemaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', { showingrid: true, sorting: true, required: true }),
            textareaField('quote', 'Quote'),
            textareaField('description', 'Description'),
            textField('name', 'Founder Name'),
            textField('role', 'Role'),
            imageField('image', 'Founder Image'),
            textField('alt', 'Image Alt'),
        ],
    },
];

export default StorefrontFounderMessageMasterJson;
