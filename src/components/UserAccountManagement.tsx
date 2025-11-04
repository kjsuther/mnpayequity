import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Jurisdiction } from '../lib/supabase';
import type { UserProfile } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Plus, Edit2, Trash2, X, AlertCircle, CheckCircle } from 'lucide-react';

type UserAccountManagementProps = {
  onBack: () => void;
};

type UserAccountWithAuth = UserProfile & {
  last_sign_in_at?: string;
};

export function UserAccountManagement({ onBack }: UserAccountManagementProps) {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserAccountWithAuth[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    jurisdiction_id: '',
    role: 'User' as 'User' | 'Admin' | 'IT',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdminOrIT = userProfile?.role === 'Admin' || userProfile?.role === 'IT' || userProfile?.is_admin;

  useEffect(() => {
    loadUsers();
    loadJurisdictions();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  const loadJurisdictions = async () => {
    try {
      const { data, error } = await supabase
        .from('jurisdictions')
        .select('*')
        .order('name');

      if (error) throw error;
      setJurisdictions(data || []);
    } catch (error) {
      console.error('Error loading jurisdictions:', error);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      jurisdiction_id: '',
      role: 'User',
    });
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    const userRole = (user as any).role || (user.is_admin ? 'Admin' : 'User');
    setFormData({
      email: user.email,
      password: '',
      jurisdiction_id: user.jurisdiction_id || '',
      role: userRole,
    });
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      if (editingUser) {
        const updates: any = {
          jurisdiction_id: formData.jurisdiction_id || null,
          role: formData.role,
          is_admin: formData.role === 'Admin' || formData.role === 'IT',
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', editingUser.id);

        if (error) throw error;
        setSuccess('User account updated successfully!');
      } else {
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setSaving(false);
          return;
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              jurisdiction_id: formData.jurisdiction_id,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update({
              jurisdiction_id: formData.jurisdiction_id || null,
              role: formData.role,
              is_admin: formData.role === 'Admin' || formData.role === 'IT',
            })
            .eq('user_id', authData.user.id);

          if (profileError) throw profileError;
        }

        setSuccess('User account created successfully!');
      }

      await loadUsers();
      setTimeout(() => {
        setShowModal(false);
        setSuccess(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error saving user:', error);
      setError(error.message || 'Failed to save user account');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!confirm(`Are you sure you want to delete the account for ${user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      setSuccess('User account deleted successfully!');
      await loadUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Failed to delete user account');
      setTimeout(() => setError(null), 5000);
    }
  };

  const getJurisdictionName = (jurisdictionId: string | null) => {
    if (!jurisdictionId) return 'All Jurisdictions';
    const jurisdiction = jurisdictions.find(j => j.jurisdiction_id === jurisdictionId);
    return jurisdiction ? jurisdiction.name : jurisdictionId;
  };

  if (!isAdminOrIT) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#003865] hover:text-[#78BE21] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access User Account Management. This feature is only available to Admin and IT users.
            </p>
            <p className="text-sm text-gray-500">
              Current role: <span className="font-semibold">{userProfile?.role || 'User'}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#003865] hover:text-[#78BE21] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Account Management</h2>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage user accounts for the pay equity reporting system
              </p>
            </div>
            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors"
            >
              <Plus size={20} />
              Add User
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-6 flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-green-800">{success}</span>
          </div>
        )}

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003865] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading user accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No user accounts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jurisdiction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getJurisdictionName(user.jurisdiction_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            (user as any).role === 'Admin'
                              ? 'bg-red-100 text-red-800'
                              : (user as any).role === 'IT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {(user as any).role || (user.is_admin ? 'Admin' : 'User')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-[#003865] hover:text-[#78BE21] mr-4 transition-colors"
                          title="Edit user"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingUser ? 'Edit User Account' : 'Add New User Account'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!editingUser}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="user@example.com"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jurisdiction
                </label>
                <select
                  value={formData.jurisdiction_id}
                  onChange={(e) => setFormData({ ...formData, jurisdiction_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  disabled={formData.role === 'Admin' || formData.role === 'IT'}
                >
                  <option value="">Select Jurisdiction</option>
                  {jurisdictions.map((jurisdiction) => (
                    <option key={jurisdiction.id} value={jurisdiction.jurisdiction_id}>
                      {jurisdiction.name} ({jurisdiction.jurisdiction_id})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty for admin users with access to all jurisdictions
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    const role = e.target.value as 'User' | 'Admin' | 'IT';
                    setFormData({
                      ...formData,
                      role,
                      jurisdiction_id: (role === 'Admin' || role === 'IT') ? '' : formData.jurisdiction_id,
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  required
                >
                  <option value="User">User - Standard access to assigned jurisdiction</option>
                  <option value="Admin">Admin - Full system access to all jurisdictions</option>
                  <option value="IT">IT - Technical support and system maintenance</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Admin and IT roles have access to all jurisdictions
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-green-800">{success}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
