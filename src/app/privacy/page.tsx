import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#05070a] text-[#dfe7e0] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#aab4ad] hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-normal tracking-tight mb-8">Privacy Policy</h1>
        <p className="text-[#aab4ad] mb-12">Last updated: October 2026</p>

        <div className="space-y-8 text-[#aab4ad] leading-relaxed">
          <section>
            <h2 className="text-2xl text-white mb-4">1. Information We Collect</h2>
            <p>When you submit a problem through the Code Kootu portal, we collect the information you provide directly: your name, email address, and the details of the problem you are submitting.</p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Review and triage the problems submitted to our committee.</li>
              <li>Communicate with you about the status of your submission.</li>
              <li>Improve our platform and understand community needs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">3. Data Storage & Security</h2>
            <p>Your data is securely stored using Supabase (PostgreSQL) with enterprise-grade encryption and Row Level Security (RLS). We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:codekootu@gmail.com" className="text-[#e0231c] hover:underline">codekootu@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
