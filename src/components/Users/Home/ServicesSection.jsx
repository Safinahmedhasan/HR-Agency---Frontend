// components/Users/Home/ServicesSection.jsx
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Search, Users, FileText, BarChart3, GraduationCap, Heart,
  Shield, UserCheck, Database, Award, Zap, ArrowRight, Star,
  CheckCircle, TrendingUp, Globe
} from 'lucide-react';

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const services = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Recruitment & Talent Acquisition",
      description: "End-to-end hiring solutions from job posting to onboarding with AI-powered matching.",
      features: ["Job Posting & Advertising", "Resume Screening", "Virtual Interviews", "ATS Management"],
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
      borderColor: "border-blue-200",
      hoverShadow: "hover:shadow-blue-200/50",
      accent: "text-blue-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Onboarding & Offboarding",
      description: "Seamless employee lifecycle management with digital workflows and documentation.",
      features: ["Digital Onboarding Kits", "Virtual Orientations", "Exit Interviews", "Process Automation"],
      bgGradient: "from-green-50 to-green-100",
      iconBg: "bg-green-500",
      borderColor: "border-green-200",
      hoverShadow: "hover:shadow-green-200/50",
      accent: "text-green-600"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Payroll & HRIS Management",
      description: "Complete payroll processing and HR information system management and optimization.",
      features: ["Payroll Processing", "HRIS Setup", "Attendance Tracking", "Salary Sheet Prep"],
      bgGradient: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-500",
      borderColor: "border-purple-200",
      hoverShadow: "hover:shadow-purple-200/50",
      accent: "text-purple-600"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "HR Policy & Documentation",
      description: "Comprehensive policy development and employee handbook creation for compliance.",
      features: ["Policy Creation", "Employee Handbooks", "Remote Work Policies", "Compliance Docs"],
      bgGradient: "from-orange-50 to-orange-100",
      iconBg: "bg-orange-500",
      borderColor: "border-orange-200",
      hoverShadow: "hover:shadow-orange-200/50",
      accent: "text-orange-600"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Performance Management",
      description: "Data-driven performance tracking with KPIs, OKRs, and 360-degree feedback systems.",
      features: ["KPI & OKR Setup", "Performance Reviews", "360° Feedback", "Evaluation Templates"],
      bgGradient: "from-red-50 to-red-100",
      iconBg: "bg-red-500",
      borderColor: "border-red-200",
      hoverShadow: "hover:shadow-red-200/50",
      accent: "text-red-600"
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Training & Development",
      description: "Custom learning programs and skill development initiatives for team growth.",
      features: ["E-Learning Materials", "Virtual Workshops", "LMS Setup", "Skill Assessment"],
      bgGradient: "from-indigo-50 to-indigo-100",
      iconBg: "bg-indigo-500",
      borderColor: "border-indigo-200",
      hoverShadow: "hover:shadow-indigo-200/50",
      accent: "text-indigo-600"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Employee Engagement",
      description: "Boost retention with engagement surveys, recognition programs, and team activities.",
      features: ["Engagement Surveys", "Recognition Programs", "Team Building", "Retention Strategy"],
      bgGradient: "from-pink-50 to-pink-100",
      iconBg: "bg-pink-500",
      borderColor: "border-pink-200",
      hoverShadow: "hover:shadow-pink-200/50",
      accent: "text-pink-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "HR Compliance & Auditing",
      description: "Ensure legal compliance with labor laws, contracts, and industry regulations.",
      features: ["Compliance Checklists", "Contract Review", "Labor Law Updates", "GDPR/HIPAA"],
      bgGradient: "from-teal-50 to-teal-100",
      iconBg: "bg-teal-500",
      borderColor: "border-teal-200",
      hoverShadow: "hover:shadow-teal-200/50",
      accent: "text-teal-600"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Remote Workforce Management",
      description: "Specialized solutions for managing global remote teams and freelance workforce.",
      features: ["Freelancer Onboarding", "Global Payments", "Time Tracking", "Virtual SOPs"],
      bgGradient: "from-cyan-50 to-cyan-100",
      iconBg: "bg-cyan-500",
      borderColor: "border-cyan-200",
      hoverShadow: "hover:shadow-cyan-200/50",
      accent: "text-cyan-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "HR Analytics & Reporting",
      description: "Data-driven insights with comprehensive dashboards and strategic HR metrics.",
      features: ["Data Dashboards", "Turnover Reports", "Productivity Analysis", "HR Metrics"],
      bgGradient: "from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-500",
      borderColor: "border-emerald-200",
      hoverShadow: "hover:shadow-emerald-200/50",
      accent: "text-emerald-600"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Strategic HR Consulting",
      description: "Expert guidance for organizational development and human capital optimization.",
      features: ["Strategy Development", "Change Management", "Culture Design", "Leadership Coaching"],
      bgGradient: "from-violet-50 to-violet-100",
      iconBg: "bg-violet-500",
      borderColor: "border-violet-200",
      hoverShadow: "hover:shadow-violet-200/50",
      accent: "text-violet-600"
    }
  ];

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16 lg:mb-24"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 rounded-full text-sm font-medium text-blue-700 mb-6"
          >
            <Star className="w-4 h-4 text-blue-500 fill-current" />
            <span>11+ Comprehensive HR Services</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
          >
            <span className="text-gray-800">Complete</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Remote HR Solutions
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            From talent acquisition to performance management — we provide end-to-end HR services 
            designed for modern remote and hybrid organizations.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className={`group relative bg-gradient-to-br ${service.bgGradient} border-2 ${service.borderColor} rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:shadow-2xl ${service.hoverShadow} transition-all duration-500 cursor-pointer overflow-hidden`}
            >
              {/* Hover Effect Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />

              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`${service.iconBg} text-white p-3 rounded-xl mb-6 w-fit shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
              >
                {service.icon}
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className={`text-xl lg:text-2xl font-bold ${service.accent} mb-4 group-hover:text-gray-900 transition-colors duration-300`}>
                  {service.title}
                </h3>
                
                <p className="text-gray-700 mb-6 leading-relaxed text-sm lg:text-base">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 group/btn shadow-sm hover:shadow-md`}
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </div>

              {/* Corner Decoration */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-current opacity-20 rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-current opacity-30 rounded-full"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center mt-16 lg:mt-24"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl lg:rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-4 right-4 w-16 h-16 border border-white/20 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-4 left-4 w-12 h-12 border border-white/10 rounded-full"
            />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Transform Your HR Operations?
              </h3>
              <p className="text-lg lg:text-xl text-blue-100 mb-8">
                Get a free consultation and discover how our remote HR solutions can streamline your business.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-50 transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Get Free Consultation</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>View Pricing</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;