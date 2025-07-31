import { Repository } from './store'

// Fallback repositories based on Abdullah's actual GitHub profile
const fallbackRepositories: Repository[] = [
  {
    id: 1,
    name: 'AI Lung Classification',
    full_name: 'ahussainNCL/AI-LungClassification',
    description: 'Deep learning system for detecting lung abnormalities',
    html_url: 'https://github.com/ahussainNCL/AI-LungClassification',
    stargazers_count: 1,
    forks_count: 0,
    language: 'TensorFlow Keras Medical Imaging',
    topics: ['ai', 'machine-learning', 'medical-imaging', 'deep-learning'],
    readme: 'A comprehensive deep learning system designed for detecting lung abnormalities in medical imaging. This project utilizes advanced neural network architectures to analyze chest X-rays and CT scans for early detection of pulmonary conditions.',
    socialPreview: undefined
  },
  {
    id: 2,
    name: 'Solidity Escrow Service',
    full_name: 'ahussainNCL/Solidity-Escrow-Service',
    description: 'Blockchain-based escrow system with smart contracts',
    html_url: 'https://github.com/ahussainNCL/Solidity-Escrow-Service',
    stargazers_count: 1,
    forks_count: 0,
    language: 'Solidity Web3.js Hardhat',
    topics: ['blockchain', 'smart-contracts', 'escrow', 'web3'],
    readme: 'A decentralized escrow service built on Ethereum using Solidity smart contracts. This system provides secure, transparent, and automated escrow services for peer-to-peer transactions.',
    socialPreview: undefined
  },
  {
    id: 3,
    name: 'OpenCV Facial Recognition',
    full_name: 'ahussainNCL/OpenCV-Facial-Recognition',
    description: 'Real-time facial recognition pipeline',
    html_url: 'https://github.com/ahussainNCL/OpenCV-Facial-Recognition',
    stargazers_count: 1,
    forks_count: 0,
    language: 'OpenCV Haar Cascades Python',
    topics: ['opencv', 'facial-recognition', 'computer-vision', 'python'],
    readme: 'An advanced facial recognition system built with OpenCV that can detect, recognize, and track faces in real-time. Features include face detection, landmark detection, and identity verification.',
    socialPreview: undefined
  },
  {
    id: 4,
    name: 'NLPToolkit',
    full_name: 'ahussainNCL/NLPToolkit',
    description: 'Modular NLP processing framework',
    html_url: 'https://github.com/ahussainNCL/NLPToolkit',
    stargazers_count: 0,
    forks_count: 0,
    language: 'NLTK spaCy Transformers',
    topics: ['nlp', 'text-processing', 'machine-learning', 'python'],
    readme: 'A comprehensive Natural Language Processing toolkit that provides modular components for text preprocessing, sentiment analysis, named entity recognition, and other NLP tasks.',
    socialPreview: undefined
  }
]

export async function fetchRepositories(): Promise<Repository[]> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  
  if (!GITHUB_TOKEN) {
    console.log('No GitHub token provided, using fallback data')
    return fallbackRepositories
  }

  try {
    const response = await fetch('https://api.github.com/users/ahussainNCL/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      console.error('GitHub API error:', response.status, response.statusText)
      return fallbackRepositories
    }

    const repos = await response.json()
    
    // Fetch additional data for each repository
    const repositoriesWithDetails = await Promise.all(
      repos.map(async (repo: any) => {
        try {
          const [readme, topics] = await Promise.all([
            fetchReadme(repo.full_name),
            fetchTopics(repo.full_name)
          ])

          return {
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description || 'No description available',
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            language: repo.language || 'Unknown',
            topics: topics,
            readme: readme,
            socialPreview: repo.socialPreview
          } as Repository
        } catch (error) {
          console.error(`Error fetching details for ${repo.name}:`, error)
          return {
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description || 'No description available',
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            language: repo.language || 'Unknown',
            topics: [],
            readme: undefined,
            socialPreview: repo.socialPreview
          } as Repository
        }
      })
    )

    return repositoriesWithDetails
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return fallbackRepositories
  }
}

async function fetchReadme(fullName: string): Promise<string | undefined> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  
  try {
    const response = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
      headers: {
        'Authorization': GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : '',
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      return undefined
    }

    const data = await response.json()
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    
    // Remove markdown formatting and limit length
    return content
      .replace(/[#*`]/g, '')
      .replace(/\n+/g, '\n')
      .substring(0, 500) + '...'
  } catch (error) {
    console.error(`Error fetching README for ${fullName}:`, error)
    return undefined
  }
}

async function fetchTopics(fullName: string): Promise<string[]> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  
  try {
    const response = await fetch(`https://api.github.com/repos/${fullName}/topics`, {
      headers: {
        'Authorization': GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : '',
        'Accept': 'application/vnd.github.mercy-preview+json',
      },
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.names || []
  } catch (error) {
    console.error(`Error fetching topics for ${fullName}:`, error)
    return []
  }
} 