# TTS Test Scripts (Thai & English)
## สำหรับทดสอบ Azure และ Gemini TTS Voices

---

## 🇹🇭 Thai Test Scripts

### 1. ทักทาย/สวัสดี
```
สวัสดีครับ ยินดีต้อนรับสู่ Speech Hub
สวัสดีค่ะ ผมยินดีที่ได้รู้จักทุกคน
```

### 2. แนะนำตัวเอง
```
สมชายรับใช้ครับ วันนี้ผมจะพาเพื่อนๆ ไปรู้จักกับเทคโนโลยี TTS ครับ
ดิฉันชื่อมานีค่ะ เป็นผู้ช่วยเสียงประกอบจาก Gemini AI ค่ะ
```

### 3. พูดถึงเทคโนโลยี
```
วันนี้เราจะมาทดสอบความสามารถของระบบ Text-to-Speech กันครับ
เทคโนโลยีการแปลงข้อความเป็นเสียงพูดนี้มีความน่าสนใจมากค่ะ
```

### 4. แสดงอารมณ์ต่างๆ
```
**สดใส/มีชีวิต:**
ว้าว! นี่มันเจ๋งมากเลยครับ! ผมตื่นเต้นจริงๆ ครับ!

**สุภาพ/เรียบร้อย:**
ขอเชิญทุกท่านเข้าสู่โลกแห่งเสียงพูดที่สวยงามครับ

**จริงจัง/สุขุม:**
ในฐานะผู้พัฒนา เราต้องให้ความสำคัญกับคุณภาพเสียงที่ได้ครับ

**เป็นกันเอง/เป็นมิตร:**
เอาล่ะครับ มาลองกันเถอะ! ไม่ต้องเกรงใจเลยครับ
```

### 5. บทสนทนาสั้นๆ
```
คุณ: สวัสดีครับ วันนี้มีอะไรให้ช่วยเหรอครับ
ผม: สวัสดีครับ! วันนี้ผมมีเรื่องน่าสนใจเกี่ยวกับ AI มาเล่าให้ฟังครับ
คุณ: อ๋อ คืออะไรเหรอครับ
ผม: คือระบบแปลงข้อความเป็นเสียงพูดครับ ลองฟังดูสิครับ
```

### 6. อ่านข่าว/ประกาศ
```
ประกาศ! ระบบ TTS ใหม่ของเราพร้อมให้บริการแล้ววันนี้
ผู้ใช้สามารถเลือกเสียงพูดได้มากกว่า 30 เสียงครับ
ทั้งภาษาไทยและภาษาอังกฤษ มาพร้อมคุณภาพเสียงที่ชัดเจนครับ
```

---

## 🇬🇧 English Test Scripts

### 1. Greeting
```
Hello everyone! Welcome to Speech Hub
Hi there! I'm excited to meet you all today
```

### 2. Introduction
```
I'm your AI voice assistant, powered by Gemini technology
Nice to meet you! I'm here to help with text-to-speech synthesis
```

### 3. Technology Focus
```
Today we're exploring the amazing capabilities of modern TTS systems
Text-to-speech technology has evolved significantly in recent years
```

### 4. Emotional Range
```
**Excited:**
Wow! This is absolutely amazing! I'm so excited to show you what we can do!

**Professional:**
Welcome to our demonstration of advanced voice synthesis technology

**Friendly:**
Hey there! Let's have some fun with voice generation, shall we?

**Calm:**
Take a moment to appreciate the natural sound quality of these voices
```

### 5. Short Dialogue
```
User: Hi, can you help me with something?
AI: Of course! I'd be happy to help. What do you need?
User: I want to test different voice styles
AI: Great! Let me show you the variety of voices we have available
```

---

## 🎯 Gemini-Specific Instructions

### 1. Tone Instructions (สำหรับ Gemini เท่านั้น)
```
พูดด้วยน้ำเสียงสดใสและเป็นมิตร: สวัสดีครับ ยินดีต้อนรับครับ

พูดด้วยน้ำเสียงสุภาพและสงบ: ขอเชิญทุกท่านเข้าสู่การทดสอบระบบครับ

พูดด้วยน้ำเสียงที่มีพลังและกระตือรือร้น: วันนี้เราจะมาทดสอบสิ่งที่น่าตื่นเต้นครับ!

Speak cheerfully and enthusiastically: Hello everyone! Welcome to our TTS demonstration!

Speak in a calm and soothing tone: Relax and enjoy the natural voice quality

Speak with excitement and energy: This technology is absolutely incredible!
```

### 2. Complex Instructions
```
พูดด้วยน้ำเสียงเป็นพิธีกรรายการข่าว แต่มีความเป็นกันเอง: ข่าวด่วน! เทคโนโลยี TTS มาถึงจุดที่น่าทึ่งตื่นตาตื่นใจแล้วครับ

พูดด้วยน้ำเสียงเหมือนนักบรรยายในสารคดีทางวิทยาศาสตร์: ในโลกของปัญญาประดิษฐ์ เราได้พัฒนาเทคโนโลยีที่สามารถเข้าใจความรู้สึกและอารมณ์ของมนุษย์
```

---

## 📝 Test Recommendations

### 1. Basic Testing (ทุก voices)
- ใช้บทพูดสั้นๆ 2-3 ประโยค
- ทดสอบทั้งภาษาไทยและอังกฤษ
- สังเกตความชัดเจนและความเป็นธรรมชาติ

### 2. Azure Voices Testing
- ทดสอบ SSML styles (ถ้ามี)
- ทดสอบความเร็วและจังหวะ
- ทดสอบเสียงแต่ละ gender

### 3. Gemini Voices Testing
- ทดสอบ tone instructions ต่างๆ
- ทดสอบความสามารถในการแสดงอารมณ์
- เปรียบเทียบกับ Azure voices

### 4. Quality Checklist
- [ ] เสียงชัดเจน ไม่มีสัญญาณรบกวน
- [ ] จังหวะการพูดเป็นธรรมชาติ
- [ ] อารมณ์/น้ำเสียงสอดคล้องกับคำสั่ง
- [ ] ความเร็วเหมาะสมกับการฟัง
- [ ] ไม่มีปัญหาการตัดคำหรือออกเสียงผิด

---

## 🎵 Audio Quality Notes

### Thai Language Tips:
- ให้ความสำคัญกับวรรณยุกต์และการลงเสียง
- สังเกตการออกเสียงพยัญชนะไทย
- ทดสอบคำที่มีตัวสะกดต่างๆ

### English Language Tips:
- ทดสอบคำศัพท์ที่ยากและยาว
- สังเกตการออกเสียงสระ
- ทดสอบการอ่านตัวเลขและวันที่

---

## 🚀 Quick Start

1. เลือก voice ที่ต้องการทดสอบ
2. คัดลอกบทพูดจากด้านบน
3. สำหรับ Gemini: เพิ่ม tone instruction ถ้าต้องการ
4. กด Generate และฟังผลลัพธ์
5. บันทึกผลการทดสอบ

Good luck with your TTS testing! 🎤
