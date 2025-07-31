import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function generateGradient(name: string): string {
  const colors = [
    'from-purple-500 to-pink-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500', 'from-indigo-500 to-purple-500', 'from-teal-500 to-blue-500',
    'from-pink-500 to-rose-500', 'from-yellow-500 to-orange-500',
  ]
  const hash = name.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
  return colors[Math.abs(hash) % colors.length]
}

export function getProjectIcon(name: string, description: string = ''): { icon: string; label: string } {
  const lowerName = name.toLowerCase()
  const lowerDesc = description.toLowerCase()
  
  // AI/Machine Learning projects
  if (lowerName.includes('ai lung classification') || lowerName.includes('ai') || lowerName.includes('ml') || lowerName.includes('neural') || 
      lowerName.includes('classification') || lowerName.includes('recognition') || lowerDesc.includes('ai') || 
      lowerDesc.includes('machine learning') || lowerDesc.includes('neural')) {
    return { icon: '🤖', label: 'AI/ML' }
  }
  
  // Blockchain/Solidity projects
  if (lowerName.includes('solidity escrow service') || lowerName.includes('solidity') || lowerName.includes('blockchain') || lowerName.includes('escrow') ||
      lowerName.includes('smart') || lowerName.includes('contract') || lowerDesc.includes('blockchain') ||
      lowerDesc.includes('ethereum') || lowerDesc.includes('smart contract')) {
    return { icon: '🔒', label: 'Blockchain' }
  }
  
  // Computer Vision/OpenCV projects
  if (lowerName.includes('opencv facial recognition') || lowerName.includes('opencv') || lowerName.includes('vision') || lowerName.includes('facial') ||
      lowerName.includes('detection') || lowerDesc.includes('computer vision') || lowerDesc.includes('opencv')) {
    return { icon: '👁️', label: 'Computer Vision' }
  }
  
  // NLP/Text Processing projects
  if (lowerName.includes('nlptoolkit') || lowerName.includes('nlp') || lowerName.includes('text') || lowerName.includes('language') ||
      lowerName.includes('sentiment') || lowerDesc.includes('natural language') || lowerDesc.includes('nlp')) {
    return { icon: '📚', label: 'NLP' }
  }
  
  // Web Development projects
  if (lowerName.includes('web') || lowerName.includes('react') || lowerName.includes('vue') ||
      lowerName.includes('angular') || lowerName.includes('frontend') || lowerName.includes('backend') ||
      lowerDesc.includes('web') || lowerDesc.includes('frontend') || lowerDesc.includes('backend')) {
    return { icon: '🌐', label: 'Web Dev' }
  }
  
  // Mobile Development projects
  if (lowerName.includes('mobile') || lowerName.includes('android') || lowerName.includes('ios') ||
      lowerName.includes('flutter') || lowerName.includes('react-native') || lowerDesc.includes('mobile')) {
    return { icon: '📱', label: 'Mobile' }
  }
  
  // Data Science projects
  if (lowerName.includes('data') || lowerName.includes('analytics') || lowerName.includes('dashboard') ||
      lowerName.includes('visualization') || lowerDesc.includes('data science') || lowerDesc.includes('analytics')) {
    return { icon: '📊', label: 'Data Science' }
  }
  
  // Game Development projects
  if (lowerName.includes('game') || lowerName.includes('unity') || lowerName.includes('unreal') ||
      lowerDesc.includes('game') || lowerDesc.includes('gaming')) {
    return { icon: '🎮', label: 'Game Dev' }
  }
  
  // Security projects
  if (lowerName.includes('security') || lowerName.includes('crypto') || lowerName.includes('encryption') ||
      lowerName.includes('auth') || lowerDesc.includes('security') || lowerDesc.includes('cryptography')) {
    return { icon: '🔒', label: 'Security' }
  }
  
  // API/Backend projects
  if (lowerName.includes('api') || lowerName.includes('server') || lowerName.includes('microservice') ||
      lowerName.includes('rest') || lowerName.includes('graphql') || lowerDesc.includes('api') ||
      lowerDesc.includes('server')) {
    return { icon: '⚙️', label: 'API' }
  }
  
  // Database projects
  if (lowerName.includes('db') || lowerName.includes('database') || lowerName.includes('sql') ||
      lowerName.includes('nosql') || lowerName.includes('mongo') || lowerDesc.includes('database')) {
    return { icon: '🗄️', label: 'Database' }
  }
  
  // DevOps/Tools projects
  if (lowerName.includes('devops') || lowerName.includes('docker') || lowerName.includes('kubernetes') ||
      lowerName.includes('ci') || lowerName.includes('cd') || lowerName.includes('tool') ||
      lowerDesc.includes('devops') || lowerDesc.includes('automation')) {
    return { icon: '🛠️', label: 'DevOps' }
  }
  
  // Default - use first letter with a music note theme
  const musicIcons = ['🎵', '🎶', '🎸', '🎹', '🎺', '🥁', '🎻', '🎤']
  const hash = name.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
  return { icon: musicIcons[Math.abs(hash) % musicIcons.length], label: 'Project' }
}

export function generateThumbnailDesign(name: string, description: string = ''): {
  gradient: string
  pattern: string
  accentColor: string
  iconStyle: string
} {
  const lowerName = name.toLowerCase()
  const lowerDesc = description.toLowerCase()
  
  // AI/ML projects - futuristic gradients with circuit patterns
  if (lowerName.includes('ai') || lowerName.includes('ml') || lowerName.includes('neural') || 
      lowerName.includes('classification') || lowerName.includes('recognition') || lowerDesc.includes('ai') || 
      lowerDesc.includes('machine learning') || lowerDesc.includes('neural')) {
    return {
      gradient: 'from-cyan-500 via-blue-600 to-purple-700',
      pattern: 'circuit',
      accentColor: 'bg-cyan-400',
      iconStyle: 'glow-cyan'
    }
  }
  
  // Blockchain projects - dark gradients with geometric patterns
  if (lowerName.includes('solidity') || lowerName.includes('blockchain') || lowerName.includes('escrow') ||
      lowerName.includes('smart') || lowerName.includes('contract') || lowerDesc.includes('blockchain') ||
      lowerDesc.includes('ethereum') || lowerDesc.includes('smart contract')) {
    return {
      gradient: 'from-gray-800 via-gray-900 to-black',
      pattern: 'geometric',
      accentColor: 'bg-yellow-500',
      iconStyle: 'glow-yellow'
    }
  }
  
  // Computer Vision projects - vibrant gradients with eye patterns
  if (lowerName.includes('opencv') || lowerName.includes('vision') || lowerName.includes('facial') ||
      lowerName.includes('detection') || lowerDesc.includes('computer vision') || lowerDesc.includes('opencv')) {
    return {
      gradient: 'from-green-400 via-emerald-500 to-teal-600',
      pattern: 'dots',
      accentColor: 'bg-green-400',
      iconStyle: 'glow-green'
    }
  }
  
  // NLP projects - warm gradients with text patterns
  if (lowerName.includes('nlp') || lowerName.includes('text') || lowerName.includes('language') ||
      lowerName.includes('sentiment') || lowerDesc.includes('natural language') || lowerDesc.includes('nlp')) {
    return {
      gradient: 'from-orange-400 via-red-500 to-pink-600',
      pattern: 'lines',
      accentColor: 'bg-orange-400',
      iconStyle: 'glow-orange'
    }
  }
  
  // Web Development projects - modern gradients with grid patterns
  if (lowerName.includes('web') || lowerName.includes('react') || lowerName.includes('vue') ||
      lowerName.includes('angular') || lowerName.includes('frontend') || lowerName.includes('backend') ||
      lowerDesc.includes('web') || lowerDesc.includes('frontend') || lowerDesc.includes('backend')) {
    return {
      gradient: 'from-blue-500 via-indigo-600 to-purple-700',
      pattern: 'grid',
      accentColor: 'bg-blue-400',
      iconStyle: 'glow-blue'
    }
  }
  
  // Mobile Development projects - gradient with app-like patterns
  if (lowerName.includes('mobile') || lowerName.includes('android') || lowerName.includes('ios') ||
      lowerName.includes('flutter') || lowerName.includes('react-native') || lowerDesc.includes('mobile')) {
    return {
      gradient: 'from-purple-500 via-pink-500 to-rose-600',
      pattern: 'app-grid',
      accentColor: 'bg-purple-400',
      iconStyle: 'glow-purple'
    }
  }
  
  // Data Science projects - analytical gradients with chart patterns
  if (lowerName.includes('data') || lowerName.includes('analytics') || lowerName.includes('dashboard') ||
      lowerName.includes('visualization') || lowerDesc.includes('data science') || lowerDesc.includes('analytics')) {
    return {
      gradient: 'from-teal-500 via-cyan-600 to-blue-700',
      pattern: 'bars',
      accentColor: 'bg-teal-400',
      iconStyle: 'glow-teal'
    }
  }
  
  // Default - music-themed gradients
  const gradients = [
    'from-purple-500 via-pink-500 to-rose-600',
    'from-blue-500 via-cyan-500 to-teal-600',
    'from-green-500 via-emerald-500 to-teal-600',
    'from-orange-500 via-red-500 to-pink-600',
    'from-indigo-500 via-purple-500 to-pink-600',
    'from-yellow-500 via-orange-500 to-red-600'
  ]
  const patterns = ['waves', 'notes', 'rhythm', 'melody']
  const hash = name.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
  
  return {
    gradient: gradients[Math.abs(hash) % gradients.length],
    pattern: patterns[Math.abs(hash) % patterns.length],
    accentColor: 'bg-spotify-green',
    iconStyle: 'glow-green'
  }
} 