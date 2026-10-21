import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-[#05070a] text-[#dfe7e0] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#aab4ad] hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-normal tracking-tight mb-8">Terms of Service</h1>
        <p className="text-[#aab4ad] mb-12">Last updated: October 2026</p>

        <div className="space-y-8 text-[#aab4ad] leading-relaxed">
          <section>
            <h2 className="text-2xl text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using the Code Kootu platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">2. Submission of Ideas</h2>
            <p>When you submit a problem or idea to Code Kootu, you acknowledge that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>You grant Code Kootu the right to review, prototype, and build solutions based on your submission.</li>
              <li>Any prototypes or solutions developed by Code Kootu will be open-source and documented, available for public use.</li>
              <li>You will not submit ideas that infringe on third-party intellectual property rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">3. User Conduct</h2>
            <p>You agree not to submit any content that is unlawful, harmful, threatening, abusive, or otherwise objectionable. We reserve the right to remove any submissions that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">4. Limitation of Liability</h2>
            <p>Code Kootu is a student-run engineering collective. We provide our services "as is" and do not guarantee that every submitted problem will be solved. We are not liable for any damages arising from the use of our platform.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
