// components/Users/Home/StatsSection.jsx
import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  Users, Award, Globe, TrendingUp, Clock, CheckCircle, 
  Star, Target, Zap, Heart 
} from 'lucide-react';

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.3 });
  const controls = useAnimation();

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
    hidden: { y: 30, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Animated Counter Hook
  const useCounter = (end, duration = 2000, delay = 0) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (!isInView) return;
      
      const startTime = Date.now() + delay;
      const endTime = startTime + duration;
      
      const timer = setInterval(() => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        if (progress >= 0) {
          setCount(Math.floor(progress * end));
        }
        
        if (now >= endTime) {
          clearInterval(timer);
          setCount(end);
        }
      }, 16);
      
      return () => clearInterval(timer);
    }, [isInView, end, duration, delay]);
    
    return count;
  };

  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      number: 500,
      suffix: "+",
      label: "Successful Placements",
      description: "Remote professionals placed",
      color: "blue",
      bgGradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Award className="w-8 h-8" />,
      number: 150,
      suffix: "+",
      label: "Happy Clients",
      description: "Satisfied business partners",
      color: "green",
      bgGradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      number: 50,
      suffix: "+",
      label: "Countries Served",
      description: "Global reach and presence",
      color: "purple",
      bgGradient: "from-purple-500 to-violet-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      number: 95,
      suffix: "%",
      label: "Client Satisfaction",
      description: "Retention and success rate",
      color: "orange",
      bgGradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      number: 48,
      suffix: "hr",
      label: "Average Response Time",
      description: "Quick turnaround guaranteed",
      color: "teal",
      bgGradient: "from-teal-500 to-cyan-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      number: 99,
      suffix: "%",
      label: "Project Success Rate",
      description: "Delivered on time and budget",
      color: "pink",
      bgGradient: "from-pink-500 to-rose-500"
    }
  ];

  const colorSchemes = {
    blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", shadow: "shadow-blue-200/30" },
    green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-600", shadow: "shadow-green-200/30" },
    purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", shadow: "shadow-purple-200/30" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", shadow: "shadow-orange-200/30" },
    teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-600", shadow: "shadow-teal-200/30" },
    pink: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-600", shadow: "shadow-pink-200/30" }
  };

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-12 lg:mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 rounded-full text-sm font-medium text-blue-700 mb-6"
          >
            <Star className="w-4 h-4 text-blue-500 fill-current" />
            <span>Proven Track Record</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Our Success in
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 ml-3">
              Numbers
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Real results that speak volumes about our commitment to excellence and client satisfaction.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {stats.map((stat, index) => {
            const scheme = colorSchemes[stat.color];
            const count = useCounter(stat.number, 2000, index * 200);
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className={`group relative ${scheme.bg} ${scheme.border} border-2 rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:shadow-2xl ${scheme.shadow} transition-all duration-500 cursor-default overflow-hidden`}
              >
                {/* Background Gradient Animation */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl lg:rounded-3xl`}
                />

                {/* Animated Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.6, type: "spring" }}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    transition: { duration: 0.3 }
                  }}
                  className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.bgGradient} text-white flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 relative z-10`}
                >
                  {stat.icon}
                </motion.div>

                {/* Number with Counter Animation */}
                <div className="text-center relative z-10">
                  <motion.div
                    className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2"
                    key={count}
                  >
                    <motion.span
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {count}
                    </motion.span>
                    <span className={`${scheme.text} ml-1`}>{stat.suffix}</span>
                  </motion.div>
                  
                  <h3 className={`text-lg lg:text-xl font-bold ${scheme.text} mb-2 group-hover:text-gray-900 transition-colors duration-300`}>
                    {stat.label}
                  </h3>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {stat.description}
                  </p>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ 
                    y: [-5, 5, -5],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                  className="absolute top-4 right-4 w-2 h-2 bg-current opacity-20 rounded-full"
                />
                
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3
                  }}
                  className="absolute bottom-4 left-4 w-1 h-1 bg-current opacity-30 rounded-full"
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Section with Client Logos */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 lg:mt-24 text-center"
        >
          <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl lg:rounded-3xl p-8 lg:p-12 shadow-lg">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8"
            >
              Join Our Success Story
            </motion.h3>

            {/* Achievement Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: <CheckCircle className="w-5 h-5 text-green-500" />, text: "ISO Certified", color: "green" },
                { icon: <Star className="w-5 h-5 text-yellow-500 fill-current" />, text: "5-Star Rated", color: "yellow" },
                { icon: <Heart className="w-5 h-5 text-pink-500" />, text: "Client Loved", color: "pink" },
                { icon: <Zap className="w-5 h-5 text-blue-500" />, text: "Fast Delivery", color: "blue" }
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.3 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {badge.icon}
                  <span className="text-gray-700">{badge.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Your Success Story
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-bold rounded-full transition-colors duration-300 bg-white hover:bg-gray-50"
              >
                View Case Studies
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating Achievement Icons */}
        <motion.div
          animate={{ 
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 hidden lg:block"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        <motion.div
          animate={{ 
            y: [10, -10, 10],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-10 hidden lg:block"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
        </motion.div>

        <motion.div
          animate={{ 
            y: [-8, 8, -8],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-1/4 hidden lg:block"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-4 h-4 text-white fill-current" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Trophy component (if not imported)
const Trophy = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

export default StatsSection;