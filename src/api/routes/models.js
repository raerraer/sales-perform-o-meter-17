
const express = require('express');
const router = express.Router();
const { modelService } = require('../../db/services');

// 모든 모델 조회
router.get('/', async (req, res) => {
  try {
    const models = await modelService.getAllModels();
    res.json(models);
  } catch (error) {
    console.error('모델 조회 에러:', error);
    res.status(500).json({ error: '모델 조회 실패' });
  }
});

// 특정 모델 조회
router.get('/:id', async (req, res) => {
  try {
    const model = await modelService.getModelById(req.params.id);
    if (!model) {
      return res.status(404).json({ error: '모델을 찾을 수 없음' });
    }
    res.json(model);
  } catch (error) {
    console.error('모델 조회 에러:', error);
    res.status(500).json({ error: '모델 조회 실패' });
  }
});

module.exports = router;
