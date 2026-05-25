import pool from './src/config/database.js';

const cleanupInviteCodes = async () => {
  try {
    console.log('🧹 Đang dọn dẹp hệ thống mã mời...');
    
    // 1. Xóa toàn bộ mã mời cũ
    await pool.query('DELETE FROM invite_codes');
    
    // 2. Tạo 2 mã mời chuẩn gắn cho Super Admin (ID 1)
    const codes = ['838688', '838699'];
    const now = Date.now();
    
    for (const code of codes) {
      await pool.query(
        'INSERT INTO invite_codes (code, user_id, remark, created_at) VALUES (?, ?, ?, ?)',
        [code, 1, 'Mã mời chuẩn hệ thống', now]
      );
      console.log(`✅ Đã khởi tạo mã: ${code}`);
    }
    
    console.log('✨ Hoàn tất dọn dẹp mã mời!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  }
};

cleanupInviteCodes();
