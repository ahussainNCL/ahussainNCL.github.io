'use client'

import { useAtom } from 'jotai'
import { motion } from 'framer-motion'
import { ExternalLink, Star, GitFork, Play, Heart, MoreHorizontal } from 'lucide-react'
import { repositoriesAtom, searchQueryAtom, selectedLanguageAtom } from '@/lib/store'
import { generateGradient, getProjectIcon, generateThumbnailDesign } from '@/lib/utils'

interface AlbumGridProps {
  onPlayProject?: (project: any) => void;
}

export function AlbumGrid({ onPlayProject }: AlbumGridProps) {
  const [repositories] = useAtom(repositoriesAtom)
  const [searchQuery] = useAtom(searchQueryAtom)
  const [selectedLanguage] = useAtom(selectedLanguageAtom)

  // Filter repositories based on search and language
  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = !selectedLanguage || repo.language === selectedLanguage
    return matchesSearch && matchesLanguage
  })

  const handleAlbumClick = (repo: any) => {
    // Use the onPlayProject prop if provided (for main page integration)
    if (onPlayProject) {
      onPlayProject(repo);
    }
  }

  if (filteredRepos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <motion.div 
          className="w-32 h-32 bg-gradient-to-br from-gray-700/20 to-gray-800/20 rounded-3xl flex items-center justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <span className="text-6xl">🎵</span>
        </motion.div>
        <motion.h3 
          className="text-3xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          No tracks found
        </motion.h3>
        <motion.p 
          className="text-gray-400 max-w-md text-lg"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {filteredRepos.map((repo, index) => {
        const projectIcon = getProjectIcon(repo.name, repo.description)
        const thumbnailDesign = generateThumbnailDesign(repo.name, repo.description)
        
        return (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.05, 
              duration: 0.6,
              type: "spring",
              damping: 20,
              stiffness: 100
            }}
            className="group cursor-pointer"
            onClick={() => handleAlbumClick(repo)}
          >
            {/* Enhanced Modern Card Container */}
            <div className="glass-card p-5 hover:scale-[1.02] transition-all duration-500 interactive-card">
              {/* Enhanced Album Cover with modern 3D effects */}
              <div className="album-cover aspect-square mb-6 relative overflow-hidden">
                {repo.socialPreview ? (
                  <motion.img
                    src={repo.socialPreview}
                    alt={repo.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : null}
                
                {/* Enhanced fallback with modern patterns and animations */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${thumbnailDesign.gradient} pattern-${thumbnailDesign.pattern} ${repo.socialPreview ? 'hidden' : ''}`}
                >
                  {/* Animated background overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"
                    animate={{
                      background: [
                        'linear-gradient(45deg, rgba(0,0,0,0.2), transparent, rgba(0,0,0,0.4))',
                        'linear-gradient(225deg, rgba(0,0,0,0.4), transparent, rgba(0,0,0,0.2))',
                        'linear-gradient(45deg, rgba(0,0,0,0.2), transparent, rgba(0,0,0,0.4))'
                      ]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Main icon with enhanced glow and hover effects */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className={`text-white text-7xl font-bold ${thumbnailDesign.iconStyle} transition-all duration-500`}
                      whileHover={{ 
                        rotate: [0, -5, 5, 0],
                        scale: 1.1,
                        textShadow: "0 0 30px rgba(255,255,255,0.8)"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {projectIcon.icon}
                    </motion.div>
                  </div>
                  
                  {/* Enhanced floating accent elements with physics */}
                  <motion.div 
                    className={`absolute top-8 right-8 w-4 h-4 ${thumbnailDesign.accentColor} rounded-full`}
                    animate={{ 
                      scale: [1, 1.3, 1],
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
                      scale: [1, 1.4, 1],
                      opacity: [0.6, 0.9, 0.6],
                      x: [0, 10, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                  <motion.div 
                    className={`absolute top-1/3 left-1/4 w-2 h-2 ${thumbnailDesign.accentColor} rounded-full`}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 0.8, 0.4],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2
                    }}
                  />
                  
                  {/* Modern project type badge with glow */}
                  <motion.div 
                    className="absolute bottom-4 left-4 glass-morphism-light px-3 py-2 rounded-xl border border-white/20"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-xs text-white font-semibold tracking-wide">{projectIcon.label}</span>
                  </motion.div>
                  
                  {/* Enhanced geometric accent elements */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <motion.div 
                      className="w-24 h-24 border border-white/15 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <motion.div 
                      className="absolute inset-2 border border-white/10 rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{ 
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </div>
                </div>

                {/* Enhanced play button overlay with modern design */}
                <motion.div 
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    animate={{
                      boxShadow: [
                        "0 10px 30px rgba(34, 197, 94, 0.4)",
                        "0 15px 40px rgba(34, 197, 94, 0.6)",
                        "0 10px 30px rgba(34, 197, 94, 0.4)"
                      ]
                    }}
                  >
                    <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                </motion.div>

                {/* Enhanced stats overlay with animations */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <motion.div 
                    className="flex items-center space-x-1 glass-morphism px-3 py-1.5 rounded-xl border border-white/20"
                    whileHover={{ scale: 1.05, x: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-white font-semibold">{repo.stargazers_count}</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-1 glass-morphism px-3 py-1.5 rounded-xl border border-white/20"
                    whileHover={{ scale: 1.05, x: -5 }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                  >
                    <GitFork className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-white font-semibold">{repo.forks_count}</span>
                  </motion.div>
                </div>

                {/* Enhanced corner action buttons */}
                <div className="absolute bottom-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <motion.button
                    className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center border border-white/20 hover:border-green-400/50 hover:bg-green-500/20 transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(repo.html_url, '_blank')
                    }}
                  >
                    <ExternalLink className="w-4 h-4 text-white" />
                  </motion.button>
                  <motion.button
                    className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center border border-white/20 hover:border-red-400/50 hover:bg-red-500/20 transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="w-4 h-4 text-white" />
                  </motion.button>
                </div>

                {/* Loading shimmer effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: index * 0.1 
                  }}
                />
              </div>

              {/* Enhanced project info with better typography */}
              <div className="space-y-4">
                <div>
                  <motion.h3 
                    className="font-bold text-white group-hover:text-green-400 transition-all duration-300 truncate text-lg"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    {repo.name.replace(/-/g, ' ')}
                  </motion.h3>
                  <motion.p 
                    className="text-sm text-gray-400 line-clamp-2 mt-2 leading-relaxed"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {repo.description || "No description available"}
                  </motion.p>
                </div>
                
                {/* Enhanced bottom section with better spacing */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className={`text-xs glass-morphism text-gray-300 px-3 py-1.5 rounded-full border ${
                      repo.language === 'TypeScript' ? 'border-blue-500/30 bg-blue-500/10' :
                      repo.language === 'JavaScript' ? 'border-yellow-500/30 bg-yellow-500/10' :
                      repo.language === 'Python' ? 'border-green-500/30 bg-green-500/10' :
                      repo.language === 'React' ? 'border-cyan-500/30 bg-cyan-500/10' :
                      'border-gray-600/30'
                    }`}>
                      {repo.language || 'Unknown'}
                    </span>
                  </motion.div>
                  
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