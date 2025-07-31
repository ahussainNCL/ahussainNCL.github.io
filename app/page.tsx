'use client'

import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Github, Music, Play, Pause, SkipForward, SkipBack, Volume2, Star, GitFork, Menu, X, Search, Heart, Shuffle, Repeat, ExternalLink, Share, MoreHorizontal, Command, Filter, SortAsc, Grid, List, Zap, TrendingUp, Clock } from 'lucide-react'
import { repositoriesAtom } from '@/lib/store'
import { fetchRepositories } from '@/lib/github'
import { ProjectCarousel } from '@/components/project-carousel'
import { MusicPlayer } from '@/components/music-player'
import { SearchFilter } from '@/components/search-filter'
import { AlbumGrid } from '@/components/album-grid'
import { CommandPalette } from '@/components/command-palette'
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getProjectIcon, generateThumbnailDesign, formatTime } from '@/lib/utils'

// Sort options for projects
const SORT_OPTIONS = [
  { value: 'updated', label: 'Recently Updated', icon: Clock },
  { value: 'stars', label: 'Most Stars', icon: Star },
  { value: 'forks', label: 'Most Forks', icon: GitFork },
  { value: 'name', label: 'Name A-Z', icon: SortAsc },
]

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
  const [sortBy, setSortBy] = useState('updated')
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false)
  const [showReadmeInPlayer, setShowReadmeInPlayer] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command/Ctrl + K to open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setCommandPaletteOpen(true)
      }
      
      // Global player controls
      if (event.target === document.body || (event.target as HTMLElement).tagName === 'BODY') {
        switch (event.code) {
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
          case 'KeyF':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault()
              setShowFilters(!showFilters)
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, showFilters])

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

  // Enhanced filtering and sorting
  const filteredAndSortedRepos = repositories
    .filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLanguage = !selectedLanguage || repo.language === selectedLanguage
      return matchesSearch && matchesLanguage
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count
        case 'forks':
          return b.forks_count - a.forks_count
        case 'name':
          return a.name.localeCompare(b.name)
        case 'updated':
        default:
          return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      }
    })

  // Get unique languages
  const languages = Array.from(new Set(repositories.map(repo => repo.language).filter(Boolean)))

  // Statistics
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
          <motion.div 
            className="absolute top-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        {/* Modern Sidebar Navigation */}
        <div className="fixed left-0 top-0 h-full w-64 bg-black/40 backdrop-blur-2xl border-r border-white/10 z-40 hidden lg:block">
          <div className="p-6">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center relative overflow-hidden">
                <Music className="w-5 h-5 text-white relative z-10" />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div>
                <span className="font-bold text-xl text-gradient">GitHub Player</span>
                <p className="text-xs text-white/60">v2.0 Enhanced</p>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              className="grid grid-cols-2 gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="glass-card p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{repositories.length}</div>
                <div className="text-xs text-white/60">Projects</div>
              </div>
              <div className="glass-card p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{totalStars}</div>
                <div className="text-xs text-white/60">Stars</div>
              </div>
            </motion.div>

            {/* Navigation Items */}
            <motion.nav 
              className="space-y-2 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button 
                onClick={() => setActiveView('grid')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeView === 'grid' 
                    ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-white border border-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Grid className="w-4 h-4" />
                Browse All
                <span className="ml-auto text-xs bg-white/10 px-2 py-1 rounded-full">
                  {filteredAndSortedRepos.length}
                </span>
              </button>
              <button 
                onClick={() => setActiveView('carousel')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeView === 'carousel' 
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <List className="w-4 h-4" />
                Featured Projects
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => setCommandPaletteOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
                  >
                    <Command className="w-4 h-4" />
                    Quick Search
                    <span className="ml-auto text-xs bg-white/10 px-2 py-1 rounded-full">⌘K</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open command palette (⌘K)</p>
                </TooltipContent>
              </Tooltip>
            </motion.nav>

            {/* Recently Played */}
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Top Performers
              </h3>
              <div className="space-y-2">
                {repositories
                  .sort((a, b) => b.stargazers_count - a.stargazers_count)
                  .slice(0, 3)
                  .map((repo, index) => (
                  <motion.button
                    key={repo.id}
                    onClick={() => handleProjectClick(repo)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 text-left group"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center flex-shrink-0 relative">
                      <span className="text-sm">{getProjectIcon(repo.name, repo.description).icon}</span>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs">👑</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate group-hover:text-yellow-400 transition-colors">
                        {repo.name.replace(/-/g, ' ')}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {repo.stargazers_count}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span>{repo.language}</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gradient">GitHub Player</span>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setCommandPaletteOpen(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Command className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search projects</p>
                </TooltipContent>
              </Tooltip>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-black/90 backdrop-blur-2xl border-r border-white/10 z-40"
            >
              <div className="p-6">
                {/* Quick Stats Mobile */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="glass-card p-3 text-center">
                    <div className="text-xl font-bold text-green-400">{repositories.length}</div>
                    <div className="text-xs text-white/60">Projects</div>
                  </div>
                  <div className="glass-card p-3 text-center">
                    <div className="text-xl font-bold text-yellow-400">{totalStars}</div>
                    <div className="text-xs text-white/60">Stars</div>
                  </div>
                </div>

                <nav className="space-y-2">
                  <button 
                    onClick={() => {
                      setActiveView('grid')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeView === 'grid' 
                        ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-white border border-white/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    Browse All
                  </button>
                  <button 
                    onClick={() => {
                      setActiveView('carousel')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeView === 'carousel' 
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-white/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    Featured Projects
                  </button>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="lg:ml-64 min-h-screen">
          {/* Enhanced Hero Section */}
          <motion.div 
            ref={heroRef}
            className="relative px-6 lg:px-8 pt-20 lg:pt-8 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1">
                  <motion.div 
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/10 rounded-full px-4 py-2 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1, duration: 0.8 }}
                  >
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Enhanced Portfolio Experience</span>
                  </motion.div>

                  <motion.h1 
                    className="text-4xl lg:text-7xl font-bold mb-6 leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                      Abdullah's
                    </span>
                    <br />
                    <span className="text-gradient">
                      Code Symphony
                    </span>
                  </motion.h1>

                  <motion.p 
                    className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    Discover, explore, and experience my GitHub projects like never before. 
                    An interactive musical journey through code, creativity, and innovation.
                  </motion.p>

                  <motion.div 
                    className="flex flex-wrap gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    <div className="glass-card px-4 py-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">{repositories.length} Projects</span>
                    </div>
                    <div className="glass-card px-4 py-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium">{totalStars} Stars</span>
                    </div>
                    <div className="glass-card px-4 py-2 flex items-center gap-2">
                      <GitFork className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium">{totalForks} Forks</span>
                    </div>
                    <div className="glass-card px-4 py-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <span className="text-sm font-medium">{languages.length} Languages</span>
                    </div>
                  </motion.div>
                </div>

                {/* Enhanced Now Playing Card */}
                {nowPlayingProject && (
                  <motion.div 
                    className="lg:w-96 xl:w-[28rem]"
                    initial={{ opacity: 0, x: 20 }}
                    animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  >
                    <div className="glass-card p-6 relative overflow-hidden">
                      {/* Animated background */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5"
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
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ 
                                rotate: isPlaying ? 360 : 0,
                                scale: isPlaying ? [1, 1.05, 1] : 1
                              }}
                              transition={{ 
                                rotate: { duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" },
                                scale: { duration: 2, repeat: isPlaying ? Infinity : 0 }
                              }}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center relative overflow-hidden"
                            >
                              <Music className="w-4 h-4 text-white relative z-10" />
                              {isPlaying && (
                                <motion.div 
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                  animate={{ x: ['-100%', '100%'] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                              )}
                            </motion.div>
                            <div>
                              <h3 className="text-sm font-semibold text-green-400">Now Playing</h3>
                              <p className="text-xs text-white/60">Interactive Mode</p>
                            </div>
                          </div>
                          <motion.div 
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                              isPlaying 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
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
                            className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center relative overflow-hidden shadow-lg"
                            animate={{
                              scale: isPlaying ? [1, 1.03, 1] : 1,
                              rotate: isPlaying ? [0, 0.5, -0.5, 0] : 0,
                            }}
                            transition={{
                              duration: 3,
                              repeat: isPlaying ? Infinity : 0,
                              ease: "easeInOut"
                            }}
                          >
                            <span className="text-2xl relative z-10 text-black font-bold">
                              {getProjectIcon(nowPlayingProject.name, nowPlayingProject.description).icon}
                            </span>
                            {isPlaying && (
                              <>
                                <motion.div 
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                                  animate={{ x: ['-100%', '100%'] }}
                                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div 
                                  className="absolute inset-0 border-2 border-green-400 rounded-xl"
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
                            <p className="text-sm text-gray-300 truncate mb-3">
                              {nowPlayingProject.description}
                            </p>
                            <div className="flex items-center gap-3">
                              <motion.span 
                                className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 font-medium"
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
                                <Star className="w-3 h-3 text-yellow-400" />
                                {nowPlayingProject.stargazers_count}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <GitFork className="w-3 h-3 text-blue-400" />
                                {nowPlayingProject.forks_count}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Progress Section */}
                        <div className="mb-6">
                          <div className="w-full h-2 bg-gray-600/30 rounded-full overflow-hidden relative group cursor-pointer hover:h-2.5 transition-all duration-200">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 relative"
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
                                whileHover={{ scale: 1.2 }}
                              />
                            </motion.div>
                            
                            {/* Chapter markers */}
                            {[25, 50, 75].map((marker, index) => (
                              <motion.div
                                key={marker}
                                className="absolute top-0 w-0.5 h-full"
                                style={{ left: `${marker}%` }}
                                animate={{
                                  opacity: progress > marker ? 1 : 0.4,
                                  backgroundColor: progress > marker ? '#22c55e' : '#ffffff99'
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
                              className="text-center mt-3"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                {progress < 25 ? '📖 Overview' :
                                 progress < 50 ? '⚙️ Features' :
                                 progress < 75 ? '🔧 Technical' :
                                 '🎯 Implementation'}
                              </span>
                            </motion.div>
                          )}
                        </div>

                        {/* Enhanced Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.button 
                                  onClick={prevProject}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <SkipBack className="w-5 h-5 fill-current" />
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>Previous project</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.button 
                                  onClick={togglePlay}
                                  className="w-14 h-14 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-all relative overflow-hidden shadow-lg"
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
                                  <AnimatePresence mode="wait">
                                    {isPlaying ? (
                                      <motion.div
                                        key="pause"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Pause className="w-6 h-6 text-black fill-current" />
                                      </motion.div>
                                    ) : (
                                      <motion.div
                                        key="play"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Play className="w-6 h-6 text-black ml-0.5 fill-current" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.button 
                                  onClick={nextProject}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <SkipForward className="w-5 h-5 fill-current" />
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>Next project</TooltipContent>
                            </Tooltip>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.button
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-green-400"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setIsFullPlayerVisible(true)}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>Open full player</TooltipContent>
                            </Tooltip>
                            <div className="flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-gray-400" />
                              <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
                                <div className="w-3/4 h-full bg-green-500 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Enhanced Search and Filter Section */}
          <motion.div 
            className="px-6 lg:px-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isProjectsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Enhanced Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, languages, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 glass-morphism text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="glass-morphism px-4 py-3 pr-8 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-green-500/50 appearance-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <SortAsc className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Filter Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`glass-morphism p-3 transition-all duration-300 ${
                        showFilters ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle filters (Ctrl+F)</TooltipContent>
                </Tooltip>

                {/* View Toggle */}
                <div className="glass-morphism p-1 flex">
                  <button
                    onClick={() => setActiveView('grid')}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      activeView === 'grid'
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveView('carousel')}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      activeView === 'carousel'
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Language Filter */}
            <AnimatePresence>
              {(showFilters || languages.length > 0) && (
                <motion.div 
                  className="mt-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      onClick={() => setSelectedLanguage(null)}
                      className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                        selectedLanguage === null
                          ? 'bg-green-500 text-white shadow-glow'
                          : 'glass-morphism text-gray-400 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      All ({repositories.length})
                    </motion.button>
                    {languages.map((language) => {
                      const count = repositories.filter(repo => repo.language === language).length
                      return (
                        <motion.button
                          key={language}
                          onClick={() => setSelectedLanguage(language)}
                          className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                            selectedLanguage === language
                              ? 'bg-green-500 text-white shadow-glow'
                              : 'glass-morphism text-gray-400 hover:text-white'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {language} ({count})
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Summary */}
            <motion.div 
              className="mt-4 text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Showing {filteredAndSortedRepos.length} of {repositories.length} projects
              {searchQuery && (
                <span className="text-green-400"> matching "{searchQuery}"</span>
              )}
              {selectedLanguage && (
                <span className="text-blue-400"> in {selectedLanguage}</span>
              )}
            </motion.div>
          </motion.div>

          {/* Enhanced Projects Section */}
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

        {/* Enhanced Command Palette */}
        <CommandPalette 
          open={commandPaletteOpen} 
          onOpenChange={setCommandPaletteOpen}
          onSelectProject={handlePlayProject}
        />

        {/* Hidden components for functionality */}
        <div className="hidden">
          <SearchFilter />
          <MusicPlayer />
        </div>

        {/* Enhanced Full-Screen Player (keeping existing functionality) */}
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
                      <AnimatePresence mode="wait">
                        {isPlaying ? (
                          <motion.div
                            key="pause"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Pause className="w-10 h-10 text-black fill-current" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="play"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Play className="w-10 h-10 text-black ml-1 fill-current" />
                          </motion.div>
                        )}
                      </AnimatePresence>
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
    </TooltipProvider>
  )
} 