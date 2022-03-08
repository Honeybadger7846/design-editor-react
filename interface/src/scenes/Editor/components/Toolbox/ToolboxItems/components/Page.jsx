import * as React from 'react'

import { Button, KIND } from 'baseui/button'
import { styled, ThemeProvider, LightTheme } from 'baseui'
import { Select, Value } from 'baseui/select'
import { Input } from 'baseui/input'
import { StatefulPopover, PLACEMENT } from 'baseui/popover'
import { useEffect, useState } from 'react'
import formatSizes from '../../../../../../constants/format-sizes'
import { useEditor, useEditorContext } from '../../../../../../../../src'

const getLabel = ({ option }) => {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <div>{option.name}</div>
      <div style={{ color: '#AFAFAF' }}>{option.description}</div>
    </div>
  )
}

const Container = styled('div', props => ({
  background: props.$theme.colors.background,
  color: props.$theme.colors.primary,
  width: '320px',
  fontFamily: 'Uber Move Text',
  padding: '2rem 2rem'
}))

export default function Page() {
  const editor = useEditor()
  const [value, setValue] = useState([])
  const [customSize, setCustomSize] = useState({ width: 0, height: 0 })
  const { pageSize } = useEditorContext()

  const updateFormatSize = value => {
    setValue(value)
    const [page] = value

    editor.page.update(page.size)
  }
  const applyCustomSize = () => {
    if (customSize.width && customSize.height) {
      editor.page.update(customSize)
    }
  }
  useEffect(() => {
    if (pageSize) {
      setCustomSize(pageSize)
    }
  }, [pageSize])

  return (
    <StatefulPopover
      focusLock
      placement={PLACEMENT.bottomLeft}
      content={({ close }) => (
        <ThemeProvider theme={LightTheme}>
          <Container>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>Preset</div>
              <Select
                options={formatSizes}
                labelKey="name"
                valueKey="id"
                onChange={({ value }) => updateFormatSize(value)}
                value={value}
                getValueLabel={getLabel}
                getOptionLabel={getLabel}
                clearable={false}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>Custom size</div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Input
                  value={customSize.width}
                  onChange={e => setCustomSize({ ...customSize, width: e.target.value })}
                  startEnhancer="W"
                  placeholder="width"
                />
                <Input
                  value={customSize.height}
                  onChange={e => setCustomSize({ ...customSize, height: e.target.value })}
                  startEnhancer="H"
                  placeholder="width"
                />
              </div>
              <Button onClick={() => applyCustomSize()}>Apply</Button>
            </div>
          </Container>
        </ThemeProvider>
      )}
    >
      <Button kind={KIND.tertiary}>Page</Button>
    </StatefulPopover>
  )
}
