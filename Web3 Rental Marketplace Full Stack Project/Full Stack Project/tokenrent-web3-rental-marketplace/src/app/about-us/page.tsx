"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Globe, Users, BarChart, ShieldCheck, CalendarCheck ,ArrowRight, Twitter, Linkedin, Facebook
  , Github
} from "lucide-react";

const AboutPage = () => {
  const stats = [
    { value: "2025", label: "Established", icon: CalendarCheck },
    { value: "20+", label: "Assets Managed", icon: BarChart },
    { value: "98%", label: "Client Retention", icon: Users },
    { value: "ISO 27001", label: "Certified", icon: ShieldCheck },
  ];

  const timeline = [
    { year: "2025", title: "Founded in 2025 ", description: "Began operations with my self" },
    { year: "2025", title: "Series B Funding", description: "$50M raised to expand platform capabilities" },
    { year: "2025", title: "Global Expansion", description: "Opened EMEA and APAC headquarters" },
    { year: "2025", title: "AI Integration will come", description: "Launched predictive maintenance platform" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                Transforming Asset Management
              </span>
              <br />
              Through Innovation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Global leader in intelligent equipment solutions serving Fortune 500 companies across 30+ industries
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="p-8 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
                <div className="text-gray-600 font-medium">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="relative rounded-2xl overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <Image
                src="/images/con-1.webp"
                alt="Global Operations"
                width={800}
                height={600}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
            </motion.div>

            <motion.div
              className="lg:pl-12"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Global Reach, Local Expertise
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                With operations spanning 15 countries and a network of 500+ partners,
                we deliver tailored equipment solutions that power industries worldwide.
                Our cloud-connected platform manages over $10B in industrial assets.
              </p>
              <div className="flex items-center gap-4">
                <Globe className="w-12 h-12 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">30+</div>
                  <div className="text-gray-600">Countries Served</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Journey of Innovation
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Milestones that define our commitment to progress
            </p>
          </div>

          <div className="relative pl-8 sm:pl-32 before:absolute before:left-0 sm:before:left-1/2 before:h-full before:w-1 before:bg-gray-200">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="relative mb-12 sm:w-1/2 sm:ml-auto sm:pl-16"
                style={{ marginLeft: index % 2 === 0 ? 0 : '50%' }}
              >
                <div className="absolute -left-8 sm:-left-16 top-0 w-16 text-right">
                  <div className="text-2xl font-bold text-blue-600">{item.year}</div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Executive Leadership
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visionary leaders driving operational excellence
            </p>
          </div>

          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 center">
            {[
              { 
                name: "Dr. Sarah Lin",
                role: "CEO & Founder",
                image: "/team/ceo.jpg",
                bio: "20+ years in industrial tech, MIT alum"
              },
            ].map((member) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="relative aspect-square">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50" />
                </div>
                <div className="p-6 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent">
                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  <p className="text-blue-200 mb-2">{member.role}</p>
                  <p className="text-gray-300 text-sm">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div> */}

{/* <div className="flex flex-col items-center justify-center max-w-7xl mx-auto px-4"> */}
{/* <div className="flex justify-center w-full"> */}
  {/* Team Grid */}
  {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full"> */}
  {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full justify-items-center">
   */}
     {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl"> */}
    <div className="flex flex-col items-center gap-12 w-full">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 place-items-center">
    {[
      { 
        name: "Ali Murtaza",
        role: "Software Engineer",
        image: "/images/software-developer.jpg",
        bio: "2+ years in Software Development",
        social: {
          linkedin: "https://www.linkedin.com/in/ali-murtaza-361110246/",
          twitter: "#",
          website: "https://portfolio-website-nine-sigma-96.vercel.app/"
        }
      },
    ].map((member) => (
      <motion.div
        key={member.name}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        // className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden w-72"

      > 


        <div className="relative aspect-square">
          <Image
            src={member.image}
            alt={member.name}
            fill
            // className="object-cover group-hover:scale-105 transition-transform"
            className="object-cover object-center group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50" />
        </div>
        <div className="p-6 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent">
          <h3 className="text-xl font-bold text-white">{member.name}</h3>
          <p className="text-blue-200 mb-2">{member.role}</p>
          <p className="text-gray-300 text-sm">{member.bio}</p>
          {member.social && (
            <div className="flex gap-4 mt-4 text-white/80">
              {member.social.linkedin && (
                <Link href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-5 h-5 hover:text-blue-400 transition-colors" />
                </Link>
              )}
              {member.social.twitter && (
                <Link href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-5 h-5 hover:text-blue-400 transition-colors" />
                </Link>
              )}
              {member.social.website && (
                <Link href={member.social.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-5 h-5 hover:text-blue-400 transition-colors" />
                </Link>
              )}
            </div>
          )}
        </div>
      </motion.div>
    ))}
  </div>
  
  {/* Social Links Section */}
  <div className="flex gap-6 items-center justify-center w-full border-t border-gray-200 pt-8">
    <Link 
      href="https://www.linkedin.com/in/ali-murtaza-361110246/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-blue-600 transition-colors"
    >
      <Linkedin className="w-6 h-6" />
    </Link>
    <Link 
      href="#" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-blue-400 transition-colors"
    >
      <Twitter className="w-6 h-6" />
    </Link>
    <Link 
      href="https://web.facebook.com/profile.php?id=100004742388103" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-blue-800 transition-colors"
    >
      <Facebook className="w-6 h-6" />
    </Link>
    <Link 
      href="https://github.com/alimurtaza8" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-pink-600 transition-colors"
    >
      <Github className="w-6 h-6" />
    </Link>
  </div>
</div>
        
        
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to Optimize Your Operations?
            </h2>
            <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
              Join 1,000+ enterprises transforming their equipment management
            </p>
            <button className="bg-white text-blue-900 px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors font-semibold flex items-center gap-3 mx-auto">
              Schedule Consultation
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;