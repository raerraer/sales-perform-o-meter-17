
const express = require('express');
const router = express.Router();
const { salesDataService } = require('../../db/services');

// 특정 버전의 모든 데이터 조회
router.get('/', async (req, res) => {
  try {
    const { versionId } = req.query;
    if (!versionId) {
      return res.status(400).json({ error: '버전 ID가 필요합니다' });
    }
    
    const data = await salesDataService.getDataByVersion(versionId);
    res.json(data);
  } catch (error) {
    console.error('데이터 조회 에러:', error);
    res.status(500).json({ error: '데이터 조회 실패' });
  }
});

// 데이터 생성
router.post('/', async (req, res) => {
  try {
    const newData = await salesDataService.createData(req.body);
    res.status(201).json(newData);
  } catch (error) {
    console.error('데이터 생성 에러:', error);
    res.status(500).json({ error: '데이터 생성 실패' });
  }
});

// 배치 데이터 생성
router.post('/batch', async (req, res) => {
  try {
    const { dataList } = req.body;
    if (!Array.isArray(dataList) || dataList.length === 0) {
      return res.status(400).json({ error: '유효한 데이터 목록이 필요합니다' });
    }
    
    const newDataList = await salesDataService.createBatchData(dataList);
    res.status(201).json(newDataList);
  } catch (error) {
    console.error('배치 데이터 생성 에러:', error);
    res.status(500).json({ error: '배치 데이터 생성 실패' });
  }
});

// 데이터 업데이트
router.put('/:id', async (req, res) => {
  try {
    const updatedData = await salesDataService.updateData(req.params.id, req.body);
    if (!updatedData) {
      return res.status(404).json({ error: '데이터를 찾을 수 없음' });
    }
    res.json(updatedData);
  } catch (error) {
    console.error('데이터 업데이트 에러:', error);
    res.status(500).json({ error: '데이터 업데이트 실패' });
  }
});

// 버전 데이터 복사
router.post('/copy', async (req, res) => {
  try {
    const { sourceVersionId, targetVersionId } = req.body;
    if (!sourceVersionId || !targetVersionId) {
      return res.status(400).json({ error: '원본 및 대상 버전 ID가 필요합니다' });
    }
    
    const success = await salesDataService.copyVersionData(sourceVersionId, targetVersionId);
    if (!success) {
      return res.status(400).json({ error: '데이터 복사 실패' });
    }
    
    res.json({ success: true, message: '데이터가 성공적으로 복사되었습니다' });
  } catch (error) {
    console.error('데이터 복사 에러:', error);
    res.status(500).json({ error: '데이터 복사 실패' });
  }
});

// 회계연도별 합계 계산
router.get('/fiscal-year-totals', async (req, res) => {
  try {
    const { versionId } = req.query;
    if (!versionId) {
      return res.status(400).json({ error: '버전 ID가 필요합니다' });
    }
    
    const data = await salesDataService.getDataByVersion(versionId);
    const totals = await salesDataService.calculateFiscalYearTotals(data);
    
    res.json(totals);
  } catch (error) {
    console.error('연간 합계 계산 에러:', error);
    res.status(500).json({ error: '연간 합계 계산 실패' });
  }
});

module.exports = router;
