import express from 'express';
import { SearchHistory } from '../models/SearchHistory.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply middleware to all routes in this router
router.use(requireAuth);
router.use(requireAdmin);

router.get('/top-searches', async (req, res) => {
    try {
        const topSearches = await SearchHistory.aggregate([
            {
                $group: {
                    _id: { $toLower: "$query" }, // Group by query (case-insensitive)
                    count: { $sum: 1 },
                    originalQuery: { $first: "$query" } // Keep one version of the query string
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json(topSearches.map(item => ({
            query: item.originalQuery,
            count: item.count
        })));
    } catch (err) {
        console.error("Error fetching top searches:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
