/**
 * i18n/translations/vi.ts — Tiếng Việt (mặc định)
 */
export const vi = {
  // ── Common ────────────────────────────────────────────────────────────────
  common: {
    loading:      'Đang tải...',
    error:        'Có lỗi xảy ra',
    retry:        'Thử lại',
    save:         'Lưu',
    cancel:       'Hủy',
    confirm:      'Xác nhận',
    delete:       'Xóa',
    edit:         'Chỉnh sửa',
    close:        'Đóng',
    back:         'Quay lại',
    next:         'Tiếp theo',
    submit:       'Gửi',
    search:       'Tìm kiếm',
    noData:       'Không có dữ liệu',
    success:      'Thành công',
    copy:         'Sao chép',
    copied:       'Đã sao chép!',
    all:          'Tất cả',
    today:        'Hôm nay',
    yesterday:    'Hôm qua',
    thisWeek:     'Tuần này',
    thisMonth:    'Tháng này',
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    login:            'Đăng nhập',
    logout:           'Đăng xuất',
    register:         'Đăng ký',
    phone:            'Số điện thoại',
    username:         'Tên đăng nhập',
    password:         'Mật khẩu',
    confirmPassword:  'Xác nhận mật khẩu',
    inviteCode:       'Mã mời',
    inviteCodeHint:   'Nhập mã mời (nếu có)',
    forgotPassword:   'Quên mật khẩu?',
    noAccount:        'Chưa có tài khoản?',
    hasAccount:       'Đã có tài khoản?',
    loginSuccess:     'Đăng nhập thành công',
    registerSuccess:  'Đăng ký thành công',
    invalidCredentials:'Tài khoản hoặc mật khẩu không chính xác',
    accountLocked:    'Tài khoản đã bị khóa',
  },

  // ── Navigation ────────────────────────────────────────────────────────────
  nav: {
    home:        'Trang chủ',
    game:        'Trò chơi',
    history:     'Lịch sử',
    account:     'Tài khoản',
    support:     'Hỗ trợ',
    transaction: 'Giao dịch',
  },

  // ── Game ──────────────────────────────────────────────────────────────────
  game: {
    bet:          'Đặt cược',
    betAmount:    'Số tiền cược',
    minBet:       'Cược tối thiểu',
    maxBet:       'Cược tối đa',
    period:       'Kỳ',
    timeLeft:     'Thời gian còn lại',
    result:       'Kết quả',
    win:          'Thắng',
    lose:         'Thua',
    pending:      'Chờ kết quả',
    big:          'Tài',
    small:        'Xỉu',
    odd:          'Lẻ',
    even:         'Chẵn',
    betPlaced:    'Đặt cược thành công',
    betFailed:    'Đặt cược thất bại',
    sessionClosed:'Phiên đã đóng, vui lòng đợi phiên tiếp theo',
    joinSuccess:  'Tham gia thành công',
    history:      'Lịch sử cược',
  },

  // ── Account ───────────────────────────────────────────────────────────────
  account: {
    profile:          'Hồ sơ',
    balance:          'Số dư',
    vipLevel:         'VIP',
    inviteCode:       'Mã mời của bạn',
    security:         'Bảo mật',
    changePassword:   'Đổi mật khẩu',
    transactionPwd:   'Mật khẩu giao dịch',
    banking:          'Ngân hàng',
    addBank:          'Thêm ngân hàng',
    bankName:         'Tên ngân hàng',
    accountNumber:    'Số tài khoản',
    accountName:      'Tên chủ tài khoản',
    notifications:    'Thông báo',
    betHistory:       'Lịch sử cược',
  },

  // ── Transaction ───────────────────────────────────────────────────────────
  transaction: {
    deposit:          'Nạp tiền',
    withdraw:         'Rút tiền',
    amount:           'Số tiền',
    minDeposit:       'Nạp tối thiểu',
    maxDeposit:       'Nạp tối đa',
    minWithdraw:      'Rút tối thiểu',
    fee:              'Phí',
    receive:          'Thực nhận',
    uploadProof:      'Tải ảnh xác nhận',
    pending:          'Chờ duyệt',
    approved:         'Đã duyệt',
    rejected:         'Từ chối',
    history:          'Lịch sử giao dịch',
    depositSuccess:   'Yêu cầu nạp tiền đã được gửi',
    withdrawSuccess:  'Yêu cầu rút tiền đã được gửi',
  },

  // ── Support / Chat ────────────────────────────────────────────────────────
  support: {
    title:          'Hỗ trợ khách hàng',
    typeMessage:    'Nhập tin nhắn...',
    send:           'Gửi',
    online:         'Trực tuyến',
    offline:        'Ngoại tuyến',
  },
} as const;

export type TranslationKey = typeof vi;
export type LocaleCode = 'vi' | 'en' | 'zh' | 'th' | 'id' | 'ms' | 'ja' | 'ko' | 'de' | 'fr' | 'ru' | 'ar';
