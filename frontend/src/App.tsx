import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Search from './pages/Search'
import Timeline from './pages/Timeline'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/search" element={<Search />} />
          <Route path="/timeline" element={<Timeline />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
