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
    Alert,
    AlertDescription,
    ScrollArea,
    Separator
} from '../ui';
import ShippingMasterView from './ShippingMasterView';
import ReturnRefundMasterView from './ReturnRefundMasterView';
import OrderManagementMasterView from './OrderManagementMasterView';
import InventoryMasterView from './InventoryMasterView';
import CustomerMasterView from './CustomerMasterView';
import NotificationCenter from './NotificationCenter';

const ShippingDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [shipments, setShipments] = useState([]);
    const [exceptions, setExceptions] = useState([]);
    const [returns, setReturns] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [showShipmentDialog, setShowShipmentDialog] = useState(false);
    const [showExceptionDialog, setShowExceptionDialog] = useState(false);
    const [showCourierDialog, setShowCourierDialog] = useState(false);

    // Status configurations
    const shipmentStatuses = {
        unassigned: { label: 'Unassigned', color: 'gray', icon: 'clock' },
        assigned: { label: 'Assigned', color: 'blue', icon: 'user' },
        pickup_scheduled: { label: 'Pickup Scheduled', color: 'purple', icon: 'truck' },
        in_transit: { label: 'In Transit', color: 'orange', icon: 'package' },
        delivered: { label: 'Delivered', color: 'green', icon: 'check' },
        exception: { label: 'Exception', color: 'red', icon: 'alert' }
    };

    const exceptionSeverities = {
        low: { label: 'Low', color: 'yellow' },
        medium: { label: 'Medium', color: 'orange' },
        high: { label: 'High', color: 'red' },
        critical: { label: 'Critical', color: 'red' }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch all dashboard data
            await Promise.all([
                fetchShipments(),
                fetchExceptions(),
                fetchReturns(),
                fetchRefunds()
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchShipments = async () => {
        // Mock data - replace with actual API call
        const mockShipments = [
            {
                id: '1',
                orderNumber: 'ORD-2024-001',
                customerName: 'Rahul Sharma',
                courierName: 'Delhivery',
                awbNumber: 'DL-123456789',
                status: 'in_transit',
                assignmentStatus: 'assigned',
                pickupStatus: 'completed',
                exceptionStatus: 'none',
                totalAmount: 2500,
                shippedAt: '2024-01-15T10:00:00Z',
                estimatedDelivery: '2024-01-17T18:00:00Z',
                currentLocation: 'Mumbai Hub'
            },
            {
                id: '2',
                orderNumber: 'ORD-2024-002',
                customerName: 'Priya Patel',
                courierName: 'Blue Dart',
                awbNumber: 'BD-987654321',
                status: 'pickup_scheduled',
                assignmentStatus: 'assigned',
                pickupStatus: 'scheduled',
                exceptionStatus: 'none',
                totalAmount: 1800,
                pickupScheduledAt: '2024-01-16T14:00:00Z'
            },
            {
                id: '3',
                orderNumber: 'ORD-2024-003',
                customerName: 'Amit Kumar',
                courierName: 'FedEx',
                awbNumber: 'FX-456789123',
                status: 'exception',
                assignmentStatus: 'assigned',
                pickupStatus: 'completed',
                exceptionStatus: 'open',
                totalAmount: 3200,
                exceptionMessage: 'Delivery attempted - recipient unavailable',
                shippedAt: '2024-01-14T09:00:00Z'
            }
        ];
        setShipments(mockShipments);
    };

    const fetchExceptions = async () => {
        const mockExceptions = [
            {
                id: '1',
                shipmentId: '3',
                orderNumber: 'ORD-2024-003',
                type: 'RECIPIENT_UNAVAILABLE',
                severity: 'medium',
                status: 'open',
                message: 'Delivery attempted - recipient unavailable',
                detectedAt: '2024-01-15T16:30:00Z',
                assignedTo: null
            },
            {
                id: '2',
                shipmentId: '4',
                orderNumber: 'ORD-2024-004',
                type: 'DELAYED',
                severity: 'low',
                status: 'resolved',
                message: 'Weather delay - rescheduled for tomorrow',
                detectedAt: '2024-01-14T11:00:00Z',
                resolvedAt: '2024-01-15T09:00:00Z'
            }
        ];
        setExceptions(mockExceptions);
    };

    const fetchReturns = async () => {
        const mockReturns = [
            {
                id: '1',
                orderNumber: 'ORD-2024-005',
                customerName: 'Neha Singh',
                status: 'approved',
                reason: 'Product not as described',
                requestedAt: '2024-01-13T10:30:00Z',
                approvedAt: '2024-01-14T15:00:00Z',
                totalAmount: 1500
            }
        ];
        setReturns(mockReturns);
    };

    const fetchRefunds = async () => {
        const mockRefunds = [
            {
                id: '1',
                returnId: '1',
                orderNumber: 'ORD-2024-005',
                status: 'processed',
                amount: 1500,
                method: 'Original Payment',
                processedAt: '2024-01-15T14:00:00Z'
            }
        ];
        setRefunds(mockRefunds);
    };

    const handleAssignCourier = async (shipmentId, courierData) => {
        try {
            console.log('Assigning courier:', shipmentId, courierData);
            // Update local state
            setShipments(prev => prev.map(ship => 
                ship.id === shipmentId 
                    ? { ...ship, courierName: courierData.courier, assignmentStatus: 'assigned' }
                    : ship
            ));
            setShowCourierDialog(false);
        } catch (error) {
            console.error('Error assigning courier:', error);
        }
    };

    const handleGenerateAWB = async (shipmentId) => {
        try {
            console.log('Generating AWB for shipment:', shipmentId);
            // Update local state
            setShipments(prev => prev.map(ship => 
                ship.id === shipmentId 
                    ? { ...ship, awbNumber: `AWB-${Date.now()}`, status: 'assigned' }
                    : ship
            ));
        } catch (error) {
            console.error('Error generating AWB:', error);
        }
    };

    const handleSchedulePickup = async (shipmentId, pickupData) => {
        try {
            console.log('Scheduling pickup:', shipmentId, pickupData);
            // Update local state
            setShipments(prev => prev.map(ship => 
                ship.id === shipmentId 
                    ? { 
                        ...ship, 
                        pickupStatus: 'scheduled',
                        pickupScheduledAt: pickupData.date,
                        status: 'pickup_scheduled'
                    }
                    : ship
            ));
        } catch (error) {
            console.error('Error scheduling pickup:', error);
        }
    };

    const handleResolveException = async (exceptionId, resolution) => {
        try {
            console.log('Resolving exception:', exceptionId, resolution);
            // Update local state
            setExceptions(prev => prev.map(exc => 
                exc.id === exceptionId 
                    ? { ...exc, status: 'resolved', resolvedAt: new Date().toISOString() }
                    : exc
            ));
            setShowExceptionDialog(false);
        } catch (error) {
            console.error('Error resolving exception:', error);
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

    const filteredShipments = shipments.filter(ship => {
        const matchesSearch = ship.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ship.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ship.awbNumber?.includes(searchQuery);
        return matchesSearch;
    });

    const dashboardStats = {
        totalShipments: shipments.length,
        inTransit: shipments.filter(s => s.status === 'in_transit').length,
        exceptions: exceptions.filter(e => e.status === 'open').length,
        returns: returns.filter(r => ['requested', 'approved'].includes(r.status)).length,
        refunds: refunds.filter(r => r.status === 'processed').length,
        totalValue: shipments.reduce((sum, s) => sum + s.totalAmount, 0)
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Shipping Dashboard</h1>
                    <p className="text-muted-foreground">Complete shipping workflow management</p>
                </div>
                <div className="flex gap-2 items-center">
                <NotificationCenter />
                <Button variant="outline" onClick={fetchDashboardData}>
                    Refresh
                </Button>
                <Button>Export Report</Button>
            </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardStats.totalShipments}</div>
                        <p className="text-xs text-muted-foreground">Active orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{dashboardStats.inTransit}</div>
                        <p className="text-xs text-muted-foreground">On the way</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Exceptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{dashboardStats.exceptions}</div>
                        <p className="text-xs text-muted-foreground">Need attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Returns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{dashboardStats.returns}</div>
                        <p className="text-xs text-muted-foreground">Pending</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Refunds</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{dashboardStats.refunds}</div>
                        <p className="text-xs text-muted-foreground">Processed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            INR {dashboardStats.totalValue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">In transit</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 items-center">
                <Input
                    placeholder="Search by order, customer, or AWB..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                />
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="shipments">Shipments</TabsTrigger>
                    <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
                    <TabsTrigger value="returns">Returns</TabsTrigger>
                    <TabsTrigger value="refunds">Refunds</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Shipments */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Shipments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {shipments.slice(0, 5).map((shipment) => (
                                        <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{shipment.orderNumber}</div>
                                                <div className="text-sm text-muted-foreground">{shipment.customerName}</div>
                                            </div>
                                            <div className="text-right">
                                                {getStatusBadge(shipment.status, shipmentStatuses)}
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {shipment.courierName}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Exceptions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Exceptions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {exceptions.filter(e => e.status === 'open').map((exception) => (
                                        <div key={exception.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{exception.orderNumber}</div>
                                                <div className="text-sm text-muted-foreground">{exception.message}</div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={exceptionSeverities[exception.severity].color}>
                                                    {exceptionSeverities[exception.severity].label}
                                                </Badge>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {new Date(exception.detectedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button onClick={() => setShowCourierDialog(true)}>
                                    Assign Courier
                                </Button>
                                <Button variant="outline">
                                    Schedule Pickup
                                </Button>
                                <Button variant="outline">
                                    Generate AWB
                                </Button>
                                <Button variant="outline">
                                    Track Shipments
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="shipments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipment Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Courier</TableHead>
                                        <TableHead>AWB</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Pickup</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredShipments.map((shipment) => (
                                        <TableRow key={shipment.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{shipment.orderNumber}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {shipment.shippedAt ? new Date(shipment.shippedAt).toLocaleDateString() : 'Not shipped'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>
                                                            {shipment.customerName.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{shipment.customerName}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {shipment.currentLocation || 'Processing'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {shipment.courierName || (
                                                    <span className="text-muted-foreground">Not assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {shipment.awbNumber || (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleGenerateAWB(shipment.id)}
                                                    >
                                                        Generate
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(shipment.status, shipmentStatuses)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={shipment.pickupStatus === 'completed' ? 'green' : 'yellow'}>
                                                    {shipment.pickupStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>INR {shipment.totalAmount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedShipment(shipment)}
                                                    >
                                                        View
                                                    </Button>
                                                    {!shipment.courierName && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setShowCourierDialog(true)}
                                                        >
                                                            Assign
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="exceptions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Exceptions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {exceptions.map((exception) => (
                                    <div key={exception.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-medium">{exception.orderNumber}</div>
                                                <div className="text-sm text-muted-foreground">{exception.message}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge variant={exceptionSeverities[exception.severity].color}>
                                                    {exceptionSeverities[exception.severity].label}
                                                </Badge>
                                                <Badge variant={exception.status === 'open' ? 'red' : 'green'}>
                                                    {exception.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-muted-foreground">
                                                Detected: {new Date(exception.detectedAt).toLocaleString()}
                                            </div>
                                            {exception.status === 'open' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => setShowExceptionDialog(true)}
                                                >
                                                    Resolve
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="returns" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Return Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {returns.map((returnItem) => (
                                    <div key={returnItem.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-medium">{returnItem.orderNumber}</div>
                                                <div className="text-sm text-muted-foreground">{returnItem.reason}</div>
                                            </div>
                                            <Badge variant="blue">{returnItem.status}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-muted-foreground">
                                                Requested: {new Date(returnItem.requestedAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm font-medium">
                                                INR {returnItem.totalAmount.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="refunds" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Refund Processing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {refunds.map((refund) => (
                                    <div key={refund.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-medium">{refund.orderNumber}</div>
                                                <div className="text-sm text-muted-foreground">{refund.method}</div>
                                            </div>
                                            <Badge variant="green">{refund.status}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-muted-foreground">
                                                Processed: {refund.processedAt ? new Date(refund.processedAt).toLocaleDateString() : 'Pending'}
                                            </div>
                                            <div className="text-sm font-medium">
                                                INR {refund.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { metric: 'On-Time Delivery', value: 94.5, target: 95 },
                                        { metric: 'Exception Rate', value: 2.3, target: 3 },
                                        { metric: 'Customer Satisfaction', value: 4.6, target: 4.5 },
                                        { metric: 'Average Transit Time', value: 2.8, target: 3 }
                                    ].map((item) => (
                                        <div key={item.metric} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{item.metric}</span>
                                                <span>{item.value}{item.metric.includes('Time') ? ' days' : '%'}</span>
                                            </div>
                                            <Progress value={(item.value / item.target) * 100} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Courier Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { courier: 'Delhivery', shipments: 45, success: 96 },
                                        { courier: 'Blue Dart', shipments: 32, success: 94 },
                                        { courier: 'FedEx', shipments: 28, success: 98 },
                                        { courier: 'DHL', shipments: 15, success: 92 }
                                    ].map((item) => (
                                        <div key={item.courier} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{item.courier}</span>
                                                <span>{item.shipments} shipments ({item.success}% success)</span>
                                            </div>
                                            <Progress value={item.success} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Courier Assignment Dialog */}
            <Dialog open={showCourierDialog} onOpenChange={setShowCourierDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Courier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="courier">Select Courier</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose courier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="delhivery">Delhivery</SelectItem>
                                    <SelectItem value="blue_dart">Blue Dart</SelectItem>
                                    <SelectItem value="fedex">FedEx</SelectItem>
                                    <SelectItem value="dhl">DHL</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="service">Service Level</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose service level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                                    <SelectItem value="express">Express (1-2 days)</SelectItem>
                                    <SelectItem value="overnight">Overnight</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => handleAssignCourier('1', { courier: 'delhivery' })}>
                                Assign Courier
                            </Button>
                            <Button variant="outline" onClick={() => setShowCourierDialog(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Exception Resolution Dialog */}
            <Dialog open={showExceptionDialog} onOpenChange={setShowExceptionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolve Exception</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="resolution">Resolution Action</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose resolution" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reschedule">Reschedule Delivery</SelectItem>
                                    <SelectItem value="contact_customer">Contact Customer</SelectItem>
                                    <SelectItem value="update_address">Update Address</SelectItem>
                                    <SelectItem value="escalate">Escalate to Manager</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="notes">Resolution Notes</Label>
                            <Textarea id="notes" placeholder="Enter resolution details..." />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => handleResolveException('1', { action: 'reschedule' })}>
                                Resolve Exception
                            </Button>
                            <Button variant="outline" onClick={() => setShowExceptionDialog(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ShippingDashboard;
