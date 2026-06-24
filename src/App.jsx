import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ClientList from './pages/ClientList'
import ClientNew from './pages/ClientNew'
import ClientDetail from './pages/ClientDetail'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import Inspections from './pages/Inspections'
import InspectionDetail from './pages/InspectionDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/new" element={<ClientNew />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/inspections" element={<Inspections />} />
          <Route path="/inspections/:id" element={<InspectionDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
