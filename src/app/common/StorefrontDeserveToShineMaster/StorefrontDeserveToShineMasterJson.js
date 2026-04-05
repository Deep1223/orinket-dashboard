import { textField, textareaField, imageField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontDeserveToShineMasterJson = [
    {
        tabname: 'Deserve to shine',
        pagename: 'Deserve To Shine Master',
        aliasname: 'storefrontdeservetoshinemaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', 'Deserve to shine', { showingrid: true, sorting: true, required: true }),
            imageField('image', 'Image', 'Deserve to shine'),
            textareaField('description1', 'Description Paragraph 1', 'Deserve to shine'),
            textareaField('description2', 'Description Paragraph 2', 'Deserve to shine'),
            textField('ctaText', 'CTA Text', 'Deserve to shine'),
            textField('ctaHref', 'CTA Link', 'Deserve to shine'),
        ],
    },
];

export default StorefrontDeserveToShineMasterJson;
