import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Amplify } from 'aws-amplify'

Amplify.configure({
  Storage: {
    S3: {
      bucket: 'YOUR_S3_BUCKET_NAME',
      region: 'YOUR_AWS_REGION'
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
