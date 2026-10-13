import { ProtectedRoute } from '../routes/guards';
import { CRMLayout } from '../components/layout/CRMLayout';

export default function ProtectedCRMLayout() {
  return (
    <ProtectedRoute>
      <CRMLayout />
    </ProtectedRoute>
  );
}
