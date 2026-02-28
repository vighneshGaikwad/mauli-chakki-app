import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

/*
 🎓 LESSON: BrowserRouter
 
 BrowserRouter enables client-side routing.
 Without it, react-router-dom's <Routes>, <Route>, <Link>,
 and useNavigate() won't work.
 
 It wraps the ENTIRE app because routing can happen anywhere.
 It MUST be above any component that uses routing hooks.
*/
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
)
