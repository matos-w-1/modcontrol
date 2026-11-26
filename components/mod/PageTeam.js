import { BirthdayCard } from './BirthdayCard'
import { TeamDirectory } from './TeamDirectory'
import { s } from '../../lib/styles'

export function PageTeam() {
  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Team</h1>
      <BirthdayCard />
      <TeamDirectory />
    </div>
  )
}
