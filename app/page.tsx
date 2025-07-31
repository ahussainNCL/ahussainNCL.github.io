'use client'

import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { Github, Music, Code, ExternalLink, Play, Pause, SkipForward, SkipBack, Volume2, Star, GitFork, Menu, X } from 'lucide-react'
import { repositoriesAtom } from '@/lib/store'
import { fetchRepositories } from '@/lib/github'
import { ProjectCarousel } from '@/components/project-carousel'
import { MusicPlayer } from '@/components/music-player'
import { SearchFilter } from '@/components/search-filter'
import { getProjectIcon, generateThumbnailDesign } from '@/lib/utils'

export default function Home() {
  const [repositories, setRepositories] = useAtom(repositoriesAtom)
  const [nowPlayingProject, setNowPlayingProject] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalTime] = useState(180) // 3 minutes
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Refs for scroll animations
  const heroRef = useRef(null)
  const projectsRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })
  const isProjectsInView = useInView(projectsRef, { once: true })
  
  // Mouse tracking for parallax effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 })

  // Mouse movement tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const x = (clientX / window.innerWidth - 0.5) * 2
      const y = (clientY / window.innerHeight - 0.5) * 2
      
      setMousePosition({ x, y })
      mouseX.set(x * 20)
      mouseY.set(y * 20)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  useEffect(() => {
    const loadRepositories = async () => {
      if (repositories.length === 0) {
        const repos = await fetchRepositories()
        setRepositories(repos)
        // Set initial now playing project
        if (repos.length > 0) {
          setNowPlayingProject(repos[0])
        }
      }
    }
    loadRepositories()
  }, [repositories.length, setRepositories])

  // Auto-advance timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalTime) {
            // Auto-advance to next project
            const currentIndex = repositories.findIndex(repo => repo.id === nowPlayingProject?.id)
            const nextIndex = (currentIndex + 1) % repositories.length
            setNowPlayingProject(repositories[nextIndex])
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, totalTime, repositories, nowPlayingProject])

  const handleProjectClick = (project: any) => {
    setNowPlayingProject(project)
    setCurrentTime(0)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const nextProject = () => {
    const currentIndex = repositories.findIndex(repo => repo.id === nowPlayingProject?.id)
    const nextIndex = (currentIndex + 1) % repositories.length
    setNowPlayingProject(repositories[nextIndex])
    setCurrentTime(0)
  }

  const prevProject = () => {
    const currentIndex = repositories.findIndex(repo => repo.id === nowPlayingProject?.id)
    const prevIndex = currentIndex === 0 ? repositories.length - 1 : currentIndex - 1
    setNowPlayingProject(repositories[prevIndex])
    setCurrentTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (currentTime / totalTime) * 100

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  }

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-red-500/10 to-cyan-500/10 rounded-full blur-3xl"
          style={{ x: springX, y: springY }}
          variants={floatingVariants}
          animate="float"
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
          style={{ x: springX, y: springY }}
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-500/8 to-yellow-500/8 rounded-full blur-3xl"
          style={{ x: springX, y: springY }}
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 2 }}
        />
      </div>

      <div className="relative z-10">
        {/* Navigation Bar */}
        <motion.nav 
          className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl backdrop-blur-xl bg-black/30 border border-white/10 px-6 py-3">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <span className="font-semibold text-white hidden md:block">Abdullah Hussain</span>
                </motion.div>
                
                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                  <motion.a 
                    href="#home"
                    className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Home
                  </motion.a>
                  <motion.a 
                    href="#projects"
                    className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Projects
                  </motion.a>
                  <motion.a 
                    href="#about"
                    className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    About
                  </motion.a>
                  <motion.a 
                    href="#contact"
                    className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Contact
                  </motion.a>
                </div>
                
                {/* Desktop CTA Button */}
                <motion.button
                  className="hidden md:block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get in Touch
                </motion.button>
                
                {/* Mobile Menu Button */}
                <motion.button
                  className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-white" />
                  ) : (
                    <Menu className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden mt-2 rounded-2xl backdrop-blur-xl bg-black/30 border border-white/10 px-6 py-4 overflow-hidden"
              >
                <div className="flex flex-col gap-4">
                  <a 
                    href="#home"
                    className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </a>
                  <a 
                    href="#projects"
                    className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Projects
                  </a>
                  <a 
                    href="#about"
                    className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </a>
                  <a 
                    href="#contact"
                    className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </a>
                  <button
                    className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
                  >
                    Get in Touch
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
        
        <div className="px-6 py-12 pt-24">
          {/* Enhanced Header */}
        <motion.div 
          ref={heroRef}
          variants={itemVariants}
          className="mb-16 text-center relative"
          id="home"
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              className="w-[600px] h-[600px] rounded-full"
              animate={{
                background: [
                  "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <span className="px-4 py-1.5 text-xs font-medium text-gray-400 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700/50">
              Available for hire
            </span>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-8xl font-black mb-8 relative"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={isHeroInView ? { scale: 1, opacity: 1 } : {}}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.2
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
          >
            <motion.span 
              className="bg-gradient-to-br from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Abdullah
            </motion.span>
            <br />
            <motion.span 
              className="bg-gradient-to-br from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Hussain
            </motion.span>
          </motion.h1>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={isHeroInView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-4"
          >
            <motion.p 
              className="text-2xl md:text-3xl text-gray-300 font-light tracking-wide"
              whileHover={{ scale: 1.02, color: "#ffffff" }}
              transition={{ duration: 0.2 }}
            >
              Creative Developer & AI Innovator
            </motion.p>
            <motion.div 
              className="flex items-center justify-center gap-6 text-gray-400"
              initial={{ opacity: 0 }}
              animate={isHeroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <span className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Newcastle University
              </span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Building Tomorrow's Technology
              </span>
            </motion.div>
            
            {/* Social links */}
            <motion.div 
              className="flex items-center justify-center gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <a 
                href="https://github.com/ahussainNCL" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-200 hover:scale-110"
              >
                <Github className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </a>
              <button className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-cyan-500/25">
                View Projects
              </button>
              <button className="px-6 py-3 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-400 font-medium hover:bg-gray-700/50 hover:border-gray-600/50 hover:text-white transition-all duration-200 hover:scale-105">
                Contact Me
              </button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Project Showcase */}
        <motion.div 
          ref={projectsRef}
          className="max-w-7xl mx-auto"
          variants={itemVariants}
          id="projects"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isProjectsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-12"
          >
            <motion.h2 
              className="text-3xl font-bold text-white mb-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              Featured Projects
            </motion.h2>
            <motion.p 
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={isProjectsInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              Explore my latest work and innovations
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate={isProjectsInView ? "visible" : "hidden"}
          >
            {repositories.map((repo, index) => {
              const gradients = [
                'from-cyan-600 via-blue-600 to-purple-600',
                'from-green-600 via-emerald-600 to-teal-600', 
                'from-purple-600 via-pink-600 to-rose-600',
                'from-orange-600 via-red-600 to-pink-600',
                'from-yellow-600 via-orange-600 to-red-600',
                'from-indigo-600 via-purple-600 to-pink-600'
              ];

              const gradient = gradients[index % gradients.length];
              const projectIcon = getProjectIcon(repo.name, repo.description);

              return (
                <motion.div 
                  key={repo.id}
                  variants={itemVariants}
                  whileHover={{ 
                    y: -8,
                    transition: { 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 20 
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative"
                  onClick={() => handleProjectClick(repo)}
                >
                  {/* Card background with glassmorphism */}
                  <div className={`relative rounded-2xl p-6 backdrop-blur-xl transition-all duration-500 overflow-hidden ${
                    nowPlayingProject?.id === repo.id 
                      ? 'bg-white/10 border-2 border-green-400/50 shadow-xl shadow-green-400/10' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}>
                    {/* Gradient overlay on hover */}
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    />
                    
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div 
                        className="w-full h-full"
                        style={{
                          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                          backgroundSize: '30px 30px'
                        }}
                      />
                    </div>
                    
                    <div className="relative z-10">
                      {/* Project icon */}
                      <motion.div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 relative overflow-hidden"
                        whileHover={{ 
                          scale: 1.1, 
                          rotate: 5,
                          transition: { 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 10 
                          }
                        }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
                        <div className="absolute inset-0 backdrop-blur-sm bg-white/5" />
                        <span className="text-2xl z-10">
                          {projectIcon.icon}
                        </span>
                      </motion.div>
                      
                      {/* Project name */}
                      <motion.h3 
                        className="text-xl font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300"
                      >
                        {repo.name.replace(/-/g, ' ')}
                      </motion.h3>
                      
                      {/* Project description */}
                      <motion.p 
                        className="text-gray-400 text-sm mb-5 line-clamp-2 group-hover:text-gray-300 transition-colors"
                      >
                        {repo.description}
                      </motion.p>
                      
                      {/* Stats section */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="flex items-center gap-1.5 text-gray-400 group-hover:text-yellow-400 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span className="text-sm font-medium">{repo.stargazers_count}</span>
                          </motion.div>
                          
                          <motion.div 
                            className="flex items-center gap-1.5 text-gray-400 group-hover:text-blue-400 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <GitFork className="w-3.5 h-3.5" />
                            <span className="text-sm font-medium">{repo.forks_count}</span>
                          </motion.div>
                        </div>
                        
                        <motion.span 
                          className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white transition-all"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {repo.language}
                        </motion.span>
                      </div>
                      
                      {/* Hover indicator */}
                      <motion.div 
                        className="absolute -bottom-1 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    
                    {/* Play indicator for currently playing */}
                    {nowPlayingProject?.id === repo.id && (
                      <motion.div 
                        className="absolute top-4 right-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-3 bg-green-400 rounded-full animate-pulse" />
                          <span className="w-1 h-4 bg-green-400 rounded-full animate-pulse animation-delay-100" />
                          <span className="w-1 h-3 bg-green-400 rounded-full animate-pulse animation-delay-200" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
        </div>
      </div>

      {/* Now Playing Panel - Enhanced and Interactive */}
      <motion.div 
        className="now-playing-panel-enhanced"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-300 text-sm font-medium uppercase tracking-wider">Now Playing</h3>
          <button className="control-button-enhanced hover:scale-110 transition-transform">
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </button>
        </div>
        
        {nowPlayingProject ? (
          <>
            <h4 className="text-white font-semibold mb-2 text-sm md:text-base truncate">{nowPlayingProject.name}</h4>
            <p className="text-gray-400 text-xs mb-4 line-clamp-2">{nowPlayingProject.description}</p>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="progress-bar-enhanced">
                <div 
                  className="progress-fill-enhanced"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalTime)}</span>
              </div>
            </div>
            
            {/* Overview */}
            <div className="mb-6">
              <h5 className="text-gray-300 text-xs mb-2 font-mono">// Overview</h5>
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-4">
                {nowPlayingProject.description || "A GitHub project showcasing modern development practices and innovative solutions."}
              </p>
            </div>
            
            {/* Project Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-white">{nowPlayingProject.stargazers_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitFork className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-white">{nowPlayingProject.forks_count}</span>
                </div>
              </div>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                {nowPlayingProject.language}
              </span>
            </div>
          </>
        ) : (
          <>
            <h4 className="text-white font-semibold mb-2 text-base">Loading Project...</h4>
            <p className="text-gray-400 text-xs mb-4">Fetching from GitHub</p>
          </>
        )}
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              className="control-button-enhanced"
              onClick={prevProject}
            >
              <SkipBack className="w-4 h-4 text-white" />
            </button>
            <button 
              className="control-button-enhanced"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>
            <button 
              className="control-button-enhanced"
              onClick={nextProject}
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>
          </div>
          <button className="control-button-enhanced">
            <Volume2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </motion.div>

      {/* Hidden components for functionality */}
      <div className="hidden">
        <SearchFilter />
        <ProjectCarousel />
        <MusicPlayer />
      </div>
    </motion.div>
  )
} 