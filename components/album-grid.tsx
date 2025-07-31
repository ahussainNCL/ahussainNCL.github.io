'use client'

import { useAtom } from 'jotai'
import { motion } from 'framer-motion'
import { ExternalLink, Star, GitFork } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🎵</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No tracks found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRepos.map((repo, index) => {
        const projectIcon = getProjectIcon(repo.name, repo.description)
        const thumbnailDesign = generateThumbnailDesign(repo.name, repo.description)
        
        return (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => handleAlbumClick(index)}
          >
            <div className="album-cover aspect-square mb-4 relative overflow-hidden">
              {repo.socialPreview ? (
                <img
                  src={repo.socialPreview}
                  alt={repo.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              
              {/* Enhanced fallback gradient cover with patterns and glow effects */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${thumbnailDesign.gradient} pattern-${thumbnailDesign.pattern} ${repo.socialPreview ? 'hidden' : ''}`}
                style={{
                  '--gradient-start': 'var(--tw-gradient-from)',
                  '--gradient-end': 'var(--tw-gradient-to)',
                } as React.CSSProperties}
              >
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-20"></div>
                
                {/* Main icon with glow effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-white text-5xl font-bold ${thumbnailDesign.iconStyle} transition-all duration-300 group-hover:scale-110`}>
                    {projectIcon.icon}
                  </div>
                </div>
                
                {/* Accent elements */}
                <div className={`absolute top-4 right-4 w-3 h-3 ${thumbnailDesign.accentColor} rounded-full opacity-80`}></div>
                <div className={`absolute bottom-4 left-4 w-2 h-2 ${thumbnailDesign.accentColor} rounded-full opacity-60`}></div>
                
                {/* Project type label */}
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium">
                  {projectIcon.label}
                </div>
                
                {/* Subtle geometric accent */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/10 rounded-full opacity-30"></div>
              </div>

              {/* Play button overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>

              {/* Stats overlay */}
              <div className="absolute top-3 right-3 flex items-center space-x-2 text-white text-sm">
                <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                  <Star className="w-3 h-3" />
                  <span>{repo.stargazers_count}</span>
                </div>
                <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                  <GitFork className="w-3 h-3" />
                  <span>{repo.forks_count}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground group-hover:text-spotify-green transition-colors">
                {repo.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {repo.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground bg-gray-800 px-2 py-1 rounded">
                  {repo.language}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
} 