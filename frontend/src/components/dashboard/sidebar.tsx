import { Link, NavLink } from 'react-router-dom';
import { Home, Users, Settings, Gift, Gamepad2, Star } from "lucide-react";

const navLinks = [
    { to: "/", icon: Home, label: "Trang Chủ" },
    { to: "/games", icon: Gamepad2, label: "Trò Chơi" },
    { to: "/promotions", icon: Gift, label: "Khuyến Mãi" },
    { to: "/vip", icon: Star, label: "VIP Club" },
    { to: "/profile", icon: Users, label: "Tài Khoản" },
    { to: "/settings", icon: Settings, label: "Cài Đặt" },
];

export function Sidebar() {
    return (
        <aside className="hidden md:flex md:flex-col md:w-64 border-r border-border bg-card p-4">
            {/* Logo */}
            <div className="flex h-16 items-center mb-4 px-2">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-black italic shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                        M
                    </div>
                    <span className="text-lg font-black tracking-tighter uppercase group-hover:text-primary transition-colors text-foreground">
                        MBS Casino
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-1">
                {navLinks.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent/50 group ${isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`
                        }
                    >
                        {({ isActive }) => (
                          <>
                            <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                            {item.label}
                          </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
