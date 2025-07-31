'use client'

import { useAtom } from 'jotai'
import { Search, Filter } from 'lucide-react'
import { repositoriesAtom, searchQueryAtom, selectedLanguageAtom } from '@/lib/store'

export function SearchFilter() {
  const [repositories] = useAtom(repositoriesAtom)
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom)
  const [selectedLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom)

  // Get unique languages from repositories
  const languages = Array.from(new Set(repositories.map(repo => repo.language).filter(Boolean)))

  return (
    <div className="space-y-4 mb-8">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Language filter */}
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter by:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLanguage(null)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedLanguage === null
                ? 'bg-spotify-green text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {languages.map((language) => (
            <button
              key={language}
              onClick={() => setSelectedLanguage(language)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedLanguage === language
                  ? 'bg-spotify-green text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {language}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 