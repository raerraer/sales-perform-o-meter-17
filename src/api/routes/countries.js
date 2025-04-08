
const express = require('express');
const router = express.Router();
const { countryService } = require('../../db/services');

// 모든 국가 조회
router.get('/', async (req, res) => {
  try {
    const countries = await countryService.getAllCountries();
    res.json(countries);
  } catch (error) {
    console.error('국가 조회 에러:', error);
    res.status(500).json({ error: '국가 조회 실패' });
  }
});

// 특정 국가 조회
router.get('/:id', async (req, res) => {
  try {
    const country = await countryService.getCountryById(req.params.id);
    if (!country) {
      return res.status(404).json({ error: '국가를 찾을 수 없음' });
    }
    res.json(country);
  } catch (error) {
    console.error('국가 조회 에러:', error);
    res.status(500).json({ error: '국가 조회 실패' });
  }
});

// 특정 지역에 속한 국가 조회
router.get('/region/:regionId', async (req, res) => {
  try {
    const countries = await countryService.getCountriesByRegion(req.params.regionId);
    res.json(countries);
  } catch (error) {
    console.error('지역별 국가 조회 에러:', error);
    res.status(500).json({ error: '지역별 국가 조회 실패' });
  }
});

module.exports = router;
