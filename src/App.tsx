import { Suspense, lazy } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Footer } from './components/Footer'
import { MobileNavBar } from './components/MobileNavBar'
import { SectionFallback } from './components/SectionFallback'

const Catalog = lazy(() =>
  import('./components/Catalog').then((m) => ({ default: m.Catalog })),
)
const Services = lazy(() =>
  import('./components/Services').then((m) => ({ default: m.Services })),
)
const BookingAssistant = lazy(() =>
  import('./components/BookingAssistant').then((m) => ({ default: m.BookingAssistant })),
)
const LocationMap = lazy(() =>
  import('./components/LocationMap').then((m) => ({ default: m.LocationMap })),
)
const AdminPanel = lazy(() =>
  import('./components/admin/AdminPanel').then((m) => ({ default: m.AdminPanel })),
)

function MainSite() {
  return (
    <div className="relative min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />
      <main>
        <Hero />
        <Suspense fallback={<SectionFallback height="24rem" />}>
          <Catalog />
        </Suspense>
        <Suspense fallback={<SectionFallback height="16rem" />}>
          <Services />
        </Suspense>
        <Suspense fallback={<SectionFallback height="20rem" />}>
          <BookingAssistant />
        </Suspense>
        <Suspense fallback={<SectionFallback height="16rem" />}>
          <LocationMap />
        </Suspense>
      </main>
      <Footer />
      <MobileNavBar />
    </div>
  )
}

function App() {
  const isAdmin = window.location.pathname === '/admin'
  if (isAdmin) {
    return (
      <Suspense fallback={<SectionFallback height="100vh" />}>
        <AdminPanel />
      </Suspense>
    )
  }
  return <MainSite />
}

export default App
