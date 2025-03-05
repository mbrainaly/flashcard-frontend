export default function PrivacyPage() {
  return (
    <div className="bg-primary-50 px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-primary-200">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-primary-300 sm:text-4xl">Privacy Policy</h1>
        <p className="mt-6 text-xl leading-8">
          At AIFlash, we take your privacy seriously. This Privacy Policy explains how we collect, use, and
          protect your personal information.
        </p>
        <div className="mt-10 max-w-2xl">
          <h2 className="mt-16 text-2xl font-bold tracking-tight text-primary-300">Information We Collect</h2>
          <p className="mt-6">
            We collect information that you provide directly to us, including:
          </p>
          <ul role="list" className="mt-8 space-y-8 text-primary-200">
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>
                <strong className="font-semibold text-primary-300">Personal Information:</strong> Name, email
                address, and other contact details when you create an account or contact us.
              </span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>
                <strong className="font-semibold text-primary-300">Usage Data:</strong> Information about how
                you use our platform, including study patterns and performance metrics.
              </span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>
                <strong className="font-semibold text-primary-300">Content:</strong> The flashcards and study
                materials you create or interact with on our platform.
              </span>
            </li>
          </ul>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-primary-300">How We Use Your Information</h2>
          <p className="mt-6">
            We use the information we collect to:
          </p>
          <ul role="list" className="mt-8 space-y-8 text-primary-200">
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>Provide, maintain, and improve our services</span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>Personalize your learning experience</span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>Communicate with you about our services</span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>Protect against fraud and abuse</span>
            </li>
          </ul>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-primary-300">Data Security</h2>
          <p className="mt-6">
            We implement appropriate technical and organizational measures to protect your personal information
            against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-primary-300">Your Rights</h2>
          <p className="mt-6">
            You have the right to:
          </p>
          <ul role="list" className="mt-8 space-y-8 text-primary-200">
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>Access your personal information</span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>Correct inaccurate information</span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>Request deletion of your information</span>
            </li>
            <li className="flex gap-x-3">
              <span className="mt-1 h-5 w-5 flex-none text-primary-300">•</span>
              <span>Object to processing of your information</span>
            </li>
          </ul>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-primary-300">Contact Us</h2>
          <p className="mt-6">
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@aiflash.com" className="text-primary-300 hover:underline">
              privacy@aiflash.com
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