import { atom } from 'jotai'

export interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
  topics: string[]
  readme?: string
  socialPreview?: string
}

export interface PlayerState {
  isPlaying: boolean
  currentTime: number
  totalTime: number
  currentRepoIndex: number
  isVisible: boolean
}

export const repositoriesAtom = atom<Repository[]>([])
export const playerStateAtom = atom<PlayerState>({
  isPlaying: false,
  currentTime: 0,
  totalTime: 180, // 3 minutes default
  currentRepoIndex: 0,
  isVisible: false,
})
export const searchQueryAtom = atom('')
export const selectedLanguageAtom = atom<string | null>(null)
export const centeredProjectIndexAtom = atom(0) 