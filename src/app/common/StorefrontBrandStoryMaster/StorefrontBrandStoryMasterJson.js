import { textField, textareaField, imageField } from '../StorefrontHomeMasters/sharedFields';

const StorefrontBrandStoryMasterJson = [
    {
        tabname: 'Brand story',
        pagename: 'Storefront Brand Story Master',
        aliasname: 'storefrontbrandstorymaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', 'Brand story', { showingrid: true, sorting: true, required: true }),
            imageField('image', 'Image', 'Brand story'),
            textField('alt', 'Image Alt', 'Brand story'),
            textareaField('description1', 'Description Paragraph 1', 'Brand story'),
            textareaField('description2', 'Description Paragraph 2', 'Brand story'),
            textareaField('description3', 'Description Paragraph 3', 'Brand story'),
            textField('ctaText', 'CTA Text', 'Brand story'),
            textField('ctaHref', 'CTA Link', 'Brand story'),
        ],
    },
];

export default StorefrontBrandStoryMasterJson;
