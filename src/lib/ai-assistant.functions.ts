import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { buildKnowledgeBase } = await import("./ai-assistant.server");
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return {
        reply:
          "Trợ lý AI hiện chưa sẵn sàng. Bạn vui lòng thử lại sau hoặc liên hệ MIỀN TOUR nhé.",
      };
    }

    const knowledge = await buildKnowledgeBase();

    const system = [
      "Bạn là Trợ lý du lịch của website MIỀN TOUR (khu vực Rạch Giá, Kiên Giang).",
      "Chỉ trả lời DỰA HOÀN TOÀN vào DỮ LIỆU WEBSITE bên dưới do quản trị viên cung cấp.",
      "Tuyệt đối KHÔNG bịa đặt tên địa điểm, tour, nhà xe, hướng dẫn viên, giá, món ăn hay khách sạn không có trong dữ liệu.",
      "Nếu dữ liệu chưa có thông tin được hỏi, hãy trả lời lịch sự: thông tin này chưa được cập nhật trên MIỀN TOUR, và gợi ý những nội dung đang có.",
      "Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, dùng gạch đầu dòng khi liệt kê.",
      "",
      "=== DỮ LIỆU WEBSITE MIỀN TOUR ===",
      knowledge,
      "=== HẾT DỮ LIỆU ===",
    ].join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, ...data.messages],
      }),
    });

    if (res.status === 429)
      return { reply: "Trợ lý đang nhận quá nhiều câu hỏi. Bạn thử lại sau ít phút nhé." };
    if (res.status === 402)
      return { reply: "Trợ lý AI tạm hết lượt sử dụng. Vui lòng liên hệ quản trị viên." };
    if (!res.ok) {
      console.error("AI gateway error", res.status, await res.text());
      return { reply: "Xin lỗi, trợ lý gặp sự cố kỹ thuật. Bạn vui lòng thử lại sau." };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return {
      reply:
        json.choices?.[0]?.message?.content?.trim() ||
        "Thông tin này hiện chưa được cập nhật trên MIỀN TOUR.",
    };
  });
