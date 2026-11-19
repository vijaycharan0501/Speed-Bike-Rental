import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Headset,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function AboutPage() {
  useDocumentTitle(
    'About Us',
    'Learn about Speed Bike Rental in Vijayawada, our verified fleet, rental process, and direct WhatsApp customer support.'
  );
  const { settings } = useSettings();

  const whyChoosePoints = [
    { title: 'Multiple Bike Options', desc: 'Selection of trusted models including Activa, Jupiter, Pulsar, FZ, and Glamour.' },
    { title: 'Convenient Daily Rental Plans', desc: 'Transparent daily pricing with generous included distance starting at ₹399/day.' },
    { title: 'Selected Weekly Rental Plans', desc: 'Discounted multi-day and weekly rates available for long-term city and commuter travel.' },
    { title: 'Clearly Displayed Rental Prices', desc: 'No hidden surcharges. Clear upfront daily and weekly rates with included distance limits.' },
    { title: 'Easy Booking Process', desc: 'Browse our fleet, select your dates, and submit your request in under a minute.' },
    { title: 'Direct WhatsApp Enquiries', desc: 'Fast, direct communication with the business owner on WhatsApp for quick coordination.' },
    { title: 'Convenient Vijayawada Location', desc: 'Accessible hub at Hotel SNR Twilight, Gandhi Nagar, near prime transit hubs.' },
  ];

  const rentalSteps = [
    { step: '01', title: 'Explore Available Bikes', desc: 'Browse our verified fleet of scooters and motorcycles.' },
    { step: '02', title: 'Select Preferred Motorcycle', desc: 'Choose the bike that matches your journey, comfort, and luggage needs.' },
    { step: '03', title: 'Check Pricing & Distance', desc: 'Review transparent daily or weekly pricing and included KM allowances.' },
    { step: '04', title: 'Submit Booking Enquiry', desc: 'Enter your name, contact details, pickup date, and trip duration.' },
    { step: '05', title: 'Connect on WhatsApp', desc: 'Our owner connects directly via WhatsApp with your prefilled details.' },
    { step: '06', title: 'Confirm & Ride Out', desc: 'Verify vehicle availability, complete quick handover, and start your journey.' },
  ];

  return (
    <div className="pb-16">
      {/* Dark Hero Header */}
      <section className="bg-brand-black py-14 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.22em] text-brand-yellow">
            <Sparkles className="h-3.5 w-3.5" />
            Who We Are
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            About Speed Bike Rental
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/80 sm:text-lg">
            Speed Bike Rental is a bike rental service based in Vijayawada, Andhra Pradesh, providing
            convenient two-wheeler rental options for customers who need flexible and affordable
            transportation.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-12 sm:px-6 lg:px-8">
        {/* Core Business Overview */}
        <section className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-4 text-base leading-relaxed text-brand-muted lg:col-span-7">
            <h2 className="text-2xl font-extrabold text-brand-black sm:text-3xl">
              Flexible & Affordable Two-Wheeler Rentals
            </h2>
            <p>
              We offer a selection of motorcycles and Bobber bikes, including <strong className="text-brand-black">Bobber, Pulsar, FZ, Activa and Jupiter</strong>, to suit different travel requirements.
            </p>
            <p>
              Whether customers need a bike for daily transportation, personal work, local travel or short trips, our rental service provides daily and selected weekly rental plans.
            </p>
            <p className="rounded-xl border-l-4 border-brand-yellow bg-brand-grey p-4 font-medium text-brand-black">
              Our goal is to make bike rentals simple, convenient and accessible for everyone in Vijayawada.
            </p>
            <div className="pt-2">
              <Link to="/bikes" className="btn-primary inline-flex">
                Explore Our Bikes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-black p-2 shadow-card lg:col-span-5">
            <img
              src="/demo/bike-bobber.jpg"
              alt="Speed Bike Rental Bobber Motorcycle in Vijayawada"
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          </div>
        </section>

        {/* Why Choose Speed Bike Rental */}
        <section className="rounded-3xl bg-[#0D0E12] p-6 text-white sm:p-10 lg:p-12">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow">
              The Speed Advantage
            </span>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl lg:text-4xl">
              Why Choose Speed Bike Rental?
            </h2>
            <p className="mt-2 text-sm text-white/70 sm:text-base">
              Clear commitments and honest services built around customer convenience in Vijayawada.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {whyChoosePoints.map((pt, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#16181F] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand-yellow/50"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-black text-brand-yellow border border-brand-yellow/30">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-white">{pt.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/70">{pt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How Our Rental Process Works */}
        <section>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
              Step-by-Step Guide
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-brand-black sm:text-3xl lg:text-4xl">
              How Our Rental Process Works
            </h2>
            <p className="mt-2 text-sm text-brand-muted sm:text-base">
              Renting a bike with us is quick, straightforward, and paperless.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rentalSteps.map((s) => (
              <div
                key={s.step}
                className="card p-6 relative overflow-hidden group hover:border-brand-black transition"
              >
                <span className="font-display text-3xl font-extrabold text-brand-yellow/70 group-hover:text-brand-yellow transition">
                  {s.step}
                </span>
                <h3 className="mt-3 text-base font-bold text-brand-black">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-brand-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Location & Hub Details */}
        <section className="card p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-12 items-center">
            <div className="space-y-3 lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-yellow-hover">
                <MapPin className="h-4 w-4" />
                Physical Showroom & Rental Hub
              </div>
              <h2 className="text-2xl font-extrabold text-brand-black sm:text-3xl">
                Visit Us at Hotel SNR Twilight, Vijayawada
              </h2>
              <p className="text-sm leading-relaxed text-brand-muted">
                Hotel SNR Twilight, Narravari St, Opp. Building, Gandhi Nagar, Vijayawada, Andhra Pradesh 520003, India.
              </p>
              <p className="text-xs text-brand-muted">
                Operating Hours: {settings.operatingHours || 'Mon–Sun: 7:00 AM – 10:00 PM'}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
              <a
                href={settings.mapLinkUrl || 'https://maps.app.goo.gl/DDHHmSEPxHrd5YCLA'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary justify-center"
              >
                Open in Google Maps
              </a>
              <Link to="/bikes" className="btn-primary justify-center">
                Explore Bikes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
