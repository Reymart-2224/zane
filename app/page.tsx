import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import zaneIcon from "@/assets/media/zane-icon.png";
import zaneLogo from "@/assets/media/zane-logo-v2.png";
import zaneWindow from "@/assets/media/zane-flow.png";


import zaneSW from "@/assets/media/sw.png";
import zaneSystemDash from "@/assets/media/zane-system-dash.png";
import zaneListing from "@/assets/media/zane-listing.png";
export const metadata: Metadata = {
  title: "ZANE IT Solutions | Future-Ready IT & Digital Systems",
  description:
    "ZANE IT Solutions builds modern websites, automation systems, cloud-ready platforms, dashboards, and secure digital solutions for growing businesses.",
  keywords: [
    "ZANE IT Solutions",
    "IT solutions",
    "web development",
    "business automation",
    "cloud solutions",
    "digital systems",
    "dashboard development",
    "technical support",
    "software solutions",
  ],
  authors: [{ name: "ZANE IT Solutions" }],
  creator: "ZANE IT Solutions",
  publisher: "ZANE IT Solutions",
  metadataBase: new URL("https://zaneitsolutions.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ZANE IT Solutions | Future-Ready IT & Digital Systems",
    description:
      "Smart, scalable, and secure IT solutions for modern businesses. Websites, automation, cloud systems, dashboards, and technical support.",
    url: "https://zaneitsolutions.com",
    siteName: "ZANE IT Solutions",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZANE IT Solutions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZANE IT Solutions | Future-Ready IT & Digital Systems",
    description:
      "Modern websites, automation, cloud-ready systems, dashboards, and secure digital solutions for growing businesses.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function HomePage() {
  return (
  <main className="min-h-screen overflow-x-hidden bg-[#06121f] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(47,140,116,0.35),transparent_35%),radial-gradient(circle_at_top_right,rgba(41,101,137,0.45),transparent_35%),linear-gradient(180deg,#06121f_0%,#020712_100%)]" />
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#2f8c74]/20 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-[#296589]/25 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:70px_70px] opacity-30" />
      </div>

{/* Header */}
<header className="fixed left-0 top-0 z-[9999] w-full border-b border-white/10 bg-[#06121f]/85 backdrop-blur-xl">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
    <Link href="/" className="flex items-center gap-3">
      <Image
        src={zaneLogo}
        alt="Zane IT Solutions Logo"
        className="h-9 w-auto object-contain"
        priority
      />
    </Link>

    {/* Desktop Menu */}
    <nav className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
      <Link href="#services" className="transition hover:text-white">
        Services
      </Link>
      <Link href="#projects" className="transition hover:text-white">
              Projects
            </Link>
      <Link href="#solutions" className="transition hover:text-white">
        Solutions
      </Link>
      <Link href="#process" className="transition hover:text-white">
        Process
      </Link>
      <Link href="#contact" className="transition hover:text-white">
        Contact
      </Link>
    </nav>

    {/* Desktop Contact */}
    <div className="hidden items-center gap-3 lg:flex">
      <Link
        href="tel:09365160775"
        className="rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#2f8c74]/70 hover:bg-[#2f8c74]/20"
      >
        0936 516 0775
      </Link>

      <Link
        href="https://wa.me/639365160775"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-[#2f8c74] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#267762]"
      >
        WhatsApp
      </Link>
    </div>

    {/* Mobile Menu */}
    <details className="group relative lg:hidden">
      <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/15">
        <span className="relative h-4 w-5">
          <span className="absolute left-0 top-0 h-0.5 w-5 rounded-full bg-white transition group-open:top-2 group-open:rotate-45" />
          <span className="absolute left-0 top-2 h-0.5 w-5 rounded-full bg-white transition group-open:opacity-0" />
          <span className="absolute left-0 top-4 h-0.5 w-5 rounded-full bg-white transition group-open:top-2 group-open:-rotate-45" />
        </span>
      </summary>

      <div className="absolute right-0 top-14 w-[290px] overflow-hidden rounded-3xl border border-white/10 bg-[#081827]/95 p-5 shadow-2xl backdrop-blur-xl">
        <nav className="flex flex-col gap-1 text-sm text-white/75">
          <Link
            href="#services"
            className="rounded-xl px-4 py-3 transition hover:bg-white/10 hover:text-white"
          >
            Services
          </Link>
          <Link
            href="#solutions"
            className="rounded-xl px-4 py-3 transition hover:bg-white/10 hover:text-white"
          >
            Solutions
          </Link>
          <Link
            href="#process"
            className="rounded-xl px-4 py-3 transition hover:bg-white/10 hover:text-white"
          >
            Process
          </Link>
          <Link
            href="#contact"
            className="rounded-xl px-4 py-3 transition hover:bg-white/10 hover:text-white"
          >
            Contact
          </Link>
        </nav>

        <div className="my-5 h-px bg-white/10" />

        <div className="space-y-3 text-sm">
          <Link
            href="tel:09365160775"
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <span>Phone</span>
            <span>0936 516 0775</span>
          </Link>

          <Link
            href="https://wa.me/639365160775"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-[#2f8c74]/30 bg-[#2f8c74]/10 px-4 py-3 text-[#8ff0d1] transition hover:bg-[#2f8c74]/20"
          >
            <span>WhatsApp</span>
            <span>Message</span>
          </Link>

          <Link
            href="mailto:reymartdungca.dev@gmail.com"
            className="block rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            reymartdungca.dev@gmail.com
          </Link>

          <Link
            href="https://www.facebook.com/rymrtdngca"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Facebook Profile
          </Link>
        </div>
      </div>
    </details>
  </div>
</header>
      {/* Hero */}
     <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-32 md:px-8 lg:grid-cols-2 lg:pb-32 lg:pt-40">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2f8c74]/30 bg-[#2f8c74]/10 px-4 py-2 text-sm text-[#8ff0d1] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#2f8c74] shadow-[0_0_16px_#2f8c74]" />
            Future-ready IT solutions
          </div>

          <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            Smart digital systems for modern businesses.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/65 md:text-lg">
            ZANE IT Solutions helps businesses build fast, scalable, and secure
            digital platforms — from websites and automation to cloud-ready
            systems and technical support.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="#contact"
              className="rounded-full bg-[#2f8c74] px-7 py-4 text-center text-sm font-bold text-white  transition hover:bg-[#267762]"
            >
              Start a Project
            </Link>

            <Link
              href="#services"
              className="rounded-full border border-white/15 bg-white/5 px-7 py-4 text-center text-sm font-bold text-white backdrop-blur-md transition hover:border-[#296589]/80 hover:bg-[#296589]/20"
            >
              View Services
            </Link>
          </div>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-4">
            {[
              ["99%", "Uptime Focus"],
              ["24/7", "Support Ready"],
              ["10x", "Scalable Builds"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
              >
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-white/45">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative">
          <div className="absolute -inset-10 rounded-full bg-[#296589]/20 blur-[90px]" />

          <div className="relative mx-auto max-w-[520px] rounded-[36px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
            <div className="rounded-[28px] border border-white/10 bg-[#081827]/80 p-7">
              <div className="mb-6 flex items-center justify-between">
               
                <span className="text-xs uppercase tracking-[0.3em] text-white/35">
                TURNING IDEAS INTO REALITY
                </span>
              </div>

              <div className="flex justify-center py-10">
                <Image
                  src={zaneWindow}
                  alt="Zane Window"
                  className="h-48 w-100 object-contain drop-shadow-[0_0_45px_rgba(47,140,116,0.45)]"
                  priority
                />
              </div>

              <div className="space-y-4">
                {[
                  ["Ideas/Flowcharts", "10%"],
                  ["Prototype and Testing", "70%"],
                  ["Production", "100%"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-white/65">{label}</span>
                      <span className="text-[#8ff0d1]">{value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#296589] to-[#2f8c74]"
                        style={{ width: value }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#2f8c74]">
            Services
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Built for performance, automation, and growth.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Web Development",
              desc: "Modern responsive websites, landing pages, portals, and custom dashboards.",
            },
            {
              title: "IT Automation",
              desc: "Streamline repetitive workflows with smart automation and system integrations.",
            },
            {
              title: "Cloud Solutions",
              desc: "Cloud-ready systems designed for speed, stability, and future scaling.",
            },
            {
              title: "Security & Support",
              desc: "Technical maintenance, monitoring, backups, and reliable support systems.",
            },
          ].map((service) => (
            <div
              key={service.title}
              className="group rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-[#2f8c74]/50 hover:bg-[#2f8c74]/10"
            >
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#296589] to-[#2f8c74] shadow-[0_0_28px_rgba(47,140,116,0.35)]">
                <span className="text-xl font-bold">Z</span>
              </div>
              <h3 className="text-xl font-bold">{service.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/60">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Projects */}
<section id="projects" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
  <div className="mb-12 max-w-3xl">
    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#2f8c74]">
      Sample Projects
    </p>

    <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
      Real systems built for business operations.
    </h2>

    <p className="mt-5 leading-8 text-white/60">
      Here are sample project types ZANE IT Solutions can build, from internal
      admin systems to listing platforms. Sensitive information is intentionally
      blurred in the previews.
    </p>
  </div>

  <div className="grid gap-6 lg:grid-cols-2">
    {/* Project 1 */}
    <div className="group overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-[#2f8c74]/50 hover:bg-[#2f8c74]/10">
      <div className="mb-6 flex items-center justify-between gap-5">
        <div>
          <span className="inline-flex rounded-full border border-[#2f8c74]/30 bg-[#2f8c74]/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#8ff0d1]">
            Academy System
          </span>

          <h3 className="mt-5 text-2xl font-bold">
            Still Waters Academy System
          </h3>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#296589] to-[#2f8c74] text-lg font-black shadow-[0_0_28px_rgba(47,140,116,0.35)]">
          01
        </div>
      </div>

      <p className="mb-6 leading-7 text-white/60">
        A custom academy management system with dashboards for tracking
        students, parents, therapists, sessions, invoices, expenses, paystubs,
        reports, and analytics. It helps organize school operations in one
        secure admin panel.
      </p>

      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#081827]">
             <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#06121f]/15 backdrop-blur-[2px]">
          <span className="rounded-full border border-white/10 bg-[#06121f]/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            Data Blurred
          </span>
        </div>
 <Image
            src={zaneSW}
            alt="Still Waters Academy System"
            className="h-[300px] w-full object-cover blur-[3px]"
            placeholder="blur"
          />
          
        </div>

      
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          "Admin Dashboard",
          "Session Tracking",
          "Invoices",
          "Reports",
          "Analytics",
        ].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/60"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* Project 2 */}
    <div className="group overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-[#2f8c74]/50 hover:bg-[#2f8c74]/10">
      <div className="mb-6 flex items-center justify-between gap-5">
        <div>
          <span className="inline-flex rounded-full border border-[#296589]/40 bg-[#296589]/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#9fdcff]">
            Listing Platform
          </span>

          <h3 className="mt-5 text-2xl font-bold">
            Real Estate Listing System
          </h3>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#296589] to-[#2f8c74] text-lg font-black shadow-[0_0_28px_rgba(47,140,116,0.35)]">
          02
        </div>
      </div>

      <p className="mb-6 leading-7 text-white/60">
        A listing management system for companies, properties, sales, and leads.
        It includes company profiles, listing pages, filters, lead tracking,
        sales analytics, and an admin dashboard for monitoring performance.
      </p>

      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#eef8fb]">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#06121f]/15 backdrop-blur-[2px]">
          <span className="rounded-full border border-white/10 bg-[#06121f]/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            Data Blurred
          </span>
        </div>
<Image
            src={zaneSystemDash}
            alt="Still Waters Academy System Dashboard"
            className="h-[300px] w-full object-cover blur-[3px]"
            placeholder="blur"
          />
         
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          "Listings",
          "Lead Tracking",
          "Company Profiles",
          "Sales Analytics",
          "Filters",
        ].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/60"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
</section>


      {/* Solutions */}
      <section id="solutions" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#296589]/25 to-[#2f8c74]/10 p-8 backdrop-blur-md md:p-10">
            <Image
              src={zaneLogo}
              alt="Zane IT Solutions"
              className="mb-10 h-12 w-auto object-contain"
            />

            <h2 className="text-3xl font-bold md:text-5xl">
              A smarter IT partner for your digital operations.
            </h2>

            <p className="mt-6 leading-8 text-white/65">
              From strategy to deployment, ZANE builds digital systems that help
              businesses move faster, operate cleaner, and scale with confidence.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              "Business websites",
              "Booking systems",
              "Admin dashboards",
              "CRM integrations",
              "Workflow automation",
              "Performance optimization",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md"
              >
                <div className="mb-5 h-1.5 w-14 rounded-full bg-gradient-to-r from-[#296589] to-[#2f8c74]" />
                <h3 className="text-lg font-semibold">{item}</h3>
                <p className="mt-3 text-sm leading-7 text-white/55">
                  Clean, scalable, and future-focused solutions tailored to your
                  business needs.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#2f8c74]">
            Process
          </p>
          <h2 className="text-3xl font-bold md:text-5xl">
            From idea to launch.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Discover",
              desc: "We understand your business, goals, workflows, and technical requirements.",
            },
            {
              step: "02",
              title: "Build",
              desc: "We design and develop your solution using clean, scalable, modern technology.",
            },
            {
              step: "03",
              title: "Launch",
              desc: "We deploy, optimize, monitor, and support your system after launch.",
            },
          ].map((process) => (
            <div
              key={process.step}
              className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md"
            >
              <div className="absolute right-6 top-4 text-7xl font-black text-white/[0.04]">
                {process.step}
              </div>
              <div className="relative">
                <span className="text-sm font-semibold text-[#8ff0d1]">
                  Step {process.step}
                </span>
                <h3 className="mt-5 text-2xl font-bold">{process.title}</h3>
                <p className="mt-4 leading-7 text-white/60">
                  {process.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-[#296589]/40 via-[#06121f] to-[#2f8c74]/30 p-8 text-center shadow-2xl backdrop-blur-md md:p-16">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#2f8c74]/30 blur-[80px]" />

          <div className="relative mx-auto max-w-3xl">
            <Image
              src={zaneIcon}
              alt="Zane Icon"
              className="mx-auto mb-8 h-20 w-20 object-contain"
            />

            <h2 className="text-3xl font-bold md:text-5xl">
              Ready to build your next digital system?
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-8 text-white/65">
              Let’s create a fast, secure, and future-ready IT solution for your
              business.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
  <Link
    href="mailto:reymartdungca.dev@gmail.com"
    className="rounded-full bg-[#2f8c74] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#267762]"
  >
    Email Me
  </Link>

  <Link
    href="https://wa.me/639365160775"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-full border border-white/15 bg-white/10 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/15"
  >
    WhatsApp
  </Link>

  <Link
    href="tel:09365160775"
    className="rounded-full border border-white/15 bg-white/10 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/15"
  >
    Call Now
  </Link>
</div>
          </div>
        </div>
      </section>

      {/* Footer */}
     
<footer className="border-t border-white/10 px-5 py-8 md:px-8">
  <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-sm text-white/45 lg:flex-row">
    <div className="flex items-center gap-3">
      <Image
        src={zaneLogo}
        alt="Zane Logo"
        className="h-8 w-32 object-contain"
      />
    </div>

    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      <Link href="tel:09365160775" className="transition hover:text-white">
        0936 516 0775
      </Link>

      <Link
        href="https://wa.me/639365160775"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-white"
      >
        WhatsApp
      </Link>

      <Link
        href="mailto:reymartdungca.dev@gmail.com"
        className="transition hover:text-white"
      >
        reymartdungca.dev@gmail.com
      </Link>

      <Link
        href="https://www.facebook.com/rymrtdngca"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-white"
      >
        Facebook
      </Link>
    </div>

    <p>
      © {new Date().getFullYear()} ZANE IT Solutions. All rights reserved.
    </p>
  </div>
</footer>
    </main>
  );
}