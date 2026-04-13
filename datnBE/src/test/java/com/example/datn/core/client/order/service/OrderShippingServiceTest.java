package com.example.datn.core.client.order.service;

import com.example.datn.core.client.order.model.request.UpdateShippingInfoRequest;
import com.example.datn.core.client.order.model.response.UpdateShippingInfoResponse;
import com.example.datn.core.client.order.service.impl.OrderShippingServiceImpl;
import com.example.datn.entity.Customer;
import com.example.datn.entity.Order;
import com.example.datn.entity.OrderChangeRequest;
import com.example.datn.infrastructure.constant.ChangeRequestStatus;
import com.example.datn.infrastructure.constant.ChangeRequestType;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.repository.OrderChangeRequestRepository;
import com.example.datn.repository.OrderRepository;
import com.example.datn.repository.ShippingAuditLogRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderShippingService - Business Rule Tests")
class OrderShippingServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderChangeRequestRepository changeRequestRepository;

    @Mock
    private ShippingAuditLogRepository auditLogRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private OrderShippingServiceImpl service;

    private Order order;
    private Customer customer;
    private static final String ORDER_ID = "order-123";
    private static final String CUSTOMER_ID = "cust-456";

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(CUSTOMER_ID);
        customer.setName("Nguyen Van A");

        order = new Order();
        order.setId(ORDER_ID);
        order.setCode("ORD-001");
        order.setCustomer(customer);
        order.setRecipientName("Nguoi Nhan Cu");
        order.setRecipientPhone("0900123456");
        order.setRecipientAddress("Dia Chi Cu");
        order.setOrderStatus(OrderStatus.CHO_XAC_NHAN);
        order.setIsShippingLocked(false);
    }

    // ============================================================
    // CASE 1: Direct update - Trạng thái PENDING
    // ============================================================

    @Nested
    @DisplayName("CASE 1: Trạng thái PENDING - Cho phép cập nhật trực tiếp")
    class DirectUpdatePending {

        @BeforeEach
        void setStatus() {
            order.setOrderStatus(OrderStatus.CHO_XAC_NHAN);
        }

        @Test
        @DisplayName("Cập nhật địa chỉ thành công khi trạng thái PENDING")
        void updateAddress_WhenPending_Success() {
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .shippingAddress("Dia Chi Moi Ha Noi")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
            when(orderRepository.save(any(Order.class))).thenReturn(order);

            UpdateShippingInfoResponse response = service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, request);

            assertTrue(response.isDirectUpdate());
            assertEquals("Dia Chi Moi Ha Noi", order.getRecipientAddress());
            verify(orderRepository).save(order);
            verify(auditLogRepository).save(any());
            assertEquals("Cập nhật thông tin giao hàng thành công: Cập nhật địa chỉ giao hàng", response.getMessage());
        }

        @Test
        @DisplayName("Cập nhật số điện thoại thành công khi trạng thái PENDING")
        void updatePhone_WhenPending_Success() {
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .receiverPhone("0987654321")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
            when(orderRepository.save(any(Order.class))).thenReturn(order);

            UpdateShippingInfoResponse response = service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, request);

            assertTrue(response.isDirectUpdate());
            assertEquals("0987654321", order.getRecipientPhone());
            verify(auditLogRepository).save(any());
        }

        @Test
        @DisplayName("Cập nhật tên người nhận thành công khi trạng thái PENDING")
        void updateReceiverName_WhenPending_Success() {
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .receiverName("Nguoi Nhan Moi")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
            when(orderRepository.save(any(Order.class))).thenReturn(order);

            UpdateShippingInfoResponse response = service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, request);

            assertTrue(response.isDirectUpdate());
            assertEquals("Nguoi Nhan Moi", order.getRecipientName());
        }

        @Test
        @DisplayName("Cập nhật nhiều trường cùng lúc thành công")
        void updateMultipleFields_WhenPending_Success() {
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .shippingAddress("Dia Chi Moi")
                    .receiverPhone("0987654321")
                    .receiverName("Nguoi Nhan Moi")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
            when(orderRepository.save(any(Order.class))).thenReturn(order);

            UpdateShippingInfoResponse response = service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, request);

            assertTrue(response.isDirectUpdate());
            assertEquals("Dia Chi Moi", order.getRecipientAddress());
            assertEquals("0987654321", order.getRecipientPhone());
            assertEquals("Nguoi Nhan Moi", order.getRecipientName());
            verify(auditLogRepository, times(3)).save(any());
        }
    }

    // ============================================================
    // CASE 2: Direct update - Trạng thái CONFIRMED
    // ============================================================

    @Nested
    @DisplayName("CASE 2: Trạng thái CONFIRMED - Cho phép cập nhật trực tiếp")
    class DirectUpdateConfirmed {

        @BeforeEach
        void setStatus() {
            order.setOrderStatus(OrderStatus.DA_XAC_NHAN);
        }

        @Test
        @DisplayName("Cập nhật địa chỉ thành công khi trạng thái CONFIRMED")
        void updateAddress_WhenConfirmed_Success() {
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .shippingAddress("Dia Chi Moi")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
            when(orderRepository.save(any(Order.class))).thenReturn(order);

            UpdateShippingInfoResponse response = service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, request);

            assertTrue(response.isDirectUpdate());
            assertEquals("Dia Chi Moi", order.getRecipientAddress());
        }
    }

    // ============================================================
    // CASE 3: Direct update - Trạng thái PACKING
    // ============================================================

    @Nested
    @DisplayName("CASE 3: Trạng thái PACKING (CHO_GIAO) - Cho phép cập nhật trực tiếp")
    class DirectUpdatePacking {

        @BeforeEach
        void setStatus() {
            order.setOrderStatus(OrderStatus.CHO_GIAO);
        }

        @Test
        @DisplayName("Cập nhật địa chỉ thành công khi trạng thái PACKING")
        void updateAddress_WhenPacking_Success() {
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .shippingAddress("Dia Chi Moi")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
            when(orderRepository.save(any(Order.class))).thenReturn(order);

            UpdateShippingInfoResponse response = service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, request);

            assertTrue(response.isDirectUpdate());
            assertEquals("Dia Chi Moi", order.getRecipientAddress());
        }
    }

    // ============================================================
    // CASE 4: Blocked update - Trạng thái HANDOVER/SHIPPING
    // ============================================================

    @Nested
    @DisplayName("CASE 4: Trạng thái DANG_GIAO - Không cho cập nhật trực tiếp, tạo change request")
    class BlockedUpdateAfterHandover {

        @BeforeEach
        void setStatus() {
            order.setOrderStatus(OrderStatus.DANG_GIAO);
            order.setIsShippingLocked(true);
        }

        @Test
        @DisplayName("Cập nhật khi DANG_GIAO: tạo change request, không cập nhật trực tiếp")
        void updateAddress_WhenHandover_CreatesChangeRequest() {
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .shippingAddress("Dia Chi Moi")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
            when(changeRequestRepository.save(any(OrderChangeRequest.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            UpdateShippingInfoResponse response = service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, request);

            assertFalse(response.isDirectUpdate());
            assertEquals("Dia Chi Cu", order.getRecipientAddress()); // Order field NOT updated
            verify(changeRequestRepository).save(any(OrderChangeRequest.class));
            verify(orderRepository, never()).save(any(Order.class));
            assertTrue(response.getMessage().contains("bàn giao cho đơn vị vận chuyển"));
        }

        @Test
        @DisplayName("Change request được tạo với trạng thái CHO_XU_LY")
        void changeRequest_HasCorrectStatus() {
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .shippingAddress("Dia Chi Moi")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
            ArgumentCaptor<OrderChangeRequest> captor = ArgumentCaptor.forClass(OrderChangeRequest.class);
            when(changeRequestRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

            service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, request);

            OrderChangeRequest saved = captor.getValue();
            assertEquals(ChangeRequestStatus.CHO_XU_LY, saved.getChangeStatus());
            assertEquals(ChangeRequestType.UPDATE_ADDRESS, saved.getType());
            assertEquals("Dia Chi Cu", saved.getOldValue());
            assertEquals("Dia Chi Moi", saved.getNewValue());
            assertEquals(order, saved.getOrder());
        }
    }

    // ============================================================
    // CASE 5: Blocked update - Trạng thái terminal
    // ============================================================

    @Nested
    @DisplayName("CASE 5: Trạng thái terminal (HOAN_THANH, DA_HUY) - Chặn mọi cập nhật")
    class BlockedUpdateTerminal {

        @ParameterizedTest
        @EnumSource(value = OrderStatus.class,
                names = {"HOAN_THANH", "DA_HUY"})
        @DisplayName("Chặn cập nhật khi trạng thái terminal")
        void blockUpdate_WhenTerminal(OrderStatus terminalStatus) {
            order.setOrderStatus(terminalStatus);

            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .shippingAddress("Dia Chi Moi")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));

            IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                    service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, request));

            assertTrue(ex.getMessage().contains(terminalStatus.getDisplayText()));
            verify(orderRepository, never()).save(any());
            verify(changeRequestRepository, never()).save(any());
        }
    }

    // ============================================================
    // CASE 6: Validation rules
    // ============================================================

    @Nested
    @DisplayName("CASE 6: Validation Rules")
    class ValidationRules {

        @Test
        @DisplayName("Ném IllegalArgumentException khi request không có trường nào")
        void throwException_WhenNoFieldsProvided() {
            UpdateShippingInfoRequest emptyRequest = new UpdateShippingInfoRequest();

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                    service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, emptyRequest));

            assertEquals("Phải cung cấp ít nhất một trường để cập nhật", ex.getMessage());
        }

        @Test
        @DisplayName("Ném NoSuchElementException khi không tìm thấy đơn hàng")
        void throwException_WhenOrderNotFound() {
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .shippingAddress("Dia Chi Moi")
                    .build();

            when(orderRepository.findById("unknown")).thenReturn(Optional.empty());

            assertThrows(java.util.NoSuchElementException.class, () ->
                    service.updateShippingInfo("unknown", CUSTOMER_ID, request));
        }

        @Test
        @DisplayName("Ném SecurityException khi khách hàng không sở hữu đơn hàng")
        void throwException_WhenCustomerNotOwner() {
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .shippingAddress("Dia Chi Moi")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));

            assertThrows(SecurityException.class, () ->
                    service.updateShippingInfo(ORDER_ID, "wrong-customer-id", request));
        }

        @Test
        @DisplayName("Không cập nhật khi giá trị mới bằng giá trị cũ")
        void noUpdate_WhenNewValueSameAsOld() {
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .shippingAddress("Dia Chi Cu")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                    service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, request));

            assertEquals("Không có thay đổi nào cần cập nhật", ex.getMessage());
        }
    }

    // ============================================================
    // CASE 7: Audit logging
    // ============================================================

    @Nested
    @DisplayName("CASE 7: Audit Logging")
    class AuditLogging {

        @Test
        @DisplayName("Tạo audit log khi cập nhật trực tiếp với isDirectUpdate=true")
        void auditLog_CreatedWithDirectUpdateFlag() {
            order.setOrderStatus(OrderStatus.CHO_XAC_NHAN);
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .receiverPhone("0987654321")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
            when(orderRepository.save(any(Order.class))).thenReturn(order);

            service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, request);

            ArgumentCaptor<com.example.datn.entity.ShippingAuditLog> captor =
                    ArgumentCaptor.forClass(com.example.datn.entity.ShippingAuditLog.class);
            verify(auditLogRepository).save(captor.capture());

            com.example.datn.entity.ShippingAuditLog log = captor.getValue();
            assertEquals("recipientPhone", log.getFieldName());
            assertEquals("0900123456", log.getOldValue());
            assertEquals("0987654321", log.getNewValue());
            assertEquals("DIRECT_UPDATE", log.getChangeType());
            assertEquals(CUSTOMER_ID, log.getUpdatedBy());
            assertTrue(log.getIsDirectUpdate());
        }

        @Test
        @DisplayName("Tạo audit log khi tạo change request với isDirectUpdate=false")
        void auditLog_CreatedForChangeRequest() {
            order.setOrderStatus(OrderStatus.DANG_GIAO);
            UpdateShippingInfoRequest request = UpdateShippingInfoRequest.builder()
                    .receiverPhone("0987654321")
                    .build();

            when(orderRepository.findById(ORDER_ID)).thenReturn(Optional.of(order));
            when(changeRequestRepository.save(any(OrderChangeRequest.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            service.updateShippingInfo(ORDER_ID, CUSTOMER_ID, request);

            ArgumentCaptor<com.example.datn.entity.ShippingAuditLog> captor =
                    ArgumentCaptor.forClass(com.example.datn.entity.ShippingAuditLog.class);
            verify(auditLogRepository).save(captor.capture());

            com.example.datn.entity.ShippingAuditLog log = captor.getValue();
            assertEquals("CHANGE_REQUEST_CREATED", log.getChangeType());
            assertFalse(log.getIsDirectUpdate());
        }
    }
}
