const txt = (field, text, sectionTitle) => ({
    field,
    text,
    type: 'textarea',
    sectionTitle,
    size: 'col-12',
    defaultvalue: '',
    showingrid: false,
    filter: 0,
});

const StorefrontSectionsMasterJson = [
    {
        tabname: 'Homepage sections',
        pagename: 'Storefront sections',
        aliasname: 'storefrontsections',
        rightsidebarsize: 'lg',
        fields: [
            txt('demifineSectionJson', 'Demifine section (JSON)', 'Home'),
            txt('topStylesSectionJson', 'Top styles section (JSON)', 'Home'),
            txt('discountBannerJson', 'Discount banner (JSON)', 'Home'),
            txt('shopByRecipientJson', 'Shop by recipient (JSON)', 'Home'),
            txt('forEveryYouJson', 'For every you (JSON)', 'Home'),
            txt('fineGoldSectionJson', 'Fine gold section (JSON)', 'Home'),
            txt('deserveToShineJson', 'Deserve to shine (JSON)', 'Home'),
            txt('founderMessageJson', 'Founder message (JSON)', 'Home'),
            txt('blogSectionJson', 'Blog section (JSON)', 'Home'),
            txt('shopWithConfidenceJson', 'Shop with confidence (JSON)', 'Home'),
            txt('brandStoryJson', 'Brand story (JSON)', 'Home'),
            txt('reviewsJson', 'Reviews (JSON)', 'Home'),
            txt('ctaBannerJson', 'CTA banner (JSON)', 'Home'),
            txt('visitStoresJson', 'Visit stores (JSON)', 'Home'),
        ],
    },
    {
        tabname: 'Inner pages',
        pagename: 'Storefront sections',
        aliasname: 'storefrontsections',
        rightsidebarsize: 'lg',
        fields: [
            txt('aboutPageJson', 'About page (JSON)', 'Pages'),
            txt('storyPageJson', 'Story page (JSON)', 'Pages'),
            txt('careersPageJson', 'Careers page (JSON)', 'Pages'),
            txt('jobOpeningsJson', 'Job openings (JSON array)', 'Pages'),
            txt('blogPostsJson', 'Blog posts (JSON array)', 'Pages'),
            txt('storeLocationsJson', 'Store locations (JSON array)', 'Pages'),
            txt('supportPagesJson', 'Support pages (JSON)', 'Pages'),
        ],
    },
];

export default StorefrontSectionsMasterJson;
