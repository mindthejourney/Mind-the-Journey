export default function ThemeButton({ label, color, icon, isActive = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg 
        font-montserrat transition-all duration-300 transform
        ${isActive 
          ? 'scale-110 shadow-2xl ring-4 ring-white text-white' 
          : 'hover:scale-105 hover:shadow-xl text-white hover:brightness-110'
        }
      `}
      style={{ 
        backgroundColor: color,
        opacity: isActive ? 1 : 0.9
      }}
    >
      <div className="relative">
        <img 
          src={icon} 
          alt={`${label} icon`} 
          className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} 
        />
        {isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></div>
        )}
      </div>
      <span className="font-semibold tracking-wide">
        {label}
      </span>
    </button>
  );
}