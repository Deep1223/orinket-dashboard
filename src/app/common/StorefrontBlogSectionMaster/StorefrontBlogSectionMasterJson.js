import { textField, textareaField, imageField } from '../StorefrontHomeMasters/sharedFields';

const postFields = (index) => [
    textField(`post${index}Slug`, `Post ${index} Slug`, `Post ${index}`),
    textField(`post${index}Title`, `Post ${index} Title`, `Post ${index}`),
    textareaField(`post${index}Excerpt`, `Post ${index} Excerpt`, `Post ${index}`),
    imageField(`post${index}Image`, `Post ${index} Image`, `Post ${index}`),
    textField(`post${index}DateLabel`, `Post ${index} Date Label`, `Post ${index}`),
    textField(`post${index}Href`, `Post ${index} Link`, `Post ${index}`),
];

const StorefrontBlogSectionMasterJson = [
    {
        tabname: 'Blog Master',
        pagename: 'Blog Master',
        aliasname: 'storefrontblogsectionmaster',
        rightsidebarsize: 'lg',
        fields: [
            textField('title', 'Title', '', { showingrid: true, sorting: true, required: true }),
            ...postFields(1),
            ...postFields(2),
            ...postFields(3),
            textField('buttonText', 'Button Text', ''),
            textField('buttonHref', 'Button Link', ''),
        ],
    },
];

export default StorefrontBlogSectionMasterJson;
