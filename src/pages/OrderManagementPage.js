import { Routes, Route } from 'react-router-dom';
import OrderManagementController from '../app/controller/OrderManagementController';
import OrderManagementDetailPage from './OrderManagementDetailPage';

/**
 * Nested routes: list (all + status segments) and order detail.
 */
const OrderManagementPage = () => {
  return (
    <Routes>
      <Route path="detail/:orderId" element={<OrderManagementDetailPage />} />
      <Route index element={<OrderManagementController />} />
      <Route path=":status" element={<OrderManagementController />} />
    </Routes>
  );
};

export default OrderManagementPage;
