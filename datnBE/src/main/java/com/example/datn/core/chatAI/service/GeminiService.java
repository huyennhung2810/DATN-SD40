package com.example.datn.core.chatAI.service;

import com.example.datn.entity.ChatMessage;
import com.example.datn.entity.Product;
import com.example.datn.repository.ChatMessageRepository;
import com.example.datn.repository.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.net.URI;
@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ProductRepository productRepository;
    private final WebClient.Builder webClientBuilder;
    private final ChatMessageRepository chatMessageRepository;

    public String getChatResponse(String userMsg, String sessionId) {

        //  Tìm sản phẩm (RAG)
        List<Product> relatedProducts = productRepository.findProductsForAi(userMsg);
        String productContext = buildProductContext(relatedProducts);

        // Lấy lịch sử chat
        List<ChatMessage> history = chatMessageRepository.findTop10BySession_SessionIdOrderByCreatedAtDesc(sessionId);
        String chatHistory = history.stream()
                .map(m -> m.getSender() + ": " + m.getContent())
                .collect(Collectors.joining("\n"));

        String finalPrompt = String.format(
                "Bạn là chuyên gia máy ảnh Canon tại cửa hàng Canon Hikari. " +
                        "Hãy dùng thông tin sản phẩm sau: \n%s\n\n" +
                        "Ngữ cảnh hội thoại: \n%s\n\n" +
                        "Khách hàng hỏi: %s\n" +
                        "Trả lời ngắn gọn, nhiệt tình. Nếu không có sản phẩm, hãy gợi ý khách để lại số điện thoại để nhân viên tư vấn.",
                productContext, chatHistory, userMsg
        );

        return callGeminiApi(finalPrompt);
    }

    private String buildProductContext(List<Product> products) {
        if (products.isEmpty()) return "Hiện tại không tìm thấy sản phẩm cụ thể khách yêu cầu.";
        return products.stream()
                .map(p -> String.format("- %s: Giá %s. Tình trạng: %s",
                        p.getName(), p.getPrice(), p.getDescription()))
                .collect(Collectors.joining("\n"));
    }


    private String callGeminiApi(String prompt) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("${GEMINI_API_KEY}")) {
            return "Canon Hikari AI: Lỗi cấu hình chìa khóa.";
        }

        try {
            WebClient webClient = webClientBuilder.build();
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
            );

            // Chú ý: Dùng gemini-flash-latest
            String urlString = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + apiKey.trim();
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