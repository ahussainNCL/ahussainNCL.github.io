'use client'

import { useAtom } from 'jotai'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play, Star, GitFork, ExternalLink, Heart, Share, MoreHorizontal } from 'lucide-react'
import { repositoriesAtom, centeredProjectIndexAtom, playerStateAtom, searchQueryAtom, selectedLanguageAtom } from '@/lib/store'
import { getProjectIcon, generateThumbnailDesign } from '@/lib/utils'

export function ProjectCarousel() {
  const [repositories] = useAtom(repositoriesAtom)
  const [centeredIndex, setCenteredIndex] = useAtom(centeredProjectIndexAtom)
  const [searchQuery] = useAtom(searchQueryAtom)
  const [selectedLanguage] = useAtom(selectedLanguageAtom)
  const [, setPlayerState] = useAtom(playerStateAtom)

  // Filter repositories based on search and language
  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = !selectedLanguage || repo.language === selectedLanguage
    return matchesSearch && matchesLanguage
  })

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && centeredIndex < filteredRepos.length - 1) {
      setCenteredIndex(centeredIndex + 1)
    } else if (direction === 'right' && centeredIndex > 0) {
      setCenteredIndex(centeredIndex - 1)
    }
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50
    if (info.offset.x > swipeThreshold) {
      handleSwipe('right')
    } else if (info.offset.x < -swipeThreshold) {
      handleSwipe('left')
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handleSwipe('right')
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        handleSwipe('left')
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openPlayer()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [centeredIndex, filteredRepos.length])

  const openPlayer = () => {
    setPlayerState(prev => ({
      ...prev,
      currentRepoIndex: centeredIndex,
      isVisible: true,
      isPlaying: true,
      currentTime: 0
    }))
  }

  const openGitHub = () => {
    const currentRepo = filteredRepos[centeredIndex]
    if (currentRepo) {
      window.open(currentRepo.html_url, '_blank')
    }
  }

  if (filteredRepos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <motion.div 
          className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          <span className="text-5xl">🎵</span>
        </motion.div>
        <motion.h3 
          className="text-3xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          No tracks in playlist
        </motion.h3>
        <motion.p 
          className="text-gray-400 max-w-lg text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Adjust your search filters to discover amazing projects
        </motion.p>
      </div>
    )
  }

  const currentRepo = filteredRepos[centeredIndex]
  const projectIcon = getProjectIcon(currentRepo.name, currentRepo.description)
  const thumbnailDesign = generateThumbnailDesign(currentRepo.name, currentRepo.description)

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      {/* Modern Navigation Arrows */}
      <motion.button
        onClick={() => handleSwipe('right')}
        disabled={centeredIndex === 0}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/10"
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </motion.button>

      <motion.button
        onClick={() => handleSwipe('left')}
        disabled={centeredIndex === filteredRepos.length - 1}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/10"
        whileHover={{ scale: 1.1, x: 2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </motion.button>

      {/* Enhanced Main Project Card */}
      <motion.div
        key={currentRepo.id}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="cursor-grab active:cursor-grabbing relative"
      >
        <div className="glass-card p-8 max-w-4xl mx-auto">
          {/* Enhanced Project Showcase */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Side - Project Thumbnail */}
            <div className="relative">
              <motion.div 
                className={`aspect-square rounded-3xl overflow-hidden bg-gradient-to-br ${thumbnailDesign.gradient} pattern-${thumbnailDesign.pattern} relative group`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {currentRepo.socialPreview ? (
                  <img
                    src={currentRepo.socialPreview}
                    alt={currentRepo.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                
                {/* Enhanced fallback design */}
                <div className={`absolute inset-0 ${currentRepo.socialPreview ? 'hidden' : ''}`}>
                  {/* Animated gradient overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30"
                    animate={{
                      background: [
                        "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)",
                        "linear-gradient(135deg, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
                        "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)",
                      ]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Main icon with enhanced animations */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className={`text-white text-8xl lg:text-9xl font-bold ${thumbnailDesign.iconStyle} drop-shadow-2xl`}
                      animate={{
                        y: [0, -10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {projectIcon.icon}
                    </motion.div>
                  </div>
                  
                  {/* Floating particles with enhanced animations */}
                  <motion.div 
                    className={`absolute top-8 right-8 w-6 h-6 ${thumbnailDesign.accentColor} rounded-full`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 1, 0.7],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div 
                    className={`absolute bottom-8 left-8 w-4 h-4 ${thumbnailDesign.accentColor} rounded-full`}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.9, 0.5],
                      x: [0, 10, 0]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                  
                  {/* Enhanced project type badge */}
                  <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                    <span className="text-sm text-white font-semibold">{projectIcon.label}</span>
                  </div>
                  
                  {/* Multiple rotating geometric elements */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <motion.div 
                      className="w-64 h-64 border border-white/10 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <motion.div 
                      className="absolute top-6 left-6 right-6 bottom-6 border border-white/5 rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 35,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <motion.div 
                      className="absolute top-12 left-12 right-12 bottom-12 border border-white/10 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 45,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </div>
                </div>

                {/* Enhanced play button overlay */}
                <motion.div 
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                >
                  <motion.button
                    onClick={openPlayer}
                    className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Play className="w-9 h-9 text-black ml-1" fill="currentColor" />
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Side - Project Info */}
            <div className="space-y-6">
              <div>
                <motion.div 
                  className="flex items-center gap-2 mb-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                    Featured
                  </span>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </motion.div>

                <motion.h1 
                  className="text-3xl lg:text-4xl font-bold text-white mb-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ x: 4 }}
                >
                  {currentRepo.name.replace(/-/g, ' ')}
                </motion.h1>
                
                <motion.p 
                  className="text-lg text-gray-400 leading-relaxed mb-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {currentRepo.description || "An innovative project showcasing modern development practices and creative solutions."}
                </motion.p>
              </div>
              
              {/* Enhanced Stats Grid */}
              <motion.div 
                className="grid grid-cols-3 gap-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{currentRepo.stargazers_count}</div>
                  <div className="text-xs text-gray-400 font-medium">Stars</div>
                </motion.div>
                
                <motion.div 
                  className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <GitFork className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{currentRepo.forks_count}</div>
                  <div className="text-xs text-gray-400 font-medium">Forks</div>
                </motion.div>
                
                <motion.div 
                  className="bg-green-500/20 backdrop-blur-md p-4 rounded-xl border border-green-500/30 text-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                  </div>
                  <div className="text-sm font-bold text-green-400 truncate">{currentRepo.language}</div>
                  <div className="text-xs text-green-400/70 font-medium">Language</div>
                </motion.div>
              </motion.div>

              {/* Enhanced Action Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  onClick={openPlayer}
                  className="flex-1 bg-gradient-to-r from-green-400 to-green-500 text-black px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-lg shadow-green-500/25"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  <span>Play Project</span>
                </motion.button>
                
                <div className="flex gap-3">
                  <motion.button
                    onClick={openGitHub}
                    className="bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-all duration-300 border border-white/10"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span className="hidden sm:inline">Code</span>
                  </motion.button>
                  
                  <motion.button
                    className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart className="w-5 h-5 text-white" />
                  </motion.button>
                  
                  <motion.button
                    className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Project Navigation Indicators */}
      <motion.div 
        className="flex items-center justify-center mt-8 gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {filteredRepos.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCenteredIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === centeredIndex 
                ? 'bg-green-400 w-8' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </motion.div>

      {/* Enhanced Project Counter */}
      <motion.div 
        className="text-center mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-gray-400 font-mono text-lg">
          {String(centeredIndex + 1).padStart(2, '0')} / {String(filteredRepos.length).padStart(2, '0')}
        </span>
      </motion.div>

      {/* Enhanced Navigation Hints */}
      <motion.div 
        className="text-center mt-4 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <p className="text-sm text-gray-400">
          Use arrow keys, swipe, or click arrows to navigate
        </p>
        <p className="text-xs text-gray-500">
          Press Enter or Space to play • Click and drag to explore
        </p>
      </motion.div>
    </div>
  )
} 