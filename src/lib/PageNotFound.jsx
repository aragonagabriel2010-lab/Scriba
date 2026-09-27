import { useLocation } from 'react-router-dom'

export default function PageNotFound() {
  const location = useLocation()
  const pageName = location.pathname.substring(1)

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="font-display text-7xl text-muted-foreground">404</h1>
        <p className="text-muted-foreground">La pagina «{pageName}» non c’è.</p>
        <button onClick={() => { window.location.href = '/' }} className="btn-primary">Torna all’inizio</button>
      </div>
    </div>
  )
}
