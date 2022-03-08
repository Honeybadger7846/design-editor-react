import * as React from 'react'
import Icons from '../../icons'
import Page from './components/Page'
import { Button, SHAPE, KIND, SIZE } from 'baseui/button'
import useAppContext from '../../../../../hooks/useAppContext'
import { PanelType } from '../../../../../constants/app-options'

function Default() {
  const { setActivePanel } = useAppContext()
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
      <Page />
    </div>
  )
}

export default Default
