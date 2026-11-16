'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-600 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-red-700 font-semibold">Home</Link>
        <span>&raquo;</span>
        <span className="text-gray-900 font-bold">Contact Us</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-[#8b0000] text-white p-5 rounded-t-sm shadow-md">
        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide flex items-center gap-2.5">
          <MessageSquare className="w-7 h-7 text-amber-300 shrink-0" />
          Contact Us &amp; Support
        </h1>
        <p className="text-xs md:text-sm text-amber-200 mt-1 font-medium">
          Have a query, correction request, or advertising inquiry? We are here to help.
        </p>
      </div>

      <div className="bg-white border-2 border-red-700 p-6 md:p-8 space-y-6 text-sm leading-relaxed shadow-sm">
        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xs text-center">
            <Mail className="w-6 h-6 text-red-700 mx-auto mb-2" />
            <h3 className="font-bold text-gray-900 text-sm mb-1">General Queries</h3>
            <p className="text-xs text-gray-600 mb-2">For general support &amp; feedback:</p>
            <a href="mailto:contact@govtjob.site" className="text-xs font-bold text-blue-700 hover:underline">
              contact@govtjob.site
            </a>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xs text-center">
            <AlertCircle className="w-6 h-6 text-amber-700 mx-auto mb-2" />
            <h3 className="font-bold text-gray-900 text-sm mb-1">Grievance &amp; Corrections</h3>
            <p className="text-xs text-gray-600 mb-2">Report errors or broken links:</p>
            <a href="mailto:grievance@govtjob.site" className="text-xs font-bold text-blue-700 hover:underline">
              grievance@govtjob.site
            </a>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xs text-center">
            <MapPin className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
            <h3 className="font-bold text-gray-900 text-sm mb-1">Location</h3>
            <p className="text-xs text-gray-600">
              GovtJob Editorial Team<br />
              Connaught Place, New Delhi 110001, India
            </p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="pt-4 border-t border-gray-200">
          <h2 className="text-lg font-extrabold text-red-800 mb-2">
            Send Us a Message
          </h2>
          <p className="text-xs text-gray-600 mb-4">
            Fill out the form below. Our editorial desk responds to all candidate inquiries within 24–48 hours.
          </p>

          {submitted ? (
            <div className="bg-emerald-50 border-2 border-emerald-400 p-5 rounded-xs text-center text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-base">Thank you for your message!</h3>
              <p className="text-xs text-gray-600 mt-1">
                Your message has been received by our editorial team. We will review your query and respond shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 p-2.5 rounded-xs text-xs focus:outline-hidden focus:border-red-700"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 p-2.5 rounded-xs text-xs focus:outline-hidden focus:border-red-700"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subject / Inquiry Type *</label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-xs text-xs focus:outline-hidden focus:border-red-700 bg-white"
                >
                  <option value="">-- Select Subject --</option>
                  <option value="Correction in Job Details">Report a Correction / Error in Job Post</option>
                  <option value="Broken Link Report">Report a Broken Official Notification Link</option>
                  <option value="General Inquiry">General Candidate Inquiry</option>
                  <option value="Advertising & Partnerships">Advertising &amp; Sponsorships</option>
                  <option value="Grievance / Copyright">Grievance / Copyright / Legal Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Message / Query *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-xs text-xs focus:outline-hidden focus:border-red-700"
                  placeholder="Please provide specific details (including post title or URL if reporting a correction)..."
                />
              </div>

              <button
                type="submit"
                className="bg-[#b91c1c] hover:bg-[#8b0000] text-white font-extrabold text-xs px-6 py-2.5 rounded-xs shadow-md transition-colors flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Message
              </button>
            </form>
          )}
        </div>

        {/* Grievance Officer statutory disclosure */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xs text-xs text-gray-600">
          <p className="font-bold text-gray-800 mb-1">Statutory Grievance Redressal (IT Rules 2021):</p>
          <p>
            In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021, the contact details of the Grievance Redressal Officer are published above. Any grievance regarding content will be acknowledged within 24 hours and addressed within 15 days.
          </p>
        </div>
      </div>
    </div>
  );
}
