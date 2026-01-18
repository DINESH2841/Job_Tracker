import Link from 'next/link'

export default async function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            📋 Job Tracker
          </h1>
          <p className="text-xl text-purple-100 mb-8">
            Automatically track job applications from your Gmail accounts with AI-powered insights
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">📧</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Multiple Gmail Accounts</h3>
                <p className="text-gray-600 text-sm">Link and sync multiple Gmail accounts in one dashboard</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">🤖</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">AI-Powered Extraction</h3>
                <p className="text-gray-600 text-sm">Automatically extract company, role, and status from emails</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">📊</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Analytics Dashboard</h3>
                <p className="text-gray-600 text-sm">Track response rates, timelines, and success metrics</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">🔔</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Smart Reminders</h3>
                <p className="text-gray-600 text-sm">Get notified about follow-ups and interviews</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">📄</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Resume Tracking</h3>
                <p className="text-gray-600 text-sm">Manage multiple resume versions and track performance</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">🤝</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Referral Management</h3>
                <p className="text-gray-600 text-sm">Track referrals and measure their success rate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/auth/signin"
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-colors shadow-lg"
          >
            Get Started →
          </Link>
          <p className="text-purple-100 mt-4 text-sm">
            Sign in with Google to start tracking your job applications
          </p>
        </div>
      </div>
    </div>
  )
}
