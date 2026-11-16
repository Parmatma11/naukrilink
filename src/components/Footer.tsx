import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t-4 border-red-700 pt-8 pb-12 mt-12 text-xs md:text-sm">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Col 1 */}
        <div>
          <div className="flex items-center gap-2.5 mb-3 border-b border-gray-700 pb-2">
            <Image
              src="/logo.svg"
              alt="Govt Job Circular Logo"
              width={36}
              height={36}
              className="w-8 h-8 rounded-full border border-amber-400 shrink-0"
            />
            <h3 className="text-white font-bold text-base">
              Govt Job 2026
            </h3>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Welcome to India&apos;s employment alert portal. Find latest government jobs, online application forms, admit cards, exam results, and answer keys in one place.
          </p>
        </div>

        {/* Col 2 */}
        <div>
          <h3 className="text-white font-bold text-base mb-3 border-b border-gray-700 pb-1">
            Quick Navigation
          </h3>
          <ul className="space-y-1.5">
            <li><Link href="/category/latest-jobs" className="hover:text-white">» Latest Government Jobs</Link></li>
            <li><Link href="/category/admit-card" className="hover:text-white">» Hall Ticket / Admit Cards</Link></li>
            <li><Link href="/category/results" className="hover:text-white">» Examination Results</Link></li>
            <li><Link href="/category/answer-key" className="hover:text-white">» Official Answer Keys</Link></li>
            <li><Link href="/category/syllabus" className="hover:text-white">» Exam Syllabus &amp; Pattern</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h3 className="text-white font-bold text-base mb-3 border-b border-gray-700 pb-1">
            Top Recruiters
          </h3>
          <ul className="space-y-1.5">
            <li><Link href="/?q=Railway" className="hover:text-white">» Railway Recruitment Board (RRB)</Link></li>
            <li><Link href="/?q=SSC" className="hover:text-white">» Staff Selection Commission (SSC)</Link></li>
            <li><Link href="/?q=UPSC" className="hover:text-white">» Union Public Service Commission (UPSC)</Link></li>
            <li><Link href="/?q=UPSSSC" className="hover:text-white">» Uttar Pradesh UPSSSC / UPPSC</Link></li>
            <li><Link href="/?q=Police" className="hover:text-white">» State Police &amp; Paramilitary Forces</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h3 className="text-white font-bold text-base mb-3 border-b border-gray-700 pb-1">
            Disclaimer
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            This portal is an informational platform providing alerts regarding government recruitment notices, exam schedules, and results. We strongly advise all candidates to verify the official notification on the official department websites before applying.
          </p>
          <div className="mt-3 text-gray-500 text-[11px]">
            Copyright &copy; 2026 GovtJob.site.
          </div>
        </div>
      </div>
    </footer>
  );
}
