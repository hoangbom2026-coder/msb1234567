
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/images/bg_register.jpg')" }}
    >
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-[#0c192c]/60 backdrop-blur-[2px] z-0" />

      {/* Form Section */}
      <div className="w-full max-w-[440px] p-6 lg:p-12 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/images/left-top-1751727228593.png" 
                className="h-16 object-contain drop-shadow-[0_0_15px_rgba(255,197,62,0.5)]" 
                alt="Logo" 
              />
            </div>
            <h1 className="font-headline text-3xl font-black tracking-tight text-primary mb-2 uppercase tracking-tighter">
              {title}
            </h1>
            <p className="text-white/60 text-sm font-bold uppercase tracking-wider">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
