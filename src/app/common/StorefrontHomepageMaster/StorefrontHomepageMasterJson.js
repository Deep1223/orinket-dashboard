/**
 * Standalone master: hero slides + storefront JSON only.
 * Saves to the same General Setting document (alias generalsetting) — create if none, else update.
 * tablefields entries must match sibling field definitions with istablefield (see shopFooterLinks pattern).
 */
const StorefrontHomepageMasterJson = [
    {
        tabname: 'Storefront homepage',
        pagename: 'Hero Banner Slides',
        aliasname: 'storefronthomepage',
        rightsidebarsize: 'lg',
        fields: [
            {
                field: 'image',
                text: 'Slide image',
                type: 'image',
                size: 'col-12 col-md-4',
                defaultvalue: '',
                istablefield: true,
                rightsidebartablesize: 'tbl-w-180p',
            },
            {
                field: 'title',
                text: 'Title',
                type: 'text',
                size: 'col-12 col-md-4',
                defaultvalue: '',
                istablefield: true,
                rightsidebartablesize: 'tbl-w-160p',
            },
            {
                field: 'subtitle',
                text: 'Subtitle',
                type: 'text',
                size: 'col-12 col-md-4',
                defaultvalue: '',
                istablefield: true,
                rightsidebartablesize: 'tbl-w-160p',
            },
            {
                field: 'caption',
                text: 'Caption',
                type: 'text',
                size: 'col-12 col-md-4',
                defaultvalue: '',
                istablefield: true,
                rightsidebartablesize: 'tbl-w-140p',
            },
            {
                field: 'cta',
                text: 'Button label (CTA)',
                type: 'text',
                size: 'col-12 col-md-4',
                defaultvalue: '',
                istablefield: true,
                rightsidebartablesize: 'tbl-w-120p',
            },
            {
                field: 'href',
                text: 'Button link (URL)',
                type: 'text',
                size: 'col-12 col-md-4',
                placeholder: '/shop',
                defaultvalue: '',
                istablefield: true,
                rightsidebartablesize: 'tbl-w-160p',
            },
            {
                field: 'heroSlides',
                text: 'Hero banner slides',
                type: 'tbl-add-button',
                size: 'col-12',
                defaultvalue: [],
                tablefields: ['image', 'title', 'subtitle', 'caption', 'cta', 'href'],
                showingrid: false,
                filter: 0,
            },
        ],
    },
];

export default StorefrontHomepageMasterJson;
