// components/Users/Home/CTASection.jsx
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  ArrowRight, Phone, Mail, Calendar, Star, Zap, 
  CheckCircle, Users, Clock, Shield, MessageCircle,
  Rocket, Gift, Trophy
} from 'lucide-react';

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const benefits = [
    { icon: <CheckCircle className="w-5 h-5 text-green-400" />, text: "Free 30-minute consultation" },
    { icon: <Clock className="w-5 h-5 text-blue-400" />, text: "24/7 dedicated support" },
    { icon: <Shield className="w-5 h-5 text-purple-400" />, text: "100% satisfaction guarantee" },
    { icon: <Gift className="w-5 h-5 text-pink-400" />, text: "No setup fees for first month" }
  ];

  const ctaOptions = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Schedule Consultation",
      description: "Book a free strategy session",
      action: "Book Now",
      primary: true,
      color: "blue"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us Direct",
      description: "Speak with our HR experts",
      action: "Call Now",
      primary: false,
      color: "green"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Live Chat Support",
      description: "Get instant assistance",
      action: "Chat Now",
      primary: false,
      color: "purple"
    }
  ];

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-3xl"
        />

        {/* Sparkle Effects */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          {/* Main CTA Section */}
          <div className="text-center mb-16">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Rocket className="w-4 h-4 text-blue-400" />
              </motion.div>
              <span>Ready to Get Started?</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6"
            >
              <span className="text-white">Transform Your</span>
              <br />
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '300% 300%'
                }}
              >
                HR Strategy Today
              </motion.span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl lg:text-2xl mb-8 text-slate-300 max-w-3xl mx-auto leading-relaxed"
            >
              Join 500+ companies who've revolutionized their HR operations with our 
              comprehensive remote solutions. Let's build your success story together.
            </motion.p>

            {/* Benefits List */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-4 mb-12 max-w-2xl mx-auto"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-colors duration-300"
                >
                  {benefit.icon}
                  <span>{benefit.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Primary CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  y: -3,
                  boxShadow: "0 25px 50px rgba(59, 130, 246, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group px-10 py-5 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-2xl text-white font-bold text-lg transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: [-100, 300] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
                <Calendar className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Get Free Consultation</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 hover:border-white/50 rounded-2xl text-white font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Phone className="w-6 h-6" />
                <span>Call Now: +1 (555) 123-4567</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Contact Options Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid md:grid-cols-3 gap-6 lg:gap-8"
          >
            {ctaOptions.map((option, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-2xl lg:rounded-3xl p-6 lg:p-8 transition-all duration-500 cursor-pointer overflow-hidden`}
              >
                {/* Background Glow Effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${
                      option.color === 'blue' ? 'rgba(59, 130, 246, 0.1)' :
                      option.color === 'green' ? 'rgba(34, 197, 94, 0.1)' :
                      'rgba(147, 51, 234, 0.1)'
                    } 0%, transparent 70%)`
                  }}
                />

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 ${
                    option.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                    option.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                    'bg-gradient-to-br from-purple-500 to-purple-600'
                  } text-white relative z-10`}
                >
                  {option.icon}
                </motion.div>

                {/* Content */}
                <div className="text-center relative z-10">
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors duration-300">
                    {option.title}
                  </h3>
                  
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    {option.description}
                  </p>

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      option.primary 
                        ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl' 
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30'
                    }`}
                  >
                    <span>{option.action}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-1 h-1 bg-white/20 rounded-full"></div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-center mt-16 lg:mt-20"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl lg:rounded-3xl p-8 lg:p-12 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

              <div className="relative z-10 max-w-3xl mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-4"
                >
                  <Trophy className="w-12 h-12 text-yellow-400" />
                </motion.div>

                <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                  Award-Winning HR Solutions
                </h3>
                <p className="text-slate-300 mb-8 text-lg">
                  Recognized by industry leaders for excellence in remote HR management and client satisfaction.
                </p>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  {[
                    { icon: <Users className="w-5 h-5 text-blue-400" />, text: "500+ Companies Trust Us" },
                    { icon: <Star className="w-5 h-5 text-yellow-400 fill-current" />, text: "4.9/5 Client Rating" },
                    { icon: <Shield className="w-5 h-5 text-green-400" />, text: "ISO 27001 Certified" },
                    { icon: <Zap className="w-5 h-5 text-purple-400" />, text: "24/7 Premium Support" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      {item.icon}
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Final CTA */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                  className="text-slate-400 text-sm"
                >
                  🚀 Ready to join the future of HR management? 
                  <span className="text-blue-400 font-semibold ml-2">Let's start your transformation today!</span>
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;