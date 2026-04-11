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
    Alert,
    AlertDescription,
    Progress,
    Separator,
    ScrollArea,
    Avatar,
    AvatarFallback,
    AvatarImage
} from '../ui';

const ReturnRefundCenter = () => {
    const [activeTab, setActiveTab] = useState('returns');
    const [returns, setReturns] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [showRefundDialog, setShowRefundDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [refundStatusFilter, setRefundStatusFilter] = useState('all');

    // Status configurations
    const returnStatuses = {
        requested: { label: 'Requested', color: 'yellow', icon: 'clock' },
        approved: { label: 'Approved', color: 'blue', icon: 'check' },
        rejected: { label: 'Rejected', color: 'red', icon: 'x' },
        pickup_scheduled: { label: 'Pickup Scheduled', color: 'purple', icon: 'truck' },
        in_transit: { label: 'In Transit', color: 'orange', icon: 'package' },
        received: { label: 'Received', color: 'green', icon: 'inbox' },
        refund_pending: { label: 'Refund Pending', color: 'yellow', icon: 'clock' },
        refunded: { label: 'Refunded', color: 'green', icon: 'check-circle' },
        closed: { label: 'Closed', color: 'gray', icon: 'archive' }
    };

    const refundStatuses = {
        not_started: { label: 'Not Started', color: 'gray', icon: 'minus' },
        pending: { label: 'Pending', color: 'yellow', icon: 'clock' },
        processed: { label: 'Processed', color: 'green', icon: 'check' },
        failed: { label: 'Failed', color: 'red', icon: 'x' }
    };

    useEffect(() => {
        fetchReturns();
        fetchRefunds();
    }, []);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            // Mock data - replace with actual API call
            const mockReturns = [
                {
                    id: '1',
                    orderNumber: 'ORD-2024-001',
                    customerName: 'Rahul Sharma',
                    phone: '+91-9876543210',
                    email: 'rahul@example.com',
                    status: 'requested',
                    reason: 'Product not as described',
                    customerNote: 'The color is different from what was shown in the pictures',
                    requestedAt: '2024-01-15T10:30:00Z',
                    totalAmount: 2500,
                    proofCount: 2,
                    items: [
                        { name: 'Gold Necklace', quantity: 1, price: 2500 }
                    ]
                },
                {
                    id: '2',
                    orderNumber: 'ORD-2024-002',
                    customerName: 'Priya Patel',
                    phone: '+91-9876543211',
                    email: 'priya@example.com',
                    status: 'approved',
                    reason: 'Wrong item delivered',
                    customerNote: 'Received silver earrings instead of gold ones',
                    requestedAt: '2024-01-14T15:45:00Z',
                    approvedAt: '2024-01-15T09:00:00Z',
                    totalAmount: 1800,
                    proofCount: 3,
                    pickupScheduledAt: '2024-01-16T14:00:00Z',
                    items: [
                        { name: 'Gold Earrings', quantity: 1, price: 1800 }
                    ]
                },
                {
                    id: '3',
                    orderNumber: 'ORD-2024-003',
                    customerName: 'Amit Kumar',
                    phone: '+91-9876543212',
                    email: 'amit@example.com',
                    status: 'received',
                    reason: 'Size issue',
                    customerNote: 'Ring size is too small',
                    requestedAt: '2024-01-13T11:20:00Z',
                    approvedAt: '2024-01-13T16:30:00Z',
                    receivedAt: '2024-01-15T10:15:00Z',
                    totalAmount: 3200,
                    proofCount: 1,
                    items: [
                        { name: 'Diamond Ring', quantity: 1, price: 3200 }
                    ]
                }
            ];
            setReturns(mockReturns);
        } catch (error) {
            console.error('Error fetching returns:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRefunds = async () => {
        setLoading(true);
        try {
            // Mock data - replace with actual API call
            const mockRefunds = [
                {
                    id: '1',
                    returnId: '1',
                    orderNumber: 'ORD-2024-003',
                    customerName: 'Amit Kumar',
                    status: 'processed',
                    amount: 3200,
                    method: 'Original Payment',
                    reference: 'REF-2024-001',
                    processedAt: '2024-01-15T14:30:00Z',
                    proofCount: 2
                },
                {
                    id: '2',
                    returnId: '2',
                    orderNumber: 'ORD-2024-002',
                    customerName: 'Priya Patel',
                    status: 'pending',
                    amount: 1800,
                    method: 'Bank Transfer',
                    reference: '',
                    proofCount: 0
                }
            ];
            setRefunds(mockRefunds);
        } catch (error) {
            console.error('Error fetching refunds:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveReturn = async (returnId, action, note) => {
        try {
            // API call to approve/reject return
            console.log(`${action} return ${returnId}:`, note);
            
            // Update local state
            setReturns(prev => prev.map(ret => 
                ret.id === returnId 
                    ? { 
                        ...ret, 
                        status: action === 'approve' ? 'approved' : 'rejected',
                        [action === 'approve' ? 'approvedAt' : 'rejectedAt']: new Date().toISOString(),
                        [action === 'approve' ? 'approvalNote' : 'rejectionReason']: note
                    }
                    : ret
            ));
            
            setShowApprovalDialog(false);
            setSelectedReturn(null);
        } catch (error) {
            console.error('Error updating return:', error);
        }
    };

    const handleProcessRefund = async (refundData) => {
        try {
            // API call to process refund
            console.log('Processing refund:', refundData);
            
            // Update local state
            setRefunds(prev => prev.map(ref => 
                ref.id === refundData.id 
                    ? { 
                        ...ref, 
                        status: 'processed',
                        processedAt: new Date().toISOString(),
                        reference: refundData.reference
                    }
                    : ref
            ));
            
            setShowRefundDialog(false);
            setSelectedRefund(null);
        } catch (error) {
            console.error('Error processing refund:', error);
        }
    };

    const filteredReturns = returns.filter(ret => {
        const matchesSearch = ret.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ret.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ret.phone.includes(searchQuery);
        const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredRefunds = refunds.filter(ref => {
        const matchesSearch = ref.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ref.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = refundStatusFilter === 'all' || ref.status === refundStatusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status, statusMap) => {
        const config = statusMap[status];
        return (
            <Badge variant={config.color} className="flex items-center gap-1">
                <span className="text-xs">{config.label}</span>
            </Badge>
        );
    };

    const getReturnProgress = (returnItem) => {
        const steps = [
            { key: 'requested', label: 'Requested', completed: true },
            { key: 'approved', label: 'Approved', completed: returnItem.status !== 'requested' },
            { key: 'pickup_scheduled', label: 'Pickup', completed: ['pickup_scheduled', 'in_transit', 'received', 'refund_pending', 'refunded', 'closed'].includes(returnItem.status) },
            { key: 'received', label: 'Received', completed: ['received', 'refund_pending', 'refunded', 'closed'].includes(returnItem.status) },
            { key: 'refunded', label: 'Refunded', completed: ['refunded', 'closed'].includes(returnItem.status) }
        ];
        
        const currentStep = steps.findIndex(step => !step.completed);
        const progress = ((currentStep === -1 ? steps.length : currentStep) / steps.length) * 100;
        
        return { steps, progress, currentStep: currentStep === -1 ? steps.length : currentStep };
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Return & Refund Center</h1>
                    <p className="text-muted-foreground">Manage customer returns and refunds</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchReturns()}>
                        Refresh
                    </Button>
                    <Button>Export Report</Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{returns.length}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {returns.filter(r => ['requested', 'approved'].includes(r.status)).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Awaiting action</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Refunds Processed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {refunds.filter(r => r.status === 'processed').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Refund Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            INR {refunds.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <Input
                    placeholder="Search by order number, customer name, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Return Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.entries(returnStatuses).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={refundStatusFilter} onValueChange={setRefundStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Refund Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.entries(refundStatuses).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="returns">Returns</TabsTrigger>
                    <TabsTrigger value="refunds">Refunds</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="returns" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Return Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Progress</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReturns.map((returnItem) => {
                                        const { progress, steps } = getReturnProgress(returnItem);
                                        return (
                                            <TableRow key={returnItem.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{returnItem.orderNumber}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {new Date(returnItem.requestedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback>
                                                                {returnItem.customerName.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{returnItem.customerName}</div>
                                                            <div className="text-sm text-muted-foreground">{returnItem.phone}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{returnItem.reason}</div>
                                                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                                                            {returnItem.customerNote}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(returnItem.status, returnStatuses)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <Progress value={progress} className="h-2" />
                                                        <div className="text-xs text-muted-foreground">
                                                            {steps.find(s => !s.completed)?.label || 'Complete'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>INR {returnItem.totalAmount.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setSelectedReturn(returnItem)}
                                                        >
                                                            View
                                                        </Button>
                                                        {returnItem.status === 'requested' && (
                                                            <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => setSelectedReturn(returnItem)}
                                                                    >
                                                                        Review
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Review Return Request</DialogTitle>
                                                                    </DialogHeader>
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <Label>Order</Label>
                                                                            <p className="font-medium">{selectedReturn?.orderNumber}</p>
                                                                        </div>
                                                                        <div>
                                                                            <Label>Customer</Label>
                                                                            <p>{selectedReturn?.customerName}</p>
                                                                        </div>
                                                                        <div>
                                            <Label>Reason</Label>
                                            <p>{selectedReturn?.reason}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedReturn?.customerNote}
                                            </p>
                                        </div>
                                        <div>
                                            <Label>Items</Label>
                                            {selectedReturn?.items?.map((item, idx) => (
                                                <div key={idx} className="text-sm">
                                                    {item.quantity}x {item.name} - INR {item.price}
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <Label>Proof Documents</Label>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedReturn?.proofCount || 0} files uploaded
                                            </p>
                                        </div>
                                        <div>
                                            <Label>Action</Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleApproveReturn(selectedReturn.id, 'approve', 'Return approved after review')}
                                                    className="flex-1"
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleApproveReturn(selectedReturn.id, 'reject', 'Return rejected - product condition issue')}
                                                    className="flex-1"
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="refunds" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Refund Processing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRefunds.map((refund) => (
                                        <TableRow key={refund.id}>
                                            <TableCell>
                                                <div className="font-medium">{refund.orderNumber}</div>
                                            </TableCell>
                                            <TableCell>{refund.customerName}</TableCell>
                                            <TableCell>INR {refund.amount.toLocaleString()}</TableCell>
                                            <TableCell>{refund.method}</TableCell>
                                            <TableCell>
                                                {getStatusBadge(refund.status, refundStatuses)}
                                            </TableCell>
                                            <TableCell>
                                                {refund.reference || (
                                                    <span className="text-muted-foreground">Not generated</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedRefund(refund)}
                                                    >
                                                        View
                                                    </Button>
                                                    {refund.status === 'pending' && (
                                                        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => setSelectedRefund(refund)}
                                                                >
                                                                    Process
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Process Refund</DialogTitle>
                                                                </DialogHeader>
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <Label>Order</Label>
                                                                        <p className="font-medium">{selectedRefund?.orderNumber}</p>
                                                                    </div>
                                                                    <div>
                                                                        <Label>Amount</Label>
                                                                        <p className="font-medium">INR {selectedRefund?.amount}</p>
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="refundMethod">Refund Method</Label>
                                                                        <Select>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select method" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="original">Original Payment</SelectItem>
                                                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                                                <SelectItem value="wallet">Wallet Credit</SelectItem>
                                                                                <SelectItem value="store_credit">Store Credit</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="reference">Reference Number</Label>
                                                                        <Input id="reference" placeholder="Enter reference number" />
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="refundNote">Note</Label>
                                                                        <Textarea id="refundNote" placeholder="Add any notes about this refund" />
                                                                    </div>
                                                                    <div>
                                                                        <Label>Proof Documents</Label>
                                                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                                                            <p className="text-sm text-muted-foreground">
                                                Upload refund proof (bank statement, transaction screenshot)
                                            </p>
                                            <Button variant="outline" className="mt-2">
                                                Upload Files
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleProcessRefund({
                                                id: selectedRefund?.id,
                                                reference: 'REF-2024-' + Date.now()
                                            })}
                                            className="flex-1"
                                        >
                                            Process Refund
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowRefundDialog(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
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

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Return Reasons</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { reason: 'Product not as described', count: 15, percentage: 35 },
                                        { reason: 'Wrong item delivered', count: 12, percentage: 28 },
                                        { reason: 'Size issue', count: 8, percentage: 19 },
                                        { reason: 'Quality issue', count: 5, percentage: 12 },
                                        { reason: 'Other', count: 3, percentage: 6 }
                                    ].map((item) => (
                                        <div key={item.reason} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{item.reason}</span>
                                                <span>{item.count} ({item.percentage}%)</span>
                                            </div>
                                            <Progress value={item.percentage} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Refund Processing Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { period: 'Same day', count: 8, percentage: 25 },
                                        { period: '1-2 days', count: 15, percentage: 47 },
                                        { period: '3-5 days', count: 7, percentage: 22 },
                                        { period: '5+ days', count: 2, percentage: 6 }
                                    ].map((item) => (
                                        <div key={item.period} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{item.period}</span>
                                                <span>{item.count} ({item.percentage}%)</span>
                                            </div>
                                            <Progress value={item.percentage} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ReturnRefundCenter;
