
const express = require('express');
const router = express.Router();
const { regionService } = require('../../db/services');

// 모든 지역 조회
router.get('/', async (req, res) => {
  try {
    const regions = await regionService.getAllRegions();
    res.json(regions);
  } catch (error) {
    console.error('지역 조회 에러:', error);
    res.status(500).json({ error: '지역 조회 실패' });
  }
});

// 특정 지역 조회
router.get('/:id', async (req, res) => {
  try {
    const region = await regionService.getRegionById(req.params.id);
    if (!region) {
      return res.status(404).json({ error: '지역을 찾을 수 없음' });
    }
    res.json(region);
  } catch (error) {
    console.error('지역 조회 에러:', error);
    res.status(500).json({ error: '지역 조회 실패' });
  }
});

module.exports = router;
