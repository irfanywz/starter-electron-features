import { NavLink } from 'react-router'
import type { AppRoute } from './routes'

interface Props {
  route: AppRoute
  /** Cuma ikon, tanpa label */
  iconOnly?: boolean
}

/** Satu item menu di titlebar */
export default function NavItem({ route, iconOnly }: Props) {
  const { to, label, Icon, end } = route

  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      title={label}
      className={({ isActive }) =>
        'flex h-7 items-center gap-1.5 rounded-md text-xs transition-colors ' +
        (iconOnly ? 'w-8 justify-center ' : 'px-3 ') +
        (isActive ? 'bg-accent text-white' : 'text-muted hover:bg-fg/10')
      }
    >
      <Icon size={iconOnly ? 14 : 13} />
      {!iconOnly && label}
    </NavLink>
  )
}
