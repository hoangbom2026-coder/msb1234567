import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center">
            <h1 className="text-6xl font-bold text-white">404</h1>
            <p className="text-xl mt-4 text-white/80">Trang không tồn tại</p>
            <Link to="/" className="mt-8 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-colors">
                Về Trang Chủ
            </Link>
        </div>
    );
}
