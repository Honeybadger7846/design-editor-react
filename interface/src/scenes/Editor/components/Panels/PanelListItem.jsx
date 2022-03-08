import * as React from 'react'
import { useStyletron } from 'baseui'
import Icons from '../../../../components/icons'
import useAppContext from '../../../../hooks/useAppContext'

function PanelListItem({ label, icon, activePanel }) {
  const { setActivePanel, isMobile } = useAppContext()
  const [css, theme] = useStyletron()
  const Icon = Icons[icon]
  return (
    <div
      onClick={() => setActivePanel(label === activePanel ? null : label)}
      className={css({
        width: '76px',
        height: isMobile ? '100%' : '76px',
        backgroundColor: label === activePanel ? theme.colors.background : theme.colors.primary100,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: 'Roboto',
        fontWeight: 500,
        fontSize: '0.75rem',
        userSelect: 'none',
        transition: 'all 0.3s',
        gap: '0.2rem',
        ':hover': {
          cursor: 'pointer',
          backgroundColor: theme.colors.background,
          transition: 'all 0.6s'
        }
      })}
    >
      <Icon size={22} />
      <div>{label}</div>
    </div>
  )
}

export default PanelListItem
