'use client'

import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Github, Music, Play, Pause, SkipForward, SkipBack, Volume2, Star, GitFork, Menu, X, Search, Heart, Shuffle, Repeat, ExternalLink } from 'lucide-react'
import { repositoriesAtom } from '@/lib/store'
import { fetchRepositories } from '@/lib/github'
import { ProjectCarousel } from '@/components/project-carousel'
import { MusicPlayer } from '@/components/music-player'
import { SearchFilter } from '@/components/search-filter'
import { AlbumGrid } from '@/components/album-grid'
import { getProjectIcon, generateThumbnailDesign } from '@/lib/utils'

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

  // Filter repositories
  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = !selectedLanguage || repo.language === selectedLanguage
    return matchesSearch && matchesLanguage
  })

  // Get unique languages
  const languages = Array.from(new Set(repositories.map(repo => repo.language).filter(Boolean)))

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

              {/* Currently Playing Preview */}
              {nowPlayingProject && (
                <motion.div 
                  className="lg:w-80 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <p className="text-sm text-gray-400 mb-3">Now Playing</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-xl">{getProjectIcon(nowPlayingProject.name, nowPlayingProject.description).icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{nowPlayingProject.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{nowPlayingProject.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(totalTime)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={prevProject}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={togglePlay}
                        className="w-10 h-10 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center transition-colors"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black ml-0.5" />}
                      </button>
                      <button 
                        onClick={nextProject}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-gray-400" />
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
            <AlbumGrid />
          ) : (
            <ProjectCarousel />
          )}
        </motion.div>
      </div>

      {/* Hidden components for functionality */}
      <div className="hidden">
        <SearchFilter />
        <MusicPlayer />
      </div>
    </div>
  )
} 