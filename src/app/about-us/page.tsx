import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Award, Target, Users, BookOpen, CheckCircle, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - Govt Job 2026',
  description: 'About GovtJob.site. India’s leading trusted career alert platform dedicated to providing authenticated government job updates, admit cards, and results.',
  alternates: {
    canonical: 'https://www.govtjob.site/about-us',
  },
};

export default function AboutUsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-600 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-red-700 font-semibold">Home</Link>
        <span>&raquo;</span>
        <span className="text-gray-900 font-bold">About Us</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-[#8b0000] text-white p-5 rounded-t-sm shadow-md">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Govt Job Logo"
            width={44}
            height={44}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-amber-300 bg-white shrink-0"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide">
              About GovtJob.site
            </h1>
            <p className="text-xs md:text-sm text-amber-200 mt-0.5 font-medium">
              Empowering Aspirants Across India with Fast &amp; Authenticated Recruitment Alerts
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-red-700 p-6 md:p-8 space-y-6 text-sm leading-relaxed shadow-sm">
        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            Our Mission &amp; Vision
          </h2>
          <p>
            Founded with the singular mission of simplifying government job discoveries, <strong>GovtJob.site</strong> is an independent digital news and employment alert portal. Every year, millions of graduates, 10th/12th pass students, and diploma holders in India prepare for Central and State government examinations. However, tracking multiple departmental websites, understanding lengthy 80-page notification PDFs, and tracking shifting application deadlines is often overwhelming.
          </p>
          <p className="mt-2">
            GovtJob.site bridges this gap by presenting <strong>verified, cleanly formatted summaries</strong> of every recruitment announcement—including crucial eligibility criteria, age limits, application fee structures, direct official links, and exam dates—all in one lightning-fast place.
          </p>
        </section>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xs text-center">
            <Zap className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <h3 className="font-extrabold text-gray-900 text-sm mb-1">Instant Speed</h3>
            <p className="text-xs text-gray-600 leading-normal">
              Direct alerts for admit cards, answer keys, and results within minutes of official release.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xs text-center">
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-extrabold text-gray-900 text-sm mb-1">100% Authentic</h3>
            <p className="text-xs text-gray-600 leading-normal">
              Every post is verified against official <code>.gov.in</code> / <code>.nic.in</code> gazettes and employment notifications.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xs text-center">
            <Target className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <h3 className="font-extrabold text-gray-900 text-sm mb-1">Candidate-First</h3>
            <p className="text-xs text-gray-600 leading-normal">
              Smart candidate filtering by age, education, and sector to eliminate irrelevant noise.
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            Our Editorial &amp; Verification Process
          </h2>
          <p>
            To uphold the highest standards of journalistic integrity and reliability:
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-2 pl-2 text-gray-700">
            <li>
              <strong>Primary Source Verification:</strong> We only track authentic government portals (such as UPSC, SSC, Railway Recruitment Boards, Defence recruitment cells, and State PSCs).
            </li>
            <li>
              <strong>Fact-Checking:</strong> Important dates (Application Begin, Last Date, Fee payment deadlines, and Admit card releases) are verified against the official recruitment notification PDF before being published.
            </li>
            <li>
              <strong>Direct Official Links:</strong> Unlike many misleading portals that trap users in ad loops, we provide direct links to the official government portal, PDF notification, and official result links.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-red-800 border-b border-gray-200 pb-1 mb-2">
            What We Offer
          </h2>
          <ul className="list-disc list-inside mt-2 space-y-1.5 pl-2 text-gray-700">
            <li><strong>Latest Central &amp; State Jobs:</strong> Railway, SSC, UPSC, Banking, Defence, Teaching, Police, and PSU opportunities.</li>
            <li><strong>Admit Cards / Hall Tickets:</strong> Direct download links with step-by-step instructions.</li>
            <li><strong>Official Results &amp; Cutoffs:</strong> Merit lists, scorecards, and category-wise cut-off marks.</li>
            <li><strong>Official Answer Keys &amp; Objections:</strong> Preliminary and final answer keys with objection links.</li>
            <li><strong>Exam Syllabus &amp; Patterns:</strong> Detailed post-wise marks distribution and syllabus breakdown.</li>
          </ul>
        </section>

        <section className="bg-amber-50 p-4 border border-amber-300 rounded-xs text-xs text-amber-950">
          <p className="font-bold mb-1">Transparency Statement:</p>
          <p>
            GovtJob.site is completely free to use for all candidates. We fund our servers, maintenance, and editorial verification through standardized third-party advertisements (such as Google AdSense). We never sell candidate personal data.
          </p>
        </section>
      </div>
    </div>
  );
}
