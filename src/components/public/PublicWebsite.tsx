import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Laptop,
  ArrowRightLeft,
  FileCheck2,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  Lock,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PublicWebsite: React.FC = () => {
  const { setActiveView, settings } = useApp();
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Public Top Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> {settings.email}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-blue-400" /> {settings.phone}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 hidden sm:inline">Enterprise Assets Portal</span>
            <button
              onClick={() => setActiveView('login')}
              className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
            >
              <Lock className="w-3 h-3" /> Login to Portal
            </button>
          </div>
        </div>
      </div>

      {/* Public Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black tracking-wider shadow-sm">
              {settings.brandName ? settings.brandName.split(' ').map(w => w[0]).join('').slice(0, 2) : 'ZI'}
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-wider text-slate-900">
                {settings.brandName || 'ZOVILO INDIA'}
              </span>
              <span className="block text-[10px] tracking-tight font-medium text-slate-500 uppercase">
                Assets Management System
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#about" className="hover:text-blue-600 transition-colors">
              About
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#lifecycle" className="hover:text-blue-600 transition-colors">
              Asset Lifecycle
            </a>
            <a href="#noc-clearance" className="hover:text-blue-600 transition-colors">
              NOC & Clearance
            </a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Official Corporate Assets & Handover Infrastructure
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Smart, Secure and Centralized Company Asset Management
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              Engineered for Jobulo India to manage company laptops, CCTV, mobile devices, employee allocations, handover inspections, automated NOC clearance certificates, and immutable audit logs.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveView('login')}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
              >
                Login to Management Portal <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveView('dashboard')}
                className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors border border-slate-700"
              >
                View Live Demo Dashboard
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80">
              <div>
                <div className="text-2xl font-black text-white">100%</div>
                <div className="text-xs text-slate-400 mt-0.5">Asset Traceability</div>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-400">Zero-Loss</div>
                <div className="text-xs text-slate-400 mt-0.5">Handover Verification</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">Automated</div>
                <div className="text-xs text-slate-400 mt-0.5">NOC PDF Generation</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">RBAC 5-Tier</div>
                <div className="text-xs text-slate-400 mt-0.5">Enterprise Security</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                About the Platform
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Eliminating Asset Leakage Across Corporate Branches
              </h2>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Jobulo India manages a dynamic workforce across regional branches including Mumbai, Patna, Bengaluru, Delhi NCR, and Kolkata. When employees join or separate, tracking laptops, monitors, CCTV hardware, and mobile equipment manually leads to misplaced company property, disputed clearances, and compliance gaps.
              </p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                The Jobulo India Assets Management System guarantees complete lifecycle oversight—from purchase tagging, multi-asset allocation vouchers, return condition audits, to final locked No Objection Certificates (NOC).
              </p>

              <div className="mt-6 space-y-2.5">
                {[
                  'Single-pane view of all regional assets with real-time condition tracking',
                  'Allocation vouchers with digital employee acknowledgement & signatures',
                  'Guided exit checklist preventing NOC release until all hardware is accounted for',
                  'Printable & downloadable legal A4 clearance documents with corporate seal'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual preview card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-600 ml-2">
                    JOBULO INDIA // CLEARANCE WORKFLOW
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  SYSTEM READY
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-blue-50 text-blue-600">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Dell Latitude 5440 (JIA-000101)</div>
                      <div className="text-[11px] text-slate-500">Allocated to Harsh Kumar (ASM)</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Assigned
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-teal-50 text-teal-600">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Handover RET-2026-001</div>
                      <div className="text-[11px] text-slate-500">Vikrant Singh • 1 Item Verified Returned</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                    Returned
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-emerald-50 text-emerald-600">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">NOC-JIA-2026-001</div>
                      <div className="text-[11px] text-slate-500">Clearance Locked • Stamp Attached</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Finalized
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              End-to-End Enterprise Asset Governance
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Designed according to corporate standards to protect capital investments and streamline employee transitions.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Asset Master & Tagging</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Unique sequential asset IDs (e.g. JIA-000101), serial and IMEI tracking, warranty renewal monitors, purchase capitalization, and GPS location stamping.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Allocation Vouchers</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Single or batch issuance of laptops, peripherals, and smartphones with verified availability checks and printable employee acknowledgement vouchers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Strict Exit Clearance & NOC</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Zero-tolerance clearance engine that locks NOC generation until every item is inspected and accepted, followed by locked A4 certificate issuance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Multi-Branch Locations</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Manage branch asset depots across Mumbai, Patna, Bengaluru, Delhi, and Kolkata with automated geolocation capture upon asset registration.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Immutable Audit Trail</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Every login, status transition, assignment, inspection, and certificate generation is logged with timestamp, user ID, and IP address.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Analytics & Register Reports</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Generate fixed asset registers, category breakdown charts, department allocations, damaged/lost reports, and instant CSV data export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Asset Lifecycle Section */}
      <section id="lifecycle" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Complete Lifecycle Tracking
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              Who Had This Laptop Before Harsh?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Assets never lose their historic custody. The complete timeline remains preserved across employee handovers and repairs.
            </p>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="flex-1 text-center p-4 rounded-xl bg-slate-50 border border-slate-200 w-full">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">
                1
              </div>
              <h4 className="text-xs font-bold text-slate-900">Registered</h4>
              <p className="text-[11px] text-slate-500 mt-1">Serial & Tag generated</p>
            </div>
            <div className="hidden md:block text-slate-300 font-mono">→</div>

            <div className="flex-1 text-center p-4 rounded-xl bg-slate-50 border border-slate-200 w-full">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">
                2
              </div>
              <h4 className="text-xs font-bold text-slate-900">Available</h4>
              <p className="text-[11px] text-slate-500 mt-1">Buffer IT inventory</p>
            </div>
            <div className="hidden md:block text-slate-300 font-mono">→</div>

            <div className="flex-1 text-center p-4 rounded-xl bg-blue-50 border border-blue-200 w-full">
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">
                3
              </div>
              <h4 className="text-xs font-bold text-blue-900">Allocated</h4>
              <p className="text-[11px] text-blue-700 mt-1">Assigned to Employee</p>
            </div>
            <div className="hidden md:block text-slate-300 font-mono">→</div>

            <div className="flex-1 text-center p-4 rounded-xl bg-teal-50 border border-teal-200 w-full">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">
                4
              </div>
              <h4 className="text-xs font-bold text-teal-900">Handover</h4>
              <p className="text-[11px] text-teal-700 mt-1">Return & Inspection</p>
            </div>
            <div className="hidden md:block text-slate-300 font-mono">→</div>

            <div className="flex-1 text-center p-4 rounded-xl bg-slate-50 border border-slate-200 w-full">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">
                5
              </div>
              <h4 className="text-xs font-bold text-slate-900">Re-Issued / Repair</h4>
              <p className="text-[11px] text-slate-500 mt-1">Ready for next user</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Corporate Inquiries
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Jobulo India Corporate Assets Center
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Contact the IT Infrastructure and Human Resources Asset Governance cell for enterprise support, branch asset transfers, or vendor equipment registrations.
              </p>

              <div className="mt-8 space-y-4 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Corporate Headquarters</div>
                    <div className="text-slate-600 mt-0.5">{settings.legalName}</div>
                    <div className="text-slate-500">{settings.address}, {settings.city}, {settings.state} - {settings.pinCode}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Regional Depot (Bihar & Jharkhand)</div>
                    <div className="text-slate-500">Exhibition Road, Patna Regional Office, Bihar - 800001</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Support Desk</div>
                    <div className="text-slate-600">{settings.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Official Correspondence</div>
                    <div className="text-slate-600">{settings.email}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Send an Official Message</h3>
              <p className="text-xs text-slate-500 mt-1">
                Reach out to the IT asset administrator or request regional inventory dispatch.
              </p>

              {contactSubmitted ? (
                <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900 mt-2">Message Dispatched</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Thank you, {formData.name}. The IT administrative officer will review your request.
                  </p>
                  <button
                    onClick={() => {
                      setContactSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
                    }}
                    className="mt-4 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-md text-xs font-semibold"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Harsh Kumar"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="harsh@jobuloindia.com"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98350 12345"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Branch</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Sales - Patna Branch"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Request *</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Specify asset details, transfer requirements or handover questions..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    Submit Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 px-4 sm:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              JI
            </div>
            <span className="text-white font-semibold">{settings.legalName}</span>
          </div>
          <div>
            © {new Date().getFullYear()} Jobulo India Assets Management System. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveView('login')} className="hover:text-white transition-colors">
              Employee Portal
            </button>
            <button onClick={() => setActiveView('dashboard')} className="hover:text-white transition-colors">
              Admin Console
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
