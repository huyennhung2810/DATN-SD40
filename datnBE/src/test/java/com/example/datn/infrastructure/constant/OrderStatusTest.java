package com.example.datn.infrastructure.constant;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("OrderStatus - State Machine Tests")
class OrderStatusTest {

    @Nested
    @DisplayName("allowDirectShippingUpdate()")
    class AllowDirectShippingUpdate {

        @ParameterizedTest
        @EnumSource(names = {"CHO_XAC_NHAN", "DA_XAC_NHAN", "CHO_GIAO"})
        @DisplayName("Cho phép cập nhật trực tiếp khi trạng thái < DANG_GIAO")
        void allowDirectUpdate_WhenStatusBeforeHandover(OrderStatus status) {
            assertTrue(status.allowDirectShippingUpdate(), status + " nên cho phép cập nhật trực tiếp");
        }

        @ParameterizedTest
        @EnumSource(names = {"DANG_GIAO", "GIAO_HANG_KHONG_THANH_CONG", "HOAN_THANH", "DA_HUY"})
        @DisplayName("Không cho phép cập nhật trực tiếp khi trạng thái >= DANG_GIAO")
        void blockDirectUpdate_WhenStatusAtOrAfterHandover(OrderStatus status) {
            assertFalse(status.allowDirectShippingUpdate(), status + " không nên cho phép cập nhật trực tiếp");
        }
    }

    @Nested
    @DisplayName("isShipped()")
    class IsShipped {

        @ParameterizedTest
        @EnumSource(names = {"DANG_GIAO", "GIAO_HANG_KHONG_THANH_CONG", "HOAN_THANH", "DA_HUY"})
        @DisplayName("Trả về true khi đã bàn giao cho đơn vị vận chuyển")
        void isShipped_WhenAtOrAfterHandover(OrderStatus status) {
            assertTrue(status.isShipped(), status + " nên được coi là đã bàn giao");
        }

        @ParameterizedTest
        @EnumSource(names = {"CHO_XAC_NHAN", "DA_XAC_NHAN", "CHO_GIAO"})
        @DisplayName("Trả về false khi chưa bàn giao")
        void notShipped_WhenBeforeHandover(OrderStatus status) {
            assertFalse(status.isShipped(), status + " không nên được coi là đã bàn giao");
        }

        @Test
        @DisplayName("LUU_TAM không phải trạng thái shipped thực sự")
        void luuTam_IsNotShipped() {
            // LUU_TAM ordinal=7 > DANG_GIAO ordinal=3, nhưng đây là trạng thái tạm, không phải shipped
            assertFalse(OrderStatus.LUU_TAM.isShipped());
        }
    }

    @Nested
    @DisplayName("isTerminal()")
    class IsTerminal {

        @ParameterizedTest
        @EnumSource(names = {"HOAN_THANH", "DA_HUY"})
        @DisplayName("Trả về true cho trạng thái terminal")
        void isTerminal_True(OrderStatus status) {
            assertTrue(status.isTerminal());
        }

        @ParameterizedTest
        @EnumSource(names = {"CHO_XAC_NHAN", "DA_XAC_NHAN", "CHO_GIAO", "DANG_GIAO", "GIAO_HANG_KHONG_THANH_CONG", "LUU_TAM"})
        @DisplayName("Trả về false cho trạng thái không phải terminal")
        void isTerminal_False(OrderStatus status) {
            assertFalse(status.isTerminal(), status + " không nên là trạng thái terminal");
        }
    }

    @Nested
    @DisplayName("isLocked()")
    class IsLocked {

        @ParameterizedTest
        @EnumSource(names = {"HOAN_THANH", "DA_HUY", "LUU_TAM"})
        @DisplayName("Trả về true khi trạng thái khóa mọi thao tác")
        void isLocked_True(OrderStatus status) {
            assertTrue(status.isLocked());
        }

        @ParameterizedTest
        @EnumSource(names = {"CHO_XAC_NHAN", "DA_XAC_NHAN", "CHO_GIAO", "DANG_GIAO", "GIAO_HANG_KHONG_THANH_CONG"})
        @DisplayName("Trả về false khi trạng thái cho phép thao tác")
        void isLocked_False(OrderStatus status) {
            assertFalse(status.isLocked(), status + " không nên bị khóa");
        }
    }

    @Nested
    @DisplayName("getDisplayText()")
    class DisplayText {

        @Test
        @DisplayName("Trả về text tiếng Việt cho mỗi trạng thái")
        void allStatusesHaveDisplayText() {
            for (OrderStatus status : OrderStatus.values()) {
                String text = status.getDisplayText();
                assertNotNull(text);
                assertFalse(text.isBlank(), status + " phải có display text");
            }
        }
    }

    @Nested
    @DisplayName("Order ordinal consistency")
    class OrderOrdinalConsistency {

        @Test
        @DisplayName("Thứ tự ordinal đúng: CHO_XAC_NHAN < DA_XAC_NHAN < CHO_GIAO < DANG_GIAO")
        void ordinalOrder_Correct() {
            assertTrue(OrderStatus.CHO_XAC_NHAN.getOrder() < OrderStatus.DA_XAC_NHAN.getOrder());
            assertTrue(OrderStatus.DA_XAC_NHAN.getOrder() < OrderStatus.CHO_GIAO.getOrder());
            assertTrue(OrderStatus.CHO_GIAO.getOrder() < OrderStatus.DANG_GIAO.getOrder());
            assertTrue(OrderStatus.DANG_GIAO.getOrder() < OrderStatus.GIAO_HANG_KHONG_THANH_CONG.getOrder());
            assertTrue(OrderStatus.GIAO_HANG_KHONG_THANH_CONG.getOrder() < OrderStatus.HOAN_THANH.getOrder());
            assertTrue(OrderStatus.HOAN_THANH.getOrder() < OrderStatus.DA_HUY.getOrder());
        }

        @Test
        @DisplayName("DANG_GIAO là điểm ranh giới: allowDirect false, isShipped true")
        void handoverBoundary() {
            OrderStatus handover = OrderStatus.DANG_GIAO;
            assertFalse(handover.allowDirectShippingUpdate());
            assertTrue(handover.isShipped());
        }
    }
}
