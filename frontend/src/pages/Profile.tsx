import { useAuth } from '../auth/AuthContext'
import { User, Mail, Calendar } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={28} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
            <p className="text-sm text-gray-500">Account</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail size={18} className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Joined</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
