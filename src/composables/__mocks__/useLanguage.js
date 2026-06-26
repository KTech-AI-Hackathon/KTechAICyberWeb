import { ref } from 'vue'

const mockTranslations = {
  'nav.home': 'Home',
  'positions.title': 'Job Openings',
  'positions.subtitle': 'Join Our Team',
  'positions.searchPlaceholder': 'Search positions...',
  'positions.filters.title': 'Filters',
  'positions.filters.department': 'Department',
  'positions.filters.location': 'Location',
  'positions.filters.type': 'Employment Type',
  'positions.filters.clearAll': 'Clear All',
  'positions.filters.activeFilters': 'positions found',
  'positions.departments.all': 'All Departments',
  'positions.departments.engineering': 'Engineering',
  'positions.departments.product': 'Product',
  'positions.departments.design': 'Design',
  'positions.departments.marketing': 'Marketing',
  'positions.departments.sales': 'Sales',
  'positions.locations.all': 'All Locations',
  'positions.locations.bangkok': 'Bangkok',
  'positions.locations.shanghai': 'Shanghai',
  'positions.locations.beijing': 'Beijing',
  'positions.locations.remote': 'Remote',
  'positions.types.all': 'All Types',
  'positions.types.fulltime': 'Full-time',
  'positions.types.parttime': 'Part-time',
  'positions.types.contract': 'Contract',
  'positions.types.internship': 'Internship',
  'positions.cards.posted': 'Posted',
  'positions.cards.viewDetails': 'View Details',
  'positions.detail.backToList': 'Back to list',
  'positions.detail.description': 'Job Description',
  'positions.detail.responsibilities': 'Responsibilities',
  'positions.detail.requirements': 'Requirements',
  'positions.detail.benefits': 'Benefits & Perks',
  'positions.detail.culture': 'Culture & Values',
  'positions.detail.deadline': 'Application Deadline',
  'positions.detail.applyNow': 'Apply Now',
  'positions.detail.share': 'Share',
  'positions.empty.noPositions': 'No positions available at this time',
  'positions.empty.title': 'No positions found',
  'positions.empty.message': 'Try adjusting your filters to see more results'
}

export function useLanguage() {
  const currentLanguage = ref('en')
  const languageDisplay = ref('EN')
  const isEnglish = ref(true)
  
  function initLanguage() {}
  function setLanguage() {}
  function toggleLanguage() {}
  
  function t(key) {
    return mockTranslations[key] || key
  }
  
  return {
    currentLanguage,
    languageDisplay,
    isEnglish,
    initLanguage,
    setLanguage,
    toggleLanguage,
    t
  }
}
