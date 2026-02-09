import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION, GEMINI_MODEL_TEXT } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async sendChatMessage(
    history: { role: string; parts: { text: string }[] }[],
    newMessage: string
  ): Promise<string> {
    try {
      const chat = this.ai.chats.create({
        model: GEMINI_MODEL_TEXT,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2, // Low temperature for academic precision
        },
        history: history.map(h => ({
          role: h.role,
          parts: h.parts
        }))
      });

      const response: GenerateContentResponse = await chat.sendMessage({
        message: newMessage
      });

      return response.text || "Xin lỗi, tôi không thể tạo phản hồi lúc này.";
    } catch (error: any) {
      console.error("Gemini API Error Details:", JSON.stringify(error, null, 2));
      console.error("Gemini API Error Message:", error.message);

      if (error.message?.includes("API key") || error.toString().includes("403")) {
        throw new Error("API Key không hợp lệ hoặc chưa được kích hoạt Google AI Studio.");
      }
      if (error.toString().includes("429")) {
        throw new Error("Đã vượt quá giới hạn request (Quota Exceeded).");
      }
      throw new Error(`Lỗi kết nối AI: ${error.message || "Không xác định"}`);
    }
  }

  async generateLessonPlan(
    topic: string,
    duration: string,
    level: string,
    templateStructure?: string,
    clos?: string,
    type: 'outline' | 'full' = 'outline'
  ): Promise<string> {
    let prompt = `
      Hãy đóng vai một giảng viên đại học uy tín ngành Mạng & Viễn thông. 
      Nhiệm vụ: ${type === 'outline' ? 'Soạn ĐỀ CƯƠNG bài giảng (Lesson Plan Structure)' : 'Soạn NỘI DUNG BÀI GIẢNG CHI TIẾT (Full Lecture Notes)'}.
      
      Thông tin đầu vào:
      - Chủ đề: ${topic}
      - Thời lượng: ${duration}
      - Đối tượng: ${level}
    `;

    if (clos && clos.trim()) {
      prompt += `
      \nQUAN TRỌNG - CHUẨN ĐẦU RA (CLOs) CẦN ĐẠT:
      --------------------------
      ${clos}
      --------------------------
      YÊU CẦU ĐẶC BIỆT VỀ CLO:
      1. Mục tiêu bài học phải liệt kê lại chính xác các CLO này.
      2. Nội dung phải map được với CLO (Chỉ rõ phần nào đáp ứng CLO nào).
      `;
    }

    if (type === 'outline') {
      prompt += `
        \nYÊU CẦU CHẾ ĐỘ: ĐỀ CƯƠNG TÓM TẮT (OUTLINE)
        - Tập trung vào phân bổ thời gian, cấu trúc các mục, hoạt động dạy học.
        - Không cần viết quá chi tiết nội dung kiến thức, chỉ gạch đầu dòng ý chính.
        - Tạo bảng phân bổ thời gian chi tiết.
        `;
    } else {
      prompt += `
        \nYÊU CẦU CHẾ ĐỘ: NỘI DUNG HOÀN THIỆN CHI TIẾT (FULL CONTENT)
        - Viết đầy đủ nội dung kiến thức như một giáo trình hoặc kịch bản giảng dạy chi tiết.
        - Giải thích sâu các khái niệm kỹ thuật (Definitions, Concepts).
        - Phân tích nguyên lý hoạt động từng bước (Step-by-step analysis).
        - Đưa ra ví dụ minh họa thực tế (Real-world examples).
        - So sánh ưu nhược điểm chi tiết.
        - Nếu có các giao thức/lệnh, hãy giải thích ý nghĩa từng dòng lệnh.
        - Văn phong học thuật, sâu sắc, chặt chẽ.
        `;
    }

    if (templateStructure) {
      prompt += `
      \nCẤU TRÚC MẪU BẮT BUỘC (Hãy điền nội dung vào khung này):
      --------------------------
      ${templateStructure}
      --------------------------
      `;
    } else {
      prompt += `
      \nYêu cầu cấu trúc mặc định (Markdown):
      1. Mục tiêu bài học.
      2. Nội dung chi tiết (Viết sâu).
      3. Sơ đồ minh họa (Mermaid).
      4. Tổng kết & Câu hỏi lượng giá.
      `;
    }

    prompt += `\nLưu ý: Nội dung phải chuyên sâu, sử dụng thuật ngữ kỹ thuật chính xác, văn phong sư phạm trang trọng.`;

    try {
      const response = await this.ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: type === 'full' ? 0.4 : 0.3 // Higher temp for full content creativity
        }
      });
      return response.text || "Không có dữ liệu trả về.";
    } catch (error) {
      console.error("Lesson Plan Error:", error);
      throw error;
    }
  }

  async translateTechnical(text: string): Promise<string> {
    const prompt = `
      Bạn là một chuyên gia dịch thuật kỹ thuật chuyên ngành Viễn thông & Công nghệ thông tin.
      Hãy dịch đoạn văn bản sau từ tiếng Anh sang tiếng Việt (hoặc ngược lại nếu đầu vào là tiếng Việt).

      Nguyên tắc dịch:
      1. GIỮ NGUYÊN các thuật ngữ chuyên ngành chuẩn quốc tế.
      2. Văn phong: Học thuật, chính xác, ngắn gọn.
      3. Nếu văn bản gốc có bảng biểu hoặc cấu trúc danh sách, hãy giữ nguyên định dạng Markdown Table và List trong bản dịch.
      4. Nếu văn bản mô tả quy trình, hãy cân nhắc vẽ thêm sơ đồ Mermaid minh họa nếu thấy hữu ích.

      Văn bản cần dịch:
      "${text}"
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: { temperature: 0.1 }
      });
      return response.text || "Lỗi dịch thuật.";
    } catch (error) {
      console.error("Translation Error:", error);
      throw error;
    }
  }

  async generateLabGuide(topic: string, tool: string): Promise<string> {
    const prompt = `
      Hãy tạo một Hướng dẫn Thực hành (Lab Guide) chi tiết cho chủ đề: "${topic}".
      Công cụ thực hiện: ${tool} (ví dụ: Cisco Packet Tracer, GNS3, EVE-NG, hoặc thiết bị thật).

      Cấu trúc yêu cầu (Markdown):
      1. **Mục tiêu bài Lab**: Kiến thức cần đạt được.
      2. **Mô hình mạng (Topology)**: 
         - Mô tả các thiết bị cần thiết.
         - **BẮT BUỘC**: Vẽ sơ đồ kết nối bằng mã **Mermaid** (sử dụng graph TD hoặc graph LR).
      3. **Bảng địa chỉ IP**: Kẻ bảng IP Allocation (Device, Interface, IP Address, Subnet Mask, Gateway) bằng **Markdown Table**.
      4. **Các bước cấu hình (Step-by-Step Configuration)**:
         - Hướng dẫn từng bước cụ thể.
         - CUNG CẤP LỆNH CLI (Command Line Interface) đầy đủ trong các block code.
         - Giải thích ngắn gọn ý nghĩa các câu lệnh quan trọng.
      5. **Kiểm tra kết quả (Verification)**: Các lệnh show, ping, traceroute để kiểm tra.
      6. **Troubleshooting**: Một số lỗi thường gặp và cách xử lý.

      Lưu ý: Đảm bảo các lệnh CLI chính xác theo cú pháp của hãng (thường là Cisco IOS nếu không chỉ định cụ thể).
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.3
        }
      });
      return response.text || "Không thể tạo hướng dẫn Lab.";
    } catch (error) {
      console.error("Lab Guide Error:", error);
      throw error;
    }
  }

  async generateLectureContent(topic: string, moduleName: string): Promise<string> {
    const prompt = `
      Viết nội dung bài giảng chi tiết cho sinh viên đại học ngành Viễn thông.
      - Môn học: ${moduleName}
      - Tên bài: ${topic}
      
      Yêu cầu cấu trúc (Markdown):
      1. **Giới thiệu chung**: Khái niệm và vai trò.
      2. **Nguyên lý hoạt động**: Giải thích chi tiết về kỹ thuật.
      3. **Minh họa**: Vẽ 1 sơ đồ **Mermaid** giải thích quy trình hoặc cấu trúc (VD: Sequence diagram hoặc Architecture diagram).
      4. **So sánh/Thông số**: Tạo 1 **Markdown Table** so sánh với các công nghệ cũ hoặc liệt kê thông số kỹ thuật.
      5. **Kết luận**: Tóm tắt ý chính.
      
      Nội dung phải chuyên sâu, chính xác, cập nhật công nghệ mới nhất.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.3
        }
      });
      return response.text || "Không thể tạo nội dung bài giảng.";
    } catch (error) {
      console.error("Lecture Gen Error:", error);
      throw error;
    }
  }
}
