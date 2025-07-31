'use client'

import { useAtom } from 'jotai'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play, Star, GitFork, ExternalLink } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🎵</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No tracks found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
      </div>
    )
  }

  const currentRepo = filteredRepos[centeredIndex]
  const projectIcon = getProjectIcon(currentRepo.name, currentRepo.description)
  const thumbnailDesign = generateThumbnailDesign(currentRepo.name, currentRepo.description)

  return (
    <div className="carousel-container">
      {/* Navigation arrows */}
      <button
        onClick={() => handleSwipe('right')}
        disabled={centeredIndex === 0}
        className="carousel-nav-button left-4 touch-feedback focus-visible"
        aria-label="Previous project"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => handleSwipe('left')}
        disabled={centeredIndex === filteredRepos.length - 1}
        className="carousel-nav-button right-4 touch-feedback focus-visible"
        aria-label="Next project"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main project card */}
      <motion.div
        key={currentRepo.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="carousel-card">
          {/* Project thumbnail */}
          <div className="relative mb-8">
            <div className={`aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${thumbnailDesign.gradient} pattern-${thumbnailDesign.pattern}`}>
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
              
              {/* Enhanced fallback with patterns and glow effects */}
              <div className={`absolute inset-0 ${currentRepo.socialPreview ? 'hidden' : ''}`}>
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-20"></div>
                
                {/* Main icon with glow effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-white text-6xl md:text-8xl font-bold ${thumbnailDesign.iconStyle} transition-all duration-300`}>
                    {projectIcon.icon}
                  </div>
                </div>
                
                {/* Accent elements */}
                <div className={`absolute top-4 md:top-8 right-4 md:right-8 w-3 md:w-4 h-3 md:h-4 ${thumbnailDesign.accentColor} rounded-full opacity-80`}></div>
                <div className={`absolute bottom-4 md:bottom-8 left-4 md:left-8 w-2 md:w-3 h-2 md:h-3 ${thumbnailDesign.accentColor} rounded-full opacity-60`}></div>
                
                {/* Project type label */}
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-black/70 backdrop-blur-sm px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm text-white font-medium">
                  {projectIcon.label}
                </div>
                
                {/* Subtle geometric accent */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 md:w-32 h-24 md:h-32 border border-white/10 rounded-full opacity-30"></div>
              </div>

              {/* Play button overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  onClick={openPlayer}
                  className="w-16 md:w-20 h-16 md:h-20 bg-spotify-green rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform touch-feedback"
                >
                  <Play className="w-6 md:w-8 h-6 md:h-8 text-white ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Project info */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {currentRepo.name}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
              {currentRepo.description}
            </p>
            
            {/* Stats */}
            <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-6 mb-6">
              <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-3 md:px-4 py-2 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">{currentRepo.stargazers_count}</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-3 md:px-4 py-2 rounded-lg">
                <GitFork className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">{currentRepo.forks_count}</span>
              </div>
              <div className="bg-spotify-green/20 backdrop-blur-sm px-3 md:px-4 py-2 rounded-lg">
                <span className="text-spotify-green font-medium">{currentRepo.language}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-4">
              <button
                onClick={openPlayer}
                className="w-full md:w-auto bg-spotify-green hover:bg-spotify-green/90 text-white px-6 md:px-8 py-3 rounded-full font-semibold flex items-center justify-center space-x-2 transition-colors shadow-lg touch-feedback"
              >
                <Play className="w-5 h-5" />
                <span>Play Project</span>
              </button>
              <button
                onClick={openGitHub}
                className="w-full md:w-auto bg-gray-800 hover:bg-gray-700 text-white px-4 md:px-6 py-3 rounded-full font-semibold flex items-center justify-center space-x-2 transition-colors touch-feedback"
              >
                <ExternalLink className="w-5 h-5" />
                <span>View on GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Project counter */}
      <div className="text-center mt-6">
        <span className="text-muted-foreground">
          {centeredIndex + 1} of {filteredRepos.length}
        </span>
      </div>

      {/* Navigation hints */}
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Use arrow keys, swipe, or click arrows to navigate • Press Enter to play
        </p>
      </div>
    </div>
  )
} 