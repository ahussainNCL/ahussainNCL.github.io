'use client'

import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Github, Music, Play, Pause, SkipForward, SkipBack, Volume2, Star, GitFork, Menu, X, Search, Heart, Shuffle, Repeat, ExternalLink, Share, MoreHorizontal } from 'lucide-react'
import { repositoriesAtom } from '@/lib/store'
import { fetchRepositories } from '@/lib/github'
import { ProjectCarousel } from '@/components/project-carousel'
import { MusicPlayer } from '@/components/music-player'
import { SearchFilter } from '@/components/search-filter'
import { AlbumGrid } from '@/components/album-grid'
import { getProjectIcon, generateThumbnailDesign, formatTime } from '@/lib/utils'

export default function Home() {
  const [repositories, setRepositories] = useAtom(repositoriesAtom)
  const [nowPlayingProject, setNowPlayingProject] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalTime] = useState(180) // 3 minutes
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeView, setActiveView] = useState<'grid' | 'carousel'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false)
  const [showReadmeInPlayer, setShowReadmeInPlayer] = useState(false)
  
  // Refs for scroll animations
  const heroRef = useRef(null)
  const projectsRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })
  const isProjectsInView = useInView(projectsRef, { once: true })

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

  // Function to be passed to child components
  const handlePlayProject = (project: any) => {
    setNowPlayingProject(project)
    setCurrentTime(0)
    setIsPlaying(true)
    setIsFullPlayerVisible(true)
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



  const progress = (currentTime / totalTime) * 100

  // Filter repositories
  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = !selectedLanguage || repo.language === selectedLanguage
    return matchesSearch && matchesLanguage
  })

  // Get unique languages
  const languages = Array.from(new Set(repositories.map(repo => repo.language).filter(Boolean)))

  // Keyboard controls for full-screen player
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFullPlayerVisible) return
      
      switch (event.code) {
        case 'Escape':
          setIsFullPlayerVisible(false)
          break
        case 'Space':
          event.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          event.preventDefault()
          prevProject()
          break
        case 'ArrowRight':
          event.preventDefault()
          nextProject()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullPlayerVisible, togglePlay, prevProject, nextProject])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Modern Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 bg-black/50 backdrop-blur-xl border-r border-white/10 z-40 hidden lg:block">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">GitHub Player</span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveView('grid')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeView === 'grid' 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="w-2 h-2 bg-current rounded-full"></div>
              Browse All
            </button>
            <button 
              onClick={() => setActiveView('carousel')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeView === 'carousel' 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="w-2 h-2 bg-current rounded-full"></div>
              Featured Projects
            </button>
          </nav>

          {/* Recently Played */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Recently Played</h3>
            <div className="space-y-2">
              {repositories.slice(0, 3).map((repo, index) => (
                <motion.button
                  key={repo.id}
                  onClick={() => handleProjectClick(repo)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{getProjectIcon(repo.name, repo.description).icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{repo.name}</p>
                    <p className="text-xs text-gray-400 truncate">{repo.language}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">GitHub Player</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 z-40"
          >
            <div className="p-6">
              <nav className="space-y-2">
                <button 
                  onClick={() => {
                    setActiveView('grid')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeView === 'grid' 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Browse All
                </button>
                <button 
                  onClick={() => {
                    setActiveView('carousel')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeView === 'carousel' 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Featured Projects
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Hero Section */}
        <motion.div 
          ref={heroRef}
          className="relative px-6 lg:px-8 pt-20 lg:pt-8 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <motion.h1 
                  className="text-4xl lg:text-6xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    Abdullah's
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Code Library
                  </span>
                </motion.h1>
                <motion.p 
                  className="text-lg lg:text-xl text-gray-400 mb-6 max-w-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Discover and play through my GitHub projects like your favorite playlist
                </motion.p>
                <motion.div 
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    {repositories.length} Projects
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                    {languages.length} Languages
                  </span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                    Interactive Player
                  </span>
                </motion.div>
              </div>

              {/* Spotify-Style Now Playing */}
              {nowPlayingProject && (
                <motion.div 
                  className="lg:w-96 bg-gradient-to-br from-green-500/10 via-black/80 to-green-500/5 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 relative overflow-hidden shadow-2xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.1) 0%, rgba(0, 0, 0, 0.9) 50%, rgba(29, 185, 84, 0.05) 100%)',
                    boxShadow: '0 25px 50px -12px rgba(29, 185, 84, 0.25), 0 0 30px rgba(29, 185, 84, 0.1)'
                  }}
                >
                  {/* Animated background based on playing state */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5"
                    animate={{
                      opacity: isPlaying ? [0.3, 0.6, 0.3] : 0.3
                    }}
                    transition={{
                      duration: 3,
                      repeat: isPlaying ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: isPlaying ? 360 : 0 }}
                          transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
                          className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <span className="text-black text-xs font-bold">🎵</span>
                        </motion.div>
                        <span className="text-sm font-semibold text-green-400">Now Playing</span>
                      </div>
                      <motion.div 
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          isPlaying 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                        animate={{
                          scale: isPlaying ? [1, 1.02, 1] : 1,
                          borderColor: isPlaying ? ['rgba(34,197,94,0.3)', 'rgba(34,197,94,0.6)', 'rgba(34,197,94,0.3)'] : undefined
                        }}
                        transition={{
                          duration: 2,
                          repeat: isPlaying ? Infinity : 0
                        }}
                      >
                        <motion.div
                          className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-400'}`}
                          animate={{
                            scale: isPlaying ? [1, 1.3, 1] : 1,
                            opacity: isPlaying ? [1, 0.6, 1] : 1
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: isPlaying ? Infinity : 0
                          }}
                        />
                        {isPlaying ? 'LIVE' : 'PAUSED'}
                      </motion.div>
                    </div>
                    
                                      <div className="flex items-center gap-4 mb-6">
                      <motion.div 
                        className="w-20 h-20 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center relative overflow-hidden shadow-lg"
                        animate={{
                          scale: isPlaying ? [1, 1.03, 1] : 1,
                          rotate: isPlaying ? [0, 0.5, -0.5, 0] : 0,
                          boxShadow: isPlaying 
                            ? ['0 8px 25px rgba(34,197,94,0.3)', '0 8px 35px rgba(34,197,94,0.5)', '0 8px 25px rgba(34,197,94,0.3)']
                            : '0 8px 25px rgba(34,197,94,0.3)'
                        }}
                        transition={{
                          duration: 3,
                          repeat: isPlaying ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                        style={{
                          boxShadow: '0 8px 25px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                      >
                        <span className="text-2xl relative z-10 text-black font-bold">{getProjectIcon(nowPlayingProject.name, nowPlayingProject.description).icon}</span>
                        {isPlaying && (
                          <>
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                              animate={{
                                x: ['-100%', '100%']
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                            />
                            <motion.div 
                              className="absolute inset-0 border-2 border-green-400 rounded-lg"
                              animate={{
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          </>
                        )}
                                            </motion.div>
                      <div className="flex-1 min-w-0">
                        <motion.h3 
                          className="font-bold text-white text-lg truncate mb-1"
                          animate={{
                            color: isPlaying ? ['#ffffff', '#22c55e', '#ffffff'] : '#ffffff'
                          }}
                          transition={{
                            duration: 3,
                            repeat: isPlaying ? Infinity : 0
                          }}
                        >
                          {nowPlayingProject.name.replace(/-/g, ' ')}
                        </motion.h3>
                        <p className="text-sm text-gray-300 truncate mb-2">{nowPlayingProject.description}</p>
                        <div className="flex items-center gap-2">
                          <motion.span 
                            className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 font-medium"
                            animate={{
                              backgroundColor: isPlaying ? ['rgba(34,197,94,0.2)', 'rgba(34,197,94,0.3)', 'rgba(34,197,94,0.2)'] : undefined
                            }}
                            transition={{
                              duration: 2,
                              repeat: isPlaying ? Infinity : 0
                            }}
                          >
                            {nowPlayingProject.language}
                          </motion.span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <span className="text-yellow-400">⭐</span>
                            {nowPlayingProject.stargazers_count}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">GitHub Project</span>
                        </div>
                      </div>
                    </div>
                  
                    {/* Live README Preview */}
                    {isPlaying && nowPlayingProject.readme && (
                      <motion.div 
                        className="mb-4 bg-black/20 rounded-lg p-3 border border-white/10"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 bg-green-400 rounded-full"
                          />
                          <span className="text-xs text-green-400 font-medium">Reading README...</span>
                        </div>
                        <div className="max-h-20 overflow-hidden relative">
                          <motion.div
                            animate={{
                              y: isPlaying ? [0, -50, -100] : 0
                            }}
                            transition={{
                              duration: totalTime,
                              ease: "linear",
                              repeat: isPlaying ? Infinity : 0
                            }}
                          >
                            <p className="text-xs text-gray-300 leading-relaxed">
                              {nowPlayingProject.readme.slice(0, 200)}...
                            </p>
                          </motion.div>
                          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>
                      </motion.div>
                    )}

                                        {/* Spotify-Style Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full h-1.5 bg-gray-600 rounded-full overflow-hidden relative group cursor-pointer hover:h-2 transition-all duration-200">
                        <motion.div 
                          className="h-full bg-green-500 transition-all duration-300 relative"
                          style={{ width: `${progress}%` }}
                          animate={{
                            boxShadow: isPlaying 
                              ? ['0 0 8px rgba(34,197,94,0.6)', '0 0 12px rgba(34,197,94,0.8)', '0 0 8px rgba(34,197,94,0.6)']
                              : '0 0 8px rgba(34,197,94,0.6)'
                          }}
                          transition={{
                            duration: 2,
                            repeat: isPlaying ? Infinity : 0
                          }}
                        >
                          <motion.div 
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            style={{
                              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}
                            whileHover={{ scale: 1.2 }}
                          />
                        </motion.div>
                        
                        {/* Chapter markers */}
                        {[25, 50, 75].map((marker, index) => (
                          <motion.div
                            key={marker}
                            className="absolute top-0 w-0.5 h-full bg-white/60"
                            style={{ left: `${marker}%` }}
                            animate={{
                              opacity: progress > marker ? 1 : 0.4,
                              backgroundColor: progress > marker ? '#22c55e' : '#ffffff'
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        ))}
                      </div>
                      
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span className="font-mono">{formatTime(currentTime)}</span>
                        <motion.span 
                          className="text-green-400 font-medium"
                          animate={{
                            opacity: isPlaying ? [0.7, 1, 0.7] : 0.7
                          }}
                          transition={{
                            duration: 2,
                            repeat: isPlaying ? Infinity : 0
                          }}
                        >
                          {Math.floor(progress)}% Complete
                        </motion.span>
                        <span className="font-mono">{formatTime(totalTime)}</span>
                    </div>

                      {/* Current "Chapter" indicator */}
                      {isPlaying && (
                        <motion.div 
                          className="text-center mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <span className="text-xs text-blue-400 font-medium">
                            {progress < 25 ? '📖 Reading Overview' :
                             progress < 50 ? '⚙️ Exploring Features' :
                             progress < 75 ? '🔧 Technical Details' :
                             '🎯 Implementation & Usage'}
                          </span>
                        </motion.div>
                      )}
                  </div>

                                        {/* Spotify-Style Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.button 
                          onClick={prevProject}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <SkipBack className="w-5 h-5 fill-current" />
                        </motion.button>
                        
                        <motion.button 
                          onClick={togglePlay}
                          className="w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-all relative overflow-hidden shadow-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          animate={{
                            boxShadow: isPlaying 
                              ? ["0 4px 12px rgba(0,0,0,0.3)", "0 6px 20px rgba(0,0,0,0.4)", "0 4px 12px rgba(0,0,0,0.3)"]
                              : "0 4px 12px rgba(0,0,0,0.3)"
                          }}
                          transition={{
                            duration: 2,
                            repeat: isPlaying ? Infinity : 0
                          }}
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6 text-black fill-current" />
                          ) : (
                            <Play className="w-6 h-6 text-black ml-0.5 fill-current" />
                          )}
                          
                          {isPlaying && (
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/30 to-transparent"
                              animate={{
                                x: ['-100%', '100%']
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                            />
                          )}
                        </motion.button>
                        
                        <motion.button 
                          onClick={nextProject}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <SkipForward className="w-5 h-5 fill-current" />
                        </motion.button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <motion.button
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-green-400"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open(nowPlayingProject.html_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </motion.button>
                        <Volume2 className="w-4 h-4 text-gray-400" />
                        <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          className="px-6 lg:px-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isProjectsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-white placeholder-gray-400"
              />
            </div>

            {/* View Toggle */}
            <div className="flex bg-white/5 backdrop-blur-xl rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setActiveView('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeView === 'grid'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setActiveView('carousel')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeView === 'carousel'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Carousel
              </button>
            </div>
          </div>

          {/* Language Filter */}
          {languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setSelectedLanguage(null)}
                className={`px-3 py-1 text-sm rounded-full transition-all ${
                  selectedLanguage === null
                    ? 'bg-green-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                All
              </button>
              {languages.map((language) => (
                <button
                  key={language}
                  onClick={() => setSelectedLanguage(language)}
                  className={`px-3 py-1 text-sm rounded-full transition-all ${
                    selectedLanguage === language
                      ? 'bg-green-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Projects Section */}
        <motion.div 
          ref={projectsRef}
          className="px-6 lg:px-8 pb-32"
          initial={{ opacity: 0, y: 20 }}
          animate={isProjectsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {activeView === 'grid' ? (
            <AlbumGrid onPlayProject={handlePlayProject} />
          ) : (
            <ProjectCarousel onPlayProject={handlePlayProject} />
          )}
        </motion.div>
      </div>

      {/* Hidden components for functionality */}
      <div className="hidden">
        <SearchFilter />
        <MusicPlayer />
      </div>

      {/* Full-Screen Spotify-Style Player */}
      <AnimatePresence>
        {isFullPlayerVisible && nowPlayingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
          >
            {/* Blurred Background */}
            <motion.div 
              className="absolute inset-0"
              initial={{ scale: 1.1, filter: 'blur(0px)' }}
              animate={{ scale: 1, filter: 'blur(20px)' }}
              transition={{ duration: 0.5 }}
              style={{
                backgroundImage: nowPlayingProject.socialPreview 
                  ? `url(${nowPlayingProject.socialPreview})`
                  : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/70" />
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col">
              {/* Header */}
              <motion.div 
                className="flex items-center justify-between p-4 pt-12"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.button
                  onClick={() => setIsFullPlayerVisible(false)}
                  className="w-10 h-10 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
                
                <div className="text-center">
                  <p className="text-white text-sm font-medium">Playing from portfolio:</p>
                  <p className="text-white/70 text-xs">Abdullah's Projects</p>
                </div>
                
                <motion.button
                  className="w-10 h-10 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MoreHorizontal className="w-6 h-6 text-white" />
                </motion.button>
              </motion.div>
              
              {/* Main Content */}
              <div className="flex-1 flex flex-col items-center justify-center px-8">
                <AnimatePresence mode="wait">
                  {!showReadmeInPlayer ? (
                    /* Large Album Art */
                    <motion.div 
                      key="album-art"
                      className="w-80 h-80 mb-8 rounded-lg overflow-hidden shadow-2xl"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.4, type: "spring" }}
                      style={{
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                      }}
                    >
                      {nowPlayingProject.socialPreview ? (
                        <img
                          src={nowPlayingProject.socialPreview}
                          alt={nowPlayingProject.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${generateThumbnailDesign(nowPlayingProject.name, nowPlayingProject.description).gradient} pattern-${generateThumbnailDesign(nowPlayingProject.name, nowPlayingProject.description).pattern} flex items-center justify-center relative`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"></div>
                          <span className="text-9xl relative z-10">{getProjectIcon(nowPlayingProject.name, nowPlayingProject.description).icon}</span>
                        </div>
                      )}
                    </motion.div>
                  ) : nowPlayingProject.readme ? (
                    /* Full README View */
                    <motion.div 
                      key="readme-view"
                      className="w-80 h-80 mb-8 bg-black/40 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.4, type: "spring" }}
                      style={{
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                      }}
                    >
                      <div className="h-full relative">
                        {/* README Header */}
                        <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 border-b border-white/20 z-10">
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ 
                                opacity: [0.5, 1, 0.5],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity 
                              }}
                              className="w-2 h-2 bg-green-400 rounded-full"
                            />
                            <span className="text-white font-semibold text-sm">📖 README</span>
                            <span className="text-white/50 text-xs ml-auto">{Math.floor(progress)}% read</span>
                          </div>
                        </div>

                        {/* Scrolling README Content */}
                        <div className="h-full pt-16 pb-4 px-4 overflow-hidden relative">
                          <motion.div
                            className="text-white/90 text-xs leading-relaxed whitespace-pre-wrap font-mono"
                            animate={{
                              y: isPlaying ? `-${(progress / 100) * 100}%` : '0%'
                            }}
                            transition={{
                              duration: 0.5,
                              ease: "easeOut"
                            }}
                          >
                            {nowPlayingProject.readme}
                          </motion.div>
                          
                          {/* Current reading line highlight */}
                          <motion.div 
                            className="absolute left-4 right-4 h-0.5 bg-green-400/80"
                            style={{ 
                              top: '50%',
                              transform: 'translateY(-50%)'
                            }}
                            animate={{
                              opacity: isPlaying ? [0.6, 1, 0.6] : 0.3
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: isPlaying ? Infinity : 0
                            }}
                          />
                          
                          {/* Fade overlays */}
                          <div className="absolute top-16 left-0 right-0 h-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                        </div>

                        {/* Reading indicator */}
                        {isPlaying && (
                          <motion.div 
                            className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-lg"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <span className="text-green-400 text-xs">📖</span>
                            <span className="text-white/60 text-xs">Auto-reading...</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    /* Fallback when no README */
                    <motion.div 
                      key="no-readme"
                      className="w-80 h-80 mb-8 bg-black/40 backdrop-blur-md rounded-lg border border-white/20 flex items-center justify-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.4, type: "spring" }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-white/60 text-sm">No README available</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Project Info */}
                <motion.div 
                  className="text-center mb-8 w-full max-w-sm"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <motion.h1 
                    className="text-white text-3xl font-bold mb-2 truncate"
                    animate={{
                      color: isPlaying ? ['#ffffff', '#1DB954', '#ffffff'] : '#ffffff'
                    }}
                    transition={{
                      duration: 3,
                      repeat: isPlaying ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    {nowPlayingProject.name.replace(/-/g, ' ')}
                  </motion.h1>
                  <p className="text-white/70 text-lg truncate">
                    {nowPlayingProject.description}
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <span className="text-white/50 text-sm">⭐ {nowPlayingProject.stargazers_count}</span>
                    <span className="text-white/50 text-sm">•</span>
                    <span className="text-white/50 text-sm">{nowPlayingProject.language}</span>
                  </div>
                </motion.div>
                
                {/* Progress Section */}
                <motion.div 
                  className="w-full max-w-sm mb-8"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-white/30 rounded-full mb-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  {/* Time */}
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(totalTime)}</span>
                  </div>
                </motion.div>
              </div>
              
              {/* Bottom Controls */}
              <motion.div 
                className="px-8 pb-12"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {/* Main Controls */}
                <div className="flex items-center justify-center gap-8 mb-6">
                  <motion.button
                    onClick={prevProject}
                    className="w-12 h-12 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SkipBack className="w-8 h-8 text-white fill-current" />
                  </motion.button>
                  
                  <motion.button
                    onClick={togglePlay}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: isPlaying 
                        ? ["0 0 20px rgba(255,255,255,0.3)", "0 0 30px rgba(255,255,255,0.5)", "0 0 20px rgba(255,255,255,0.3)"]
                        : "0 0 20px rgba(255,255,255,0.3)"
                    }}
                    transition={{
                      duration: 2,
                      repeat: isPlaying ? Infinity : 0
                    }}
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-black fill-current" />
                    ) : (
                      <Play className="w-10 h-10 text-black ml-1 fill-current" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={nextProject}
                    className="w-12 h-12 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SkipForward className="w-8 h-8 text-white fill-current" />
                  </motion.button>
                </div>
                
                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between">
                  <motion.button
                    className="w-12 h-12 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share className="w-6 h-6 text-white" />
                  </motion.button>
                  
                  <div className="flex items-center gap-3">
                    {/* README Toggle Button */}
                    {nowPlayingProject.readme && (
                      <motion.button
                        onClick={() => setShowReadmeInPlayer(!showReadmeInPlayer)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-full border transition-all ${
                          showReadmeInPlayer
                            ? 'bg-white/30 border-white/40 text-white'
                            : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                          borderColor: showReadmeInPlayer && isPlaying 
                            ? ['rgba(255,255,255,0.4)', 'rgba(34,197,94,0.6)', 'rgba(255,255,255,0.4)']
                            : undefined
                        }}
                        transition={{
                          duration: 2,
                          repeat: showReadmeInPlayer && isPlaying ? Infinity : 0
                        }}
                      >
                        <motion.div
                          animate={{
                            rotate: showReadmeInPlayer ? [0, 360] : 0
                          }}
                          transition={{
                            duration: 2,
                            ease: "linear",
                            repeat: showReadmeInPlayer ? Infinity : 0
                          }}
                        >
                          📖
                        </motion.div>
                        <span className="text-sm font-medium">
                          {showReadmeInPlayer ? 'README' : 'Show README'}
                        </span>
                      </motion.button>
                    )}
                    
                    <motion.button
                      onClick={() => window.open(nowPlayingProject.html_url, '_blank')}
                      className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30"
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ExternalLink className="w-4 h-4 text-white" />
                      <span className="text-white font-medium text-sm">View Code</span>
                    </motion.button>
                  </div>
                  
                  <motion.button
                    className="w-12 h-12 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Shuffle className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 