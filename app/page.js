import { Home } from '@/components/home-page'
export async function generateMetadata({ params }) {
  return {
    title: 'Follow XU',
  }
}
export default async function HomePage() {
  await new Promise(resolve => setTimeout(resolve, 10000))
  return (
    <div>
      <Home/>
    </div>
  )
}