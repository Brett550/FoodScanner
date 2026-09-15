import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')
  const previewUrlRef = useRef('')

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])

  async function handleFileChange(event) {
    const selectedFile = event.target.files[0]
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const url = selectedFile?.type.startsWith('image/')
      ? URL.createObjectURL(selectedFile)
      : ''
    previewUrlRef.current = url
    setFile(url ? selectedFile : null)
    setPreviewUrl(url)

    if (!url) {
      setUploadStatus('Please choose an image file.')
      return
    }

    setUploadStatus('Converting image...')
    try {
      const imageBase64 = await fileToBase64(selectedFile)
      const apiUrl = import.meta.env.VITE_LAMBDA_API_URL
      if (!apiUrl) {
        setUploadStatus('Converted to Base64. Configure VITE_LAMBDA_API_URL to send it.')
        return
      }
      setUploadStatus('Sending image to Lambda...')
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: selectedFile.name, contentType: selectedFile.type, base64Image: imageBase64 }),
      })
      if (!response.ok) throw new Error(`Lambda API returned ${response.status}`)
      setUploadStatus('Image sent to Lambda')
    } catch (error) {
      console.error('Image processing request failed', error)
      setUploadStatus('Could not send image to Lambda.')
    }
  }

  return (
    <main className="upload-page">
      <section className="upload-card" aria-labelledby="upload-title">
        <h1 id="upload-title">Upload an image</h1>
        <p className="upload-help">Choose an image to send to Lambda.</p>
        <label className="file-picker">
          <span>{file ? 'Choose a different image' : 'Choose an image'}</span>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        {file && <p className="file-name" role="status">Selected: <strong>{file.name}</strong></p>}
        {uploadStatus && <p className="upload-status" role="status">{uploadStatus}</p>}
        {previewUrl && <img className="image-preview" src={previewUrl} alt={`Preview of ${file.name}`} />}
      </section>
    </main>
  )
}

function fileToBase64(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(imageFile)
  })
}

export default App