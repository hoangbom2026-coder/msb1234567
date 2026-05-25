import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { GameCard } from '@/components/shared/game-card';

export function GameList() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const { data } = await api.get('/game/rooms');
                if (data.status) {
                    setRooms(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch rooms', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    if (loading) return (
        <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );

    return (
        <section className="w-full px-4 my-6">
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-x-4 gap-y-6">
                {rooms.map((game) => (
                    <GameCard
                        key={game.game_id}
                        name={game.name}
                        imageUrl={game.image_url}
                        onClick={() => navigate(`/betting/${game.game_id}`)}
                    />
                ))}
            </div>
        </section>
    );
}
