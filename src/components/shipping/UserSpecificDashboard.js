import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Badge,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Textarea,
    Label,
    Progress,
    Avatar,
    AvatarFallback,
    ScrollArea
} from '../ui';
import NotificationCenter from './NotificationCenter';

const UserSpecificDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [returns, setReturns] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Status configurations
    const orderStatuses = {
        pending: { label: 'Pending', color: 'yellow' },
        confirmed: { label: 'Confirmed', color: 'blue' },
        processing: { label: 'Processing', color: 'purple' },
        shipped: { label: 'Shipped', color: 'orange' },
        delivered: { label: 'Delivered', color: 'green' },
        cancelled: { label: 'Cancelled', color: 'red' }
    };

    const shipmentStatuses = {
        assigned: { label: 'Assigned', color: 'blue' },
        pickup_scheduled: { label: 'Pickup Scheduled', color: 'purple' },
        in_transit: { label: 'In Transit', color: 'orange' },
        delivered: { label: 'Delivered', color: 'green' },
        exception: { label: 'Exception', color: 'red' }
    };

    const returnStatuses = {
        requested: { label: 'Requested', color: 'yellow' },
        approved: { label: 'Approved', color: 'blue' },
        rejected: { label: 'Rejected', color: 'red' },
        received: { label: 'Received', color: 'green' },
        refunded: { label: 'Refunded', color: 'green' }
    };

    useEffect(() => {
        // Get current user from localStorage or auth context
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(currentUser);
        
        if (currentUser.id) {
            fetchUserSpecificData(currentUser.id);
        }
    }, []);

    const fetchUserSpecificData = async (userId) => {
        setLoading(true);
        try {
            // Fetch user-specific data
            await Promise.all([
                fetchUserOrders(userId),
                fetchUserShipments(userId),
                fetchUserReturns(userId),
                fetchUserRefunds(userId),
                fetchUserInventory(userId),
                fetchUserCustomers(userId)
            ]);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserOrders = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}/orders`);
            const data = await response.json();
            
            if (data.success) {
                setOrders(data.orders);
            } else {
                // Mock data for development
                const mockOrders = [
                    {
                        id: '1',
                        orderNumber: 'ORD-2024-001',
                        customerName: 'Rahul Sharma',
                        status: 'pending',
                        totalAmount: 2500,
                        createdAt: '2024-01-15T10:30:00Z',
                        assignedTo: userId
                    },
                    {
                        id: '2',
                        orderNumber: 'ORD-2024-002',
                        customerName: 'Priya Patel',
                        status: 'confirmed',
                        totalAmount: 1800,
                        createdAt: '2024-01-14T15:45:00Z',
                        assignedTo: userId
                    },
                    {
                        id: '3',
                        orderNumber: 'ORD-2024-003',
                        customerName: 'Amit Kumar',
                        status: 'processing',
                        totalAmount: 3200,
                        createdAt: '2024-01-13T11:20:00Z',
                        assignedTo: userId
                    }
                ];
                setOrders(mockOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchUserShipments = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}/shipments`);
            const data = await response.json();
            
            if (data.success) {
                setShipments(data.shipments);
            } else {
                // Mock data
                const mockShipments = [
                    {
                        id: '1',
                        orderNumber: 'ORD-2024-001',
                        courierName: 'Delhivery',
                        awbNumber: 'DL-123456789',
                        status: 'in_transit',
                        assignedTo: userId,
                        shippedAt: '2024-01-15T10:00:00Z',
                        estimatedDelivery: '2024-01-17T18:00:00Z'
                    },
                    {
                        id: '2',
                        orderNumber: 'ORD-2024-002',
                        courierName: 'Blue Dart',
                        awbNumber: 'BD-987654321',
                        status: 'assigned',
                        assignedTo: userId,
                        pickupScheduledAt: '2024-01-16T14:00:00Z'
                    }
                ];
                setShipments(mockShipments);
            }
        } catch (error) {
            console.error('Error fetching shipments:', error);
        }
    };

    const fetchUserReturns = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}/returns`);
            const data = await response.json();
            
            if (data.success) {
                setReturns(data.returns);
            } else {
                // Mock data
                const mockReturns = [
                    {
                        id: '1',
                        orderNumber: 'ORD-2024-004',
                        customerName: 'Neha Singh',
                        status: 'approved',
                        reason: 'Product not as described',
                        totalAmount: 1500,
                        requestedAt: '2024-01-13T10:30:00Z',
                        approvedAt: '2024-01-14T15:00:00Z',
                        assignedTo: userId
                    }
                ];
                setReturns(mockReturns);
            }
        } catch (error) {
            console.error('Error fetching returns:', error);
        }
    };

    const fetchUserRefunds = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}/refunds`);
            const data = await response.json();
            
            if (data.success) {
                setRefunds(data.refunds);
            } else {
                // Mock data
                const mockRefunds = [
                    {
                        id: '1',
                        orderNumber: 'ORD-2024-004',
                        status: 'processed',
                        amount: 1500,
                        method: 'Original Payment',
                        processedAt: '2024-01-15T14:00:00Z',
                        assignedTo: userId
                    }
                ];
                setRefunds(mockRefunds);
            }
        } catch (error) {
            console.error('Error fetching refunds:', error);
        }
    };

    const fetchUserInventory = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}/inventory`);
            const data = await response.json();
            
            if (data.success) {
                setInventory(data.inventory);
            } else {
                // Mock data
                const mockInventory = [
                    {
                        id: '1',
                        productName: 'Gold Necklace',
                        sku: 'GN-001',
                        currentStock: 15,
                        threshold: 5,
                        assignedTo: userId,
                        lowStock: false
                    },
                    {
                        id: '2',
                        productName: 'Silver Earrings',
                        sku: 'SE-002',
                        currentStock: 3,
                        threshold: 5,
                        assignedTo: userId,
                        lowStock: true
                    }
                ];
                setInventory(mockInventory);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };

    const fetchUserCustomers = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}/customers`);
            const data = await response.json();
            
            if (data.success) {
                setCustomers(data.customers);
            } else {
                // Mock data
                const mockCustomers = [
                    {
                        id: '1',
                        name: 'Rahul Sharma',
                        email: 'rahul@example.com',
                        phone: '+91-9876543210',
                        totalOrders: 5,
                        assignedTo: userId
                    },
                    {
                        id: '2',
                        name: 'Priya Patel',
                        email: 'priya@example.com',
                        phone: '+91-9876543211',
                        totalOrders: 3,
                        assignedTo: userId
                    }
                ];
                setCustomers(mockCustomers);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const getStatusBadge = (status, statusMap) => {
        const config = statusMap[status];
        return (
            <Badge variant={config.color} className="flex items-center gap-1">
                <span className="text-xs">{config.label}</span>
            </Badge>
        );
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const userStats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        activeShipments: shipments.filter(s => ['assigned', 'pickup_scheduled', 'in_transit'].includes(s.status)).length,
        pendingReturns: returns.filter(r => ['requested', 'approved'].includes(r.status)).length,
        lowStockItems: inventory.filter(i => i.lowStock).length,
        totalCustomers: customers.length,
        totalValue: orders.reduce((sum, o) => sum + o.totalAmount, 0)
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>Loading user information...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* User Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback>
                            {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold">Welcome, {user.name || 'User'}</h1>
                        <p className="text-muted-foreground">
                            {user.role || 'Admin'} Dashboard - Your Management Overview
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <NotificationCenter />
                    <Button variant="outline" onClick={() => fetchUserSpecificData(user.id)}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">My Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userStats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Assigned to you</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{userStats.pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">Need action</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{userStats.activeShipments}</div>
                        <p className="text-xs text-muted-foreground">In progress</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Returns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{userStats.pendingReturns}</div>
                        <p className="text-xs text-muted-foreground">Pending</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{userStats.lowStockItems}</div>
                        <p className="text-xs text-muted-foreground">Need restock</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            INR {userStats.totalValue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Your orders</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 items-center">
                <Input
                    placeholder="Search by order number, customer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.entries(orderStatuses).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="shipments">Shipments</TabsTrigger>
                    <TabsTrigger value="returns">Returns</TabsTrigger>
                    <TabsTrigger value="refunds">Refunds</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Orders */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Recent Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {orders.slice(0, 5).map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{order.orderNumber}</div>
                                                <div className="text-sm text-muted-foreground">{order.customerName}</div>
                                            </div>
                                            <div className="text-right">
                                                {getStatusBadge(order.status, orderStatuses)}
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    INR {order.totalAmount.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Low Stock Alerts */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Low Stock Alerts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {inventory.filter(i => i.lowStock).map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{item.productName}</div>
                                                <div className="text-sm text-muted-foreground">{item.sku}</div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="red">
                                                    {item.currentStock} left
                                                </Badge>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    Threshold: {item.threshold}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <div className="font-medium">{order.orderNumber}</div>
                                            </TableCell>
                                            <TableCell>{order.customerName}</TableCell>
                                            <TableCell>
                                                {getStatusBadge(order.status, orderStatuses)}
                                            </TableCell>
                                            <TableCell>INR {order.totalAmount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="shipments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Shipments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Courier</TableHead>
                                        <TableHead>AWB</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shipments.map((shipment) => (
                                        <TableRow key={shipment.id}>
                                            <TableCell>{shipment.orderNumber}</TableCell>
                                            <TableCell>{shipment.courierName}</TableCell>
                                            <TableCell>{shipment.awbNumber}</TableCell>
                                            <TableCell>
                                                {getStatusBadge(shipment.status, shipmentStatuses)}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">
                                                    Track
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="returns" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Returns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {returns.map((returnItem) => (
                                        <TableRow key={returnItem.id}>
                                            <TableCell>{returnItem.orderNumber}</TableCell>
                                            <TableCell>{returnItem.customerName}</TableCell>
                                            <TableCell>{returnItem.reason}</TableCell>
                                            <TableCell>
                                                {getStatusBadge(returnItem.status, returnStatuses)}
                                            </TableCell>
                                            <TableCell>INR {returnItem.totalAmount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">
                                                    Process
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="refunds" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Refunds</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Processed At</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {refunds.map((refund) => (
                                        <TableRow key={refund.id}>
                                            <TableCell>{refund.orderNumber}</TableCell>
                                            <TableCell>
                                                <Badge variant="green">{refund.status}</Badge>
                                            </TableCell>
                                            <TableCell>INR {refund.amount.toLocaleString()}</TableCell>
                                            <TableCell>{refund.method}</TableCell>
                                            <TableCell>
                                                {refund.processedAt ? new Date(refund.processedAt).toLocaleDateString() : 'Pending'}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Inventory</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Current Stock</TableHead>
                                        <TableHead>Threshold</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventory.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell>{item.sku}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.lowStock ? 'red' : 'green'}>
                                                    {item.currentStock}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.threshold}</TableCell>
                                            <TableCell>
                                                {item.lowStock ? 'Low Stock' : 'In Stock'}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">
                                                    Restock
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Customers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Total Orders</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>{customer.name}</TableCell>
                                            <TableCell>{customer.email}</TableCell>
                                            <TableCell>{customer.phone}</TableCell>
                                            <TableCell>{customer.totalOrders}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">
                                                    View Profile
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default UserSpecificDashboard;
