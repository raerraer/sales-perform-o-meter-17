
const express = require('express');
const router = express.Router();
const { versionService } = require('../../db/services');

// 모든 버전 조회
router.get('/', async (req, res) => {
  try {
    const versions = await versionService.getAllVersions();
    res.json(versions);
  } catch (error) {
    console.error('버전 조회 에러:', error);
    res.status(500).json({ error: '버전 조회 실패' });
  }
});

// 특정 버전 조회
router.get('/:id', async (req, res) => {
  try {
    const version = await versionService.getVersionById(req.params.id);
    if (!version) {
      return res.status(404).json({ error: '버전을 찾을 수 없음' });
    }
    res.json(version);
  } catch (error) {
    console.error('버전 조회 에러:', error);
    res.status(500).json({ error: '버전 조회 실패' });
  }
});

// 최신 버전 조회
router.get('/latest', async (req, res) => {
  try {
    const latestVersion = await versionService.getLatestVersion();
    if (!latestVersion) {
      return res.status(404).json({ error: '버전을 찾을 수 없음' });
    }
    res.json(latestVersion);
  } catch (error) {
    console.error('최신 버전 조회 에러:', error);
    res.status(500).json({ error: '최신 버전 조회 실패' });
  }
});

// 새 버전 생성
router.post('/', async (req, res) => {
  try {
    const newVersion = await versionService.createVersion(req.body);
    res.status(201).json(newVersion);
  } catch (error) {
    console.error('버전 생성 에러:', error);
    res.status(500).json({ error: '버전 생성 실패' });
  }
});

// 버전 복제
router.post('/clone', async (req, res) => {
  try {
    const { sourceVersionId, newVersion } = req.body;
    const clonedVersion = await versionService.cloneVersion(sourceVersionId, newVersion);
    if (!clonedVersion) {
      return res.status(400).json({ error: '버전 복제 실패' });
    }
    res.status(201).json(clonedVersion);
  } catch (error) {
    console.error('버전 복제 에러:', error);
    res.status(500).json({ error: '버전 복제 실패' });
  }
});

module.exports = router;
