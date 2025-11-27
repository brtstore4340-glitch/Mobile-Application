  // --- AI Processing (Debug Version) ---
  const processImage = async () => {
    if (!fileObj) return;
    setIsLoading(true);

    try {
      console.log("Starting AI...");
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are a receipt scanner. Look at this image.
        Find "TESP AFTER COUPON" and "CUSTOMER" (number).
        
        Return ONLY valid JSON format like this:
        { "tesp": "123.45", "customer": "10" }
        
        Do not use Markdown. Do not say "Here is the JSON". Just the JSON string.
      `;

      const imagePart = await fileToGenerativePart(fileObj);
      
      console.log("Sending request to Gemini...");
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      
      // 1. ดึงข้อความดิบออกมาก่อน
      let text = response.text();
      console.log("Raw AI Response:", text);

      // 2. ล้างค่า Markdown ออก (เผื่อ AI เผลอใส่มา)
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      // 3. ลองแปลงเป็น JSON
      try {
        const data = JSON.parse(text);
        setResultData(data); // ถ้าผ่าน บรรทัดนี้จะทำงาน
      } catch (jsonError) {
        // ⚠️ ถ้าแปลงไม่ได้ ให้แจ้งเตือนข้อความดิบที่ AI ตอบมา
        alert("AI ตอบมา แต่แปลงเป็นข้อมูลไม่ได้:\n\n" + text);
        console.error("JSON Parse Error:", jsonError);
      }

    } catch (err) {
      // ⚠️ ถ้า Error ตั้งแต่เชื่อมต่อ (เช่น Key ผิด, เน็ตหลุด)
      console.error(err);
      alert("เกิดข้อผิดพลาดร้ายแรง:\n" + err.message);
    } finally {
      setIsLoading(false);
    }
  };
