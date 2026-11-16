import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ShieldAlert, CheckCircle2, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclaimer & Government Non-Affiliation Notice - Govt Job 2026',
  description: 'Official Non-Affiliation Disclaimer for GovtJob.site. We are an informational portal and are not affiliated with the Government of India or any State Govt.',
  alternates: {
    canonical: 'https://www.govtjob.site/disclaimer',
  },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-600 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-red-700 font-semibold">Home</Link>
        <span>&raquo;</span>
        <span className="text-gray-900 font-bold">Disclaimer</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-[#8b0000] text-white p-5 rounded-t-sm shadow-md">
        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide flex items-center gap-2.5">
          <AlertTriangle className="w-7 h-7 text-amber-300 shrink-0" />
          Official Disclaimer &amp; Non-Affiliation Notice
        </h1>
        <p className="text-xs md:text-sm text-amber-200 mt-1 font-medium">
          Please read this statutory disclaimer carefully before using GovtJob.site
        </p>
      </div>

      <div className="bg-white border-2 border-red-700 p-6 md:p-8 space-y-6 text-sm leading-relaxed shadow-sm">
        {/* Critical Notice Callout */}
        <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xs text-amber-950">
          <h2 className="text-base font-extrabold text-red-900 mb-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-700 shrink-0" />
            1. Important Notice: Non-Government Entity
          </h2>
          <p className="font-medium text-xs md:text-sm leading-relaxed">
            <strong>GovtJob.site is NOT an official website of the Government of India, any State Government, Union Territory administration, or any statutory recruitment body</strong> (including but not limited to UPSC, SSC, IBPS, RRB, NTA, or State Public Service Commissions). We are a privately operated, independent informational employment portal created to assist job aspirants across India.
          </p>
        </div>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            2. Source of Information
          </h2>
          <p>
            All examination dates, recruitment vacancies, admit card notifications, answer keys, and syllabus outlines published on <strong>GovtJob.site</strong> are collected strictly from authentic, publicly accessible sources:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1.5 pl-2 text-gray-700">
            <li>Official Government Portals ending in <code>.gov.in</code> and <code>.nic.in</code>.</li>
            <li>Government of India Weekly <em>Employment News / Rojgar Samachar</em>.</li>
            <li>Press releases issued by authorized Central and State Examination Boards.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            3. Mandatory Verification Advice for Candidates
          </h2>
          <p>
            While our editorial team makes every effort to ensure that the information on this website is 100% accurate, up-to-date, and free of typographical errors, <strong>GovtJob.site assumes no legal liability or responsibility for any inadvertent error, omission, or subsequent modification in recruitment rules or exam dates</strong> made by the recruiting authority.
          </p>
          <div className="bg-gray-50 border-l-4 border-red-700 p-3 my-3 text-xs md:text-sm text-gray-700">
            <p className="font-bold text-red-800">Candidate Duty to Verify:</p>
            <p className="mt-1">
              Candidates are strongly advised to always download and read the official advertisement PDF and cross-check all eligibility criteria on the official recruiting department&apos;s website before filling out any application form or submitting application fees.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            4. No Fees or Financial Transactions
          </h2>
          <p>
            GovtJob.site does <strong>NOT</strong> charge any money, registration fees, or service charges from candidates. All information provided on our website is completely free of cost.
          </p>
          <p className="mt-2 text-red-700 font-bold">
            Caution: GovtJob.site will NEVER send emails, SMS, or WhatsApp messages asking for OTPs, credit/debit card numbers, UPI PINs, or job-guarantee money. Beware of fraudsters.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            5. External Links Disclaimer
          </h2>
          <p>
            GovtJob.site contains hyperlinks to external third-party portals for the purpose of downloading admit cards, reading official notifications, and applying online. We do not have control over the content, uptime, or privacy practices of these external sites. Clicking external links is strictly at the user&apos;s own discretion.
          </p>
        </section>

        <section className="bg-gray-50 p-4 border border-gray-200 rounded-xs text-xs">
          <p className="font-bold text-gray-800 mb-1">Grievance &amp; Correction Reporting:</p>
          <p className="text-gray-600">
            If you notice any inaccuracy, broken link, or outdated information in any of our job posts, please notify our team immediately at <a href="mailto:grievance@govtjob.site" className="text-blue-700 underline font-semibold">grievance@govtjob.site</a> and we will review and update it promptly.
          </p>
        </section>
      </div>
    </div>
  );
}
