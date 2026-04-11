import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Badge,
    Avatar,
    AvatarFallback,
    ScrollArea,
    Separator,
    Bell,
    X,
    Check,
    AlertTriangle,
    Package,
    Truck,
    Users,
    DollarSign
} from '../ui';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [realTimeConnected, setRealTimeConnected] = useState(false);
    const wsRef = useRef(null);
    const notificationSound = useRef(null);

    // Notification types with icons and colors
    const notificationTypes = {
        shipment_assigned: {
            icon: Truck,
            color: 'blue',
            title: 'Shipment Assigned'
        },
        pickup_scheduled: {
            icon: Package,
            color: 'green',
            title: 'Pickup Scheduled'
        },
        delivery_exception: {
            icon: AlertTriangle,
            color: 'red',
            title: 'Delivery Exception'
        },
        return_approved: {
            icon: Package,
            color: 'yellow',
            title: 'Return Approved'
        },
        return_rejected: {
            icon: X,
            color: 'red',
            title: 'Return Rejected'
        },
        refund_processed: {
            icon: DollarSign,
            color: 'green',
            title: 'Refund Processed'
        },
        system_alert: {
            icon: Bell,
            color: 'orange',
            title: 'System Alert'
        }
    };

    useEffect(() => {
        // Initialize WebSocket connection for real-time notifications
        initializeWebSocket();
        
        // Load initial notifications
        loadInitialNotifications();
        
        // Setup notification sound
        setupNotificationSound();
        
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const initializeWebSocket = () => {
        try {
            // WebSocket connection to backend
            const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                setRealTimeConnected(true);
                
                // Subscribe to notifications
                wsRef.current.send(JSON.stringify({
                    type: 'subscribe',
                    channel: 'shipping_notifications'
                }));
            };

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'notification') {
                    handleNewNotification(data.notification);
                }
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket disconnected');
                setRealTimeConnected(false);
                
                // Attempt to reconnect after 3 seconds
                setTimeout(initializeWebSocket, 3000);
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setRealTimeConnected(false);
            };

        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            // Fallback to polling
            startPolling();
        }
    };

    const startPolling = () => {
        // Fallback polling mechanism
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/notifications/poll');
                const data = await response.json();
                
                if (data.notifications && data.notifications.length > 0) {
                    data.notifications.forEach(notification => {
                        handleNewNotification(notification);
                    });
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(pollInterval);
    };

    const loadInitialNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            const data = await response.json();
            
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            
            // Mock data for development
            const mockNotifications = [
                {
                    id: '1',
                    type: 'shipment_assigned',
                    title: 'Order ORD-2024-001 Shipped',
                    message: 'Your order has been assigned to Delhivery. AWB: DL-123456789',
                    timestamp: new Date(Date.now() - 5 * 60 * 1000),
                    read: false,
                    data: {
                        orderNumber: 'ORD-2024-001',
                        courierName: 'Delhivery',
                        awbNumber: 'DL-123456789'
                    }
                },
                {
                    id: '2',
                    type: 'pickup_scheduled',
                    title: 'Pickup Scheduled',
                    message: 'Return pickup scheduled for order ORD-2024-002',
                    timestamp: new Date(Date.now() - 15 * 60 * 1000),
                    read: false,
                    data: {
                        orderNumber: 'ORD-2024-002',
                        pickupDate: '2024-01-16',
                        pickupTime: '14:00'
                    }
                },
                {
                    id: '3',
                    type: 'delivery_exception',
                    title: 'Delivery Exception',
                    message: 'Delivery attempted for order ORD-2024-003 - recipient unavailable',
                    timestamp: new Date(Date.now() - 30 * 60 * 1000),
                    read: true,
                    data: {
                        orderNumber: 'ORD-2024-003',
                        exceptionType: 'RECIPIENT_UNAVAILABLE'
                    }
                }
            ];
            
            setNotifications(mockNotifications);
            setUnreadCount(mockNotifications.filter(n => !n.read).length);
        }
    };

    const handleNewNotification = (notification) => {
        // Add new notification to the list
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Play notification sound
        playNotificationSound();
        
        // Show browser notification if permission granted
        showBrowserNotification(notification);
    };

    const setupNotificationSound = () => {
        // Create audio element for notification sound
        notificationSound.current = new Audio('/sounds/notification.mp3');
        notificationSound.current.volume = 0.3;
    };

    const playNotificationSound = () => {
        if (notificationSound.current) {
            notificationSound.current.play().catch(error => {
                console.log('Could not play notification sound:', error);
            });
        }
    };

    const showBrowserNotification = (notification) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/icons/notification-icon.png',
                tag: notification.id
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showBrowserNotification(notification);
                }
            });
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                setNotifications(prev => 
                    prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'PUT'
            });
            
            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
                if (!notifications.find(n => n.id === notificationId)?.read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffMs = now - notificationTime;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
        return `${Math.floor(diffMins / 1440)} days ago`;
    };

    const getNotificationIcon = (type) => {
        const config = notificationTypes[type] || notificationTypes.system_alert;
        const Icon = config.icon;
        return <Icon className="h-4 w-4" />;
    };

    const getNotificationColor = (type) => {
        const config = notificationTypes[type] || notificationTypes.system_alert;
        return config.color;
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {/* Notification Dropdown */}
            {isOpen && (
                <Card className="absolute right-0 top-12 w-96 max-h-96 shadow-lg z-50">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Notifications</CardTitle>
                            <div className="flex items-center gap-2">
                                {realTimeConnected && (
                                    <Badge variant="green" className="text-xs">
                                        Live
                                    </Badge>
                                )}
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllAsRead}
                                        className="text-xs"
                                    >
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-80">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    No notifications
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                                                !notification.read ? 'bg-muted/20' : ''
                                            }`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className={`bg-${getNotificationColor(notification.type)}-100 text-${getNotificationColor(notification.type)}-600`}>
                                                        {getNotificationIcon(notification.type)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium text-sm truncate">
                                                            {notification.title}
                                                        </p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notification.id);
                                                            }}
                                                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatTimestamp(notification.timestamp)}
                                                        </span>
                                                        {!notification.read && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                New
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default NotificationCenter;
