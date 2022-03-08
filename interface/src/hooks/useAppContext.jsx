import { AppContext } from '../contexts/AppContext'
import { useContext } from 'react'

function useAppContext() {
  const {
    isMobile,
    setIsMobile,
    activePanel,
    setActivePanel,
    templates,
    setTemplates,
    elements,
    setElements,
    fonts,
    setFonts,
    photos,
    setPhotos,
    activeSubMenu,
    setActiveSubMenu,
  } = useContext(AppContext)
  return {
    isMobile,
    setIsMobile,
    activePanel,
    setActivePanel,
    templates,
    setTemplates,
    elements,
    setElements,
    fonts,
    setFonts,
    photos,
    setPhotos,
    activeSubMenu,
    setActiveSubMenu,
  }
}

export default useAppContext
