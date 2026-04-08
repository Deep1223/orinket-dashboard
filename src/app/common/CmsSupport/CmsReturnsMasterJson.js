const CmsReturnsMasterJson = [
    {
        tabname: 'Returns page',
        pagename: 'Returns & exchanges',
        aliasname: 'cmsreturns',
        rightsidebarsize: 'lg',
        fields: [
            {
                field: 'title',
                text: 'Title',
                type: 'text',
                defaultvisibility: true,
                size: 'col-12',
                defaultvalue: 'Returns & exchanges',
            },
            {
                field: 'subtitle',
                text: 'Subtitle',
                type: 'textarea',
                defaultvisibility: true,
                size: 'col-12',
                defaultvalue: '',
            },
            {
                field: 'eligibleText',
                text: 'Eligible items (one per line)',
                type: 'textarea',
                defaultvisibility: true,
                size: 'col-12',
                defaultvalue: '',
            },
            {
                field: 'notEligibleText',
                text: 'Not eligible (one per line)',
                type: 'textarea',
                defaultvisibility: true,
                size: 'col-12',
                defaultvalue: '',
            },
            {
                field: 'howToText',
                text: 'How to return (one per line)',
                type: 'textarea',
                defaultvisibility: true,
                size: 'col-12',
                defaultvalue: '',
            },
            {
                field: 'supportNote',
                text: 'Footer note / questions line',
                type: 'textarea',
                defaultvisibility: true,
                size: 'col-12',
                defaultvalue: '',
            },
            {
                field: 'refundPolicyUrl',
                text: 'Refund policy URL (path or full URL)',
                type: 'text',
                defaultvisibility: true,
                size: 'col-12',
                defaultvalue: '/legal/refund',
            },
        ],
    },
];

export default CmsReturnsMasterJson;
