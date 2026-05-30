import React from 'react'
import { Header } from '../components/common/Header'
import { Sidebar } from '../components/common/Sidebar'
import './DashboardLayout.css'

export const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  )
}
