import * as React from 'react'
import useAppContext from '../../hooks/useAppContext'
import api from '../../services/api'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Panels from './components/Panels'
import Toolbox from './components/Toolbox'
import { useEditor } from '../../../../src'
import Editor from '../../../../src'

function App() {
  const { setTemplates, setElements, setPhotos, setFonts, isMobile } = useAppContext()
  const editor = useEditor()
  useEffect(() => {
    api.getTemplates().then(templates => setTemplates(templates))
    api.getElements().then(elements => setElements(elements))
    api.getPhotos().then(photos => setPhotos(photos))
  }, [])
  useEffect(() => {
    api.getFonts().then(fonts => {
      if (editor) {
        setFonts(fonts)
        editor.setFonts(fonts)
      }
    })
  }, [editor])

  const editorConfig = {
    clipToFrame: true,
    scrollLimit: 0
  }
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#F9F9F9',
        fontFamily: 'Roboto'
      }}
    >
      <Navbar />
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', flex: 1 }}>
        <Panels />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <Toolbox />
          <div style={{ flex: 1, display: 'flex', padding: '1px' }}>
            <Editor config={editorConfig} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
