
const express = require('express');
const router = express.Router();
const { userService } = require('../../db/services');

// 현재 로그인한 사용자 정보 조회
router.get('/me', async (req, res) => {
  try {
    // 실제 구현에서는 JWT 토큰에서 사용자 ID 추출
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: '인증되지 않음' });
    }
    
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없음' });
    }
    
    // 비밀번호 해시는 제외하고 반환
    const { password_hash, ...userInfo } = user;
    res.json(userInfo);
  } catch (error) {
    console.error('사용자 조회 에러:', error);
    res.status(500).json({ error: '사용자 조회 실패' });
  }
});

// 특정 사용자 조회 (관리자 전용)
router.get('/:id', async (req, res) => {
  try {
    // 실제 구현에서는 관리자 권한 확인
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없음' });
    }
    
    // 비밀번호 해시는 제외하고 반환
    const { password_hash, ...userInfo } = user;
    res.json(userInfo);
  } catch (error) {
    console.error('사용자 조회 에러:', error);
    res.status(500).json({ error: '사용자 조회 실패' });
  }
});

// 사용자 생성 (관리자 전용)
router.post('/', async (req, res) => {
  try {
    // 실제 구현에서는 관리자 권한 확인 및 비밀번호 해시 처리
    const newUser = await userService.createUser(req.body);
    
    // 비밀번호 해시는 제외하고 반환
    const { password_hash, ...userInfo } = newUser;
    res.status(201).json(userInfo);
  } catch (error) {
    console.error('사용자 생성 에러:', error);
    res.status(500).json({ error: '사용자 생성 실패' });
  }
});

// 사용자 업데이트
router.put('/:id', async (req, res) => {
  try {
    // 실제 구현에서는 본인 또는 관리자 권한 확인
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ error: '사용자를 찾을 수 없음' });
    }
    
    // 비밀번호 해시는 제외하고 반환
    const { password_hash, ...userInfo } = updatedUser;
    res.json(userInfo);
  } catch (error) {
    console.error('사용자 업데이트 에러:', error);
    res.status(500).json({ error: '사용자 업데이트 실패' });
  }
});

module.exports = router;
