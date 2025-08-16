import { redirect } from 'next/navigation'

export default function Page() {
  // Redirect root to the interactive demo during pre-launch
  redirect('/demo')
}
