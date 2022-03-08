// @ts-nocheck
import * as React from 'react'
import Icons from '../../icons'
import { Button, SHAPE, KIND, SIZE } from 'baseui/button'
import { ChevronDown } from 'baseui/icon'
import useAppContext from '../../../../../hooks/useAppContext'
import { SubMenuType } from '../../../../../constants/editor'
import { useEffect, useState } from 'react'
import { useActiveObject, useEditor } from '../../../../../../../src'
import { StatefulPopover, PLACEMENT } from 'baseui/popover'
import { StatefulMenu } from 'baseui/menu'
import Delete from './components/Delete'
import Duplicate from './components/Duplicate'
import Opacity from './components/Opacity'
import Position from './components/Position'

const defaultOptions = {
  fontFamily: 'Open Sans',
  fontWeight: 'normal',
  fontSize: 12,
  opacity: [1],
  italic: 'true',
  textAligh: 'center',
  underline: 'true',
  fill: '#000000'
}

const ITEMS = [
  { label: 8 },
  { label: 10 },
  { label: 12 },
  { label: 14 },
  { label: 16 },
  { label: 18 },
  { label: 20 },
  { label: 22 },
  { label: 24 },
  { label: 32 },
  { label: 36 },
  { label: 64 }
]

function Text() {
  const { setActiveSubMenu } = useAppContext()
  const activeObject = useActiveObject()
  const [options, setOptions] = useState(defaultOptions)
  const editor = useEditor()
  useEffect(() => {
    updateOptions(activeObject)
  }, [activeObject])

  useEffect(() => {
    editor.on('history:changed', () => {
      updateOptions(activeObject)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  const updateOptions = (object) => {
    let style = object.getUIStyles()
    const textOptions = {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      opacity: [object.opacity * 100],
      textAlign: style.lineAlign,
      underline: style.underline,
      fill: style.fill
    }
    setOptions(textOptions)
  }

  const toggleUnderline = () => {
    editor.update({ underline: options.underline ? false : true })
  }


  const getNextTextAlign = (current) => {
    const positions = ['left', 'center', 'right', 'left']
    const currentIndex = positions.findIndex(v => v === current)
    const nextAlign = positions[currentIndex + 1]
    return nextAlign
  }

  const toggleTextAlign = () => {
    const currentValue = options.textAlign
    const nextTextAlign = getNextTextAlign(currentValue)
    console.log(currentValue)
    editor.update({ textAlign: nextTextAlign })
  }

  const getTextAlignIcon = () => {
    const currentValue = options.textAlign
    const Icon =
      currentValue === 'left'
        ? Icons.TextAlignLeft
        : currentValue === 'center'
        ? Icons.TextAlignCenter
        : currentValue === 'right'
        ? Icons.TextAlignRight
        : Icons.TextAlignJustify
    return Icon
  }

  const updateFontSize = (value) => {
    editor.update({ fontSize: value })
  }

  const TextAlignIcon = getTextAlignIcon()
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button
          onClick={() => setActiveSubMenu(SubMenuType.FONT_FAMILY)}
          overrides={{
            BaseButton: {
              style: {
                borderBottomColor: 'rgba(0,0,0,0.2)',
                borderBottomStyle: 'solid',
                borderBottomWidth: '1px',
                borderTopColor: 'rgba(0,0,0,0.2)',
                borderTopStyle: 'solid',
                borderTopWidth: '1px',
                borderRightColor: 'rgba(0,0,0,0.2)',
                borderRightStyle: 'solid',
                borderRightWidth: '1px',
                borderLeftColor: 'rgba(0,0,0,0.2)',
                borderLeftStyle: 'solid',
                borderLeftWidth: '1px',
                fontSize: '14px'
              }
            }
          }}
          kind={KIND.tertiary}
          size={SIZE.mini}
          endEnhancer={() => <ChevronDown size={24} />}
        >
          {options.fontFamily}
        </Button>

        <StatefulPopover
          focusLock
          placement={PLACEMENT.bottomLeft}
          content={({ close }) => (
            <StatefulMenu
              items={ITEMS}
              onItemSelect={event => {
                updateFontSize(event.item.label)
                close()
              }}
              overrides={{
                List: { style: { width: '72px', textAlign: 'center', height: '240px' } }
              }}
            />
          )}
        >
          <Button
            overrides={{
              BaseButton: {
                style: {
                  borderBottomColor: 'rgba(0,0,0,0.2)',
                  borderBottomStyle: 'solid',
                  borderBottomWidth: '1px',
                  borderTopColor: 'rgba(0,0,0,0.2)',
                  borderTopStyle: 'solid',
                  borderTopWidth: '1px',
                  borderRightColor: 'rgba(0,0,0,0.2)',
                  borderRightStyle: 'solid',
                  borderRightWidth: '1px',
                  borderLeftColor: 'rgba(0,0,0,0.2)',
                  borderLeftStyle: 'solid',
                  borderLeftWidth: '1px',
                  fontSize: '14px'
                }
              }
            }}
            kind={KIND.tertiary}
            size={SIZE.mini}
            endEnhancer={() => <ChevronDown size={24} />}
          >
            {options.fontSize}
          </Button>
        </StatefulPopover>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            onClick={() => setActiveSubMenu(SubMenuType.COLOR)}
            size={SIZE.compact}
            kind={KIND.tertiary}
            shape={SHAPE.square}
          >
            <Icons.TextColor color={options.fill} size={24} />
          </Button>
          <Button
            overrides={{
              BaseButton: { style: { color: options.underline ? '#000000' : '#afafaf' } }
            }}
            onClick={toggleUnderline}
            size={SIZE.compact}
            kind={KIND.tertiary}
            shape={SHAPE.square}
          >
            <Icons.Underline size={24} />
          </Button>
          <Button onClick={toggleTextAlign} size={SIZE.compact} kind={KIND.tertiary} shape={SHAPE.square}>
            <TextAlignIcon size={24} />
          </Button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Position />
        <Opacity />
        <Duplicate />
        <Delete />
      </div>
    </div>
  )
}

export default Text
