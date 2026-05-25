import pool from '../config/database.js';

/**
 * Normalizes a Vietnamese string by converting it to uppercase and removing accents.
 * @param {string} str The string to normalize.
 * @returns {string} The normalized string.
 */
export const normalizeVietnameseString = (str) => {
    if (!str) return '';
    str = str.toUpperCase();
    str = str.replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, "A");
    str = str.replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, "E");
    str = str.replace(/[ÌÍỊỈĨ]/g, "I");
    str = str.replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, "O");
    str = str.replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, "U");
    str = str.replace(/[ỲÝỴỶỸ]/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Remove any remaining non-alphanumeric characters (except spaces)
    str = str.replace(/[^A-Z0-9\s]/g, '');
    return str.trim();
};

/**
 * Fetches the list of all supported banks.
 */
export const getAllBanks = async (req, res) => {
    try {
        const [banks] = await pool.query('SELECT id, name, code, bin, logo FROM banks ORDER BY name');
        res.json({ success: true, data: banks });
    } catch (error) {
        console.error('Error fetching banks:', error);
        res.status(500).json({ success: false, message: 'Could not fetch bank list.' });
    }
};

/**
 * Fetches the bank accounts linked by the authenticated user.
 */
export const getUserBanks = async (req, res) => {
    try {
        const userId = req.user.id;
        const [userBanks] = await pool.query(
            'SELECT id, bank_name, account_number, account_name, branch FROM user_banks WHERE user_id = ? AND status = \'active\'',
            [userId]
        );

        // Mask the account number for security
        const maskedBanks = userBanks.map(bank => ({
            ...bank,
            account_number: '****' + bank.account_number.slice(-4)
        }));

        res.json({ success: true, data: maskedBanks });
    } catch (error) {
        console.error('Error fetching user banks:', error);
        res.status(500).json({ success: false, message: 'Could not fetch user bank accounts.' });
    }
};

/**
 * Adds a new bank account for the authenticated user.
 */
export const addUserBank = async (req, res) => {
    const { bank_name, account_number, account_name, branch } = req.body;
    const userId = req.user.id;

    // 1. Basic Validation
    if (!bank_name || !account_number || !account_name) {
        return res.status(400).json({ success: false, message: 'Bank name, account number, and account name are required.' });
    }

    // 2. Advanced Validation
    if (!/^\d+$/.test(account_number)) {
        return res.status(400).json({ success: false, message: 'Account number must only contain digits.' });
    }

    try {
        // 3. Fetch user's real name to compare
        const [userRows] = await pool.query('SELECT name_real FROM users WHERE id = ?', [userId]);
        const nameReal = userRows[0]?.name_real;

        if (!nameReal) {
            return res.status(400).json({ success: false, message: 'Vui lòng cập nhật "Tên thật" trong hồ sơ của bạn trước khi liên kết ngân hàng.' });
        }

        const normalizedAccountName = normalizeVietnameseString(account_name);
        const normalizedNameReal = normalizeVietnameseString(nameReal);

        if (normalizedAccountName !== normalizedNameReal) {
            return res.status(400).json({ success: false, message: `Tên chủ thẻ (${normalizedAccountName}) phải trùng khớp với tên thật trong hồ sơ (${normalizedNameReal}).` });
        }

        // 4. Check if the bank is in the supported list
        const [banks] = await pool.query('SELECT * FROM banks WHERE name = ?', [bank_name]);
        if (banks.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid bank name. Please select a bank from the list.' });
        }

        // 5. Check for duplicate account number for the same user
        const [existing] = await pool.query(
            'SELECT id FROM user_banks WHERE user_id = ? AND account_number = ?',
            [userId, account_number]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Tài khoản ngân hàng này đã được liên kết.' });
        }

        // 6. Insert new bank account
        await pool.query(
            'INSERT INTO user_banks (user_id, bank_name, account_number, account_name, branch) VALUES (?, ?, ?, ?, ?)',
            [userId, bank_name, account_number, normalizedAccountName, branch || null]
        );

        res.status(201).json({ success: true, message: 'Liên kết ngân hàng thành công!' });

    } catch (error) {
        console.error('Error adding bank account:', error);
        res.status(500).json({ success: false, message: 'An error occurred while adding the bank account.' });
    }
};
