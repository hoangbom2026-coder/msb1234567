import pool from '../config/database.js';
import { sendResponse } from '../utils/helpers.js';

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
export const getAllBanks = async (req, res, next) => {
    try {
        const [banks] = await pool.query('SELECT id, name, code, bin, logo FROM banks ORDER BY name');
        return sendResponse(res, true, 'Thành công', banks);
    } catch (error) {
        next(error);
    }
};

/**
 * Fetches the bank accounts linked by the authenticated user.
 */
export const getUserBanks = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [userBanks] = await pool.query(
            "SELECT id, bank_name, account_number, account_name, branch FROM user_banks WHERE user_id = ? AND status = 'active'",
            [userId]
        );

        // Mask account number — show only last 4 digits
        const maskedBanks = userBanks.map(bank => ({
            ...bank,
            account_number: bank.account_number.length > 4
                ? '****' + bank.account_number.slice(-4)
                : '****'
        }));

        return sendResponse(res, true, 'Thành công', maskedBanks);
    } catch (error) {
        next(error);
    }
};

/**
 * Adds a new bank account for the authenticated user.
 */
export const addUserBank = async (req, res, next) => {
    try {
        const { bank_name, account_number, account_name, branch } = req.body;
        const userId = req.user.id;

        if (!bank_name || !account_number || !account_name) {
            return sendResponse(res, false, 'Vui lòng nhập đầy đủ tên ngân hàng, số tài khoản và tên chủ thẻ');
        }
        if (!/^\d+$/.test(account_number)) {
            return sendResponse(res, false, 'Số tài khoản chỉ được chứa chữ số');
        }

        const [userRows] = await pool.query('SELECT name_real FROM users WHERE id = ?', [userId]);
        const nameReal = userRows[0]?.name_real;
        if (!nameReal) {
            return sendResponse(res, false, 'Vui lòng cập nhật "Tên thật" trong hồ sơ trước khi liên kết ngân hàng');
        }

        const normalizedAccountName = normalizeVietnameseString(account_name);
        const normalizedNameReal    = normalizeVietnameseString(nameReal);
        if (normalizedAccountName !== normalizedNameReal) {
            return sendResponse(res, false, `Tên chủ thẻ (${normalizedAccountName}) phải trùng khớp với tên thật (${normalizedNameReal})`);
        }

        const [banks] = await pool.query('SELECT id FROM banks WHERE name = ?', [bank_name]);
        if (banks.length === 0) {
            return sendResponse(res, false, 'Ngân hàng không hợp lệ, vui lòng chọn từ danh sách');
        }

        const [existing] = await pool.query(
            'SELECT id FROM user_banks WHERE user_id = ? AND account_number = ?',
            [userId, account_number]
        );
        if (existing.length > 0) {
            return sendResponse(res, false, 'Tài khoản ngân hàng này đã được liên kết');
        }

        await pool.query(
            'INSERT INTO user_banks (user_id, bank_name, account_number, account_name, branch) VALUES (?, ?, ?, ?, ?)',
            [userId, bank_name, account_number, normalizedAccountName, branch || null]
        );

        return sendResponse(res, true, 'Liên kết ngân hàng thành công');
    } catch (error) {
        next(error);
    }
};
