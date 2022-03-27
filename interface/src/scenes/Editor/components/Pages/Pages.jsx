import * as React from 'react'
import { styled } from 'baseui'
import { Scrollbars } from 'react-custom-scrollbars'
import { useEditor } from '../../../../../../src'
import useAppContext from '../../../../hooks/useAppContext'
import { useEffect } from 'react'

function Pages() {
  const editor = useEditor()
  const { template, setTemplate, pageId, setPageId, isMobile} = useAppContext()

  const Container = styled('div', props => ({
    display: 'flex',
    position: 'absolute',
    bottom: isMobile ? '10px' : '20px',
    width: isMobile ? '90px' : '120px',
    right: isMobile ? '10px' : '20px',
  }))
  
  const ZoomItemContainer = styled('div', () => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    wordWrap: 'break-word',
    textAlign: 'center',
    padding: '10px'
  }))

  let setPage = (id) => {
    if (editor) editor.off('history:changed')
    setPageId(id)
  }
  useEffect(() => {
    if (editor && template) {
      const page = template.pages.find(page => page.id === pageId)
      if (!page && editor)  {
            editor.off('history:changed')
            editor.clear()
            return
      }
      editor.importFromJSON(page)
      editor.on('history:changed',() => {
        for (let i = 0; i < template.pages.length; i++) {
          if (template.pages[i].id === pageId) template.pages[i] = editor.exportToJSON()
        }
        setTemplate(Object.assign({}, template))
      })
    }
    return () => {
      if (editor) editor.off('history:changed')
  }
  }, [pageId])
  useEffect(() => {
    
  }, [template])
  return (
    <Container>
              <Scrollbars 
              autoHide
              autoHideTimeout={1000}
              autoHideDuration={200} 
              autoHeight
              autoHeightMin={0}
              autoHeightMax={isMobile ? 170 : 300}>
                {template && template.pages.map((page, index) => (
                  <ZoomItemContainer
                    onClick={() => setPage(page.id) }
                    key={index}
                  >
                   {page.name}
                    <div style={{
                display:'block',
                width: '100%',
                height: '100%',
                maxWidth: isMobile ? '80px' : '100px',
                maxHeight: isMobile ? '50px' : '60px',
                border: page.id === pageId ? '1px solid rgba(0, 0, 0, 1)' : '1px solid rgba(0, 0, 0, 0.2)',
                ':hover': {
                  border: '1px solid rgba(0, 0, 0, 0.7)',
                  cursor: 'pointer'
                },
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                marginTop: '5px',
                aspectRatio: `${page.size.width} / ${page.size.height}`
              }} dangerouslySetInnerHTML={{__html: page.preview}}></div>
                  </ZoomItemContainer>
                ))}
              </Scrollbars>
    </Container>
  )
}

export default Pages