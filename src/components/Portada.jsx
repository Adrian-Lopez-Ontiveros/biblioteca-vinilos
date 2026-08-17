export default function Portada({ src, alt, className = '' }) {
  if (src) {
    return <img src={src} alt={alt || ''} className={`portada ${className}`.trim()} />
  }

  return (
    <div className={`portada portada-vacia ${className}`.trim()} aria-hidden="true">
      <span className="disco" />
    </div>
  )
}
