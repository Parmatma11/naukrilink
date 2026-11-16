import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCachedJob, getTopJobSlugs } from '@/lib/data';
import { Job, VacancyDetail } from '@/types';
import { Calendar, DollarSign, Users, ExternalLink, FileText, Globe, Share2, Briefcase } from 'lucide-react';

// Next.js ISR: Revalidate job page in background every 30 minutes
export const revalidate = 1800;

// Pre-render the top 50 latest jobs at build time for instant loading
export async function generateStaticParams() {
  return await getTopJobSlugs();
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getCachedJob(slug);

  if (!job) {
    return { title: 'Job Not Found - Govt Job' };
  }

  const title = `${job.title} - Online Form, Eligibility, Dates, Apply Online`;
  const description = `${job.title} 2026. Check application begin and last date, fees, age limit, syllabus and direct application link on Govt Job.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.govtjob.site/job/${job.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: job.created_at,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getCachedJob(slug);

  if (!job) {
    notFound();
  }

  const dates = job.important_dates || {};
  const fees = job.application_fee || {};
  const age = job.age_limit || {};
  const links = job.important_links || {};
  const vacancies: VacancyDetail[] = Array.isArray(job.vacancy_details) ? job.vacancy_details : [];

  const cleanedShortInfo = job.short_info
    ? job.short_info
      .replace(/^Short Information\s*:?\s*/i, '')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .trim()
    : '';

  const isValidUrl = (url?: string): url is string => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    if (!trimmed.startsWith('http')) return false;
    if (
      trimmed === 'https://www.sarkariresult.com/' ||
      trimmed === 'https://www.sarkariresult.com' ||
      trimmed === 'http://www.sarkariresult.com/' ||
      trimmed === 'http://www.sarkariresult.com' ||
      trimmed === 'https://www.govtjob.site/' ||
      trimmed === 'https://www.govtjob.site' ||
      trimmed === 'https://www.govtjob.com/' ||
      trimmed === 'https://www.govtjob.com'
    ) {
      return false;
    }
    return true;
  };

  const hasFeeDetails = fees.gen_obc || fees.sc_st || fees.ph || fees.female;

  // JSON-LD JobPosting Schema for Google Jobs Rich Snippet
  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.short_info || job.title,
    datePosted: job.created_at,
    validThrough: dates.last_date ? new Date().toISOString() : undefined,
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.department || 'Government Recruitment Board',
      sameAs: links.official_website || 'https://www.govtjob.site/',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.govtjob.site/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: job.category_name || 'Jobs',
        item: `https://www.govtjob.site/category/${job.category_slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: job.title,
        item: `https://www.govtjob.site/job/${job.slug}`,
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-gray-600 mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-red-700 font-semibold">Home</Link>
        <span>&raquo;</span>
        <Link href={`/category/${job.category_slug}`} className="hover:text-red-700 font-semibold">
          {job.category_name}
        </Link>
        <span>&raquo;</span>
        <span className="text-gray-900 font-medium truncate max-w-md">{job.title}</span>
      </nav>

      {/* Main Post Card Container */}
      <div className="bg-white border-2 border-red-700 shadow-md rounded-sm overflow-hidden">
        {/* Post Title Banner with Circular Official Logo */}
        <div className="bg-[#8b0000] text-white p-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
            <Image
              src="/logo.svg"
              alt="Govt Job Circular Logo"
              width={48}
              height={48}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-amber-300 shadow-sm shrink-0 bg-white"
            />
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold uppercase tracking-wide leading-tight sm:text-left">
              {job.title}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-amber-200 font-semibold mt-1">
            WWW.GOVTJOB.SITE • POST DATE: {job.post_date || 'Latest 2026'}
          </p>
        </div>

        {/* Short Information Section */}
        {cleanedShortInfo && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 text-xs md:text-sm text-gray-800 leading-relaxed">
            <span className="font-bold text-red-700">Short Information : </span>
            {cleanedShortInfo}
          </div>
        )}

        {/* Two-Column Grid: Important Dates & Application Fee */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-red-200 border-b-2 border-red-200">
          {/* Box 1: Important Dates */}
          <div className="p-4">
            <h2 className="text-sm md:text-base font-extrabold text-[#8b0000] uppercase mb-3 flex items-center gap-1.5 border-b border-red-100 pb-1">
              <Calendar className="w-4 h-4 text-red-700" />
              Important Dates
            </h2>
            <ul className="space-y-2 text-xs md:text-sm">
              <li className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-medium text-gray-700">Application Begin:</span>
                <span className="font-bold text-gray-900">{dates.application_begin || 'Check Notification'}</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-medium text-gray-700">Last Date for Apply Online:</span>
                <span className="font-bold text-red-700">{dates.last_date || 'Check Notification'}</span>
              </li>
              {dates.fee_last_date && (
                <li className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Pay Exam Fee Last Date:</span>
                  <span className="font-bold text-gray-900">{dates.fee_last_date}</span>
                </li>
              )}
              {dates.correction_date && (
                <li className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Correction Date:</span>
                  <span className="font-bold text-purple-700">{dates.correction_date}</span>
                </li>
              )}
              <li className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-medium text-gray-700">Exam Date:</span>
                <span className="font-bold text-blue-900">{dates.exam_date || 'As per Schedule'}</span>
              </li>
              <li className="flex justify-between items-center py-1">
                <span className="font-medium text-gray-700">Admit Card Available:</span>
                <span className="font-bold text-green-700">{dates.admit_card_date || 'Before Exam'}</span>
              </li>
            </ul>
          </div>

          {/* Box 2: Application Fee */}
          <div className="p-4">
            <h2 className="text-sm md:text-base font-extrabold text-[#8b0000] uppercase mb-3 flex items-center gap-1.5 border-b border-red-100 pb-1">
              <DollarSign className="w-4 h-4 text-red-700" />
              Application Fee
            </h2>
            {hasFeeDetails ? (
              <ul className="space-y-2 text-xs md:text-sm">
                {fees.gen_obc && (
                  <li className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-700">General / OBC / EWS :</span>
                    <span className="font-bold text-gray-900">{fees.gen_obc}</span>
                  </li>
                )}
                {fees.sc_st && (
                  <li className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-700">SC / ST :</span>
                    <span className="font-bold text-gray-900">{fees.sc_st}</span>
                  </li>
                )}
                {fees.ph && (
                  <li className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-700">PH (Divyang) :</span>
                    <span className="font-bold text-gray-900">{fees.ph}</span>
                  </li>
                )}
                {fees.female && (
                  <li className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Female Candidates :</span>
                    <span className="font-bold text-gray-900">{fees.female}</span>
                  </li>
                )}
                <li className="py-2 text-[11px] text-gray-500 italic">
                  Pay Exam Fee through Debit Card, Credit Card, Net Banking or UPI Fee Mode Only.
                </li>
              </ul>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs md:text-sm font-semibold text-gray-700">
                  No Application Fee Applicable / Result Notice
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Candidates can check official notification for any special category exemptions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Age Limit Section */}
        {(age.min_age || age.max_age) && (
          <div className="p-4 bg-amber-50/50 border-b border-red-200">
            <h2 className="text-sm md:text-base font-extrabold text-[#8b0000] uppercase mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-red-700" />
              Age Limit Details
            </h2>
            <div className="flex flex-wrap gap-4 text-xs md:text-sm font-semibold text-gray-800">
              {age.min_age && <span>• Minimum Age : <strong className="text-black">{age.min_age}</strong></span>}
              {age.max_age && <span>• Maximum Age : <strong className="text-black">{age.max_age}</strong></span>}
              <span>• Age Relaxation Extra as per Recruitment Rules</span>
            </div>
          </div>
        )}

        {/* Vacancy Details Table (When Available) */}
        {vacancies.length > 0 && (
          <div className="p-4 bg-gray-50 border-b-2 border-red-200">
            <h2 className="text-base md:text-lg font-extrabold text-[#8b0000] uppercase text-center mb-3 flex items-center justify-center gap-2">
              <Briefcase className="w-5 h-5 text-red-700" />
              Vacancy Details &amp; Eligibility Criteria
            </h2>
            <div className="border border-gray-300 rounded-sm overflow-x-auto shadow-xs bg-white">
              <table className="w-full text-xs md:text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#8b0000] text-white">
                    <th className="p-2.5 border border-red-800 font-bold">Post Name</th>
                    <th className="p-2.5 border border-red-800 font-bold text-center w-28">Total Post</th>
                    <th className="p-2.5 border border-red-800 font-bold">Eligibility Criteria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vacancies.map((v, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'}>
                      <td className="p-2.5 font-bold text-gray-900 border border-gray-200">
                        {v.post_name}
                      </td>
                      <td className="p-2.5 font-extrabold text-blue-900 text-center border border-gray-200">
                        {v.total_post}
                      </td>
                      <td className="p-2.5 text-gray-700 border border-gray-200 leading-snug">
                        {v.eligibility}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Important Direct Links Table (The Most Critical Section) */}
        <div className="p-4 bg-white">
          <h2 className="text-base md:text-lg font-extrabold text-[#8b0000] uppercase text-center mb-4 tracking-wide border-b-2 border-red-700 pb-1">
            Important Direct Links
          </h2>

          <div className="border-2 border-gray-300 rounded-sm overflow-hidden">
            <table className="w-full text-xs md:text-sm">
              <tbody className="divide-y divide-gray-200">
                {isValidUrl(links.apply_online) && (
                  <tr className="hover:bg-green-50 transition-colors">
                    <td className="p-3 font-bold text-gray-800 bg-gray-50 w-1/2">
                      Apply Online
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={links.apply_online}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white font-extrabold px-4 py-2 rounded-xs text-xs shadow-sm"
                      >
                        Click Here <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )}

                {isValidUrl(links.download_notification) && (
                  <tr className="hover:bg-red-50 transition-colors">
                    <td className="p-3 font-bold text-gray-800 bg-gray-50">
                      Download Official Notification
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={links.download_notification}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white font-extrabold px-4 py-2 rounded-xs text-xs shadow-sm"
                      >
                        Download PDF <FileText className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )}

                {isValidUrl(links.result) && (
                  <tr className="hover:bg-emerald-50 transition-colors">
                    <td className="p-3 font-bold text-gray-800 bg-gray-50">
                      Download Result / Score Card
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={links.result}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-4 py-2 rounded-xs text-xs shadow-sm"
                      >
                        Check Result <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )}

                {isValidUrl(links.admit_card) && (
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="p-3 font-bold text-gray-800 bg-gray-50">
                      Download Admit Card / Hall Ticket
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={links.admit_card}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-blue-700 hover:bg-blue-800 text-white font-extrabold px-4 py-2 rounded-xs text-xs shadow-sm"
                      >
                        Download Admit Card <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )}

                {isValidUrl(links.answer_key) && (
                  <tr className="hover:bg-amber-50 transition-colors">
                    <td className="p-3 font-bold text-gray-800 bg-gray-50">
                      Download Answer Key
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={links.answer_key}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-amber-700 hover:bg-amber-800 text-white font-extrabold px-4 py-2 rounded-xs text-xs shadow-sm"
                      >
                        View Answer Key <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )}

                {isValidUrl(links.syllabus) && (
                  <tr className="hover:bg-purple-50 transition-colors">
                    <td className="p-3 font-bold text-gray-800 bg-gray-50">
                      Download Exam Syllabus &amp; Pattern
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={links.syllabus}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-purple-700 hover:bg-purple-800 text-white font-extrabold px-4 py-2 rounded-xs text-xs shadow-sm"
                      >
                        Download Syllabus <FileText className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )}

                {isValidUrl(links.official_website) && (
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="p-3 font-bold text-gray-800 bg-gray-50">
                      Official Department Website
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={links.official_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-blue-800 hover:bg-blue-900 text-white font-extrabold px-4 py-2 rounded-xs text-xs shadow-sm"
                      >
                        Visit Website <Globe className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Share Callout */}
        <div className="bg-gray-100 p-3 border-t border-gray-300 flex items-center justify-between text-xs flex-wrap gap-2">
          <span className="font-bold text-gray-700 flex items-center gap-1">
            <Share2 className="w-4 h-4 text-red-700" /> Share with Friends:
          </span>
          <div className="flex gap-2">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${job.title} - Apply Online at: https://www.govtjob.site/job/${job.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 rounded-xs"
            >
              WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(`https://www.govtjob.site/job/${job.slug}`)}&text=${encodeURIComponent(job.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-xs"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
