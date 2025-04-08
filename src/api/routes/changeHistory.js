
const express = require('express');
const router = express.Router();
const { changeHistoryService } = require('../../db/services');

// 특정 버전의 변경 이력 조회
router.get('/', async (req, res) => {
  try {
    const { versionId } = req.query;
    if (!versionId) {
      return res.status(400).json({ error: '버전 ID가 필요합니다' });
    }
    
    const history = await changeHistoryService.getHistoryByVersion(versionId);
    res.json(history);
  } catch (error) {
    console.error('변경 이력 조회 에러:', error);
    res.status(500).json({ error: '변경 이력 조회 실패' });
  }
});

// 변경 이력 생성
router.post('/', async (req, res) => {
  try {
    const newHistory = await changeHistoryService.createHistory(req.body);
    res.status(201).json(newHistory);
  } catch (error) {
    console.error('변경 이력 생성 에러:', error);
    res.status(500).json({ error: '변경 이력 생성 실패' });
  }
});

// 배치 변경 이력 생성
router.post('/batch', async (req, res) => {
  try {
    const { historyList } = req.body;
    if (!Array.isArray(historyList) || historyList.length === 0) {
      return res.status(400).json({ error: '유효한 이력 목록이 필요합니다' });
    }
    
    const newHistoryList = await changeHistoryService.createBatchHistory(historyList);
    res.status(201).json(newHistoryList);
  } catch (error) {
    console.error('배치 변경 이력 생성 에러:', error);
    res.status(500).json({ error: '배치 변경 이력 생성 실패' });
  }
});

module.exports = router;
