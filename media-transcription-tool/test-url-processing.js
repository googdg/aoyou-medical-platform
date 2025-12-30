#!/usr/bin/env node

// 简单的URL处理测试脚本
const { urlProcessor } = require('./server/dist/services/urlProcessor')

async function testUrlProcessing() {
  console.log('🧪 测试URL处理功能...\n')

  // 测试URL验证
  console.log('1. 测试URL验证:')
  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.bilibili.com/video/BV1xx411c7mu',
    'https://vimeo.com/123456789',
    'https://example.com/audio.mp3',
    'invalid-url',
    'ftp://example.com/file.mp4'
  ]

  testUrls.forEach(url => {
    const validation = urlProcessor.validateUrl(url)
    console.log(`  ${validation.isValid ? '✅' : '❌'} ${url}`)
    if (!validation.isValid) {
      console.log(`     错误: ${validation.error}`)
    }
  })

  // 测试平台检测
  console.log('\n2. 测试平台检测:')
  testUrls.slice(0, 4).forEach(url => {
    const platform = urlProcessor.detectPlatform(url)
    console.log(`  ${url} -> ${platform}`)
  })

  // 测试支持的平台列表
  console.log('\n3. 支持的平台:')
  const platforms = urlProcessor.getSupportedPlatforms()
  platforms.forEach(platform => {
    console.log(`  📺 ${platform}`)
  })

  console.log('\n✅ URL处理功能测试完成!')
}

// 运行测试
testUrlProcessing().catch(error => {
  console.error('❌ 测试失败:', error)
  process.exit(1)
})