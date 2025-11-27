import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [imagePath, setImagePath] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);

  // ✅ ใส่ Key ให้เรียบร้อยแล้วครับ
  const API_KEY = "AIzaSyD4RrzFQlZX7cIIBk6XG-efWNvtbnQDia8"; 

  // --- Login ---
  const handleLogin = () => {
    if (password === '1234') {
      setIsLoggedIn(true);
    } else {
      alert('รหัสผ่านผิดครับ (ลอง 1234)');
    }
  };

  // --- Upload ---
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileObj(file);
      setImagePath(URL.createObjectURL(file));
      setResultData(null); // เคลียร์ค่าเก่า
    }
  };

  // --- AI Processing ---
  async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  const processImage = async () => {
    if (!fileObj) return;
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Look at this receipt. Extract these 2 values specifically:
        1. "TESP AFTER COUPON" (Get the amount, e.g. 41,436.45)
        2. "CUSTOMER" (Get the number of customers, e.g. 128)
        
        Return JSON ONLY: { "tesp": "value", "customer": "value" }
        If not found, use "-".
      `;

      const imagePart = await fileToGenerativePart(fileObj);
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text().replace(/```json|```/g, '').trim();
      
      const data = JSON.parse(text);
      setResultData(data);

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด: AI อ่านไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  // --- หน้าจอ Login ---
  if (!isLoggedIn) {
    return (
      <div className="app-container centered">
        <div className="card login-card">
          <div className="icon-bg">🔒</div>
          <h2>เข้าสู่ระบบ</h2>
          <p className="subtitle">กรุณาใส่รหัสผ่านเพื่อใช้งาน</p>
          
          <input
            type="password"
            className="modern-input"
            placeholder="รหัสผ่าน (1234)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="modern-btn primary" onClick={handleLogin}>
            Login เข้าใช้งาน
          </button>
        </div>
      </div>
    );
  }

  // --- หน้าจอหลัก ---
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🧾 Smart Scanner</h1>
        <p>AI Powered by Gemini</p>
      </header>

      <div className="card main-card">
        {/* ส่วนอัปโหลด */}
        <div className="upload-section">
          <label className="upload-box">
            <span className="upload-icon">📸</span>
            <span>แตะเพื่อถ่ายรูป / เลือกรูป</span>
            <input type="file" onChange={handleImageUpload} accept="image/*" hidden />
          </label>
        </div>

        {/* ส่วนพรีวิวและปุ่มกด */}
        {imagePath && (
          <div className="preview-section fade-in">
            <img src={imagePath} alt="Preview" className="preview-img" />
            
            {!resultData && (
              <button 
                className={`modern-btn magic ${isLoading ? 'loading' : ''}`} 
                onClick={processImage}
                disabled={isLoading}
              >
                {isLoading ? 'กำลังวิเคราะห์...' : '✨ ให้ AI อ่านค่า'}
              </button>
            )}
          </div>
        )}

        {/* ส่วนผลลัพธ์ (แสดงการ์ดสวยๆ) */}
        {resultData && (
          <div className="results-grid fade-in-up">
            <div className="result-card blue">
              <span className="label">TESP AFTER COUPON</span>
              <span className="value">{resultData.tesp}</span>
            </div>
            
            <div className="result-card purple">
              <span className="label">CUSTOMER</span>
              <span className="value">{resultData.customer} <span className="unit">คน</span></span>
            </div>

            <button className="modern-btn outline" onClick={() => {setImagePath(null); setResultData(null);}}>
              🔄 สแกนใบใหม่
            </button>
          </div>
        )}
      </div>

      <button className="logout-link" onClick={() => setIsLoggedIn(false)}>
        ออกจากระบบ
      </button>
    </div>
  );
}

export default App;
