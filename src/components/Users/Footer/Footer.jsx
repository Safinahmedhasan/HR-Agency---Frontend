// components/Users/Shared/Footer.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Heart,
  Star,
  Shield,
  Award,
  Users,
} from "lucide-react";
import cacheManager, { CACHE_KEYS } from "../../../utils/acheManager";

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const cachedSettings = cacheManager.get(CACHE_KEYS.SITE_SETTINGS, {
        storage: "localStorage",
      });
      if (cachedSettings) {
        return cachedSettings;
      }
    } catch (error) {
      console.error("Cache read error:", error);
    }
    return null;
  });

  const API_BASE_URL = import.meta.env.VITE_DataHost;

  const fetchSiteSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/site-settings/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const settings = data.data.settings;
          setSiteSettings(settings);

          cacheManager.set(CACHE_KEYS.SITE_SETTINGS, settings, {
            storage: "localStorage",
            expiry: 10 * 60 * 1000,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch site settings:", error);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchSiteSettings();
  }, [fetchSiteSettings]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const services = [
    "Recruitment & Talent Acquisition",
    "Onboarding & Offboarding",
    "Payroll & HRIS Management",
    "HR Policy & Documentation",
    "Performance Management",
    "Training & Development",
  ];

  const quickLinks = [
    "About Us",
    "Our Services",
    "Case Studies",
    "Pricing",
    "Contact Us",
    "Career Opportunities",
  ];

  const resources = [
    "HR Blog",
    "Compliance Guide",
    "Templates & Tools",
    "Webinars",
    "Industry Reports",
    "Help Center",
  ];

  const socialLinks = [
    {
      icon: <Facebook className="w-5 h-5" />,
      href: "#",
      label: "Facebook",
      color: "hover:text-blue-500",
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      href: "#",
      label: "Twitter",
      color: "hover:text-sky-500",
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      href: "#",
      label: "LinkedIn",
      color: "hover:text-blue-600",
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      href: "#",
      label: "Instagram",
      color: "hover:text-pink-500",
    },
    {
      icon: <Youtube className="w-5 h-5" />,
      href: "#",
      label: "YouTube",
      color: "hover:text-red-500",
    },
  ];

  const trustIndicators = [
    {
      icon: <Shield className="w-5 h-5 text-green-400" />,
      text: "ISO 27001 Certified",
    },
    {
      icon: <Award className="w-5 h-5 text-yellow-400" />,
      text: "Industry Award Winner",
    },
    {
      icon: <Users className="w-5 h-5 text-blue-400" />,
      text: "500+ Happy Clients",
    },
    {
      icon: <Star className="w-5 h-5 text-purple-400 fill-current" />,
      text: "4.9/5 Client Rating",
    },
  ];

  if (!siteSettings) {
    return null;
  }

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, threshold: 0.1 }}
          variants={containerVariants}
          className="py-16 border-b border-white/10"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h3
              variants={itemVariants}
              className="text-3xl lg:text-4xl font-bold mb-4"
            >
              Stay Updated with HR Insights
            </motion.h3>
            <motion.p
              variants={itemVariants}
              className="text-lg text-slate-300 mb-8"
            >
              Get the latest HR trends, compliance updates, and expert tips
              delivered to your inbox.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, threshold: 0.1 }}
          variants={containerVariants}
          className="py-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <motion.h4
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
              >
                {siteSettings.siteName}
              </motion.h4>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Your trusted partner for comprehensive remote HR solutions. We
                help companies build stronger, more efficient workforces through
                innovative technology and expert guidance.
              </p>

              <div className="space-y-3 mb-6">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>+1 (555) 123-4567</span>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>hello@alamhragency.com</span>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>123 Business Ave, Suite 100, New York, NY 10001</span>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Mon-Fri: 9AM-6PM EST</span>
                </motion.div>
              </div>

              <div className="flex items-center gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-slate-300 ${social.color} transition-all duration-300 hover:bg-white/20 hover:border-white/30`}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h5 className="text-lg font-bold mb-6 text-white">
                Our Services
              </h5>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href="#"
                      className="text-slate-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span>{service}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h5 className="text-lg font-bold mb-6 text-white">Quick Links</h5>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href="#"
                      className="text-slate-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span>{link}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h5 className="text-lg font-bold mb-6 text-white">Resources</h5>
              <ul className="space-y-3">
                {resources.map((resource, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href="#"
                      className="text-slate-300 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span>{resource}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8">
                <h6 className="text-sm font-semibold mb-4 text-slate-200">
                  Why Trust Us
                </h6>
                <div className="space-y-2">
                  {trustIndicators.map((indicator, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors duration-300"
                    >
                      {indicator.icon}
                      <span>{indicator.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, threshold: 0.1 }}
          variants={containerVariants}
          className="py-8 border-t border-white/10"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 text-sm text-slate-400"
            >
              <span>
                {siteSettings.footerName}. Developed
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-red-400 fill-current" />
              </motion.div>
              <span>by</span>
              <motion.a
                href="https://safinahmedhasan.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-all duration-300 hover:underline"
              >
                Safin Ahmed Hasan
              </motion.a>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-6"
            >
              {[
                "Privacy Policy",
                "Terms of Service",
                "Cookie Policy",
                "GDPR Compliance",
              ].map((link, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ y: -2 }}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
                >
                  {link}
                </motion.a>
              ))}
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowRight className="w-4 h-4 transform -rotate-90 text-white" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
