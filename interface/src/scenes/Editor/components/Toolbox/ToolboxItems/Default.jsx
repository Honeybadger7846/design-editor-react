import * as React from 'react'
import Icons from '../../icons'
import Page from './components/Page'
import { Button, SHAPE, KIND, SIZE } from 'baseui/button'
import { Plus, CheckIndeterminate } from 'baseui/icon'
import { styled, ThemeProvider, LightTheme } from 'baseui'
import { StatefulPopover, PLACEMENT } from 'baseui/popover'
import useAppContext from '../../../../../hooks/useAppContext'
import { PanelType } from '../../../../../constants/app-options'
function Default() {
  const { setActivePanel, isMobile, template, setTemplate, pageId, setPageId } = useAppContext()
  let addPage = () => {
     const newPage = {
       name: 'New Page',
       id: (Math.random() + 1).toString(36).substring(7),
       objects: [],
       background: "#ffffff",
       size: {
           width: 1280,
           height: 720
       },
       preview: '',
     }
     template.pages.push(newPage)
     setTemplate(Object.assign({}, template))
    // init page
    setPageId(newPage.id)
  }
  let removePage = () => {
    template.pages = template.pages.filter(page => page.id !== pageId)
    setTemplate(Object.assign({}, template))
    // init first page
    setPageId(template.pages[0] ? template.pages[0].id : null)
  }
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem'
      }}
    >
      <div style={{display: 'flex'}}>
      <Button onClick={() => addPage()} size={SIZE.default} kind={KIND.tertiary} disabled={template ? false : true}> <Plus size={24} /> New Page</Button>
      {template && template.pages.length > 0 ? <Page /> : null }
      </div>
      {template && template.pages.length > 0 ? <Button onClick={() => removePage()} size={SIZE.default} kind={KIND.tertiary} shape={SHAPE.square}>
      <Icons.Delete size={24} />
    </Button> : null }
      
    </div>
  )
}

export default Default
