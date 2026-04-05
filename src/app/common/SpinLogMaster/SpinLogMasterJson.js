import { textField } from '../StorefrontHomeMasters/sharedFields';

const SpinLogMasterJson = [
    {
        tabname: 'Spin logs',
        pagename: 'Spin Log Master',
        aliasname: 'spinlogmaster',
        rightsidebarsize: 'lg',
        readonly: true,
        fields: [
            textField('email', 'Email', 'User & log', {
                showingrid: true,
                sorting: true,
                tablesize: 'tbl-w-220p',
            }),
            textField('phone', 'Phone', 'User & log', {
                showingrid: true,
                sorting: true,
                tablesize: 'tbl-w-140p',
            }),
            textField('session_id', 'Guest session ID', 'User & log', {
                showingrid: true,
                sorting: true,
                tablesize: 'tbl-w-180p',
            }),
            textField('spun_label', 'Spun', 'User & log', {
                showingrid: true,
                sorting: false,
                tablesize: 'tbl-w-90p',
            }),
            textField('reward', 'Reward', 'User & log', {
                showingrid: true,
                sorting: true,
                tablesize: 'tbl-w-200p',
            }),
            textField('coupon_code', 'Coupon code', 'User & log', {
                showingrid: true,
                sorting: true,
                tablesize: 'tbl-w-160p',
            }),
            textField('created_at', 'Spun at (UTC)', 'User & log', {
                showingrid: true,
                sorting: true,
                tablesize: 'tbl-w-200p',
            }),
        ],
    },
];

export default SpinLogMasterJson;
