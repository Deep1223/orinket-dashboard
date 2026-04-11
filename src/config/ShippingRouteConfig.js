import React from 'react';

// Shipping Management Routes Configuration
export const SHIPPING_ROUTES = [
    {
        path: '/shipping',
        component: React.lazy(() => import('../app/controller/ShippingMasterController')),
        pageKey: 'shippingmaster',
        title: 'Shipping Management',
        icon: 'truck',
        exact: true,
        permissions: ['shipping_view']
    },
    {
        path: '/shipping/orders',
        component: React.lazy(() => import('../app/controller/OrderMasterController')),
        pageKey: 'ordermaster',
        title: 'Order Management',
        icon: 'shopping-bag',
        exact: true,
        permissions: ['order_view']
    },
    {
        path: '/shipping/returns',
        component: React.lazy(() => import('../app/controller/ReturnRefundMasterController')),
        pageKey: 'returnrefundmaster',
        title: 'Return & Refund Management',
        icon: 'refresh-cw',
        exact: true,
        permissions: ['return_view']
    },
    {
        path: '/shipping/inventory',
        component: React.lazy(() => import('../app/controller/InventoryMasterController')),
        pageKey: 'inventorymaster',
        title: 'Inventory Management',
        icon: 'package',
        exact: true,
        permissions: ['inventory_view']
    },
    {
        path: '/shipping/customers',
        component: React.lazy(() => import('../app/controller/CustomerMasterController')),
        pageKey: 'customermaster',
        title: 'Customer Management',
        icon: 'users',
        exact: true,
        permissions: ['customer_view']
    },
    {
        path: '/shipping/dashboard',
        component: React.lazy(() => import('../components/shipping/ShippingDashboard')),
        pageKey: 'shippingdashboard',
        title: 'Shipping Dashboard',
        icon: 'layout-dashboard',
        exact: true,
        permissions: ['shipping_dashboard']
    }
];

export default SHIPPING_ROUTES;
