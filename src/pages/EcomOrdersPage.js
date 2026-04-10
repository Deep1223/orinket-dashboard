import { Navigate } from 'react-router-dom';

/** @deprecated Use Order management (`/order-management`). Kept for old menu links. */
const EcomOrdersPage = () => <Navigate to="/order-management" replace />;

export default EcomOrdersPage;
