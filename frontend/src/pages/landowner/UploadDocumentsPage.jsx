import React, { useState, useEffect, useContext } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { AuthContext } from '../../context/AuthContext'
import DocumentService from '../../services/DocumentService'
import landService from '../../services/landService'
import './landowner.css'

export const UploadDocumentsPage = () => {
  const { user } = useContext(AuthContext)
  const [files, setFiles] = useState([])
  const [parcels, setParcels] = useState([])
  const [parcelId, setParcelId] = useState('')
  const [documentType, setDocumentType] = useState('title_deed')
  const [dragActive, setDragActive] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user?.id) {
      landService.getParcels({ userId: user.id }).then(setParcels).catch(() => {})
      DocumentService.getUserDocuments().then(setUploadedDocs).catch(() => {})
    }
  }, [user?.id])

  const handleFiles = (newFiles) => {
    const valid = [...newFiles].filter((f) => f.size <= 5000000)
    setFiles((prev) => [...prev, ...valid])
  }

  const handleUpload = async () => {
    if (!files.length) return
    setLoading(true)
    setMessage('')
    try {
      for (const file of files) {
        await DocumentService.uploadDocument({
          file,
          parcelId: parcelId || undefined,
          documentType
        })
      }
      const docs = await DocumentService.getUserDocuments()
      setUploadedDocs(docs)
      setFiles([])
      setMessage('Documents uploaded successfully')
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.message || 'Upload failed'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return
    try {
      await DocumentService.deleteDocument(docId)
      setUploadedDocs((prev) => prev.filter((d) => d.id !== docId))
    } catch {
      alert('Failed to delete document')
    }
  }

  return (
    <DashboardLayout>
      <div className="upload-documents-page">
        <div className="page-header">
          <h1>Upload Documents</h1>
          <p>Submit required documents for land verification</p>
        </div>

        {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}

        <div className="upload-section">
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Link to parcel (optional)</label>
            <select value={parcelId} onChange={(e) => setParcelId(e.target.value)}>
              <option value="">— None —</option>
              {parcels.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Document type</label>
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
              <option value="title_deed">Title Deed</option>
              <option value="survey_certificate">Survey Certificate</option>
              <option value="id_card">ID Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div
            className={`upload-box ${dragActive ? 'active' : ''}`}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files) }}
          >
            <div className="upload-box-icon">📁</div>
            <p>Drag and drop files here (PDF, JPG, PNG, DOC — max 5MB)</p>
            <input type="file" multiple id="file-input" style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
            <label htmlFor="file-input" style={{ cursor: 'pointer', marginTop: '0.5rem', display: 'inline-block' }}>
              Select Files
            </label>
          </div>

          {files.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              {files.map((f, i) => (
                <div key={i} style={{ padding: '0.5rem' }}>{f.name}</div>
              ))}
              <button type="button" className="submit-btn" onClick={handleUpload} disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          )}
        </div>

        <div className="upload-section" style={{ marginTop: '2rem' }}>
          <h2>Your Documents</h2>
          <div className="documents-list">
            {uploadedDocs.length === 0 ? (
              <p>No documents uploaded yet.</p>
            ) : (
              uploadedDocs.map((doc) => (
                <div key={doc.id} className="document-item">
                  <div className="document-info">
                    <p className="document-name">{doc.fileName}</p>
                    <p className="document-size">{doc.documentType} — {doc.status}</p>
                  </div>
                  <button type="button" onClick={() => handleDelete(doc.id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
