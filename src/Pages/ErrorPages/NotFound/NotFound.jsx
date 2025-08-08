// Pages/ErrorPages/NotFound/NotFound.jsx - Funny Animated 404 Page
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  Search,
  Coffee,
  Bug,
  Zap,
  Heart,
  Star,
  Rocket,
  Ghost,
} from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isGhostVisible, setIsGhostVisible] = useState(true);

  // Funny messages that rotate
  const funnyMessages = [
    "🕵️ Oops! Even our best detectives couldn't find this page!",
    "🚀 This page went to space and forgot to come back!",
    "🎯 404: Target not found! Maybe it's playing hide and seek?",
    "🏃‍♂️ This page is probably stuck in traffic somewhere...",
    "🎪 Welcome to the 404 circus! The page you want is the disappearing act!",
    "🧙‍♂️ Abracadabra! *waves wand* Still can't make your page appear!",
  ];

  // Auto-rotate funny messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % funnyMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Toggle ghost visibility for fun interaction
  useEffect(() => {
    const interval = setInterval(() => {
      setIsGhostVisible((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const bounceVariants = {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Stars */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Floating Clouds */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute w-20 h-12 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
            }}
            animate={{
              x: [-50, 50, -50],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto px-4 text-center"
      >
        {/* Ghost Character */}
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="mb-8 relative"
        >
          <AnimatePresence>
            {isGhostVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="text-8xl mb-4"
              >
                👻
              </motion.div>
            )}
          </AnimatePresence>

          {!isGhostVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center"
            >
              <Ghost className="h-16 w-16 text-white" />
            </motion.div>
          )}
        </motion.div>

        {/* 404 Title */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.h1
            className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 mb-4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "300% 300%",
            }}
          >
            404
          </motion.h1>

          <motion.h2
            variants={bounceVariants}
            animate="animate"
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Page Not Found!
          </motion.h2>
        </motion.div>

        {/* Rotating Funny Messages */}
        <motion.div variants={itemVariants} className="mb-8 h-16">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto"
            >
              {funnyMessages[currentMessage]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Fun Icons */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex justify-center space-x-4 mb-6">
            {[Coffee, Bug, Zap, Heart, Star, Rocket].map((Icon, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.3, rotate: 360 }}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
              >
                <Icon className="h-6 w-6 text-white" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center"
        >
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <Home className="h-5 w-5" />
            Take Me Home
          </motion.button>

          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </motion.button>
        </motion.div>

        {/* Fun Footer */}
        <motion.div variants={itemVariants} className="mt-12 text-center">
          <motion.p
            animate={{
              color: [
                "#a855f7",
                "#ec4899",
                "#f59e0b",
                "#10b981",
                "#3b82f6",
                "#a855f7",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            className="text-sm font-medium"
          >
            Don't worry, even the best explorers get lost sometimes! 🗺️
          </motion.p>

          <motion.div
            className="mt-4 text-xs text-blue-300"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔍 Error Code: 404 | Page Missing | Status: Probably Having Coffee
            ☕
          </motion.div>
        </motion.div>

        {/* Easter Egg - Konami Code */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-4 right-4 text-xs text-white/50"
        >
          🎮 Try: ↑↑↓↓←→←→BA
        </motion.div>
      </motion.div>

      {/* Background Gradient Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))",
            "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(16,185,129,0.2))",
            "linear-gradient(225deg, rgba(245,158,11,0.2), rgba(239,68,68,0.2))",
            "linear-gradient(315deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
    </div>
  );
};

export default NotFound;
