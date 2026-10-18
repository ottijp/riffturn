import { PracticeSessionPage } from './components/PracticeSessionPage'

type AppProps = {
  buildYear: number
}

export default function App({ buildYear }: AppProps) {
  return <PracticeSessionPage buildYear={buildYear} />
}
