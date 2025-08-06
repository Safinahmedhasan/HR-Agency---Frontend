// components/Users/Home/WhyChooseUs.jsx - FIXED VERSION
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shield,
  Lightbulb,
  Award,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Star,
  Zap,
  Globe,
  Heart,
  Target,
} from "lucide-react";

const WhyChooseUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardHoverVariants = {
    hover: {
      y: -10,
      scale: 1.03,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const reasons = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Dedicated Partnership",
      description:
        "We work closely with you to understand your unique needs and deliver tailored HR solutions that align with your business goals.",
      highlight: "24/7 Support",
      color: "blue",
      stats: "500+ Happy Clients",
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovative Solutions",
      description:
        "Leveraging the latest HR technology, AI-powered tools, and modern strategies to deliver optimal outcomes for your organization.",
      highlight: "AI-Powered",
      color: "green",
      stats: "95% Success Rate",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Proven Expertise",
      description:
        "Our team comprises seasoned HR professionals with extensive industry knowledge and certifications in modern HR practices.",
      highlight: "Certified Experts",
      color: "purple",
      stats: "10+ Years Experience",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Cost-Effective Results",
      description:
        "Achieve significant ROI through efficient, impactful HR services that reduce overhead costs while improving employee satisfaction.",
      highlight: "ROI Focused",
      color: "orange",
      stats: "60% Cost Reduction",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Remote Expertise",
      description:
        "Specialized in managing distributed teams across different time zones, cultures, and regulations with seamless coordination.",
      highlight: "50+ Countries",
      color: "cyan",
      stats: "Remote-First Approach",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Rapid Implementation",
      description:
        "Quick deployment of HR solutions with minimal disruption to your operations. Get up and running within days, not months.",
      highlight: "Fast Setup",
      color: "red",
      stats: "48hr Implementation",
    },
  ];

  const colorSchemes = {
    blue: {
      bg: "from-blue-50 to-blue-100",
      icon: "bg-blue-500",
      text: "text-blue-600",
      border: "border-blue-200",
      shadow: "shadow-blue-200/30",
      highlight: "bg-blue-500/10 text-blue-700 border-blue-300",
    },
    green: {
      bg: "from-green-50 to-green-100",
      icon: "bg-green-500",
      text: "text-green-600",
      border: "border-green-200",
      shadow: "shadow-green-200/30",
      highlight: "bg-green-500/10 text-green-700 border-green-300",
    },
    purple: {
      bg: "from-purple-50 to-purple-100",
      icon: "bg-purple-500",
      text: "text-purple-600",
      border: "border-purple-200",
      shadow: "shadow-purple-200/30",
      highlight: "bg-purple-500/10 text-purple-700 border-purple-300",
    },
    orange: {
      bg: "from-orange-50 to-orange-100",
      icon: "bg-orange-500",
      text: "text-orange-600",
      border: "border-orange-200",
      shadow: "shadow-orange-200/30",
      highlight: "bg-orange-500/10 text-orange-700 border-orange-300",
    },
    cyan: {
      bg: "from-cyan-50 to-cyan-100",
      icon: "bg-cyan-500",
      text: "text-cyan-600",
      border: "border-cyan-200",
      shadow: "shadow-cyan-200/30",
      highlight: "bg-cyan-500/10 text-cyan-700 border-cyan-300",
    },
    red: {
      bg: "from-red-50 to-red-100",
      icon: "bg-red-500",
      text: "text-red-600",
      border: "border-red-200",
      shadow: "shadow-red-200/30",
      highlight: "bg-red-500/10 text-red-700 border-red-300",
    },
  };

  return (
    <section
      ref={ref}
      className="py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl"
        />
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </motion.div>
            <span>Why Leading Companies Choose Us</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="text-white">Why Choose</span>
            <br />
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "300% 300%",
              }}
            >
              Alam HR Agency?
            </motion.span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            We combine cutting-edge technology with human expertise to deliver
            exceptional HR solutions that drive business growth and employee
            satisfaction.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16"
        >
          {reasons.map((reason, index) => {
            const scheme = colorSchemes[reason.color];
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={cardHoverVariants.hover}
                className="group relative"
              >
                <div
                  className={`h-full bg-gradient-to-br ${scheme.bg} border-2 ${scheme.border} rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:shadow-2xl ${scheme.shadow} transition-all duration-500 overflow-hidden`}
                >
                  {/* Background Pattern */}
                  <motion.div
                    className="absolute inset-0 opacity-5"
                    animate={{
                      backgroundPosition: ["0px 0px", "60px 60px"],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, currentColor 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* Icon with Animation */}
                  <motion.div
                    whileHover={{
                      scale: 1.2,
                      rotate: 360,
                      transition: { duration: 0.6 },
                    }}
                    className={`${scheme.icon} text-white p-4 rounded-2xl mb-6 w-fit shadow-lg relative z-10`}
                  >
                    {reason.icon}
                  </motion.div>

                  {/* Highlight Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                    className={`inline-flex items-center gap-1 px-3 py-1 ${scheme.highlight} border rounded-full text-xs font-semibold mb-4`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>{reason.highlight}</span>
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3
                      className={`text-xl lg:text-2xl font-bold ${scheme.text} mb-4 group-hover:text-gray-900 transition-colors duration-300`}
                    >
                      {reason.title}
                    </h3>

                    <p className="text-gray-700 mb-6 leading-relaxed text-sm lg:text-base">
                      {reason.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between">
                      <div className={`text-sm font-semibold ${scheme.text}`}>
                        {reason.stats}
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center gap-1"
                      >
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 text-yellow-400 fill-current"
                          />
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl lg:rounded-3xl p-8 lg:p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

            <div className="relative z-10">
              <h3 className="text-2xl lg:text-3xl font-bold mb-8 text-center">
                Trusted by Industry Leaders
              </h3>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                {[
                  {
                    number: "500+",
                    label: "Successful Projects",
                    icon: <CheckCircle className="w-6 h-6 text-green-400" />,
                  },
                  {
                    number: "150+",
                    label: "Global Clients",
                    icon: <Users className="w-6 h-6 text-blue-400" />,
                  },
                  {
                    number: "50+",
                    label: "Countries Served",
                    icon: <Globe className="w-6 h-6 text-purple-400" />,
                  },
                  {
                    number: "99%",
                    label: "Client Retention",
                    icon: <Heart className="w-6 h-6 text-pink-400" />,
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center group cursor-default"
                  >
                    <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Testimonial Quote */}
              <motion.blockquote
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="text-lg lg:text-xl text-slate-300 italic text-center max-w-2xl mx-auto"
              >
                "Alam HR Agency transformed our remote workforce management
                completely. Their expertise and dedication to our success is
                unmatched."
                <footer className="mt-4 text-sm text-slate-400">
                  — Sarah Johnson, CEO at TechGlobal Inc.
                </footer>
              </motion.blockquote>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
