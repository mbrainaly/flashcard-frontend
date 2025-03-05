export default function TermsPage() {
  return (
    <div className="bg-primary-50 px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-primary-200">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-primary-300 sm:text-4xl">Terms of Service</h1>
        <p className="mt-6 text-xl leading-8">
          Welcome to AIFlash. By using our service, you agree to these terms. Please read them carefully.
        </p>
        <div className="mt-10 max-w-2xl">
          <h2 className="mt-16 text-2xl font-bold tracking-tight text-primary-300">1. Acceptance of Terms</h2>
          <p className="mt-6">
            By accessing or using AIFlash, you agree to be bound by these Terms of Service and all applicable
            laws and regulations. If you do not agree with any of these terms, you are prohibited from using
            this service.
          </p>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-primary-300">2. User Accounts</h2>
          <p className="mt-6">
            When you create an account with us, you must provide accurate and complete information. You are
            responsible for maintaining the security of your account and password.
          </p>
          <ul role="list" className="mt-8 space-y-8 text-primary-200">
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>You must be at least 13 years old to use this service</span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>You are responsible for all activities under your account</span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>You must notify us immediately of any security breach</span>
            </li>
          </ul>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-primary-300">3. User Content</h2>
          <p className="mt-6">
            You retain all rights to any content you submit, post or display on AIFlash. By submitting content,
            you grant us a worldwide, non-exclusive license to use, copy, modify, and distribute your content.
          </p>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-primary-300">4. Acceptable Use</h2>
          <p className="mt-6">You agree not to:</p>
          <ul role="list" className="mt-8 space-y-8 text-primary-200">
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>Use the service for any illegal purpose</span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>Share inappropriate or offensive content</span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>Attempt to breach or circumvent security measures</span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>Interfere with other users' enjoyment of the service</span>
            </li>
          </ul>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-primary-300">5. Termination</h2>
          <p className="mt-6">
            We reserve the right to terminate or suspend access to our service immediately, without prior
            notice, for any breach of these Terms of Service.
          </p>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-primary-300">6. Changes to Terms</h2>
          <p className="mt-6">
            We reserve the right to modify these terms at any time. We will notify users of any material
            changes by posting the new Terms of Service on this page.
          </p>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-primary-300">7. Contact Us</h2>
          <p className="mt-6">
            If you have any questions about these Terms, please contact us at{' '}
            <a href="mailto:legal@aiflash.com" className="text-primary-300 hover:underline">
              legal@aiflash.com
            </a>
            .
          </p>

          <p className="mt-10">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
} 