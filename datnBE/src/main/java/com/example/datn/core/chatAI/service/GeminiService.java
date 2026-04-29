package com.example.datn.core.chatAI.service;

import com.example.datn.entity.ChatMessage;
import com.example.datn.repository.ChatMessageRepository;
import com.example.datn.repository.ProductDetailRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.net.URI;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ProductDetailRepository productDetailRepository;
    private final WebClient.Builder webClientBuilder;
    private final ChatMessageRepository chatMessageRepository;

    public String getChatResponse(String userMsg, String sessionId) {
        // Lấy các ProductDetail còn hàng (quantity > 0)
        List<com.example.datn.entity.ProductDetail> availableDetails = productDetailRepository.findAll()
                .stream().filter(pd -> pd.getQuantity() != null && pd.getQuantity() > 0).toList();
        String productContext = buildProductDetailContext(availableDetails);
        System.out.println("[Gemini DEBUG] productContext gửi lên Gemini:\n" + productContext);

        // Lấy lịch sử chat
        List<ChatMessage> history = chatMessageRepository.findTop10BySession_SessionIdOrderByCreatedAtDesc(sessionId);
        String chatHistory = history.stream()
                .map(m -> m.getSender() + ": " + m.getContent())
                .collect(Collectors.joining("\n"));

        String finalPrompt = String.format(
                "Bạn là chuyên gia máy ảnh Canon tại cửa hàng Canon Hikari. " +
                        "Hãy dùng thông tin sản phẩm sau để trả lời khách:\n%s\n\n" +
                        "Ngữ cảnh hội thoại: \n%s\n\n" +
                        "Khách hàng hỏi: %s\n" +
                        "Nếu có sản phẩm, hãy liệt kê danh sách sản phẩm hiện có với tên, giá, tình trạng, số lượng. Nếu không còn sản phẩm nào, hãy xin số điện thoại để nhân viên liên hệ. Trả lời ngắn gọn, nhiệt tình.",
                productContext, chatHistory, userMsg);
        System.out.println("[Gemini DEBUG] finalPrompt gửi lên Gemini:\n" + finalPrompt);

        return callGeminiApi(finalPrompt);
    }

    private String buildProductDetailContext(List<com.example.datn.entity.ProductDetail> details) {
        if (details.isEmpty())
            return "Hiện tại không có sản phẩm nào còn hàng.";
        return details.stream()
                .map(pd -> String.format("- %s (%s). Giá: %s. Số lượng: %s. Mô tả: %s",
                        pd.getProduct() != null && pd.getProduct().getName() != null ? pd.getProduct().getName()
                                : "Không rõ tên",
                        pd.getVersion() != null ? pd.getVersion() : "Không rõ phiên bản",
                        pd.getSalePrice() != null ? String.format("%,.0f₫", pd.getSalePrice()) : "Không rõ giá",
                        pd.getQuantity() != null ? pd.getQuantity() : "Không rõ số lượng",
                        pd.getProduct() != null && pd.getProduct().getDescription() != null
                                ? pd.getProduct().getDescription()
                                : "Không có mô tả"))
                .collect(Collectors.joining("\n"));
    }

    private String callGeminiApi(String prompt) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("${GEMINI_API_KEY}")) {
            return "Canon Hikari AI: Lỗi cấu hình chìa khóa.";
        }

        try {
            WebClient webClient = webClientBuilder.build();
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));

            // Chú ý: Dùng gemini-flash-latest
            String urlString = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key="

                    + apiKey.trim();
            URI uri = new URI(urlString);

            JsonNode response = webClient.post()
                    .uri(uri)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.has("candidates")) {
                return response.path("candidates").get(0)
                        .path("content").path("parts").get(0)
                        .path("text").asText();
            }
            return "Hikari AI đang suy nghĩ, vui lòng đợi trong giây lát.";

        } catch (Exception e) {
            System.err.println("--- LỖI GOOGLE GEMINI: " + e.getMessage());
            return "Canon Hikari AI đang bận một chút, nhân viên sẽ hỗ trợ bạn ngay nhé!";
        }
    }
}