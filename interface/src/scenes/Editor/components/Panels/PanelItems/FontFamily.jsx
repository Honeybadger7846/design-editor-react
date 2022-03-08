import * as React from 'react'
import { useState } from 'react'
import useAppContext from '../../../../../hooks/useAppContext'
import { Scrollbars } from 'react-custom-scrollbars'
import { Input } from 'baseui/input'
import { styled } from 'baseui'
import { useEditor } from '../../../../../../../src'
import Icons from '../../icons'

function FontFamily() {
  const [value, setValue] = useState('')
  const editor = useEditor()
  const { fonts } = useAppContext()
  const handleFontFamilyChange = async (fontFamily) => {
    if (editor) {
      editor.update({
        fontFamily: fontFamily.name
      })
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <div style={{ padding: '2rem 2rem' }}>
        <Input
          startEnhancer={() => <Icons.Search size={18} />}
          value={value}
          onChange={e => setValue((e.target).value)}
          placeholder="Search font"
          clearOnEscape
        />
      </div>
      <div style={{ flex: 1 }}>
        <Scrollbars>
          <div style={{ display: 'grid', padding: '0.5rem 2rem 2rem' }}>
            {fonts.map(font => (
              <FontItem onClick={() => handleFontFamilyChange(font)} key={font.name} dangerouslySetInnerHTML={{__html: font.svgPreview}}>
              </FontItem>
            ))}
          </div>
        </Scrollbars>
      </div>
    </div>
  )
}

const FontItem = styled('div', props => ({
  cursor: 'pointer',
  padding: '14px 5px 14px 5px',
  ':hover': {
    background: 'rgba(0,0,0,0.045)'
  }
}))

export default FontFamily
