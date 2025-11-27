import { useState } from 'react';
import Tesseract from 'tesseract.js';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [imagePath, setImagePath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [rawText, setRawText] = useState('');

  // 1. ฟังก์ชัน Login
  const handleLogin = () => {
    if (password === '1234') {
      setIsLoggedIn(true);
    } else {
      alert('รหัสผ่านผิด (ลองใช้ 1234)');
    }
  };

  // 2. ฟังก์ชันอัปโหลดและอ่านภาพ
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePath(imageUrl);
      processImage(imageUrl);
    }
  };

  // 3. AI Process (Logic เดียวกับเวอร์ชันก่อน แต่เขียนแบบ React)
  const processImage = async (url) => {
    setIsLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(url, 'eng', {
        logger: (m) => console.log(m),
      });

      setRawText(text);

      // Extract Data Logic
      const lines = text.split('\n');
      const extracted = { tesp: null, itemSold: null, amount: null };

      lines.forEach((line) => {
        const cleanLine = line.toUpperCase();
        if (cleanLine.includes('TESP')) extracted.tesp = line;
        if (cleanLine.includes('ITEM SOLD')) {
            extracted.itemSold = line.replace(/[^0-9]/g, ''); // ดึงเฉพาะตัวเลข
        }
        if (cleanLine.includes('AMOUNT') && !cleanLine.includes('OFFLINE')) {
             extracted.amount = line;
        }
      });

      setResultData(extracted);
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการอ่านภาพ');
    } finally {
      setIsLoading(false);
    }
  };

  // --- ส่วนแสดงผล (UI) ---
  if (!isLoggedIn) {
    return (
      <div className="container">
        <h1>🔐 Login System</h1>
        <input 
          type="text" placeholder="Username" 
          value={username} onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          type="password" placeholder="Password (1234)" 
          value={password} onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={handleLogin}>เข้าสู่ระบบ</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>📸 AI Receipt Scanner (React)</h1>
      
      <div className="card">
        <label className="upload-btn">
          เลือกรูปภาพใบเสร็จ
          <input type="file" onChange={handleImageUpload} accept="image/*" hidden />
        </label>

        {imagePath && (
          <img src={imagePath} alt="Preview" className="preview-img" />
        )}

        {isLoading && <p className="loading">⏳ AI กำลังทำงาน... กรุณารอสักครู่</p>}

        {resultData && !isLoading && (
          <div className="result-box">
            <h3>📊 ผลการวิเคราะห์</h3>
            <ul>
              <li><strong>TESP:</strong> {resultData.tesp || 'ไม่พบค่า'}</li>
              <li><strong>Item Sold:</strong> {resultData.itemSold || 'ไม่พบค่า'} ชิ้น</li>
              <li><strong>Amount:</strong> {resultData.amount || 'ไม่พบค่า'}</li>
            </ul>
            
            <details>
              <summary>ดูข้อความดิบทั้งหมด</summary>
              <pre>{rawText}</pre>
            </details>
          </div>
        )}
        
        <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>Logout</button>
      </div>
    </div>
  );
}

export default App;
