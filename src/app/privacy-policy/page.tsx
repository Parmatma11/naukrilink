import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Cookie, HelpCircle, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Govt Job 2026',
  description: 'Privacy Policy for GovtJob.site. Learn how we collect, use, and protect your information, including our Google AdSense cookie and advertising policies.',
  alternates: {
    canonical: 'https://www.govtjob.site/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-600 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-red-700 font-semibold">Home</Link>
        <span>&raquo;</span>
        <span className="text-gray-900 font-bold">Privacy Policy</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-[#8b0000] text-white p-5 rounded-t-sm shadow-md">
        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-amber-300 shrink-0" />
          Privacy Policy
        </h1>
        <p className="text-xs md:text-sm text-amber-200 mt-1 font-medium">
          Last Updated: November 17, 2026 • Effective Date: January 1, 2026
        </p>
      </div>

      <div className="bg-white border-2 border-red-700 p-6 md:p-8 space-y-6 text-sm leading-relaxed shadow-sm">
        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            1. Introduction &amp; Commitment to Privacy
          </h2>
          <p>
            At <strong>GovtJob.site</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), accessible from <strong>https://www.govtjob.site</strong>, candidate privacy is of paramount importance to us. This Privacy Policy document outlines the types of personal and non-personal information collected and recorded by GovtJob.site and how we utilize, store, and safeguard it.
          </p>
          <p className="mt-2">
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact our Data Protection and Grievance Officer at <a href="mailto:privacy@govtjob.site" className="text-blue-700 font-semibold underline">privacy@govtjob.site</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-amber-600" />
            2. Google AdSense &amp; Advertising Cookies (Mandatory Disclosure)
          </h2>
          <p>
            We use third-party advertising companies, specifically <strong>Google AdSense</strong>, to serve advertisements when you visit our website. Google is a third-party vendor that uses cookies to serve ads on <strong>https://www.govtjob.site</strong>.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1.5 pl-2 text-gray-700">
            <li>
              <strong>DoubleClick DART Cookie:</strong> Google&apos;s use of the DART cookie enables it to serve targeted advertisements to our users based on their visit to our site and other sites across the Internet.
            </li>
            <li>
              <strong>Opt-Out of DART Cookie:</strong> Users may opt out of the use of the DART cookie by visiting the official Google Ad and Content Network Privacy Policy at <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-semibold">https://policies.google.com/technologies/ads</a>.
            </li>
            <li>
              Third-party ad servers or ad networks use technologies such as cookies, JavaScript, or Web Beacons in their respective advertisements and links that appear on GovtJob.site, which are sent directly to users&apos; browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
            </li>
            <li>
              <strong>Note:</strong> GovtJob.site has no access to or control over these cookies that are used by third-party advertisers.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            3. Log Files &amp; Web Analytics
          </h2>
          <p>
            GovtJob.site follows a standard procedure of utilizing log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users&apos; movement on the website, and gathering demographic information to ensure high performance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            4. Web Push Notifications
          </h2>
          <p>
            If you explicitly grant permission to receive browser notifications for new employment alerts, we store a cryptographic push subscription token generated by your browser. We do not store your name, email, or telephone number for push delivery. You can easily revoke this permission at any time directly through your browser settings or via the floating alert bell on our homepage.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            5. Candidate Preferences &amp; Local Storage
          </h2>
          <p>
            Our interactive Candidate Filter Sidebar stores your selected search preferences (such as preferred age range, qualification level, and department sector) strictly inside your local browser&apos;s <code>localStorage</code>. This data never leaves your device and is not transmitted to or stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            6. Third-Party Privacy Policies
          </h2>
          <p>
            GovtJob.site&apos;s Privacy Policy does not apply to other advertisers, recruitment boards, or external government portals. We provide outbound links to official government websites (such as <code>upsc.gov.in</code>, <code>ssc.gov.in</code>, <code>indianrailways.gov.in</code>) for the convenience of candidates. We strongly encourage you to consult the respective Privacy Policies of these third-party web servers for more detailed information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            7. GDPR &amp; CCPA Candidate Rights
          </h2>
          <p>
            Under international privacy frameworks (including GDPR and CCPA), users have the right to request access to their data, request rectification of inaccurate records, request erasure of personal data, and restrict or object to automated processing. If you wish to exercise any of these statutory rights, please reach out to us at <a href="mailto:privacy@govtjob.site" className="text-blue-700 underline font-semibold">privacy@govtjob.site</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            8. Children&apos;s Information Protection
          </h2>
          <p>
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. GovtJob.site does not knowingly collect any Personal Identifiable Information from children under the age of 13.
          </p>
        </section>

        <section className="bg-gray-50 p-4 border border-gray-200 rounded-xs">
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-red-700" />
            Contacting Our Privacy Officer
          </h3>
          <p className="text-xs text-gray-600">
            For any questions, legal requests, or data privacy inquiries regarding our advertising and content policies:
            <br />
            <strong>Email:</strong> <a href="mailto:privacy@govtjob.site" className="text-blue-700 underline">privacy@govtjob.site</a> / <a href="mailto:contact@govtjob.site" className="text-blue-700 underline">contact@govtjob.site</a>
            <br />
            <strong>Address:</strong> GovtJob Portal Team, New Delhi, India.
          </p>
        </section>
      </div>
    </div>
  );
}
