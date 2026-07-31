export default function Container({ children, className = "" }) {
  return (
    <div className={`max-w-16-9 mx-auto px-4 lg:px-14 ${className}`}>
      {children}
    </div>
  );
}
