'use client'

import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack, ExternalLink, X, Heart, Shuffle, Repeat, MoreHorizontal, List, Volume2, Download, Share } from 'lucide-react'
import { repositoriesAtom, playerStateAtom, centeredProjectIndexAtom, searchQueryAtom, selectedLanguageAtom } from '@/lib/store'
import { formatTime, getProjectIcon, generateThumbnailDesign } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function MusicPlayer() {
  const [repositories] = useAtom(repositoriesAtom)
  const [playerState, setPlayerState] = useAtom(playerStateAtom)
  const [centeredIndex, setCenteredIndex] = useAtom(centeredProjectIndexAtom)
  const [searchQuery] = useAtom(searchQueryAtom)
  const [selectedLanguage] = useAtom(selectedLanguageAtom)
  const [lyricsScroll, setLyricsScroll] = useState(0)
  const [isLyricsMode, setIsLyricsMode] = useState(false)
  const [volume, setVolume] = useState(75)
  const intervalRef = useRef<NodeJS.Timeout>()
  const lyricsRef = useRef<HTMLDivElement>(null)

  // Filter repositories based on search and language
  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = !selectedLanguage || repo.language === selectedLanguage
    return matchesSearch && matchesLanguage
  })

  const currentRepo = filteredRepos[playerState.currentRepoIndex] || filteredRepos[centeredIndex]
  const progress = (playerState.currentTime / playerState.totalTime) * 100

  // Sync player with centered index when player opens
  useEffect(() => {
    if (playerState.isVisible && playerState.currentRepoIndex !== centeredIndex) {
      setPlayerState(prev => ({
        ...prev,
        currentRepoIndex: centeredIndex
      }))
    }
  }, [playerState.isVisible, centeredIndex, playerState.currentRepoIndex, setPlayerState])

  useEffect(() => {
    if (playerState.isPlaying) {
      intervalRef.current = setInterval(() => {
        setPlayerState(prev => {
          const newTime = prev.currentTime + 1
          if (newTime >= prev.totalTime) {
            // Auto-advance to next repo
            const nextIndex = (prev.currentRepoIndex + 1) % filteredRepos.length
            return {
              ...prev,
              currentRepoIndex: nextIndex,
              currentTime: 0
            }
          }
          return { ...prev, currentTime: newTime }
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [playerState.isPlaying, playerState.currentRepoIndex, filteredRepos.length, setPlayerState])

  useEffect(() => {
    if (playerState.isPlaying && currentRepo?.readme) {
      // Calculate lyrics scroll position based on progress
      const totalWords = currentRepo.readme.split(' ').length
      const wordsPerSecond = totalWords / playerState.totalTime
      const currentWords = Math.floor(playerState.currentTime * wordsPerSecond)
      const scrollPercentage = (currentWords / totalWords) * 100
      setLyricsScroll(Math.min(scrollPercentage, 100))
    }
  }, [playerState.currentTime, playerState.isPlaying, currentRepo?.readme, playerState.totalTime])

  const togglePlay = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const nextRepo = () => {
    const nextIndex = (playerState.currentRepoIndex + 1) % filteredRepos.length
    setPlayerState(prev => ({
      ...prev,
      currentRepoIndex: nextIndex,
      currentTime: 0
    }))
    setCenteredIndex(nextIndex)
  }

  const prevRepo = () => {
    const prevIndex = playerState.currentRepoIndex === 0 ? filteredRepos.length - 1 : playerState.currentRepoIndex - 1
    setPlayerState(prev => ({
      ...prev,
      currentRepoIndex: prevIndex,
      currentTime: 0
    }))
    setCenteredIndex(prevIndex)
  }

  const closePlayer = () => {
    setPlayerState(prev => ({ ...prev, isVisible: false, isPlaying: false }))
  }

  const openGitHub = () => {
    if (currentRepo) {
      window.open(currentRepo.html_url, '_blank')
    }
  }

  if (!playerState.isVisible || !currentRepo) return null

  const projectIcon = getProjectIcon(currentRepo.name, currentRepo.description)
  const thumbnailDesign = generateThumbnailDesign(currentRepo.name, currentRepo.description)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-black z-50 flex flex-col overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
          />
        </div>

        {/* Header with enhanced glassmorphism */}
        <motion.div 
          className="relative z-10 backdrop-blur-xl bg-black/30 border-b border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <motion.button
              onClick={closePlayer}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all duration-200 border border-white/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
            
            <div className="text-center">
              <motion.p 
                className="text-sm text-gray-300 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Playing from GitHub
              </motion.p>
              <motion.p 
                className="text-xs text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Abdullah's Portfolio
              </motion.p>
            </div>
            
            <motion.button 
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all duration-200 border border-white/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <MoreHorizontal className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </motion.div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col px-6 py-8 relative z-10">
          <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
            
            {/* Enhanced Album Art */}
            <motion.div 
              className="mb-8 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className={`spotify-album-art bg-gradient-to-br ${thumbnailDesign.gradient} pattern-${thumbnailDesign.pattern} relative overflow-hidden`}>
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
                    className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"
                    animate={{
                      background: [
                        "linear-gradient(135deg, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(0,0,0,0.4) 100%)",
                        "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)",
                        "linear-gradient(135deg, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(0,0,0,0.4) 100%)",
                      ]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Main icon with enhanced animations */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className={`text-white text-9xl font-bold ${thumbnailDesign.iconStyle}`}
                      animate={{
                        scale: playerState.isPlaying ? [1, 1.05, 1] : 1,
                        rotate: playerState.isPlaying ? [0, 2, -2, 0] : 0
                      }}
                      transition={{
                        duration: 4,
                        repeat: playerState.isPlaying ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                    >
                      {projectIcon.icon}
                    </motion.div>
                  </div>
                  
                  {/* Floating particles */}
                  <motion.div 
                    className={`absolute top-8 right-8 w-4 h-4 ${thumbnailDesign.accentColor} rounded-full`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.8, 1, 0.8],
                      y: [0, -10, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div 
                    className={`absolute bottom-8 left-8 w-3 h-3 ${thumbnailDesign.accentColor} rounded-full`}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 0.9, 0.6],
                      x: [0, 5, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                  
                  {/* Enhanced project type badge */}
                  <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                    <span className="text-sm text-white font-semibold">{projectIcon.label}</span>
                  </div>
                  
                  {/* Rotating geometric elements */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <motion.div 
                      className="w-56 h-56 border border-white/10 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <motion.div 
                      className="absolute top-4 left-4 right-4 bottom-4 border border-white/5 rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 45,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </div>
                </div>

                {/* Now playing indicator */}
                {playerState.isPlaying && (
                  <motion.div 
                    className="absolute top-4 right-4 flex items-center gap-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-green-400 rounded-full"
                        animate={{
                          height: [8, 20, 12, 16, 8],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Enhanced Song Info with Live Development Story */}
            <motion.div 
              className="text-center mb-8 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.h1 
                className="text-3xl font-bold text-white mb-2 truncate"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {currentRepo.name.replace(/-/g, ' ')}
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-400 truncate mb-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {currentRepo.description || "No description available"}
              </motion.p>
              
              {/* Live Project Walkthrough */}
              {playerState.isPlaying && (
                <motion.div 
                  className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-md rounded-2xl p-4 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 bg-blue-400 rounded-full"
                    />
                    <span className="text-sm font-medium text-blue-400">
                      {progress < 25 ? 'Exploring Project Architecture' :
                       progress < 50 ? 'Understanding Core Features' :
                       progress < 75 ? 'Diving into Implementation' :
                       'Reviewing Usage & Documentation'}
                    </span>
                  </div>
                  
                  {/* Dynamic Code Preview */}
                  <motion.div 
                    className="bg-black/40 rounded-lg p-3 mb-3 font-mono text-xs"
                    animate={{
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-400 ml-2">
                        {progress < 25 ? 'package.json' :
                         progress < 50 ? 'main.ts' :
                         progress < 75 ? 'components/' :
                         'README.md'}
                      </span>
                    </div>
                    <motion.pre 
                      className="text-gray-300 leading-relaxed overflow-hidden"
                      style={{ height: '60px' }}
                    >
                      {progress < 25 ? `{
  "name": "${currentRepo.name}",
  "version": "1.0.0",
  "main": "index.js"` :
                       progress < 50 ? `function ${currentRepo.name.replace(/-/g, '')}() {
  // Core implementation
  return processData();
}` :
                       progress < 75 ? `import { Component } from 'react';

class ${currentRepo.name.replace(/-/g, '')} extends Component {
  render() {` :
                       `# ${currentRepo.name}

${currentRepo.description}

## Installation
\`npm install\``}
                    </motion.pre>
                  </motion.div>

                  {/* Live Technology Stack */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {currentRepo.topics?.slice(0, 3).map((topic, index) => (
                      <motion.span
                        key={topic}
                        className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.05 }}
                      >
                        #{topic}
                      </motion.span>
                    )) || (
                      <motion.span
                        className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 rounded-full text-xs font-medium border border-purple-500/30"
                        whileHover={{ scale: 1.05 }}
                      >
                        #{currentRepo.language?.toLowerCase() || 'code'}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Enhanced stats with live animations */}
              <div className="flex items-center justify-center gap-6 mb-4">
                <motion.div 
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10"
                  whileHover={{ scale: 1.05 }}
                  animate={{
                    borderColor: playerState.isPlaying ? ['rgba(255,255,255,0.1)', 'rgba(34,197,94,0.3)', 'rgba(255,255,255,0.1)'] : 'rgba(255,255,255,0.1)'
                  }}
                  transition={{
                    duration: 3,
                    repeat: playerState.isPlaying ? Infinity : 0
                  }}
                >
                  <motion.div
                    animate={{ 
                      rotate: playerState.isPlaying ? [0, 360] : 0,
                      scale: playerState.isPlaying ? [1, 1.1, 1] : 1
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: playerState.isPlaying ? Infinity : 0, 
                      ease: "linear" 
                    }}
                  >
                    ⭐
                  </motion.div>
                  <span className="text-white font-medium">{currentRepo.stargazers_count}</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10"
                  whileHover={{ scale: 1.05 }}
                  animate={{
                    borderColor: playerState.isPlaying ? ['rgba(255,255,255,0.1)', 'rgba(59,130,246,0.3)', 'rgba(255,255,255,0.1)'] : 'rgba(255,255,255,0.1)'
                  }}
                  transition={{
                    duration: 3,
                    repeat: playerState.isPlaying ? Infinity : 0,
                    delay: 1
                  }}
                >
                  <motion.span 
                    className="text-blue-400"
                    animate={{
                      scale: playerState.isPlaying ? [1, 1.2, 1] : 1
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: playerState.isPlaying ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    🔗
                  </motion.span>
                  <span className="text-white font-medium">{currentRepo.forks_count}</span>
                </motion.div>
                <motion.div 
                  className="bg-green-500/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-green-500/30"
                  whileHover={{ scale: 1.05 }}
                  animate={{
                    backgroundColor: playerState.isPlaying ? ['rgba(34,197,94,0.2)', 'rgba(34,197,94,0.3)', 'rgba(34,197,94,0.2)'] : 'rgba(34,197,94,0.2)',
                    borderColor: playerState.isPlaying ? ['rgba(34,197,94,0.3)', 'rgba(34,197,94,0.5)', 'rgba(34,197,94,0.3)'] : 'rgba(34,197,94,0.3)'
                  }}
                  transition={{
                    duration: 4,
                    repeat: playerState.isPlaying ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-green-400 font-medium">{currentRepo.language}</span>
                </motion.div>
              </div>

              {/* Enhanced action buttons */}
              <div className="flex items-center justify-center gap-3">
                <motion.button
                  onClick={openGitHub}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 hover:bg-white/20 transition-colors relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: playerState.isPlaying ? ['0 0 0 0 rgba(255,255,255,0.1)', '0 0 10px 2px rgba(34,197,94,0.2)', '0 0 0 0 rgba(255,255,255,0.1)'] : '0 0 0 0 rgba(255,255,255,0.1)'
                  }}
                  transition={{
                    duration: 3,
                    repeat: playerState.isPlaying ? Infinity : 0
                  }}
                >
                  <ExternalLink className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">View Code</span>
                  {playerState.isPlaying && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                </motion.button>
                <motion.button
                  className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10 hover:bg-red-500/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    borderColor: playerState.isPlaying ? ['rgba(255,255,255,0.1)', 'rgba(239,68,68,0.3)', 'rgba(255,255,255,0.1)'] : 'rgba(255,255,255,0.1)'
                  }}
                  transition={{
                    duration: 4,
                    repeat: playerState.isPlaying ? Infinity : 0,
                    delay: 2
                  }}
                >
                  <motion.div
                    animate={{
                      scale: playerState.isPlaying ? [1, 1.1, 1] : 1
                    }}
                    transition={{
                      duration: 2,
                      repeat: playerState.isPlaying ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    <Heart className="w-4 h-4 text-white" />
                  </motion.div>
                </motion.button>
                <motion.button
                  className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    rotate: playerState.isPlaying ? [0, 5, -5, 0] : 0
                  }}
                  transition={{
                    duration: 6,
                    repeat: playerState.isPlaying ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <Share className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </motion.div>

            {/* Enhanced Progress Section */}
            <motion.div 
              className="w-full mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="spotify-progress-bar mb-3 group cursor-pointer">
                <motion.div
                  className="spotify-progress-fill relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                >
                  <motion.div 
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.2 }}
                  />
                </motion.div>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span className="font-mono">{formatTime(playerState.currentTime)}</span>
                <span className="font-mono">{formatTime(playerState.totalTime)}</span>
              </div>
            </motion.div>

            {/* Enhanced Main Controls */}
            <motion.div 
              className="flex items-center justify-center gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                className="spotify-control-button hover:text-green-400"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shuffle className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={prevRepo}
                className="spotify-control-button hover:text-green-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <SkipBack className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                onClick={togglePlay}
                className="spotify-play-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: playerState.isPlaying 
                    ? [
                        "0 10px 25px -5px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.3)",
                        "0 10px 25px -5px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.5)",
                        "0 10px 25px -5px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.3)"
                      ]
                    : "0 10px 25px -5px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.3)"
                }}
                transition={{
                  duration: 2,
                  repeat: playerState.isPlaying ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  animate={{ rotate: playerState.isPlaying ? 0 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {playerState.isPlaying ? (
                    <Pause className="w-8 h-8 text-black" />
                  ) : (
                    <Play className="w-8 h-8 text-black ml-1" />
                  )}
                </motion.div>
              </motion.button>
              
              <motion.button
                onClick={nextRepo}
                className="spotify-control-button hover:text-green-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <SkipForward className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                className="spotify-control-button hover:text-green-400"
                whileHover={{ scale: 1.1, rotate: 360 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Repeat className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Enhanced Bottom Controls */}
            <motion.div 
              className="flex items-center justify-between w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                onClick={() => setIsLyricsMode(!isLyricsMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isLyricsMode 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  borderColor: playerState.isPlaying && isLyricsMode 
                    ? ['rgba(34,197,94,0.3)', 'rgba(34,197,94,0.5)', 'rgba(34,197,94,0.3)'] 
                    : undefined
                }}
                transition={{
                  duration: 2,
                  repeat: playerState.isPlaying && isLyricsMode ? Infinity : 0
                }}
              >
                <motion.div
                  animate={{
                    rotate: isLyricsMode ? [0, 360] : 0
                  }}
                  transition={{
                    duration: 2,
                    ease: "linear",
                    repeat: isLyricsMode ? Infinity : 0
                  }}
                >
                  📖
                </motion.div>
                <span className="text-sm font-medium">
                  {isLyricsMode ? 'Live Docs' : 'Documentation'}
                </span>
              </motion.button>
              
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-400"
                    style={{ width: `${volume}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Interactive Documentation Viewer */}
          <AnimatePresence>
            {isLyricsMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
              >
                {/* Documentation Header */}
                <div className="bg-black/20 px-6 py-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ 
                          opacity: [0.5, 1, 0.5],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity 
                        }}
                        className="w-3 h-3 bg-green-400 rounded-full"
                      />
                      <span className="text-sm font-semibold text-white">
                        📖 Live Documentation
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">
                        {Math.floor(progress)}% complete
                      </span>
                      <motion.div 
                        className="w-16 h-1 bg-white/20 rounded-full overflow-hidden"
                        animate={{
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity
                        }}
                      >
                        <motion.div
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                          style={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Interactive Documentation Content */}
                <div className="p-6 max-h-80 overflow-hidden relative">
                  <div className="space-y-6">
                    {/* Project Overview Section */}
                    <motion.div
                      className={`transition-all duration-500 ${progress < 25 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}
                      animate={{
                        borderColor: progress < 25 ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      <motion.div 
                        className="flex items-center gap-2 mb-3"
                        animate={{
                          color: progress < 25 ? '#22c55e' : '#9ca3af'
                        }}
                      >
                        <span className="text-lg">🚀</span>
                        <h3 className="font-semibold">Project Overview</h3>
                        {progress < 25 && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-2 h-2 bg-green-400 rounded-full ml-2"
                          />
                        )}
                      </motion.div>
                      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {currentRepo.description || "Exploring the core purpose and functionality of this innovative project..."}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {currentRepo.language}
                          </span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                            ⭐ {currentRepo.stargazers_count}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Features & Architecture Section */}
                    <motion.div
                      className={`transition-all duration-500 ${progress >= 25 && progress < 50 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}
                      animate={{
                        borderColor: progress >= 25 && progress < 50 ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      <motion.div 
                        className="flex items-center gap-2 mb-3"
                        animate={{
                          color: progress >= 25 && progress < 50 ? '#3b82f6' : '#9ca3af'
                        }}
                      >
                        <span className="text-lg">⚙️</span>
                        <h3 className="font-semibold">Core Features</h3>
                        {progress >= 25 && progress < 50 && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-2 h-2 bg-blue-400 rounded-full ml-2"
                          />
                        )}
                      </motion.div>
                      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <div className="space-y-2">
                          {currentRepo.topics?.slice(0, 3).map((topic, index) => (
                            <motion.div
                              key={topic}
                              className="flex items-center gap-2"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="w-2 h-2 bg-blue-400 rounded-full" />
                              <span className="text-sm text-gray-300">
                                Advanced {topic.replace(/-/g, ' ')} implementation
                              </span>
                            </motion.div>
                          )) || (
                            <div className="text-sm text-gray-300">
                              • Modern {currentRepo.language} architecture<br/>
                              • Scalable design patterns<br/>
                              • Best practices implementation
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    {/* Technical Implementation Section */}
                    <motion.div
                      className={`transition-all duration-500 ${progress >= 50 && progress < 75 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}
                      animate={{
                        borderColor: progress >= 50 && progress < 75 ? 'rgba(147,51,234,0.3)' : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      <motion.div 
                        className="flex items-center gap-2 mb-3"
                        animate={{
                          color: progress >= 50 && progress < 75 ? '#9333ea' : '#9ca3af'
                        }}
                      >
                        <span className="text-lg">🔧</span>
                        <h3 className="font-semibold">Implementation Details</h3>
                        {progress >= 50 && progress < 75 && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-2 h-2 bg-purple-400 rounded-full ml-2"
                          />
                        )}
                      </motion.div>
                      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <motion.pre 
                          className="text-xs text-gray-300 font-mono overflow-hidden"
                          animate={{
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity
                          }}
                        >
{`// Core ${currentRepo.name.replace(/-/g, '')} Implementation
class ${currentRepo.name.replace(/-/g, '')}System {
  constructor() {
    this.initialize${currentRepo.language || 'System'}();
  }
  
  async process() {
    return await this.execute();
  }
}`}
                        </motion.pre>
                      </div>
                    </motion.div>

                    {/* Usage & Documentation Section */}
                    <motion.div
                      className={`transition-all duration-500 ${progress >= 75 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}
                      animate={{
                        borderColor: progress >= 75 ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      <motion.div 
                        className="flex items-center gap-2 mb-3"
                        animate={{
                          color: progress >= 75 ? '#22c55e' : '#9ca3af'
                        }}
                      >
                        <span className="text-lg">🎯</span>
                        <h3 className="font-semibold">Getting Started</h3>
                        {progress >= 75 && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-2 h-2 bg-green-400 rounded-full ml-2"
                          />
                        )}
                      </motion.div>
                      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <div className="space-y-2 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">$</span>
                            <code className="bg-black/50 px-2 py-1 rounded text-xs">
                              git clone {currentRepo.html_url}
                            </code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">$</span>
                            <code className="bg-black/50 px-2 py-1 rounded text-xs">
                              npm install && npm start
                            </code>
                          </div>
                          {currentRepo.readme && (
                            <motion.p 
                              className="mt-3 text-xs leading-relaxed"
                              animate={{ opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              {currentRepo.readme.slice(0, 150)}...
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Reading Progress Indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                      <motion.div
                        animate={{ 
                          y: [0, -3, 0],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity 
                        }}
                        className="text-xs text-gray-400 text-center"
                      >
                        📚 Auto-scrolling through documentation...
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 