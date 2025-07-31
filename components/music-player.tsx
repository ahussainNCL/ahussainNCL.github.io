'use client'

import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack, ExternalLink, X, Heart, Shuffle, Repeat, MoreHorizontal, List } from 'lucide-react'
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
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="spotify-player"
      >
        {/* Top section with back button and repeat */}
        <div className="flex items-center justify-between px-6 pt-12 pb-4">
          <button
            onClick={closePlayer}
            className="spotify-control-button"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-sm text-white/70">Playing from portfolio: Projects</p>
          </div>
          <button className="spotify-control-button">
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col px-6">
          {/* Album art */}
          <div className="flex justify-center mb-8">
            <div className={`spotify-album-art bg-gradient-to-br ${thumbnailDesign.gradient} pattern-${thumbnailDesign.pattern}`}>
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
                  <div className={`text-white text-9xl font-bold ${thumbnailDesign.iconStyle} transition-all duration-300`}>
                    {projectIcon.icon}
                  </div>
                </div>
                
                {/* Accent elements */}
                <div className={`absolute top-8 right-8 w-6 h-6 ${thumbnailDesign.accentColor} rounded-full opacity-80`}></div>
                <div className={`absolute bottom-8 left-8 w-4 h-4 ${thumbnailDesign.accentColor} rounded-full opacity-60`}></div>
                
                {/* Project type label */}
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg text-sm text-white font-medium">
                  {projectIcon.label}
                </div>
                
                {/* Subtle geometric accent */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full opacity-30"></div>
              </div>
            </div>
          </div>

          {/* Song info */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white mb-1 truncate">
                {currentRepo.name}
              </h1>
              <p className="text-lg text-white/70 truncate">
                {currentRepo.description}
              </p>
            </div>
            <div className="flex items-center space-x-3 ml-4">
              <button 
                onClick={openGitHub}
                className="spotify-control-button"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button className="spotify-control-button">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="spotify-progress-bar mb-2">
              <motion.div
                className="spotify-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
            <div className="flex justify-between text-sm text-white/70">
              <span>{formatTime(playerState.currentTime)}</span>
              <span>{formatTime(playerState.totalTime)}</span>
            </div>
          </div>

          {/* Main controls */}
          <div className="spotify-controls mb-8">
            <button className="spotify-control-button">
              <List className="w-5 h-5" />
            </button>
            
            <button
              onClick={prevRepo}
              className="spotify-control-button"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={togglePlay}
              className="spotify-play-button"
            >
              {playerState.isPlaying ? (
                <Pause className="w-8 h-8 text-black" />
              ) : (
                <Play className="w-8 h-8 text-black ml-1" />
              )}
            </button>
            
            <button
              onClick={nextRepo}
              className="spotify-control-button"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            
            <button className="spotify-control-button">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom controls */}
          <div className="flex items-center justify-between mb-8">
            <button className="spotify-control-button">
              <Shuffle className="w-5 h-5" />
            </button>
            
            <button className="spotify-text-button">
              <span className="text-lg">≡</span>
              <span className="text-sm">Text</span>
            </button>
            
            <button className="spotify-control-button">
              <Repeat className="w-5 h-5" />
            </button>
          </div>

          {/* Lyrics mode */}
          {currentRepo.readme && (
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-hidden relative">
                <div
                  ref={lyricsRef}
                  className="transition-transform duration-100 ease-linear"
                  style={{
                    transform: `translateY(-${lyricsScroll}%)`,
                  }}
                >
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                    {currentRepo.readme}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 