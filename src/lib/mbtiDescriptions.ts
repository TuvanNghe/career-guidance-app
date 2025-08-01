export const MBTI_MAP: Record<
  string,
  { intro: string; strengths: string[]; flaws: string[]; careers: string[] }
> = {
  INTJ: {
    intro:
      'INTJ là người chiến lược, thiên về tư duy phân tích, định hướng dài hạn.',
    strengths: [
      'Sắc bén logic, phân tích sâu',
      'Tầm nhìn chiến lược, lập kế hoạch giỏi',
      'Độc lập và sáng tạo',
    ],
    flaws: ['Cứng đầu, ít linh hoạt', 'Thiếu tinh tế về cảm xúc'],
  },
  INTP: {
    intro:
      'INTP là nhà tư tưởng trừu tượng, thích khám phá ý tưởng và hệ thống.',
    strengths: [
      'Phân tích khái niệm sâu sắc',
      'Độc lập, trí tuệ tò mò',
      'Giải quyết vấn đề sáng tạo',
    ],
    flaws: ['Dễ trì hoãn', 'Khó biểu đạt cảm xúc'],
  },
  ENTJ: {
    intro: 'ENTJ là thủ lĩnh sinh ra để tổ chức, hoạch định và đạt mục tiêu.',
    strengths: [
      'Quyết đoán, định hướng kết quả',
      'Khả năng lãnh đạo',
      'Tư duy chiến lược rõ ràng',
    ],
    flaws: ['Độc đoán', 'Ít chú ý cảm xúc'],
  },
  ENTP: {
    intro:
      'ENTP là người sáng tạo ý tưởng, thích tranh luận và đổi mới không ngừng.',
    strengths: [
      'Sáng tạo, ứng biến nhanh',
      'Kỹ năng tranh luận',
      'Nhìn vấn đề đa góc độ',
    ],
    flaws: ['Thiếu kiên trì chi tiết', 'Dễ chán'],
  },
  INFJ: {
    intro:
      'INFJ là người cố vấn tận tâm, kết hợp trực giác và giá trị nhân văn.',
    strengths: ['Đồng cảm sâu sắc', 'Tầm nhìn mạnh', 'Truyền cảm hứng'],
    flaws: ['Cầu toàn', 'Khó chia sẻ cảm xúc'],
  },
  INFP: {
    intro: 'INFP là người lý tưởng hoá, sống theo giá trị cá nhân và sáng tạo.',
    strengths: [
      'Trí tưởng tượng phong phú',
      'Trung thành giá trị',
      'Thấu cảm',
    ],
    flaws: ['Né tránh xung đột', 'Thiếu kế hoạch'],
  },
  ENFJ: {
    intro:
      'ENFJ là người truyền cảm hứng, lãnh đạo dựa trên giá trị và kết nối con người.',
    strengths: ['Giao tiếp mạnh', 'Truyền động lực', 'Nhạy bén cảm xúc'],
    flaws: ['Quá quan tâm ý kiến', 'Dễ kiệt sức'],
  },
  ENFP: {
    intro:
      'ENFP là người khởi xướng đầy nhiệt huyết, giàu ý tưởng và linh hoạt.',
    strengths: ['Nhiệt tình', 'Sáng tạo', 'Dễ kết nối'],
    flaws: ['Thiếu tập trung', 'Nhạy cảm căng thẳng'],
  },
  ISTJ: {
    intro:
      'ISTJ là người nghiêm túc, đáng tin cậy, chú trọng chi tiết và chuẩn mực.',
    strengths: ['Kỷ luật', 'Logic', 'Chính xác'],
    flaws: ['Bảo thủ', 'Thiếu linh hoạt cảm xúc'],
  },
  ISFJ: {
    intro:
      'ISFJ là người bảo trợ tận tuỵ, luôn chăm sóc nhu cầu thực tế của người khác.',
    strengths: ['Đáng tin', 'Ghi nhớ chi tiết', 'Chu đáo'],
    flaws: ['Ngại thay đổi', 'Tự hy sinh quá mức'],
  },
  ESTJ: {
    intro: 'ESTJ là người quản lý thực tiễn, thích tổ chức và duy trì trật tự.',
    strengths: ['Quyết đoán', 'Tuân thủ quy trình', 'Lãnh đạo nhóm tốt'],
    flaws: ['Bảo thủ', 'Ít kiên nhẫn ý tưởng mới'],
  },
  ESFJ: {
    intro:
      'ESFJ là người bảo trợ xã hội, coi trọng hòa hợp và trách nhiệm cộng đồng.',
    strengths: ['Thân thiện', 'Tổ chức sự kiện', 'Quan tâm người khác'],
    flaws: ['Nhạy cảm xung đột', 'Phụ thuộc sự công nhận'],
  },
  ISTP: {
    intro:
      'ISTP là người thợ lành nghề, ưa khám phá cách mọi thứ vận hành trong thực tế.',
    strengths: [
      'Logic – cơ học giỏi',
      'Bình tĩnh trong khủng hoảng',
      'Giải quyết vấn đề thực tiễn',
    ],
    flaws: ['Dễ chán công việc bàn giấy', 'Khó diễn đạt cảm xúc'],
  },
  ISFP: {
    intro:
      'ISFP là nghệ sĩ điềm tĩnh, trân trọng trải nghiệm và cái đẹp hiện tại.',
    strengths: ['Sáng tạo', 'Linh hoạt', 'Thân thiện'],
    flaws: ['Tránh xung đột', 'Thiếu kế hoạch dài hạn'],
  },
  ESTP: {
    intro:
      'ESTP là người hành động, thích trải nghiệm và xử lý vấn đề ngay lập tức.',
    strengths: ['Quyết đoán', 'Mạo hiểm', 'Đàm phán tốt'],
    flaws: ['Bốc đồng', 'Thiếu cân nhắc dài hạn'],
  },
  ESFP: {
    intro:
      'ESFP là người nghệ sĩ sôi nổi, lan tỏa niềm vui và sống trong khoảnh khắc.',
    strengths: ['Hoạt náo', 'Thích ứng nhanh', 'Kết nối cảm xúc'],
    flaws: ['Mất tập trung', 'Thiếu kỷ luật tài chính'],
  },
}
