/**
 * ProfitSchedulePage.tsx
 *
 * Trang quản lý house edge theo phòng + khung giờ + ngày trong tuần.
 * Admin dùng thanh trượt (slider) để điều chỉnh tỷ lệ từng rule.
 *
 * Route: /admin/profit-schedule  (thêm vào router của admin app)
 */

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GameRoom {
  id: number;
  name: string;
  game_id: string;
  type: string;
}

interface ScheduleRule {
  id: number;
  room_id: number;
  room_name: string;
  game_id: string;
  room_type: string;
  day_of_week: number; // 0-6 or 7=all
  hour_from: number;
  hour_to: number;
  house_edge_percent: number;
  note: string | null;
  is_active: number;
}

interface LivePreview {
  room_id: number;
  room_name: string;
  game_id: string;
  type: string;
  current_house_edge: number;
  current_day: number;
  current_hour: number;
}

const DAY_LABELS: Record<number, string> = {
  0: 'Chủ nhật', 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4',
  4: 'Thứ 5',   5: 'Thứ 6', 6: 'Thứ 7', 7: 'Tất cả ngày',
};

const API = '/api/admin/profit-schedule';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const edgeColor = (pct: number) => {
  if (pct === 0)   return '#16a34a'; // green
  if (pct <= 30)   return '#2563eb'; // blue
  if (pct <= 60)   return '#d97706'; // amber
  if (pct <= 80)   return '#ea580c'; // orange
  return '#dc2626';                  // red
};

const edgeLabel = (pct: number) => {
  if (pct === 0)   return '🎲 Hoàn toàn ngẫu nhiên';
  if (pct <= 30)   return '🟢 Thấp';
  if (pct <= 60)   return '🟡 Trung bình';
  if (pct <= 80)   return '🟠 Cao';
  return '🔴 Rất cao';
};

// ─── Empty form state ─────────────────────────────────────────────────────────

const emptyForm = () => ({
  room_id: '',
  day_of_week: 7,
  hour_from: 0,
  hour_to: 23,
  house_edge_percent: 70,
  note: '',
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfitSchedulePage() {
  const [rules, setRules]           = useState<ScheduleRule[]>([]);
  const [rooms, setRooms]           = useState<GameRoom[]>([]);
  const [live, setLive]             = useState<LivePreview[]>([]);
  const [loading, setLoading]       = useState(false);
  const [form, setForm]             = useState(emptyForm());
  const [editId, setEditId]         = useState<number | null>(null);
  const [filterRoom, setFilterRoom] = useState<string>('');
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ruleRes, roomRes, liveRes] = await Promise.all([
        axios.get<{ data: ScheduleRule[] }>(API, { params: filterRoom ? { room_id: filterRoom } : {} }),
        axios.get<{ data: GameRoom[] }>(`${API}/rooms`),
        axios.get<{ data: LivePreview[] }>(`${API}/live-preview`),
      ]);
      setRules(ruleRes.data.data   || []);
      setRooms(roomRes.data.data   || []);
      setLive(liveRes.data.data    || []);
    } catch {
      showToast('Lỗi tải dữ liệu', false);
    } finally {
      setLoading(false);
    }
  }, [filterRoom]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!form.room_id) { showToast('Chọn phòng game', false); return; }
    try {
      if (editId !== null) {
        await axios.put(`${API}/${editId}`, form);
        showToast('Đã cập nhật rule');
      } else {
        await axios.post(API, form);
        showToast('Đã tạo rule mới');
      }
      setForm(emptyForm());
      setEditId(null);
      fetchAll();
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Lỗi lưu dữ liệu', false);
    }
  };

  const handleEdit = (rule: ScheduleRule) => {
    setEditId(rule.id);
    setForm({
      room_id: String(rule.room_id),
      day_of_week: rule.day_of_week,
      hour_from: rule.hour_from,
      hour_to: rule.hour_to,
      house_edge_percent: rule.house_edge_percent,
      note: rule.note || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xoá rule này?')) return;
    try {
      await axios.delete(`${API}/${id}`);
      showToast('Đã xoá rule');
      fetchAll();
    } catch {
      showToast('Lỗi xoá', false);
    }
  };

  const cancelEdit = () => { setEditId(null); setForm(emptyForm()); };

  // ─── Render ───────────────────────────────────────────────────────────────

  const edge = form.house_edge_percent as number;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '24px', maxWidth: 960, margin: '0 auto' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.ok ? '#166534' : '#991b1b',
          color: '#fff', padding: '10px 18px', borderRadius: 6, fontSize: 13,
        }}>
          {toast.msg}
        </div>
      )}

      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>⚙️ House Edge Schedule</h1>
      <p style={{ fontSize: 13, color: '#57606a', marginBottom: 24 }}>
        Điều chỉnh tỷ lệ can thiệp kết quả theo từng phòng, ngày và khung giờ.
        <strong> 0% = ngẫu nhiên hoàn toàn, 100% = luôn chọn bất lợi nhất cho người chơi.</strong>
      </p>

      {/* ── Live Preview ── */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>📡 Hiệu lực ngay bây giờ</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {live.map(l => (
            <div key={l.room_id} style={{
              background: '#f7f8fa', border: '1px solid #e5e7eb', borderRadius: 8,
              padding: '10px 14px', minWidth: 160,
            }}>
              <div style={{ fontSize: 12, color: '#57606a', marginBottom: 4 }}>{l.room_name}</div>
              <div style={{
                fontSize: 22, fontWeight: 700,
                color: edgeColor(l.current_house_edge),
              }}>
                {l.current_house_edge}%
              </div>
              <div style={{ fontSize: 11, color: '#57606a' }}>{edgeLabel(l.current_house_edge)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form ── */}
      <section style={{
        background: '#f7f8fa', border: '1px solid #e5e7eb',
        borderRadius: 8, padding: '18px 20px', marginBottom: 28,
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>
          {editId ? `✏️ Chỉnh sửa Rule #${editId}` : '➕ Tạo Rule Mới'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {/* Room */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Phòng game *</label>
            <select
              value={form.room_id}
              onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}
              style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13 }}
            >
              <option value=''>-- Chọn phòng --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>[{r.type.toUpperCase()}] {r.name}</option>
              ))}
            </select>
          </div>

          {/* Day of Week */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Ngày trong tuần</label>
            <select
              value={form.day_of_week}
              onChange={e => setForm(f => ({ ...f, day_of_week: parseInt(e.target.value) }))}
              style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13 }}
            >
              {Object.entries(DAY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Hour From */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Giờ bắt đầu: <strong>{String(form.hour_from).padStart(2, '0')}:00</strong>
            </label>
            <input
              type='range' min={0} max={23} value={form.hour_from}
              onChange={e => {
                const v = parseInt(e.target.value);
                setForm(f => ({ ...f, hour_from: v, hour_to: Math.max(f.hour_to as number, v) }));
              }}
              style={{ width: '100%' }}
            />
          </div>

          {/* Hour To */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Giờ kết thúc: <strong>{String(form.hour_to).padStart(2, '0')}:59</strong>
            </label>
            <input
              type='range' min={0} max={23} value={form.hour_to}
              onChange={e => {
                const v = parseInt(e.target.value);
                setForm(f => ({ ...f, hour_to: Math.max(v, f.hour_from as number) }));
              }}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* House Edge Slider — full width */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
            House Edge: &nbsp;
            <span style={{ fontSize: 20, fontWeight: 700, color: edgeColor(edge) }}>{edge}%</span>
            &nbsp;
            <span style={{ fontSize: 12, color: '#57606a' }}>{edgeLabel(edge)}</span>
          </label>
          <input
            type='range' min={0} max={100} step={5} value={edge}
            onChange={e => setForm(f => ({ ...f, house_edge_percent: parseInt(e.target.value) }))}
            style={{ width: '100%', accentColor: edgeColor(edge) }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
            <span>0% (Ngẫu nhiên)</span>
            <span>50%</span>
            <span>100% (Luôn can thiệp)</span>
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Ghi chú</label>
          <input
            type='text'
            placeholder='Ví dụ: Giờ cao điểm tối thứ 6...'
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSubmit}
            style={{
              background: '#3b82d4', color: '#fff', border: 'none',
              borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}
          >
            {editId ? 'Lưu thay đổi' : 'Tạo rule'}
          </button>
          {editId && (
            <button
              onClick={cancelEdit}
              style={{
                background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db',
                borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontSize: 13,
              }}
            >
              Huỷ
            </button>
          )}
        </div>
      </section>

      {/* ── Rules Table ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>📋 Danh sách Rules</h2>
          <select
            value={filterRoom}
            onChange={e => setFilterRoom(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 12 }}
          >
            <option value=''>Tất cả phòng</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button
            onClick={fetchAll}
            style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 12, cursor: 'pointer' }}
          >
            🔄 Làm mới
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#57606a', fontSize: 13 }}>Đang tải...</p>
        ) : rules.length === 0 ? (
          <p style={{ color: '#57606a', fontSize: 13 }}>Chưa có rule nào. Tạo rule đầu tiên ở trên.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f7f8fa' }}>
                  {['#', 'Phòng', 'Ngày', 'Khung giờ', 'House Edge', 'Ghi chú', 'Hành động'].map(h => (
                    <th key={h} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, i) => (
                  <tr key={rule.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb', color: '#57606a' }}>{rule.id}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: 11, background: '#e0f2fe', color: '#075985', borderRadius: 4, padding: '2px 6px', marginRight: 4 }}>
                        {rule.room_type?.toUpperCase()}
                      </span>
                      {rule.room_name}
                    </td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb' }}>{DAY_LABELS[rule.day_of_week]}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb' }}>
                      {String(rule.hour_from).padStart(2, '0')}:00 → {String(rule.hour_to).padStart(2, '0')}:59
                    </td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 60, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${rule.house_edge_percent}%`, height: '100%',
                            background: edgeColor(rule.house_edge_percent),
                          }} />
                        </div>
                        <span style={{ fontWeight: 700, color: edgeColor(rule.house_edge_percent) }}>
                          {rule.house_edge_percent}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb', color: '#57606a', fontSize: 12 }}>
                      {rule.note || '—'}
                    </td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e5e7eb' }}>
                      <button
                        onClick={() => handleEdit(rule)}
                        style={{
                          background: '#3b82d4', color: '#fff', border: 'none',
                          borderRadius: 4, padding: '3px 10px', cursor: 'pointer', fontSize: 12, marginRight: 6,
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        style={{
                          background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5',
                          borderRadius: 4, padding: '3px 10px', cursor: 'pointer', fontSize: 12,
                        }}
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
