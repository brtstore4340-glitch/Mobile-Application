import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const styles = {
  container: {
    maxWidth: '480px', margin: '0 auto', padding: '20px', minHeight: '100vh',
    fontFamily: '"Prompt", sans-serif', background: 'linear-gradient(135deg, #e0f2fe 0%, #eff6ff 100%)',
    color: '#333', display: 'flex', flexDirection: 'column'
  },
  card: {
    background: 'white', borderRadius: '20px', padding: '24px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', marginBottom: '20px', textAlign: 'center'
  },
  input: {
    width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd',
    fontSize: '16px', marginBottom: '15px', boxSizing: 'border-box'
  },
  btn: {
    width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
    fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
    background: '#2563eb', color: 'white', marginTop: '10px'
  },
  uploadBox: {
    border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '30px',
    cursor: 'pointer', background: '#f8fafc', color: '#64748b', display: 'block'
  },
  resultCard: {
    background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '12px',
    padding: '15px', marginBottom: '10px', color: '#1e40af', textAlign: 'left'
  },
  label: { fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', opacity: 0.8 },
  value: { fontSize: '24px', fontWeight: 'bold' }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [imagePath, setImagePath] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);

  // ✅ Key ของคุณ
  const API_KEY = "AIzaSyD4RrzFQlZX7cIIBk6XG-efWNvtbnQDia8";

  const handleLogin = () => {
    if (password === '1234') setIsLoggedIn(true);
    else alert('รหัสผิด (ลอง 1234)');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileObj(file);
      setImagePath(URL.createObjectURL(file));
      setResultData(null);
    }
  };

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
      
      // ✅ จุดที่แก้: ใช้รุ่นที่เจาะจงรหัส 'gemini-1.5-flash-001' (ชัวร์ที่สุด)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

      const prompt = `
        Extract 2 values from receipt:
        1. "TESP AFTER COUPON" (amount)
        2. "CUSTOMER" (number)
        Return JSON: { "tesp": "value", "customer": "value" }
        If not found use "-". No markdown.
      `;

      const imagePart = await fileToGenerativePart(fileObj);
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      let text = response.text().replace(/```json|```/g, '').trim();

      try {
        setResultData(JSON.parse(text));
      } catch (e) {
        alert("รูปแบบข้อมูลผิดพลาด: " + text);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{...styles.container, justifyContent: 'center'}}>
        <div style={styles.card}>
          <h2 style={{margin: '0 0 10px'}}>Login</h2>
          <input type="password" style={styles.input} placeholder="1234" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button style={styles.btn} onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={{textAlign: 'center', color: '#1e3a8a'}}>🧾 Smart Receipt</h2>
      <div style={styles.card}>
        <label style={styles.uploadBox}>
          <div style={{fontSize: '40px'}}>📸</div>
          <div>เลือกรูปภาพ</div>
          <input type="file" onChange={handleImageUpload} accept="image/*" hidden />
        </label>

        {imagePath && (
          <div style={{marginTop: '20px'}}>
            <img src={imagePath} style={{width: '100%', borderRadius: '12px'}} />
            {!resultData && (
              <button 
                style={{...styles.btn, background: isLoading ? '#ccc' : '#2563eb'}}
                onClick={processImage} disabled={isLoading}
              >
                {isLoading ? '⏳ กำลังทำงาน...' : '✨ วิเคราะห์'}
              </button>
            )}
          </div>
        )}

        {resultData && (
          <div style={{marginTop: '20px'}}>
            <div style={styles.resultCard}>
              <span style={styles.label}>TESP AFTER COUPON</span>
              <span style={styles.value}>{resultData.tesp}</span>
            </div>
            <div style={{...styles.resultCard, background: '#f3e8ff', color: '#6b21a8'}}>
              <span style={styles.label}>CUSTOMER</span>
              <span style={styles.value}>{resultData.customer}</span>
            </div>
            <button style={{...styles.btn, background: 'white', color: '#555', border: '1px solid #ddd'}} onClick={() => {setImagePath(null); setResultData(null);}}>🔄 เริ่มใหม่</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


