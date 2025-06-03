
import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/components/auth/AuthPage';
import { MainApp } from '@/components/MainApp';
import { RoleSelectionDialog } from '@/components/auth/RoleSelectionDialog';

const Index = () => {
  const { user, loading, showRoleDialog, pendingUser, completeOAuthSignup } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showRoleDialog && pendingUser) {
    return (
      <RoleSelectionDialog
        isOpen={showRoleDialog}
        onRoleSelect={completeOAuthSignup}
        userEmail={pendingUser.email || 'User'}
      />
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <MainApp />;
};

export default Index;
