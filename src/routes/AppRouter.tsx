import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard, PublicOnly } from './guards';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerifyResetOtpPage from '../pages/auth/VerifyResetOtpPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedCRMLayout from '../layouts/ProtectedCRMLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import AdminUsersPage from '../pages/dashboard/AdminUsersPage';
import ManagerPage from '../pages/dashboard/ManagerPage';
import ModulePlaceholderPage from '../pages/placeholders/ModulePlaceholderPage';
import LeadsListPage from '../pages/leads/LeadsListPage';
import LeadCreatePage from '../pages/leads/LeadCreatePage';
import LeadEditPage from '../pages/leads/LeadEditPage';
import LeadDetailsPage from '../pages/leads/LeadDetailsPage';
import DealsListPage from '../pages/deals/DealsListPage';
import DealDetailsPage from '../pages/deals/DealDetailsPage';
import UsersPlaceholderPage from '../pages/placeholders/UsersPlaceholderPage';
import ProfilePagePlaceholder from '../pages/profile/ProfilePagePlaceholder';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><SignupPage /></PublicOnly>} />
      <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
      <Route path="/verify-reset-otp" element={<PublicOnly><VerifyResetOtpPage /></PublicOnly>} />
      <Route path="/reset-password" element={<PublicOnly><ResetPasswordPage /></PublicOnly>} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route element={<ProtectedCRMLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsListPage />} />
        <Route path="/leads/new" element={<LeadCreatePage />} />
        <Route path="/leads/:id" element={<LeadDetailsPage />} />
        <Route path="/leads/:id/edit" element={<LeadEditPage />} />
        <Route path="/deals" element={<DealsListPage />} />
        <Route path="/deals/:id" element={<DealDetailsPage />} />
        <Route path="/accounts" element={<ModulePlaceholderPage module="accounts" />} />
        <Route path="/contacts" element={<ModulePlaceholderPage module="contacts" />} />
        <Route path="/users" element={<RoleGuard allow={['admin']}><UsersPlaceholderPage /></RoleGuard>} />
        <Route path="/profile" element={<ProfilePagePlaceholder />} />
        {/* Preserved existing pages */}
        <Route path="/manager" element={<RoleGuard allow={['manager']}><ManagerPage /></RoleGuard>} />
        <Route path="/admin" element={<RoleGuard allow={['admin']}><DashboardPage /></RoleGuard>} />
        <Route path="/admin/users" element={<RoleGuard allow={['admin']}><AdminUsersPage /></RoleGuard>} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
