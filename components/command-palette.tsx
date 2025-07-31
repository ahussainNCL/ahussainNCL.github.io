'use client'

import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { repositoriesAtom } from '@/lib/store'
import { getProjectIcon } from '@/lib/utils'
import { Search, Code, Star, GitFork, Calendar, Tag, ExternalLink } from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectProject: (project: any) => void
}

export function CommandPalette({ open, onOpenChange, onSelectProject }: CommandPaletteProps) {
  const [repositories] = useAtom(repositoriesAtom)
  const [searchQuery, setSearchQuery] = useState('')

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('')
    }
  }, [open])

  // Group repositories by categories
  const recentRepos = repositories.slice(0, 5)
  const starredRepos = repositories.filter(repo => repo.stargazers_count > 10).slice(0, 5)
  const languageGroups = repositories.reduce((acc, repo) => {
    if (!repo.language) return acc
    if (!acc[repo.language]) acc[repo.language] = []
    acc[repo.language].push(repo)
    return acc
  }, {} as Record<string, any[]>)

  const handleSelect = (repo: any) => {
    onSelectProject(repo)
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="glass-morphism border-white/20">
        <Command className="bg-transparent">
          <div className="flex items-center border-b border-white/10 px-4 py-3">
            <Search className="mr-3 h-5 w-5 text-white/60" />
            <CommandInput
              placeholder="Search projects, languages, or descriptions..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="text-white placeholder:text-white/50 border-none bg-transparent"
            />
          </div>
          <CommandList className="max-h-[70vh] custom-scrollbar">
            <CommandEmpty>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-8 text-white/60"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium mb-2">No projects found</p>
                <p className="text-sm">Try searching for a different term</p>
              </motion.div>
            </CommandEmpty>

            {!searchQuery && (
              <>
                <CommandGroup heading="Recent Projects">
                  {recentRepos.map((repo, index) => {
                    const icon = getProjectIcon(repo.name, repo.description)
                    return (
                      <CommandItem
                        key={repo.id}
                        value={`${repo.name} ${repo.description}`}
                        onSelect={() => handleSelect(repo)}
                        className="group flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-200"
                      >
                        <motion.div 
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400/20 to-blue-500/20 flex items-center justify-center flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-lg">{icon.icon}</span>
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium group-hover:text-green-400 transition-colors truncate">
                            {repo.name.replace(/-/g, ' ')}
                          </h3>
                          <p className="text-white/60 text-sm truncate">
                            {repo.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-white/40 flex items-center gap-1">
                              <Code className="w-3 h-3" />
                              {repo.language || 'Unknown'}
                            </span>
                            <span className="text-xs text-white/40 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {repo.stargazers_count}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>

                {starredRepos.length > 0 && (
                  <CommandGroup heading="Popular Projects">
                    {starredRepos.map((repo) => {
                      const icon = getProjectIcon(repo.name, repo.description)
                      return (
                        <CommandItem
                          key={repo.id}
                          value={`${repo.name} ${repo.description}`}
                          onSelect={() => handleSelect(repo)}
                          className="group flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-200"
                        >
                          <motion.div 
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-500/20 flex items-center justify-center flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="text-lg">{icon.icon}</span>
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors truncate">
                              {repo.name.replace(/-/g, ' ')}
                            </h3>
                            <p className="text-white/60 text-sm truncate">
                              {repo.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-white/40 flex items-center gap-1">
                                <Code className="w-3 h-3" />
                                {repo.language || 'Unknown'}
                              </span>
                              <span className="text-xs text-yellow-400 flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {repo.stargazers_count}
                              </span>
                              <span className="text-xs text-blue-400 flex items-center gap-1">
                                <GitFork className="w-3 h-3" />
                                {repo.forks_count}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                              Popular
                            </span>
                            <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                )}

                <CommandGroup heading="Browse by Language">
                  {Object.entries(languageGroups)
                    .sort(([, a], [, b]) => b.length - a.length)
                    .slice(0, 6)
                    .map(([language, repos]) => (
                      <CommandItem
                        key={language}
                        value={language}
                        onSelect={() => {
                          // Select first repo of this language
                          handleSelect(repos[0])
                        }}
                        className="group flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-200"
                      >
                        <motion.div 
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-teal-500/20 flex items-center justify-center flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Tag className="w-5 h-5 text-cyan-400" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                            {language}
                          </h3>
                          <p className="text-white/60 text-sm">
                            {repos.length} project{repos.length > 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">
                          {repos.length}
                        </span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </>
            )}

            {searchQuery && (
              <CommandGroup heading="Search Results">
                {repositories
                  .filter(repo => 
                    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    repo.language?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((repo) => {
                    const icon = getProjectIcon(repo.name, repo.description)
                    return (
                      <CommandItem
                        key={repo.id}
                        value={`${repo.name} ${repo.description}`}
                        onSelect={() => handleSelect(repo)}
                        className="group flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-200"
                      >
                        <motion.div 
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400/20 to-red-500/20 flex items-center justify-center flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-lg">{icon.icon}</span>
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium group-hover:text-orange-400 transition-colors truncate">
                            {repo.name.replace(/-/g, ' ')}
                          </h3>
                          <p className="text-white/60 text-sm truncate">
                            {repo.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-white/40 flex items-center gap-1">
                              <Code className="w-3 h-3" />
                              {repo.language || 'Unknown'}
                            </span>
                            <span className="text-xs text-white/40 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {repo.stargazers_count}
                            </span>
                            <span className="text-xs text-white/40 flex items-center gap-1">
                              <GitFork className="w-3 h-3" />
                              {repo.forks_count}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                      </CommandItem>
                    )
                  })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </div>
    </CommandDialog>
  )
}