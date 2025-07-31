'use client'

import { useAtom } from 'jotai'
import { motion } from 'framer-motion'
import { ExternalLink, Star, GitFork, Play, Heart, MoreHorizontal } from 'lucide-react'
import { repositoriesAtom, playerStateAtom, searchQueryAtom, selectedLanguageAtom } from '@/lib/store'
import { generateGradient, getProjectIcon, generateThumbnailDesign } from '@/lib/utils'

export function AlbumGrid() {
  const [repositories] = useAtom(repositoriesAtom)
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

  const handleAlbumClick = (repoIndex: number) => {
    setPlayerState(prev => ({
      ...prev,
      currentRepoIndex: repoIndex,
      isVisible: true,
      isPlaying: true,
      currentTime: 0
    }))
  }

  if (filteredRepos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <motion.div 
          className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <span className="text-4xl">🎵</span>
        </motion.div>
        <motion.h3 
          className="text-2xl font-semibold text-white mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          No tracks found
        </motion.h3>
        <motion.p 
          className="text-gray-400 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Try adjusting your search or filter criteria to discover more projects
        </motion.p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredRepos.map((repo, index) => {
        const projectIcon = getProjectIcon(repo.name, repo.description)
        const thumbnailDesign = generateThumbnailDesign(repo.name, repo.description)
        
        return (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.6 }}
            className="group cursor-pointer"
            onClick={() => handleAlbumClick(index)}
          >
            {/* Modern Card Container */}
            <div className="glass-card p-4 hover:scale-[1.02] transition-all duration-500">
              {/* Album Cover with Enhanced Design */}
              <div className="album-cover aspect-square mb-4 relative overflow-hidden">
                {repo.socialPreview ? (
                  <img
                    src={repo.socialPreview}
                    alt={repo.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                
                {/* Enhanced fallback with modern patterns */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${thumbnailDesign.gradient} pattern-${thumbnailDesign.pattern} ${repo.socialPreview ? 'hidden' : ''}`}
                >
                  {/* Animated background overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"></div>
                  
                  {/* Main icon with enhanced glow */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className={`text-white text-6xl font-bold ${thumbnailDesign.iconStyle} transition-all duration-500 group-hover:scale-110`}
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {projectIcon.icon}
                    </motion.div>
                  </div>
                  
                  {/* Floating accent elements */}
                  <motion.div 
                    className={`absolute top-6 right-6 w-3 h-3 ${thumbnailDesign.accentColor} rounded-full opacity-80`}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div 
                    className={`absolute bottom-6 left-6 w-2 h-2 ${thumbnailDesign.accentColor} rounded-full opacity-60`}
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 0.9, 0.6]
                    }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  />
                  
                  {/* Modern project type badge */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="text-xs text-white font-medium">{projectIcon.label}</span>
                  </div>
                  
                  {/* Geometric accent ring */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <motion.div 
                      className="w-20 h-20 border border-white/20 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 20,
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
                  whileHover={{ opacity: 1 }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Play className="w-7 h-7 text-black ml-1" fill="currentColor" />
                  </motion.div>
                </motion.div>

                {/* Enhanced stats overlay */}
                <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <motion.div 
                    className="flex items-center space-x-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-white font-medium">{repo.stargazers_count}</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10"
                    whileHover={{ scale: 1.05 }}
                  >
                    <GitFork className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-white font-medium">{repo.forks_count}</span>
                  </motion.div>
                </div>

                {/* Corner action buttons */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <motion.button
                    className="w-8 h-8 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(repo.html_url, '_blank')
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </motion.button>
                  <motion.button
                    className="w-8 h-8 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-red-500/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="w-3.5 h-3.5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Enhanced project info */}
              <div className="space-y-3">
                <div>
                  <motion.h3 
                    className="font-semibold text-white group-hover:text-green-400 transition-colors duration-300 truncate"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {repo.name.replace(/-/g, ' ')}
                  </motion.h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                    {repo.description || "No description available"}
                  </p>
                </div>
                
                {/* Enhanced bottom section */}
                <div className="flex items-center justify-between">
                  <motion.span 
                    className="text-xs bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 px-3 py-1 rounded-full border border-gray-600/50"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {repo.language || 'Unknown'}
                  </motion.span>
                  
                  <div className="flex items-center space-x-3 text-gray-400">
                    <motion.div 
                      className="flex items-center space-x-1"
                      whileHover={{ scale: 1.05, color: '#fbbf24' }}
                      transition={{ duration: 0.2 }}
                    >
                      <Star className="w-3 h-3" />
                      <span className="text-xs font-medium">{repo.stargazers_count}</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center space-x-1"
                      whileHover={{ scale: 1.05, color: '#60a5fa' }}
                      transition={{ duration: 0.2 }}
                    >
                      <GitFork className="w-3 h-3" />
                      <span className="text-xs font-medium">{repo.forks_count}</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
} 