import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use absolute path relative to this file so it works regardless of CWD
// middleware/ → src/ → backend/ → sands/logs
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.resolve(__dirname, '../../../logs');
const transactionLogFile = path.join(logsDir, 'transactions.log');
fs.mkdirSync(logsDir, { recursive: true });

export const logTransaction = (transactionData) => {
    const {
        type,           // 'recharge', 'withdraw', 'bet', 'win'
        userId,
        phone,
        amount,
        orderId,
        status,         // 'pending', 'success', 'failed'
        timestamp,
        description,
        extraData = {}
    } = transactionData;

    const logEntry = {
        type,
        userId,
        phone,
        amount: parseFloat(amount).toFixed(2),
        orderId,
        status,
        timestamp: timestamp || new Date().toISOString(),
        timestamp_unix: Date.now(),
        description,
        ...extraData
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    // Write to file asynchronously
    fs.appendFile(transactionLogFile, logLine, (err) => {
        if (err) {
            console.error('[LOGGING ERROR]', err);
        }
    });

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
        console.log('[TRANSACTION LOG]', logEntry);
    }
};

/**
 * Middleware để tự động log response chứa giao dịch
 */
export const transactionLoggingMiddleware = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
        // Log nếu là response từ transaction endpoints
        if (req.path.includes('/transaction') && data.status === true) {
            const { id_order, status: txStatus, money } = data;
            const transactionType = req.path.includes('/withdraw')
                ? 'withdraw'
                : req.path.includes('/recharge')
                    ? 'recharge'
                    : 'unknown';

            logTransaction({
                type: transactionType,
                userId: req.user?.id,
                phone: req.user?.phone,
                amount: money,
                orderId: id_order,
                status: txStatus === 0 ? 'pending' : txStatus === 1 ? 'success' : 'failed',
                description: data.message,
                endpoint: req.path
            });
        }

        return originalJson.call(this, data);
    };

    next();
};

/**
 * Hàm để đọc log transactions (cho admin panel)
 */
export const getTransactionLogs = (options = {}) => {
    const {
        limit = 100,
        userId = null,
        type = null,
        status = null,
        startDate = null,
        endDate = null
    } = options;

    try {
        const logs = fs.readFileSync(transactionLogFile, 'utf-8')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return null;
                }
            })
            .filter(entry => entry !== null);

        // Filter logs based on options
        let filtered = logs;
        if (userId) {
            filtered = filtered.filter(log => log.userId === parseInt(userId));
        }
        if (type) {
            filtered = filtered.filter(log => log.type === type);
        }
        if (status) {
            filtered = filtered.filter(log => log.status === status);
        }
        if (startDate) {
            const start = new Date(startDate).getTime();
            filtered = filtered.filter(log => log.timestamp_unix >= start);
        }
        if (endDate) {
            const end = new Date(endDate).getTime();
            filtered = filtered.filter(log => log.timestamp_unix <= end);
        }

        // Return latest entries first, limited by limit param
        return filtered.reverse().slice(0, limit);
    } catch (err) {
        console.error('[GET LOGS ERROR]', err);
        return [];
    }
};
