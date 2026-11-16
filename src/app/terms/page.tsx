import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions - Govt Job 2026',
  description: 'Terms and Conditions of use for GovtJob.site. Rules, rights, and responsibilities when accessing our employment alerts portal.',
  alternates: {
    canonical: 'https://www.govtjob.site/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-600 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-red-700 font-semibold">Home</Link>
        <span>&raquo;</span>
        <span className="text-gray-900 font-bold">Terms &amp; Conditions</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-[#8b0000] text-white p-5 rounded-t-sm shadow-md">
        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-amber-300 shrink-0" />
          Terms and Conditions
        </h1>
        <p className="text-xs md:text-sm text-amber-200 mt-1 font-medium">
          Effective Date: January 1, 2026 • Please read carefully before using GovtJob.site
        </p>
      </div>

      <div className="bg-white border-2 border-red-700 p-6 md:p-8 space-y-6 text-sm leading-relaxed shadow-sm">
        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using <strong>https://www.govtjob.site</strong> (the &quot;Site&quot;), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with all of these terms, you are expressly prohibited from using the Site and must discontinue use immediately.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            2. Informational Purpose Only
          </h2>
          <p>
            The content on GovtJob.site is published strictly for <strong>educational and informational purposes</strong>. While we summarize exam patterns, application dates, and eligibility rules, candidates must always refer to the official government notification published by the respective conducting body (UPSC, SSC, RRB, etc.) before making financial or legal decisions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            3. Intellectual Property Rights
          </h2>
          <p>
            Unless otherwise indicated, the Site layout, editorial text summaries, software code, databases, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the &quot;Content&quot;) are owned or licensed to GovtJob.site and are protected by copyright and trademark laws.
          </p>
          <p className="mt-2">
            Official government logos, examination names, and recruitment PDF notices belong to their respective governmental departments and are referenced solely under the principles of fair use for news reporting and public awareness.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            4. Prohibited Activities
          </h2>
          <p>You may not access or use the Site for any purpose other than that for which we make the Site available. Prohibited activities include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1.5 pl-2 text-gray-700">
            <li>Systematically retrieving data or other content from the Site to create or compile a collection or database without written permission.</li>
            <li>Attempting to bypass any security measures, rate limiters, or access restrictions of the Site.</li>
            <li>Using the Site in an unauthorized manner, including collecting usernames or email addresses of users by electronic or other means for the purpose of sending unsolicited email.</li>
            <li>Interfering with, disrupting, or creating an undue burden on the Site or the networks or services connected to the Site.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            5. Limitation of Liability
          </h2>
          <p>
            In no event will GovtJob.site, its owners, editors, or employees be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages arising from your use of the Site, including lost profit, lost revenue, loss of data, or other damages, even if advised of the possibility of such damages.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            6. Modifications and Interruptions
          </h2>
          <p>
            We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
          </p>
        </section>

        <section className="bg-gray-50 p-4 border border-gray-200 rounded-xs text-xs text-gray-600">
          <p className="font-bold text-gray-800 mb-1">Governing Law:</p>
          <p>
            These Terms and Conditions and your use of the Site are governed by and construed in accordance with the laws of India applicable to agreements made and to be entirely performed within the jurisdiction of the courts of New Delhi, India.
          </p>
        </section>
      </div>
    </div>
  );
}
