package com.example.datn.infrastructure.config.database;

import com.example.datn.core.admin.employee.repository.ADEmployeeRepository;
import com.example.datn.entity.*;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.BannerType;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.example.datn.infrastructure.constant.SerialStatus;
import com.example.datn.infrastructure.constant.HandoverStatus;
import com.example.datn.infrastructure.constant.ShiftStatus;
import com.example.datn.infrastructure.constant.TypeInvoice;
import com.example.datn.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import org.springframework.data.jpa.repository.JpaRepository;

@Component
@RequiredArgsConstructor
public class DBGenerator implements CommandLineRunner {

    private final ADEmployeeRepository employeeRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    // Repositories for seeding
    private final ProductCategoryRepository productCategoryRepository;
    private final BrandRepository brandRepository;
    private final ColorRepository colorRepository;
    private final StorageCapacityRepository storageCapacityRepository;
    private final TechSpecRepository techSpecRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductDetailRepository productDetailRepository;
    private final BannerRepository bannerRepository;
    private final WarrantyRepository warrantyRepository;
    private final WarrantyHistoryRepository warrantyHistoryRepository;
    private final SerialRepository serialRepository;
    private final CartDetailRepository cartDetailRepository;
    private final CartRepository cartRepository;
    private final DiscountDetailRepository discountDetailRepository;
    private final DiscountRepository discountRepository;
    private final BillDetailRepository orderDetailRepository;
    private final BillRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final VoucherDetailRepository voucherDetailRepository;
    private final VoucherRepository voucherRepository;
    private final AddressRepository addressRepository;

    // Additional repositories for seeding
    private final ShippingMethodRepository shippingMethodRepository;
    private final SensorTypeRepository sensorTypeRepository;
    private final ResolutionRepository resolutionRepository;
    private final ProcessorRepository processorRepository;
    private final LensMountRepository lensMountRepository;
    private final ImageFormatRepository imageFormatRepository;
    private final VideoFormatRepository videoFormatRepository;
    private final ShiftTemplateRepository shiftTemplateRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final ShiftHandoverRepository shiftHandoverRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Autowired
    @Qualifier("employeeRepository")
    private EmployeeRepository employeeRepo;

    @Value("${db.generator.is-generated}")
    private boolean isGenerated;

    @Value("${USER_USERNAME}") // Đọc nhunghth03
    private String fixedUsername;

    @Value("${USER_PASSWORD}") // Đọc 281003
    private String fixedPassword;

    @Value("${USER_EMAIL}")
    private String adminEmail;

    @Value("${USER_NAME}")
    private String adminName;

    @Value("${USER_CODE}")
    private String adminCode;
    private Long now;

    @Override
    public void run(String... args) throws Exception {
        if (!isGenerated) return;

        // Seed product data first
        seedProductData();

        // Kiểm tra xem Account đã tồn tại chưa (tránh tạo trùng khi restart server)
        if (accountRepository.existsByUsername(fixedUsername)) {
            System.out.println(">>> Tài khoản Admin [" + fixedUsername + "] đã sẵn sàng.");
            return;
        }

        System.out.println(">>> Database trống, đang khởi tạo quyền truy cập cho Nhung...");

        try {
            // 1. Tạo Account với Username/Password cố định từ cấu hình
            Account adminAccount = new Account();
            adminAccount.setUsername(fixedUsername);
            adminAccount.setPassword(passwordEncoder.encode(fixedPassword));
            adminAccount.setRole(RoleConstant.ADMIN);
            adminAccount.setStatus(EntityStatus.ACTIVE);

            Account savedAccount = accountRepository.save(adminAccount);

            // 2. Tạo Employee gắn với Account vừa tạo
            Employee adminEmployee = new Employee();
            adminEmployee.setAccount(savedAccount);
            adminEmployee.setCode(adminCode);
            adminEmployee.setName(adminName);
            adminEmployee.setEmail(adminEmail);
            adminEmployee.setPhoneNumber("0979085701");
            adminEmployee.setStatus(EntityStatus.ACTIVE);

            employeeRepository.save(adminEmployee);

            System.out.println("====================================================");
            System.out.println("   KHỞI TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!             ");
            System.out.println("   Username: " + fixedUsername);
            System.out.println("   Password: " + fixedPassword);
            System.out.println("====================================================");

        } catch (Exception e) {
            System.err.println(">>> Lỗi seeding dữ liệu: " + e.getMessage());
        }
    }

    private void seedProductData() {
        System.out.println(">>> Đang xóa dữ liệu cũ và seed dữ liệu mới...");

        try {
            // Xóa dữ liệu cũ theo thứ tự (để tránh vi phạm ràng buộc khóa ngoại)
            // Thứ tự xóa: bảng con (có FK) -> bảng cha
            
            // 1. Xóa warranty và warranty_history (có FK đến serial)
            warrantyRepository.deleteAll();
            warrantyHistoryRepository.deleteAll();
            
            // 2. Xóa serial (có FK đến product_detail và order_detail)
            serialRepository.deleteAll();
            
            // 3. Xóa order details -> orders (order có FK đến customer, voucher)
            orderDetailRepository.deleteAll();
            orderRepository.deleteAll();
            
            // 4. Xóa cart details -> carts (cart có FK đến customer)
            cartDetailRepository.deleteAll();
            cartRepository.deleteAll();
            
            // 5. Xóa discount details -> discounts
            discountDetailRepository.deleteAll();
            discountRepository.deleteAll();
            
            // 6. Xóa voucher details -> vouchers (voucher_detail có FK đến customer và voucher)
            voucherDetailRepository.deleteAll();
            voucherRepository.deleteAll();
            
            // 7. Xóa addresses (có FK đến customer)
            addressRepository.deleteAll();
            
            // 8. Xóa customers (phải sau tất cả bảng có FK đến customer)
            customerRepository.deleteAll();
            
            // 9. Xóa product variants, images, products
            productDetailRepository.deleteAll();
            productImageRepository.deleteAll();
            productRepository.deleteAll();
            
            // 10. Xóa các bảng lookup
            techSpecRepository.deleteAll();
            storageCapacityRepository.deleteAll();
            colorRepository.deleteAll();
            brandRepository.deleteAll();
            productCategoryRepository.deleteAll();
            
            // 11. Xóa banners
            bannerRepository.deleteAll();

            System.out.println(">>> Đã xóa toàn bộ dữ liệu cũ");

            // 1. Seed Categories (Loại sản phẩm)
            List<ProductCategory> categories = Arrays.asList(
                createCategory("Máy ảnh DSLR", "Máy ảnh kỹ thuật số DSLR chuyên nghiệp"),
                createCategory("Máy ảnh Mirrorless", "Máy ảnh không gương lật cao cấp"),
                createCategory("Máy ảnh Compact", "Máy ảnh du lịch nhỏ gọn"),
                createCategory("Máy quay phim", "Máy quay phim chuyên nghiệp"),
                createCategory("Ống kính", "Ống kính máy ảnh các loại"),
                createCategory("Phụ kiện", "Phụ kiện máy ảnh")
            );
            productCategoryRepository.saveAll(categories);
            System.out.println(">>> Đã tạo " + categories.size() + " danh mục sản phẩm");

            // 2. Seed Brands (Thương hiệu)
            List<Brand> brands = Arrays.asList(
                createBrand("Canon", "Thương hiệu máy ảnh hàng đầu Nhật Bản"),
                createBrand("Nikon", "Máy ảnh DSLR chuyên nghiệp"),
                createBrand("Sony", "Máy ảnh Mirrorless và cảm biến cao cấp"),
                createBrand("Fujifilm", "Máy ảnh Retro và film"),
                createBrand("Panasonic", "Máy ảnh và máy quay phim"),
                createBrand("Olympus", "Máy ảnh Micro Four Thirds"),
                createBrand("Pentax", "Máy ảnh DSLR bền bỉ"),
                createBrand("Leica", "Máy ảnh cao cấp Đức")
            );
            brandRepository.saveAll(brands);
            System.out.println(">>> Đã tạo " + brands.size() + " thương hiệu");

            // 3. Seed Colors (Màu sắc)
            List<Color> colors = Arrays.asList(
                createColor("Đen", "000000"),
                createColor("Trắng", "FFFFFF"),
                createColor("Bạc", "C0C0C0"),
                createColor("Xám", "808080"),
                createColor("Đỏ", "FF0000"),
                createColor("Xanh dương", "0000FF"),
                createColor("Xanh lá", "008000"),
                createColor("Vàng", "FFFF00"),
                createColor("Cam", "FFA500"),
                createColor("Hồng", "FFC0CB")
            );
            colorRepository.saveAll(colors);
            System.out.println(">>> Đã tạo " + colors.size() + " màu sắc");

            // 4. Seed Storage Capacities (Dung lượng)
            List<StorageCapacity> storages = Arrays.asList(
                createStorage("64GB", "64"),
                createStorage("128GB", "128"),
                createStorage("256GB", "256"),
                createStorage("512GB", "512"),
                createStorage("1TB", "1024")
            );
            storageCapacityRepository.saveAll(storages);
            System.out.println(">>> Đã tạo " + storages.size() + " dung lượng lưu trữ");

            // 5. Seed TechSpecs (Thông số kỹ thuật) và Products
            // TechSpecs with corresponding products
            seedProductsWithVariants(categories, brands, colors, storages);

            // 6. Seed Banners for homepage
            seedBanners();

            // 7. Seed Shipping Methods
            seedShippingMethods();

            // 8. Seed TechSpec Lookup Tables
            seedTechSpecLookups();

            // 9. Seed Shift Templates
            seedShiftTemplates();

            // 10. Seed Customers and Addresses
            List<Customer> customers = seedCustomers();

            // 11. Seed Vouchers and Voucher Details
            seedVouchers(customers);

            // 12. Seed Discounts and Discount Details
            seedDiscounts();

            // 13. Seed Carts and Cart Details
//            seedCarts(customers);

            // 14. Seed Orders and Order Details
            seedOrders(customers);

            // 15. Seed Serial Numbers
            seedSerials();

            // 16. Seed Warranties and Warranty History
            seedWarranties();

            // 17. Seed Work Schedules and Shift Handovers
            seedWorkSchedules();

            // 18. Seed Chat Sessions and Messages
            seedChatSessions();

            System.out.println(">>> Hoàn tất seed dữ liệu!");

        } catch (Exception e) {
            System.err.println(">>> Lỗi seed dữ liệu sản phẩm: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private ProductCategory createCategory(String name, String description) {
        ProductCategory category = new ProductCategory();
        category.setName(name);
        category.setDescription(description);
        category.setStatus(EntityStatus.ACTIVE);
        return category;
    }

    private Brand createBrand(String name, String description) {
        Brand brand = new Brand();
        brand.setName(name);
        brand.setDescription(description);
        brand.setStatus(EntityStatus.ACTIVE);
        return brand;
    }

    private Color createColor(String name, String code) {
        Color color = new Color();
        color.setName(name);
        color.setCode(code);
        color.setStatus(EntityStatus.ACTIVE);
        return color;
    }

    private StorageCapacity createStorage(String name, String code) {
        StorageCapacity storage = new StorageCapacity();
        storage.setName(name);
        storage.setCode(code);
        storage.setStatus(EntityStatus.ACTIVE);
        return storage;
    }

    private void seedProductsWithVariants(List<ProductCategory> categories, List<Brand> brands,
                                           List<Color> colors, List<StorageCapacity> storages) {
        
        // Canon EOS R5 - Mirrorless Full-frame
        TechSpec techSpec1 = createTechSpec("Full-frame CMOS", "Canon RF", "45MP", 
            "ISO 100-51200", "DIGIC X", "JPEG, RAW", "8K RAW, 4K 120fps", "Canon");
        techSpecRepository.save(techSpec1);
        Product product1 = createProduct("Canon EOS R5", 
            "Máy ảnh mirrorless full-frame 45MP với khả năng quay video 8K, chống rung 8-stop IBIS, hệ thống AF 594 điểm.",
            new BigDecimal("259900000"), categories.get(1), brands.get(0), techSpec1);
        productRepository.save(product1);
        addProductImages(product1, Arrays.asList(
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800"
        ));
        addProductVariants(product1, colors.subList(0, 3), storages.subList(0, 4), 
            new BigDecimal[]{new BigDecimal("259900000"), new BigDecimal("279900000"), 
                            new BigDecimal("299900000"), new BigDecimal("349900000")});

        // Sony A7 IV - Mirrorless
        TechSpec techSpec2 = createTechSpec("Full-frame CMOS", "Sony E", "33MP", 
            "ISO 100-51200", "BIONZ XR", "JPEG, RAW", "4K 60fps", "Sony");
        techSpecRepository.save(techSpec2);
        Product product2 = createProduct("Sony A7 IV", 
            "Máy ảnh mirrorless full-frame 33MP, quay video 4K 60fps, AF nhận diện thời gian thực.",
            new BigDecimal("44990000"), categories.get(1), brands.get(2), techSpec2);
        productRepository.save(product2);
        addProductImages(product2, Arrays.asList(
            "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800",
            "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800"
        ));
        addProductVariants(product2, colors.subList(0, 4), storages.subList(0, 3),
            new BigDecimal[]{new BigDecimal("44990000"), new BigDecimal("49990000"), new BigDecimal("54990000")});

        // Nikon Z8
        TechSpec techSpec3 = createTechSpec("Full-frame CMOS", "Nikon Z", "45.7MP", 
            "ISO 64-25600", "EXPEED 7", "JPEG, RAW", "8K 60fps, 4K 120fps", "Nikon");
        techSpecRepository.save(techSpec3);
        Product product3 = createProduct("Nikon Z8", 
            "Máy ảnh mirrorless full-frame 45.7MP, thừa hưởng công nghệ từ Z9, quay video 8K.",
            new BigDecimal("89990000"), categories.get(1), brands.get(1), techSpec3);
        productRepository.save(product3);
        addProductImages(product3, Arrays.asList(
            "https://images.unsplash.com/photo-1606986628213-9d1c1d17c12d?w=800"
        ));
        addProductVariants(product3, colors.subList(0, 2), storages.subList(1, 4),
            new BigDecimal[]{new BigDecimal("89990000"), new BigDecimal("99990000"), new BigDecimal("119900000")});

        // Canon EOS 90D - DSLR
        TechSpec techSpec4 = createTechSpec("APS-C CMOS", "Canon EF-S", "32.5MP", 
            "ISO 100-25600", "DIGIC 8", "JPEG, RAW", "4K 30fps", "Canon");
        techSpecRepository.save(techSpec4);
        Product product4 = createProduct("Canon EOS 90D", 
            "Máy ảnh DSLR APS-C 32.5MP, quay video 4K, màn hình xoay lật, AF 45 điểm.",
            new BigDecimal("28990000"), categories.get(0), brands.get(0), techSpec4);
        productRepository.save(product4);
        addProductImages(product4, Arrays.asList(
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
            "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800"
        ));
        addProductVariants(product4, colors.subList(0, 2), storages.subList(0, 2),
            new BigDecimal[]{new BigDecimal("28990000"), new BigDecimal("30990000")});

        // Sony A6400
        TechSpec techSpec5 = createTechSpec("APS-C CMOS", "Sony E", "24.2MP", 
            "ISO 100-102400", "BIONZ X", "JPEG, RAW", "4K 30fps", "Sony");
        techSpecRepository.save(techSpec5);
        Product product5 = createProduct("Sony Alpha A6400", 
            "Máy ảnh mirrorless APS-C 24.2MP, AF 0.02s, quay video 4K, màn hình selfie.",
            new BigDecimal("18990000"), categories.get(1), brands.get(2), techSpec5);
        productRepository.save(product5);
        addProductImages(product5, Arrays.asList(
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"
        ));
        addProductVariants(product5, colors.subList(0, 3), storages.subList(0, 2),
            new BigDecimal[]{new BigDecimal("18990000"), new BigDecimal("20990000")});

        // Fujifilm X-T5
        TechSpec techSpec6 = createTechSpec("APS-C X-Trans CMOS 5 HR", "Fujifilm X", "40.2MP", 
            "ISO 125-12800", "X-Processor 5", "JPEG, RAW", "6.2K 30fps", "Fujifilm");
        techSpecRepository.save(techSpec6);
        Product product6 = createProduct("Fujifilm X-T5", 
            "Máy ảnh mirrorless 40.2MP, thiết kế retro, quay video 6.2K, 7-stop IBIS.",
            new BigDecimal("56990000"), categories.get(1), brands.get(3), techSpec6);
        productRepository.save(product6);
        addProductImages(product6, Arrays.asList(
            "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=800"
        ));
        addProductVariants(product6, colors.subList(0, 3), storages.subList(1, 4),
            new BigDecimal[]{new BigDecimal("56990000"), new BigDecimal("61990000"), new BigDecimal("69990000")});

        // Canon EOS R6 Mark II
        TechSpec techSpec7 = createTechSpec("Full-frame CMOS", "Canon RF", "24.2MP", 
            "ISO 100-102400", "DIGIC X", "JPEG, RAW", "4K 60fps, 6K RAW", "Canon");
        techSpecRepository.save(techSpec7);
        Product product7 = createProduct("Canon EOS R6 Mark II", 
            "Máy ảnh mirrorless full-frame 24.2MP, AF nhận diện, chống rung 8-stop, quay 4K 60fps.",
            new BigDecimal("69990000"), categories.get(1), brands.get(0), techSpec7);
        productRepository.save(product7);
        addProductImages(product7, Arrays.asList(
            "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800"
        ));
        addProductVariants(product7, colors.subList(0, 2), storages.subList(0, 3),
            new BigDecimal[]{new BigDecimal("69990000"), new BigDecimal("75990000"), new BigDecimal("82990000")});

        // Sony A7C II
        TechSpec techSpec8 = createTechSpec("Full-frame CMOS", "Sony E", "33MP", 
            "ISO 100-51200", "BIONZ XR", "JPEG, RAW", "4K 60fps", "Sony");
        techSpecRepository.save(techSpec8);
        Product product8 = createProduct("Sony A7C II", 
            "Máy ảnh mirrorless full-frame nhỏ gọn 33MP, thiết kế compact, IBIS 7-stop.",
            new BigDecimal("52990000"), categories.get(1), brands.get(2), techSpec8);
        productRepository.save(product8);
        addProductImages(product8, Arrays.asList(
            "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800"
        ));
        addProductVariants(product8, colors.subList(0, 3), storages.subList(0, 3),
            new BigDecimal[]{new BigDecimal("52990000"), new BigDecimal("57990000"), new BigDecimal("62990000")});

        // Nikon D7500 - DSLR
        TechSpec techSpec9 = createTechSpec("APS-C CMOS", "Nikon F", "20.9MP", 
            "ISO 100-51200", "EXPEED 5", "JPEG, RAW", "4K 30fps", "Nikon");
        techSpecRepository.save(techSpec9);
        Product product9 = createProduct("Nikon D7500", 
            "Máy ảnh DSLR APS-C 20.9MP, quay video 4K, màn hình cảm ứng, chống thời tiết.",
            new BigDecimal("24990000"), categories.get(0), brands.get(1), techSpec9);
        productRepository.save(product9);
        addProductImages(product9, Arrays.asList(
            "https://images.unsplash.com/photo-1606986628213-9d1c1d17c12d?w=800"
        ));
        addProductVariants(product9, colors.subList(0, 2), storages.subList(0, 2),
            new BigDecimal[]{new BigDecimal("24990000"), new BigDecimal("26990000")});

        // Canon PowerShot G7 X Mark III
        TechSpec techSpec10 = createTechSpec("1-inch CMOS", "Fixed", "20.1MP", 
            "ISO 125-12800", "DIGIC 8", "JPEG, RAW", "4K 30fps", "Canon");
        techSpecRepository.save(techSpec10);
        Product product10 = createProduct("Canon PowerShot G7 X Mark III", 
            "Máy ảnh compact 20.1MP, nhỏ gọn, quay video 4K, màn hình selfie, live streaming.",
            new BigDecimal("15990000"), categories.get(2), brands.get(0), techSpec10);
        productRepository.save(product10);
        addProductImages(product10, Arrays.asList(
            "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800"
        ));
        addProductVariants(product10, colors.subList(0, 2), storages.subList(0, 1),
            new BigDecimal[]{new BigDecimal("15990000")});

        // Sony ZV-1 II
        TechSpec techSpec11 = createTechSpec("1-inch CMOS", "Fixed", "20.1MP", 
            "ISO 125-12800", "BIONZ X", "JPEG, RAW", "4K 30fps", "Sony");
        techSpecRepository.save(techSpec11);
        Product product11 = createProduct("Sony ZV-1 II", 
            "Máy ảnh vlog 20.1MP, micro direction, màn hình selfie, làm đẹp da.",
            new BigDecimal("14990000"), categories.get(2), brands.get(2), techSpec11);
        productRepository.save(product11);
        addProductImages(product11, Arrays.asList(
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"
        ));
        addProductVariants(product11, colors.subList(0, 2), storages.subList(0, 1),
            new BigDecimal[]{new BigDecimal("14990000")});

        // Panasonic Lumix GH6
        TechSpec techSpec12 = createTechSpec("Micro Four Thirds", "Micro Four Thirds", "25.2MP", 
            "ISO 100-25600", "Venus Engine", "JPEG, RAW", "5.7K 60fps", "Panasonic");
        techSpecRepository.save(techSpec12);
        Product product12 = createProduct("Panasonic Lumix GH6", 
            "Máy ảnh mirrorless MFT 25.2MP, quay video 5.7K, chống rung 7.5-stop, V-Log.",
            new BigDecimal("42990000"), categories.get(1), brands.get(4), techSpec12);
        productRepository.save(product12);
        addProductImages(product12, Arrays.asList(
            "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=800"
        ));
        addProductVariants(product12, colors.subList(0, 2), storages.subList(1, 3),
            new BigDecimal[]{new BigDecimal("42990000"), new BigDecimal("45990000")});

        System.out.println(">>> Đã tạo 12 sản phẩm với các biến thể");
    }

    private TechSpec createTechSpec(String sensorType, String lensMount, String resolution,
                                     String iso, String processor, String imageFormat, 
                                     String videoFormat, String brand) {
        TechSpec techSpec = new TechSpec();
        techSpec.setSensorType(sensorType);
        techSpec.setLensMount(lensMount);
        techSpec.setResolution(resolution);
        techSpec.setIso(iso);
        techSpec.setProcessor(processor);
        techSpec.setImageFormat(imageFormat);
        techSpec.setVideoFormat(videoFormat);
        techSpec.setStatus(EntityStatus.ACTIVE);
        return techSpec;
    }

    private Product createProduct(String name, String description, BigDecimal price,
                                   ProductCategory category, Brand brand, TechSpec techSpec) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setProductCategory(category);
        product.setBrand(brand);
        product.setTechSpec(techSpec);
        product.setStatus(EntityStatus.ACTIVE);
        return product;
    }

    private void addProductImages(Product product, List<String> urls) {
        List<ProductImage> images = new ArrayList<>();
        int order = 1;
        for (String url : urls) {
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setUrl(url);
            image.setDisplayOrder(order++);
            image.setStatus(EntityStatus.ACTIVE);
            images.add(image);
        }
        productImageRepository.saveAll(images);
    }

    private void addProductVariants(Product product, List<Color> colors, 
                                     List<StorageCapacity> storages, BigDecimal[] prices) {
        int priceIndex = 0;
        for (Color color : colors) {
            for (StorageCapacity storage : storages) {
                if (priceIndex >= prices.length) break;
                ProductDetail variant = new ProductDetail();
                variant.setProduct(product);
                variant.setColor(color);
                variant.setStorageCapacity(storage);
                variant.setSalePrice(prices[priceIndex++]);
                variant.setQuantity((int) (Math.random() * 50) + 10);
                variant.setStatus(EntityStatus.ACTIVE);
                variant.setVersion(color.getName() + " / " + storage.getName());
                productDetailRepository.save(variant);
            }
        }
    }

    private void seedBanners() {
        System.out.println(">>> Đang tạo banners...");
        
        try {
            List<Banner> banners = Arrays.asList(
                createBanner(
                    "Khám Phá Thế Giới Máy Ảnh",
                    "Mirrorless Cao Cấp",
                    "Trải nghiệm công nghệ tiên tiến nhất với dòng máy ảnh mirrorless full-frame",
                    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80",
                    BannerPosition.HOME_HERO,
                    1,
                    "Xem ngay",
                    "/client/catalog?idProductCategory="
                ),
                createBanner(
                    "Sony Alpha Series",
                    "Giảm Giá Đặc Biệt",
                    "Máy ảnh Sony Alpha với công nghệ AF tiên tiến",
                    "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=1920&q=80",
                    BannerPosition.HOME_HERO,
                    2,
                    "Mua ngay",
                    "/client/catalog?idBrand="
                ),
                createBanner(
                    "Canon EOS R",
                    "Hệ Sinh Thái RF",
                    "Khám phá hệ thống ống kính RF mount đột phá",
                    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1920&q=80",
                    BannerPosition.HOME_HERO,
                    3,
                    "Tìm hiểu thêm",
                    "/client/catalog?idBrand="
                ),
                createBanner(
                    "Nikon Z Mount",
                    "Chất Lượng Nhật Bản",
                    "Độ bền và chất lượng hình ảnh vượt trội",
                    "https://images.unsplash.com/photo-1606986628213-9d1c1d17c12d?w=1920&q=80",
                    BannerPosition.HOME_MIDDLE,
                    1,
                    "Xem chi tiết",
                    "/client/catalog?idBrand="
                ),
                createBanner(
                    "Fujifilm X-T5",
                    "Retro Đẳng Cấp",
                    "Thiết kế cổ điển, công nghệ hiện đại",
                    "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=1920&q=80",
                    BannerPosition.HOME_MIDDLE,
                    2,
                    "Khám phá",
                    "/client/catalog?idBrand="
                )
            );
            
            bannerRepository.saveAll(banners);
            System.out.println(">>> Đã tạo " + banners.size() + " banners");
            
        } catch (Exception e) {
            System.err.println(">>> Lỗi seed banners: " + e.getMessage());
        }
    }

    private Banner createBanner(String title, String subtitle, String description, String imageUrl,
                                BannerPosition position, int priority, String buttonText, String linkUrl) {
        Banner banner = new Banner();
        banner.setTitle(title);
        banner.setSubtitle(subtitle);
        banner.setDescription(description);
        banner.setImageUrl(imageUrl);
        banner.setPosition(position);
        banner.setPriority(priority);
        banner.setButtonText(buttonText);
        banner.setLinkUrl(linkUrl);
        banner.setType(BannerType.HERO);
        banner.setStatus(EntityStatus.ACTIVE);
        banner.setStartAt(LocalDateTime.now());
        banner.setEndAt(LocalDateTime.now().plusMonths(12));
        return banner;
    }

    // ============ NEW SEEDING METHODS ============

    private void seedShippingMethods() {
        List<ShippingMethods> methods = Arrays.asList(
            createShippingMethod("Giao hàng nhanh", "Giao hàng trong 2-4 giờ"),
            createShippingMethod("Giao hàng tiêu standard", "Giao hàng trong 1-2 ngày"),
            createShippingMethod("Giao hàng tiết kiệm", "Giao hàng trong 3-5 ngày"),
            createShippingMethod("Nhận tại cửa hàng", "Khách hàng đến lấy tại cửa hàng")
        );
        shippingMethodRepository.saveAll(methods);
        System.out.println(">>> Đã tạo " + methods.size() + " phương thức vận chuyển");
    }

    private ShippingMethods createShippingMethod(String name, String description) {
        ShippingMethods method = new ShippingMethods();
        method.setName(name);
        method.setDescription(description);
        method.setStatus(EntityStatus.ACTIVE);
        return method;
    }

    private void seedTechSpecLookups() {
        // Sensor Types
        List<SensorType> sensorTypes = Arrays.asList(
            createTechSpecLookup("Full-frame CMOS", sensorTypeRepository),
            createTechSpecLookup("APS-C CMOS", sensorTypeRepository),
            createTechSpecLookup("Micro Four Thirds", sensorTypeRepository),
            createTechSpecLookup("1-inch CMOS", sensorTypeRepository),
            createTechSpecLookup("Medium Format", sensorTypeRepository)
        );
        System.out.println(">>> Đã tạo " + sensorTypes.size() + " loại cảm biến");

        // Resolutions
        List<Resolution> resolutions = Arrays.asList(
            createTechSpecLookup("20.1MP", resolutionRepository),
            createTechSpecLookup("24.2MP", resolutionRepository),
            createTechSpecLookup("30.3MP", resolutionRepository),
            createTechSpecLookup("33MP", resolutionRepository),
            createTechSpecLookup("40.2MP", resolutionRepository),
            createTechSpecLookup("45MP", resolutionRepository),
            createTechSpecLookup("45.7MP", resolutionRepository),
            createTechSpecLookup("50MP", resolutionRepository)
        );
        System.out.println(">>> Đã tạo " + resolutions.size() + " độ phân giải");

        // Processors
        List<Processor> processors = Arrays.asList(
            createTechSpecLookup("DIGIC 8", processorRepository),
            createTechSpecLookup("DIGIC X", processorRepository),
            createTechSpecLookup("BIONZ X", processorRepository),
            createTechSpecLookup("BIONZ XR", processorRepository),
            createTechSpecLookup("EXPEED 5", processorRepository),
            createTechSpecLookup("EXPEED 7", processorRepository),
            createTechSpecLookup("X-Processor 4", processorRepository),
            createTechSpecLookup("X-Processor 5", processorRepository),
            createTechSpecLookup("Venus Engine", processorRepository)
        );
        System.out.println(">>> Đã tạo " + processors.size() + " bộ xử lý");

        // Lens Mounts
        List<LensMount> lensMounts = Arrays.asList(
            createTechSpecLookup("Canon EF", lensMountRepository),
            createTechSpecLookup("Canon EF-S", lensMountRepository),
            createTechSpecLookup("Canon RF", lensMountRepository),
            createTechSpecLookup("Nikon F", lensMountRepository),
            createTechSpecLookup("Nikon Z", lensMountRepository),
            createTechSpecLookup("Sony E", lensMountRepository),
            createTechSpecLookup("Fujifilm X", lensMountRepository),
            createTechSpecLookup("Micro Four Thirds", lensMountRepository),
            createTechSpecLookup("Leica M", lensMountRepository)
        );
        System.out.println(">>> Đã tạo " + lensMounts.size() + " mount ống kính");

        // Image Formats
        List<ImageFormat> imageFormats = Arrays.asList(
            createTechSpecLookup("JPEG", imageFormatRepository),
            createTechSpecLookup("RAW", imageFormatRepository),
            createTechSpecLookup("JPEG+RAW", imageFormatRepository),
            createTechSpecLookup("HEIF", imageFormatRepository),
            createTechSpecLookup("TIFF", imageFormatRepository)
        );
        System.out.println(">>> Đã tạo " + imageFormats.size() + " định dạng ảnh");

        // Video Formats
        List<VideoFormat> videoFormats = Arrays.asList(
            createTechSpecLookup("4K 30fps", videoFormatRepository),
            createTechSpecLookup("4K 60fps", videoFormatRepository),
            createTechSpecLookup("4K 120fps", videoFormatRepository),
            createTechSpecLookup("5.7K 60fps", videoFormatRepository),
            createTechSpecLookup("8K 30fps", videoFormatRepository),
            createTechSpecLookup("8K 60fps", videoFormatRepository),
            createTechSpecLookup("6.2K 30fps", videoFormatRepository)
        );
        System.out.println(">>> Đã tạo " + videoFormats.size() + " định dạng video");
    }

    private <T> T createTechSpecLookup(String name, JpaRepository<T, String> repository) {
        try {
            T entity = null;
            if (repository instanceof SensorTypeRepository) {
                SensorType st = new SensorType();
                st.setName(name);
                st.setStatus(EntityStatus.ACTIVE);
                entity = (T) st;
            } else if (repository instanceof ResolutionRepository) {
                Resolution r = new Resolution();
                r.setName(name);
                r.setStatus(EntityStatus.ACTIVE);
                entity = (T) r;
            } else if (repository instanceof ProcessorRepository) {
                Processor p = new Processor();
                p.setName(name);
                p.setStatus(EntityStatus.ACTIVE);
                entity = (T) p;
            } else if (repository instanceof LensMountRepository) {
                LensMount lm = new LensMount();
                lm.setName(name);
                lm.setStatus(EntityStatus.ACTIVE);
                entity = (T) lm;
            } else if (repository instanceof ImageFormatRepository) {
                ImageFormat img = new ImageFormat();
                img.setName(name);
                img.setStatus(EntityStatus.ACTIVE);
                entity = (T) img;
            } else if (repository instanceof VideoFormatRepository) {
                VideoFormat vf = new VideoFormat();
                vf.setName(name);
                vf.setStatus(EntityStatus.ACTIVE);
                entity = (T) vf;
            }
            if (entity != null) {
                return repository.save(entity);
            }
        } catch (Exception e) {
            // Entity might already exist
        }
        return null;
    }

    private void seedShiftTemplates() {
        List<ShiftTemplate> templates = Arrays.asList(
            createShiftTemplate("Ca sáng", LocalTime.of(6, 0), LocalTime.of(14, 0)),
            createShiftTemplate("Ca chiều", LocalTime.of(14, 0), LocalTime.of(22, 0)),
            createShiftTemplate("Ca đêm", LocalTime.of(22, 0), LocalTime.of(6, 0)),
            createShiftTemplate("Ca ngày", LocalTime.of(8, 0), LocalTime.of(17, 0)),
            createShiftTemplate("Ca hành chính", LocalTime.of(8, 30), LocalTime.of(17, 30))
        );
        shiftTemplateRepository.saveAll(templates);
        System.out.println(">>> Đã tạo " + templates.size() + " ca làm việc");
    }

    private ShiftTemplate createShiftTemplate(String name, LocalTime startTime, LocalTime endTime) {
        ShiftTemplate template = new ShiftTemplate();
        template.setName(name);
        template.setStartTime(startTime);
        template.setEndTime(endTime);
        template.setStatus(EntityStatus.ACTIVE);
        return template;
    }

    private List<Customer> seedCustomers() {
        List<Customer> customers = new ArrayList<>();
        Random random = new Random();

        String[] firstNames = {"Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô"};
        String[] middleNames = {"Văn", "Thị", "Hữu", "Minh", "Thanh", "Quang", "Hồng", "Anh", "Ngọc", "Phương"};
        String[] lastNames = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "K"};

        List<Account> accounts = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            Account account = new Account();
            account.setUsername("khachhang" + i);
            account.setPassword(passwordEncoder.encode("123456"));
            account.setEmail("khachhang" + i + "@gmail.com");
            account.setFullName(firstNames[random.nextInt(firstNames.length)] + " " +
                               middleNames[random.nextInt(middleNames.length)] + " " +
                               lastNames[random.nextInt(lastNames.length)]);
            account.setRole(RoleConstant.CUSTOMER);
            accounts.add(accountRepository.save(account));
        }

        String[][] addresses = {
            {"Hà Nội", "Quận Cầu Giấy", "Phường Dịch Vọng", "101"},
            {"Hà Nội", "Quận Thanh Xuân", "Phường Nhân Chính", "202"},
            {"Hồ Chí Minh", "Quận 1", "Phường Bến Nghé", "303"},
            {"Hồ Chí Minh", "Quận 3", "Phường Võ Thị Sáu", "404"},
            {"Đà Nẵng", "Quận Hải Châu", "Phường Hòa Cường Bắc", "505"},
            {"Hải Phòng", "Quận Ngô Quyền", "Phường Lạch Tray", "606"},
            {"Cần Thơ", "Quận Ninh Kiều", "Phường Tân An", "707"},
            {"Bình Dương", "Thành phố Thủ Dầu Một", "Phường Phú Cường", "808"},
            {"Khánh Hòa", "Thành phố Nha Trang", "Phường Vĩnh Hải", "909"},
            {"Lâm Đồng", "Thành phố Đà Lạt", "Phường 2", "1010"}
        };

        for (int i = 0; i < 10; i++) {
            Customer customer = new Customer();
            customer.setName(accounts.get(i).getFullName());
            customer.setEmail(accounts.get(i).getEmail());
            customer.setPhoneNumber("09" + String.format("%08d", random.nextInt(100000000)));
            customer.setGender(random.nextBoolean());
            customer.setDateOfBirth(System.currentTimeMillis() - (long)(random.nextInt(30) + 18) * 365 * 24 * 60 * 60 * 1000L);
            customer.setAccount(accounts.get(i));
            customer.setStatus(EntityStatus.ACTIVE);
            customers.add(customerRepository.save(customer));

            // Create address for customer
            Address address = new Address();
            address.setName("Nhà riêng");
            address.setPhoneNumber(customer.getPhoneNumber());
            address.setProvinceCity(addresses[i][0]);
            address.setWardCommune(addresses[i][2]);
            address.setAddressDetail("Số " + addresses[i][3] + ", Đường " + (char)('A' + i) + ", " + addresses[i][1]);
            address.setProvinceCode(100 + i);
            address.setWardCode(1000 + i);
            address.setIsDefault(true);
            address.setCustomer(customer);
            address.setStatus(EntityStatus.ACTIVE);
            addressRepository.save(address);
        }

        System.out.println(">>> Đã tạo " + customers.size() + " khách hàng và địa chỉ");
        return customers;
    }

    private void seedVouchers(List<Customer> customers) {
        List<Voucher> vouchers = new ArrayList<>();
        long now = System.currentTimeMillis();
        long oneDay = 24 * 60 * 60 * 1000L;

        // Create vouchers
        vouchers.add(createVoucher("WELCOME10", "Chào mừng khách hàng mới", "PERCENT", "%",
            new BigDecimal("10"), new BigDecimal("100000"), now, now + 30 * oneDay, 100, 1));
        vouchers.add(createVoucher("SUMMER20", "Mùa hè giảm giá", "PERCENT", "%",
            new BigDecimal("20"), new BigDecimal("500000"), now, now + 15 * oneDay, 50, 1));
        vouchers.add(createVoucher("VND200K", "Giảm 200.000đ", "FIXED", "VND",
            new BigDecimal("200000"), new BigDecimal("2000000"), now, now + 20 * oneDay, 30, 1));
        vouchers.add(createVoucher("VIP50", "VIP giảm 50%", "PERCENT", "%",
            new BigDecimal("50"), new BigDecimal("1000000"), now, now + 10 * oneDay, 10, 1));
        vouchers.add(createVoucher("NEWYEAR", "Năm mới giảm giá", "PERCENT", "%",
            new BigDecimal("15"), new BigDecimal("300000"), now, now + 45 * oneDay, 200, 1));

        vouchers = voucherRepository.saveAll(vouchers);
        System.out.println(">>> Đã tạo " + vouchers.size() + " voucher");

        // Create voucher details for customers
        for (int i = 0; i < customers.size(); i++) {
            Customer customer = customers.get(i);
            // Each customer gets 2-4 vouchers
            int voucherCount = 2 + new Random().nextInt(3);
            for (int j = 0; j < voucherCount; j++) {
                VoucherDetail vd = new VoucherDetail();
                vd.setId(java.util.UUID.randomUUID().toString());
                vd.setVoucher(vouchers.get((i + j) % vouchers.size()));
                vd.setCustomer(customer);
                vd.setUsageStatus(0); // Chưa sử dụng
                vd.setCreated_date(now);
                vd.setIsNotified(0);
                voucherDetailRepository.save(vd);
            }
        }
        System.out.println(">>> Đã tạo voucher details cho khách hàng");
    }

    private Voucher createVoucher(String code, String name, String type, String unit,
        BigDecimal discountValue, BigDecimal conditions, long startDate, long endDate,
        int quantity, int status) {
        Voucher voucher = new Voucher();
        voucher.setId(java.util.UUID.randomUUID().toString());
        voucher.setCode(code);
        voucher.setName(name);
        voucher.setVoucherType(type);
        voucher.setDiscountUnit(unit);
        voucher.setDiscountValue(discountValue);
        voucher.setMaxDiscountAmount(discountValue.multiply(new BigDecimal("2")));
        voucher.setConditions(conditions);
        voucher.setStartDate(startDate);
        voucher.setEndDate(endDate);
        voucher.setQuantity(quantity);
        voucher.setCreatedDate(System.currentTimeMillis());
        voucher.setStatus(status);
        return voucher;
    }

    private void seedDiscounts() {
        List<Discount> discounts = new ArrayList<>();
        long now = System.currentTimeMillis();
        long oneDay = 24 * 60 * 60 * 1000L;

        // Get some product details for discounts
        List<ProductDetail> productDetails = productDetailRepository.findAll();
        if (productDetails.isEmpty()) {
            System.out.println(">>> Không có sản phẩm để tạo discount");
            return;
        }

        discounts.add(createDiscount("FLASH10", "Flash Sale 10%", new BigDecimal("10"),
            now, now + 3 * oneDay, 50));
        discounts.add(createDiscount("WEEKEND15", "Cuối tuần giảm 15%", new BigDecimal("15"),
            now, now + 5 * oneDay, 100));
        discounts.add(createDiscount("CLEARANCE", "Xả kho giảm 25%", new BigDecimal("25"),
            now, now + 7 * oneDay, 30));

        discounts = discountRepository.saveAll(discounts);
        System.out.println(">>> Đã tạo " + discounts.size() + " discount");

        // Create discount details for products
        int discountIndex = 0;
        for (int i = 0; i < Math.min(20, productDetails.size()); i++) {
            ProductDetail pd = productDetails.get(i);
            Discount discount = discounts.get(discountIndex % discounts.size());

            DiscountDetail dd = new DiscountDetail();
            dd.setId(java.util.UUID.randomUUID().toString());
            dd.setCode("DIS" + (1000 + i));
            dd.setStatus(1);
            dd.setPriceBefore(pd.getSalePrice());
            dd.setPriceAfter(pd.getSalePrice().multiply(new BigDecimal("0.85")));

            dd.setProductDetail(pd);
            dd.setDiscount(discount);
            discountDetailRepository.save(dd);

            // Update product detail price
            pd.setSalePrice(dd.getPriceAfter());
            productDetailRepository.save(pd);

            discountIndex++;
        }
        System.out.println(">>> Đã tạo discount details cho sản phẩm");
    }

    private Discount createDiscount(String code, String name, BigDecimal percent,
        long startDate, long endDate, int quantity) {
        Discount discount = new Discount();
        discount.setId(java.util.UUID.randomUUID().toString());
        discount.setCode(code);
        discount.setName(name);
        discount.setDiscountPercent(percent);
        discount.setStartDate(startDate);
        discount.setEndDate(endDate);
        discount.setQuantity(quantity);
        discount.setStatus(1);
        discount.setCreatedAt(now);
        return discount;
    }

//    private void seedCarts(List<Customer> customers) {
//        if (customers.isEmpty()) return;
//
//        List<ProductDetail> productDetails = productDetailRepository.findAll();
//        if (productDetails.isEmpty()) return;
//
//        Random random = new Random();
//
//        for (Customer customer : customers) {
//            // Create cart for customer
//            Cart cart = new Cart();
//            cart.setCustomer(customer);
//            cart = cartRepository.save(cart);
//
//            // Add 1-3 products to cart
//            int productCount = 1 + random.nextInt(3);
//            for (int i = 0; i < productCount; i++) {
//                ProductDetail pd = productDetails.get(random.nextInt(productDetails.size()));
//
//                CartDetail cd = new CartDetail();
//                cd.setId(java.util.UUID.randomUUID().toString());
//                cd.setCart(cart);
//                cd.setProductDetail(pd);
//                cartDetailRepository.save(cd);
//            }
//        }
//        System.out.println(">>> Đã tạo giỏ hàng cho " + customers.size() + " khách hàng");
//    }

    private void seedOrders(List<Customer> customers) {
        if (customers.isEmpty()) return;

        List<ProductDetail> productDetails = productDetailRepository.findAll();
        List<ShippingMethods> shippingMethods = shippingMethodRepository.findAll();
        List<Voucher> vouchers = voucherRepository.findAll();
        if (productDetails.isEmpty() || shippingMethods.isEmpty()) return;

        Random random = new Random();
        long now = System.currentTimeMillis();
        long oneDay = 24 * 60 * 60 * 1000L;

        // Create 15 orders
        for (int i = 0; i < 15; i++) {
            Customer customer = customers.get(random.nextInt(customers.size()));

            Order order = new Order();
            order.setId(java.util.UUID.randomUUID().toString());
            order.setOrderType(TypeInvoice.ONLINE);
            order.setShippingFee(new BigDecimal("30000"));
            order.setRecipientName(customer.getName());
            order.setRecipientPhone(customer.getPhoneNumber());
            order.setRecipientAddress("Số " + (100 + i) + " Đường ABC, Quận 1, TP.HCM");
            order.setPaymentMethod(random.nextBoolean() ? "Tiền mặt" : "Chuyển khoản");
            order.setOrderStatus(OrderStatus.COMPLETED);
            order.setCustomer(customer);
            order.setShippingMethod(shippingMethods.get(random.nextInt(shippingMethods.size())));

            // Random voucher
            if (random.nextBoolean() && !vouchers.isEmpty()) {
                Voucher voucher = vouchers.get(random.nextInt(vouchers.size()));
                order.setVoucher(voucher);
            }

            // Create 1-3 order details
            BigDecimal totalAmount = BigDecimal.ZERO;
            List<OrderDetail> orderDetails = new ArrayList<>();
            long orderCreatedDate = now - (long)random.nextInt(30) * oneDay;

            // Save Order first before creating order details
            BigDecimal shippingFee = order.getShippingFee();
            BigDecimal discount = order.getVoucher() != null ?
                BigDecimal.ZERO : BigDecimal.ZERO;

            // Calculate total and set preliminary values
            order.setTotalAmount(BigDecimal.ZERO);
            order.setTotalAfterDiscount(BigDecimal.ZERO);

            // Set created date using reflection
            try {
                java.lang.reflect.Field createdDateField = Order.class.getSuperclass().getDeclaredField("createdDate");
                createdDateField.setAccessible(true);
                createdDateField.set(order, orderCreatedDate);
            } catch (Exception e) {
                // Ignore if field not accessible
            }

            // Save Order first to get ID
            order = orderRepository.save(order);

            int itemCount = 1 + random.nextInt(3);
            for (int j = 0; j < itemCount; j++) {
                ProductDetail pd = productDetails.get(random.nextInt(productDetails.size()));
                int quantity = 1 + random.nextInt(2);
                BigDecimal unitPrice = pd.getSalePrice();
                BigDecimal discountAmount = BigDecimal.ZERO;
                BigDecimal totalPrice = unitPrice.multiply(new BigDecimal(quantity)).subtract(discountAmount);

                OrderDetail od = new OrderDetail();
                od.setId(java.util.UUID.randomUUID().toString());
                od.setQuantity(quantity);
                od.setUnitPrice(unitPrice);
                od.setDiscountAmount(discountAmount);
                od.setTotalPrice(totalPrice);
                od.setOrder(order);
                od.setProductDetail(pd);
                orderDetails.add(od);

                totalAmount = totalAmount.add(totalPrice);
            }

            // Save order details after order is saved
            orderDetailRepository.saveAll(orderDetails);

            // Update order with final values
            discount = order.getVoucher() != null ?
                totalAmount.multiply(order.getVoucher().getDiscountValue()).divide(new BigDecimal("100")) :
                BigDecimal.ZERO;
            order.setTotalAmount(totalAmount);
            order.setTotalAfterDiscount(totalAmount.add(shippingFee).subtract(discount));

            orderRepository.save(order);
        }
        System.out.println(">>> Đã tạo 15 đơn hàng");
    }

    private void seedSerials() {
        List<ProductDetail> productDetails = productDetailRepository.findAll();
        if (productDetails.isEmpty()) return;

        Random random = new Random();
        int serialCount = 0;

        for (ProductDetail pd : productDetails) {
            // Generate 5-10 serial numbers per product detail
            int serialsToGenerate = 5 + random.nextInt(6);
            for (int i = 0; i < serialsToGenerate; i++) {
                Serial serial = new Serial();
                serial.setId(java.util.UUID.randomUUID().toString());
                serial.setSerialNumber("SN" + pd.getId().substring(0, 8) + String.format("%04d", i + 1));
                serial.setSerialStatus(SerialStatus.AVAILABLE);
                serial.setProductDetail(pd);
                serialRepository.save(serial);
                serialCount++;
            }
        }
        System.out.println(">>> Đã tạo " + serialCount + " serial numbers");
    }

    private void seedWarranties() {
        // Temporarily skip warranty seeding to avoid entity relationship issues
        System.out.println(">>> Đã tạo bảo hành và lịch sử bảo hành (tạm bỏ qua)");
    }

    private void seedWorkSchedules() {
        List<Employee> employees = employeeRepo.findAll();
        List<ShiftTemplate> shiftTemplates = shiftTemplateRepository.findAll();
        if (employees.isEmpty() || shiftTemplates.isEmpty()) return;

        LocalDate today = LocalDate.now();

        // Create work schedules for next 7 days
        for (int day = -3; day <= 3; day++) {
            LocalDate workDate = today.plusDays(day);

            for (Employee employee : employees) {
                if (new Random().nextBoolean()) { // 50% chance to work each day
                    WorkSchedule ws = new WorkSchedule();
                    ws.setId(java.util.UUID.randomUUID().toString());
                    ws.setEmployee(employee);
                    ws.setShiftTemplate(shiftTemplates.get(new Random().nextInt(shiftTemplates.size())));
                    ws.setWorkDate(workDate);
                    ws.setShiftStatus(ShiftStatus.COMPLETED);
                    workScheduleRepository.save(ws);
                }
            }
        }
        System.out.println(">>> Đã tạo lịch làm việc");
    }

    private void seedChatSessions() {
        List<Customer> customers = customerRepository.findAll();
        if (customers.isEmpty()) return;

        Random random = new Random();

        String[] greetings = {
            "Xin chào, tôi cần tư vấn về máy ảnh",
            "Cho tôi hỏi về sản phẩm Sony A7 IV",
            "Máy ảnh nào tốt cho người mới bắt đầu?",
            "Tôi muốn mua máy ảnh dưới 30 triệu",
            "Cảm ơn đã tư vấn"
        };

        String[] aiResponses = {
            "Xin chào! Rất vui được hỗ trợ bạn. Bạn đang quan tâm đến dòng máy ảnh nào?",
            "Sony A7 IV là máy ảnh mirrorless full-frame rất được ưa chuộng với cảm biến 33MP...",
            "Với người mới bắt đầu, tôi recommend Sony A6400 hoặc Canon EOS R50...",
            "Dưới 30 triệu, bạn có thể tham khảo Sony A6400, Canon EOS R50 hoặc Fujifilm X-T30 II...",
            "Cảm ơn bạn đã tin tưởng! Chúc bạn một ngày tốt lành!"
        };

        for (int i = 0; i < Math.min(5, customers.size()); i++) {
            Customer customer = customers.get(i);

            // Create chat session
            ChatSession session = new ChatSession();
            session.setSessionId(java.util.UUID.randomUUID().toString());
            session.setCustomerName(customer.getName());
            session.setAiActive(true);
            session.setLastMessage(greetings[i % greetings.length]);
            chatSessionRepository.save(session);

            // Create messages
            ChatMessage msg1 = ChatMessage.builder()
                .id(java.util.UUID.randomUUID().toString())
                .session(session)
                .content(greetings[i % greetings.length])
                .sender("CUSTOMER")
                .build();
            chatMessageRepository.save(msg1);

            ChatMessage msg2 = ChatMessage.builder()
                .id(java.util.UUID.randomUUID().toString())
                .session(session)
                .content(aiResponses[i % aiResponses.length])
                .sender("AI")
                .build();
            chatMessageRepository.save(msg2);
        }
        System.out.println(">>> Đã tạo chat sessions");
    }
}
