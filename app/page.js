import { Home } from '@/components/home-page'
export async function generateMetadata({ params }) {
  return {
    title: 'Follow XU',
  }
}
export default async function HomePage() {
  return (
    <div>
      <Home/>
    </div>
  )
}