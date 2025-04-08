
const express = require('express');
const router = express.Router();
const { userService } = require('../../db/services');

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호가 필요합니다' });
    }
    
    // 실제 구현에서는 비밀번호 검증 로직 추가
    const user = await userService.login(email, password);
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다' });
    }
    
    // 실제 구현에서는 JWT 토큰 생성
    const token = 'dummy_token';
    
    // 사용자 정보와 토큰 반환
    const { password_hash, ...userInfo } = user;
    res.json({
      user: userInfo,
      token
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ error: '로그인 실패' });
  }
});

// 로그아웃
router.post('/logout', (req, res) => {
  // 실제 구현에서는 토큰 무효화 등의 로직 추가
  res.json({ success: true, message: '로그아웃되었습니다' });
});

module.exports = router;
