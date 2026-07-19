# Wongduen Speaking AI — PWA Version

เวอร์ชันนี้ออกแบบให้ดูเหมือนแอปจริง มี:
- ไอคอนแอปการ์ตูนครูวงเดือน
- Web App Manifest
- เปิดแบบ standalone เต็มหน้าต่าง
- ปุ่มติดตั้งแอปเมื่ออุปกรณ์รองรับ
- หน้า Home, Practice, Progress และ Profile
- ฟังเสียง พูดตาม ให้คะแนนและดาว

## อัปโหลดขึ้น GitHub
อัปโหลดไฟล์ทั้งหมดจากด้านในโฟลเดอร์นี้ไปที่ root ของ repository:

- assets/
- app.js
- data.js
- index.html
- manifest.json
- style.css
- README.md

ไม่มี service-worker.js จึงไม่เกิดปัญหาภาพเก่าค้างแบบเดิม

## หลังอัปโหลด
1. Settings > Pages
2. Deploy from a branch
3. main
4. /(root)
5. Save

## ติดตั้งบน Android หรือคอมพิวเตอร์
เปิดเว็บด้วย Chrome แล้วกดปุ่ม “ติดตั้งแอป” หรือเมนู Chrome > Install app

หากเคยสร้างชอร์ตคัตเดิม ให้ลบชอร์ตคัตเก่าก่อน แล้วติดตั้งใหม่
