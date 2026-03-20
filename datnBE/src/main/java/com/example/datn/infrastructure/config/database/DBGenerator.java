package com.example.datn.infrastructure.config.database;

import com.example.datn.core.admin.employee.repository.ADEmployeeRepository;
import com.example.datn.entity.*;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.BannerType;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.OrderStatus;
import com.example.datn.infrastructure.constant.ProductVersion;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.example.datn.infrastructure.constant.SerialStatus;
import com.example.datn.infrastructure.constant.HandoverStatus;
import com.example.datn.infrastructure.constant.ShiftStatus;
import com.example.datn.infrastructure.constant.TypeInvoice;
import com.example.datn.repository.*;
import com.example.datn.entity.TechSpecGroup;
import com.example.datn.entity.TechSpecDefinition;
import com.example.datn.entity.TechSpecDefinitionItem;
import com.example.datn.entity.TechSpecValue;
import com.example.datn.infrastructure.constant.EntityStatus;
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
import java.util.Map;
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

    // TechSpec Group & Definition repositories (new system)
    private final TechSpecGroupRepository techSpecGroupRepository;
    private final TechSpecDefinitionRepository techSpecDefinitionRepository;
    private final TechSpecDefinitionItemRepository itemRepository;
    private final TechSpecValueRepository techSpecValueRepository;

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

            // 9. Xóa product variants, images, products (xóa tech_spec_value TRƯỚC vì nó FK đến product)
            techSpecValueRepository.deleteAll();
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

            // 9. Seed TechSpec Groups & Definitions (new group system)
            seedTechSpecGroups();

            // 9b. Seed TechSpec Values cho từng sản phẩm
            seedProductTechSpecs();

            // 10. Seed Shift Templates
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

        // Lấy thương hiệu Canon (phần tử đầu tiên trong danh sách brands)
        Brand canon = brands.get(0);

        // 1. Canon EOS R5 - Mirrorless Full-frame cao cấp
        TechSpec techSpec1 = createTechSpec("Full-frame CMOS", "Canon RF", "45MP",
                "ISO 100-51200", "DIGIC X", "JPEG, RAW", "8K RAW, 4K 120fps", "Canon");
        techSpecRepository.save(techSpec1);
        Product product1 = createProduct("Canon EOS R5",
                "Máy ảnh mirrorless full-frame 45MP với khả năng quay video 8K, chống rung 8-stop IBIS, hệ thống AF 594 điểm.",
                new BigDecimal("259900000"), categories.get(1), canon, techSpec1);
        productRepository.save(product1);
        addProductImages(product1, Arrays.asList(
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
                "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800"
        ));
        addProductVariants(product1, colors.subList(0, 3), storages.subList(0, 4),
                new BigDecimal[]{new BigDecimal("259900000"), new BigDecimal("279900000"),
                        new BigDecimal("299900000"), new BigDecimal("349900000")});

        // 2. Canon EOS R6 Mark II
        TechSpec techSpec2 = createTechSpec("Full-frame CMOS", "Canon RF", "24.2MP",
                "ISO 100-102400", "DIGIC X", "JPEG, RAW", "4K 60fps, 6K RAW", "Canon");
        techSpecRepository.save(techSpec2);
        Product product2 = createProduct("Canon EOS R6 Mark II",
                "Máy ảnh mirrorless full-frame 24.2MP, AF nhận diện, chống rung 8-stop, quay 4K 60fps.",
                new BigDecimal("69990000"), categories.get(1), canon, techSpec2);
        productRepository.save(product2);
        addProductImages(product2, Arrays.asList(
                "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800"
        ));
        addProductVariants(product2, colors.subList(0, 2), storages.subList(0, 3),
                new BigDecimal[]{new BigDecimal("69990000"), new BigDecimal("75990000"), new BigDecimal("82990000")});

        // 3. Canon EOS R8 (Full-frame nhẹ)
        TechSpec techSpec3 = createTechSpec("Full-frame CMOS", "Canon RF", "24.2MP",
                "ISO 100-102400", "DIGIC X", "JPEG, RAW", "4K 60fps", "Canon");
        techSpecRepository.save(techSpec3);
        Product product3 = createProduct("Canon EOS R8",
                "Máy ảnh mirrorless full-frame nhẹ nhất, nhỏ gọn, lấy nét nhanh, quay video 4K.",
                new BigDecimal("35990000"), categories.get(1), canon, techSpec3);
        productRepository.save(product3);
        addProductImages(product3, Arrays.asList(
                "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800"
        ));
        addProductVariants(product3, colors.subList(0, 2), storages.subList(0, 2),
                new BigDecimal[]{new BigDecimal("35990000"), new BigDecimal("38990000")});

        // 4. Canon EOS R10 (APS-C Mirrorless)
        TechSpec techSpec4 = createTechSpec("APS-C CMOS", "Canon RF-S", "24.2MP",
                "ISO 100-32000", "DIGIC X", "JPEG, RAW", "4K 60fps", "Canon");
        techSpecRepository.save(techSpec4);
        Product product4 = createProduct("Canon EOS R10",
                "Máy ảnh mirrorless APS-C, lấy nét nhanh, 15fps, quay 4K, thích hợp cho người mới.",
                new BigDecimal("18990000"), categories.get(1), canon, techSpec4);
        productRepository.save(product4);
        addProductImages(product4, Arrays.asList(
                "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800"
        ));
        addProductVariants(product4, colors.subList(0, 2), storages.subList(0, 2),
                new BigDecimal[]{new BigDecimal("18990000"), new BigDecimal("20990000")});

        // 5. Canon EOS 90D (DSLR)
        TechSpec techSpec5 = createTechSpec("APS-C CMOS", "Canon EF-S", "32.5MP",
                "ISO 100-25600", "DIGIC 8", "JPEG, RAW", "4K 30fps", "Canon");
        techSpecRepository.save(techSpec5);
        Product product5 = createProduct("Canon EOS 90D",
                "Máy ảnh DSLR APS-C 32.5MP, quay video 4K, màn hình xoay lật, AF 45 điểm.",
                new BigDecimal("28990000"), categories.get(0), canon, techSpec5);
        productRepository.save(product5);
        addProductImages(product5, Arrays.asList(
                "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
                "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800"
        ));
        addProductVariants(product5, colors.subList(0, 2), storages.subList(0, 2),
                new BigDecimal[]{new BigDecimal("28990000"), new BigDecimal("30990000")});

        // 6. Canon EOS M50 Mark II (Mirrorless EF-M)
        TechSpec techSpec6 = createTechSpec("APS-C CMOS", "Canon EF-M", "24.1MP",
                "ISO 100-25600", "DIGIC 8", "JPEG, RAW", "4K 24fps", "Canon");
        techSpecRepository.save(techSpec6);
        Product product6 = createProduct("Canon EOS M50 Mark II",
                "Máy ảnh mirrorless nhỏ gọn, màn hình selfie, live stream, thích hợp cho vlog.",
                new BigDecimal("14990000"), categories.get(1), canon, techSpec6);
        productRepository.save(product6);
        addProductImages(product6, Arrays.asList(
                "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=800"
        ));
        addProductVariants(product6, colors.subList(0, 3), storages.subList(0, 2),
                new BigDecimal[]{new BigDecimal("14990000"), new BigDecimal("16990000")});

        // 7. Canon PowerShot G7 X Mark III (Compact)
        TechSpec techSpec7 = createTechSpec("1-inch CMOS", "Fixed", "20.1MP",
                "ISO 125-12800", "DIGIC 8", "JPEG, RAW", "4K 30fps", "Canon");
        techSpecRepository.save(techSpec7);
        Product product7 = createProduct("Canon PowerShot G7 X Mark III",
                "Máy ảnh compact 20.1MP, nhỏ gọn, quay video 4K, màn hình selfie, live streaming.",
                new BigDecimal("15990000"), categories.get(2), canon, techSpec7);
        productRepository.save(product7);
        addProductImages(product7, Arrays.asList(
                "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800"
        ));
        addProductVariants(product7, colors.subList(0, 2), storages.subList(0, 1),
                new BigDecimal[]{new BigDecimal("15990000")});

        System.out.println(">>> Đã tạo 7 sản phẩm Canon với các biến thể");
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
        // Random variantVersion for each variant - phân bổ đều 3 loại
        ProductVersion[] versions = ProductVersion.values();
        Random random = new Random();
        int variantCount = 0;

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

                // LEVEL 1: Sử dụng ProductVersion enum để tạo version name
                // Random variantVersion để test đầy đủ các trường hợp
                ProductVersion selectedVersion = versions[variantCount % versions.length];
                variant.setVariantVersion(selectedVersion.name());

                // Auto-generate version name: {VariantVersion} / {Color} / {Storage}
                String versionName = ProductVersion.formatFullName(
                        selectedVersion.name(),
                        color.getName(),
                        storage.getName()
                );
                variant.setVersion(versionName);

                productDetailRepository.save(variant);
                variantCount++;
            }
        }
    }

    private void seedBanners() {
        System.out.println(">>> Đang tạo banners...");

        try {
            List<Banner> banners = Arrays.asList(
                    createBanner(
                            "Khám Phá Thế Giới Máy Ảnh Canon",
                            "EOS R Series",
                            "Trải nghiệm công nghệ tiên tiến nhất với dòng máy ảnh mirrorless full-frame Canon EOS R",
                            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80",
                            BannerPosition.HOME_HERO,
                            1,
                            "Xem ngay",
                            "/client/catalog?idBrand=1"
                    ),
                    createBanner(
                            "Canon EOS R6 Mark II",
                            "Giảm Giá Đặc Biệt",
                            "Máy ảnh Canon EOS R6 Mark II với khả năng lấy nét thông minh và chống rung vượt trội",
                            "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=1920&q=80",
                            BannerPosition.HOME_HERO,
                            2,
                            "Mua ngay",
                            "/client/catalog?idProduct=2"
                    ),
                    createBanner(
                            "Canon EOS R5",
                            "Đỉnh Cao Sáng Tạo",
                            "Quay phim 8K, chụp ảnh 45MP - Chiếc máy ảnh cho những nhà sáng tạo nội dung chuyên nghiệp",
                            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1920&q=80",
                            BannerPosition.HOME_HERO,
                            3,
                            "Tìm hiểu thêm",
                            "/client/catalog?idProduct=1"
                    ),
                    createBanner(
                            "Canon EOS 90D",
                            "DSLR Chất Lượng",
                            "Máy ảnh DSLR với cảm biến 32.5MP, lý tưởng cho nhiếp ảnh gia đam mê",
                            "https://images.unsplash.com/photo-1606986628213-9d1c1d17c12d?w=1920&q=80",
                            BannerPosition.HOME_MIDDLE,
                            1,
                            "Xem chi tiết",
                            "/client/catalog?idProduct=5"
                    ),
                    createBanner(
                            "Canon EOS M50 Mark II",
                            "Vlog Cùng Canon",
                            "Thiết kế nhỏ gọn, màn hình selfie, live stream - Vũ khí hoàn hảo cho dân vlog",
                            "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=1920&q=80",
                            BannerPosition.HOME_MIDDLE,
                            2,
                            "Khám phá",
                            "/client/catalog?idProduct=6"
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

    // ============================================================
    // SEED: TechSpec Groups & Definitions (New Group System)
    // ============================================================

    private void seedTechSpecGroups() {
        try {
            // Xóa dữ liệu cũ
            itemRepository.deleteAll();
            techSpecDefinitionRepository.deleteAll();
            techSpecGroupRepository.deleteAll();

            // Tạo 6 nhóm thông số
            TechSpecGroup grpSensor = createTechSpecGroup("sensor-image", "Cảm biến & Chất lượng ảnh",
                    "Các thông số liên quan đến cảm biến, độ phân giải và chất lượng hình ảnh", 1);
            TechSpecGroup grpLens = createTechSpecGroup("lens-focus", "Ống kính & Lấy nét",
                    "Các thông số liên quan đến ngàm lens, hệ thống lấy nét và tốc độ chụp", 2);
            TechSpecGroup grpVideo = createTechSpecGroup("video", "Video",
                    "Các thông số liên quan đến khả năng quay phim", 3);
            TechSpecGroup grpScreen = createTechSpecGroup("screen-viewfinder", "Màn hình & Kính ngắm",
                    "Các thông số liên quan đến màn hình hiển thị và kính ngắm", 4);
            TechSpecGroup grpBattery = createTechSpecGroup("battery-storage-connectivity", "Pin, lưu trữ & Kết nối",
                    "Các thông số liên quan đến pin, thẻ nhớ và cổng kết nối", 5);
            TechSpecGroup grpBody = createTechSpecGroup("body-build", "Thân máy & Hoàn thiện",
                    "Các thông số liên quan đến thân máy, trọng lượng và khả năng chống thời tiết", 6);

            // Tạo definitions cho từng nhóm
            seedSensorImageDefinitions(grpSensor);
            seedLensFocusDefinitions(grpLens);
            seedVideoDefinitions(grpVideo);
            seedScreenViewfinderDefinitions(grpScreen);
            seedBatteryStorageDefinitions(grpBattery);
            seedBodyBuildDefinitions(grpBody);

            System.out.println(">>> Đã seed 6 nhóm thông số kỹ thuật Canon (ENUM/TEXT/NUMBER) + items");
        } catch (Exception e) {
            System.err.println(">>> Lỗi seed TechSpecGroups: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private TechSpecGroup createTechSpecGroup(String code, String name, String description, int displayOrder) {
        TechSpecGroup group = new TechSpecGroup();
        group.setCode(code);
        group.setName(name);
        group.setDescription(description);
        group.setDisplayOrder(displayOrder);
        group.setStatus(EntityStatus.ACTIVE);
        return techSpecGroupRepository.save(group);
    }

    private TechSpecDefinition createTechSpecDefinition(String code, String name, String description,
            TechSpecGroup group, TechSpecDefinition.DataType dataType, String unit,
            boolean isFilterable, boolean isRequired, int displayOrder) {
        TechSpecDefinition def = new TechSpecDefinition();
        def.setCode(code);
        def.setName(name);
        def.setDescription(description);
        def.setTechSpecGroup(group);
        def.setDataType(dataType);
        def.setUnit(unit);
        def.setIsFilterable(isFilterable);
        def.setIsRequired(isRequired);
        def.setDisplayOrder(displayOrder);
        def.setStatus(EntityStatus.ACTIVE);
        return techSpecDefinitionRepository.save(def);
    }

    // ---- SEED TECH SPEC DEFINITIONS (Canon — ENUM/TEXT/NUMBER) ----

    private void seedSensorImageDefinitions(TechSpecGroup group) {
        // ENUM (với items)
        TechSpecDefinition sensorType = createTechSpecDefinition("sensor_type", "Loại cảm biến",
                "Công nghệ cảm biến (CMOS, BSI-CMOS...)", group, TechSpecDefinition.DataType.ENUM, null, true, false, 1);
        createEnumItems(sensorType, new String[]{
                "Full-frame CMOS", "APS-C CMOS", "APS-C X-Trans CMOS",
                "Micro Four Thirds", "1-inch CMOS", "Medium Format CMOS",
                "BSI-CMOS", "Stacked CMOS", "Dual Pixel CMOS"
        });

        TechSpecDefinition imageProcessor = createTechSpecDefinition("image_processor", "Bộ xử lý ảnh",
                "Tên chip xử lý hình ảnh (VD: DIGIC X)", group, TechSpecDefinition.DataType.ENUM, null, false, false, 2);
        createEnumItems(imageProcessor, new String[]{
                "DIGIC X", "DIGIC 8", "DIGIC 7", "DIGIC 6",
                "DIGIC 5", "DIGIC 4", "DIGIC 3",
                "EXPEED 7", "EXPEED 6", "EXPEED 5",
                "BIONZ X", "BIONZ XR", "BIONZ Z",
                "X-Processor 5", "X-Processor 4", "X-Processor 3"
        });

        // TEXT
        createTechSpecDefinition("sensor_size", "Kích thước cảm biến",
                "Kích thước vật lý cảm biến (VD: 36 x 24mm)", group, TechSpecDefinition.DataType.TEXT, null, false, false, 3);
        createTechSpecDefinition("iso_standard", "ISO chuẩn",
                "Dải ISO tiêu chuẩn (VD: 100-51200)", group, TechSpecDefinition.DataType.TEXT, null, false, false, 4);
        createTechSpecDefinition("iso_extended", "ISO mở rộng",
                "Dải ISO mở rộng (VD: 50-204800)", group, TechSpecDefinition.DataType.TEXT, null, false, false, 5);
        // NUMBER
        createTechSpecDefinition("resolution_mp", "Độ phân giải",
                "Số megapixel hiệu dụng", group, TechSpecDefinition.DataType.NUMBER, "MP", true, false, 6);
        createTechSpecDefinition("bit_depth", "Độ sâu bit",
                "Độ sâu bit màu (VD: 14-bit)", group, TechSpecDefinition.DataType.NUMBER, "bit", false, false, 7);
    }

    private void seedLensFocusDefinitions(TechSpecGroup group) {
        // ENUM
        TechSpecDefinition lensMount = createTechSpecDefinition("lens_mount", "Mount ống kính",
                "Loại ngàm gắn ống kính", group, TechSpecDefinition.DataType.ENUM, null, true, false, 1);
        createEnumItems(lensMount, new String[]{
                "Canon RF", "Canon RF-S", "Canon EF", "Canon EF-S", "Canon EF-M",
                "Nikon Z", "Nikon F", "Sony E", "Fujifilm X",
                "Micro Four Thirds", "Leica M", "Leica L", "Fixed"
        });

        TechSpecDefinition afSystem = createTechSpecDefinition("af_system", "Hệ thống lấy nét",
                "Loại hệ thống AF", group, TechSpecDefinition.DataType.ENUM, null, false, false, 2);
        createEnumItems(afSystem, new String[]{
                "Dual Pixel CMOS AF II", "Dual Pixel CMOS AF", "Hybrid CMOS AF",
                "Phase Detection AF", "Contrast AF", "Eye Detection AF"
        });

        TechSpecDefinition articulatingScreen = createTechSpecDefinition("articulating_screen", "Màn hình xoay lật",
                "Loại cơ chế xoay/lật màn hình", group, TechSpecDefinition.DataType.ENUM, null, false, false, 3);
        createEnumItems(articulatingScreen, new String[]{
                "Full Articulating (xoay 180°)", "Vari-angle (xoay lật đa hướng)",
                "Tilt (nghiêng)", "Fixed (cố định)", "Touchscreen-only"
        });

        // TEXT
        createTechSpecDefinition("eye_af", "Eye AF",
                "Hỗ trợ Eye AF (VD: Có — AF người + động vật)", group, TechSpecDefinition.DataType.TEXT, null, false, false, 4);
        // NUMBER
        createTechSpecDefinition("af_points", "Số điểm lấy nét",
                "Tổng số điểm AF", group, TechSpecDefinition.DataType.NUMBER, "điểm", true, false, 5);
        createTechSpecDefinition("burst_fps", "Tốc độ chụp liên tiếp",
                "fps khi chụp liên tiếp (Mechanical / Electronic)", group, TechSpecDefinition.DataType.NUMBER, "fps", true, false, 6);
    }

    private void seedVideoDefinitions(TechSpecGroup group) {
        // ENUM
        TechSpecDefinition videoMaxRes = createTechSpecDefinition("video_max_resolution", "Độ phân giải video tối đa",
                "Resolution cao nhất khi quay", group, TechSpecDefinition.DataType.ENUM, null, true, false, 1);
        createEnumItems(videoMaxRes, new String[]{
                "8K 30fps", "8K 24fps", "5.7K 60fps",
                "4K 120fps", "4K 60fps", "4K 30fps",
                "Full HD 120fps", "Full HD 60fps", "Full HD 30fps", "HD 60fps"
        });

        TechSpecDefinition logProfile = createTechSpecDefinition("log_profile", "Log profile",
                "Profile log hỗ trợ", group, TechSpecDefinition.DataType.ENUM, null, false, false, 2);
        createEnumItems(logProfile, new String[]{
                "Canon Log 3", "Canon Log 2", "Canon Log",
                "HDR PQ", "HLG",
                "S-Log3 / S-Gamut3", "S-Log3 / S-Gamut3.Cine",
                "F-Log2", "D-Log", "V-Log", "None"
        });

        TechSpecDefinition videoFormat = createTechSpecDefinition("video_format", "Định dạng video",
                "Codec / container video", group, TechSpecDefinition.DataType.ENUM, null, false, false, 3);
        createEnumItems(videoFormat, new String[]{
                "H.265 / HEVC", "H.264 / AVC",
                "ProRes 422 HQ", "ProRes 422", "ProRes RAW",
                "RAW", "MP4", "MOV"
        });

        // TEXT
        createTechSpecDefinition("slow_motion", "Slow motion",
                "Quay chậm (VD: 4K 120fps, FHD 240fps)", group, TechSpecDefinition.DataType.TEXT, null, false, false, 4);
        createTechSpecDefinition("video_stabilization", "Chống rung video",
                "Công nghệ ổn định hình ảnh khi quay", group, TechSpecDefinition.DataType.TEXT, null, false, false, 5);
        // NUMBER
        createTechSpecDefinition("video_max_fps", "FPS tối đa",
                "Số khung hình/giây tối đa", group, TechSpecDefinition.DataType.NUMBER, "fps", true, false, 6);
        createTechSpecDefinition("recording_limit", "Thời gian quay liên tục",
                "Giới hạn quay liên tục (VD: 120 phút)", group, TechSpecDefinition.DataType.NUMBER, "phút", false, false, 7);
    }

    private void seedScreenViewfinderDefinitions(TechSpecGroup group) {
        // NUMBER
        createTechSpecDefinition("screen_size", "Kích thước màn hình",
                "Kích thước LCD", group, TechSpecDefinition.DataType.NUMBER, "inch", false, false, 1);
        createTechSpecDefinition("screen_dots", "Độ phân giải màn hình",
                "Số điểm ảnh màn hình (VD: 1620000)", group, TechSpecDefinition.DataType.NUMBER, "điểm ảnh", false, false, 2);
        createTechSpecDefinition("evf_resolution", "Độ phân giải EVF",
                "Độ phân giải kính ngắm điện tử", group, TechSpecDefinition.DataType.NUMBER, "điểm ảnh", false, false, 3);
        createTechSpecDefinition("evf_magnification", "Phóng đại EVF",
                "Độ phóng đại kính ngắm điện tử", group, TechSpecDefinition.DataType.NUMBER, "x", false, false, 4);
        // ENUM
        TechSpecDefinition touchscreen = createTechSpecDefinition("touchscreen", "Màn hình cảm ứng",
                "Loại cảm ứng", group, TechSpecDefinition.DataType.ENUM, null, false, false, 5);
        createEnumItems(touchscreen, new String[]{
                "Có — Cảm ứng đa điểm", "Có — Cảm ứng", "Không"
        });

        TechSpecDefinition viewfinderType = createTechSpecDefinition("viewfinder_type", "Loại viewfinder",
                "Loại kính ngắm", group, TechSpecDefinition.DataType.ENUM, null, false, false, 6);
        createEnumItems(viewfinderType, new String[]{
                "EVF (điện tử)", "OVF (quang học)",
                "Electronic Viewfinder (OLED)", "Electronic Viewfinder (LCD)", "Không có"
        });
    }

    private void seedBatteryStorageDefinitions(TechSpecGroup group) {
        // ENUM
        TechSpecDefinition batteryType = createTechSpecDefinition("battery_type", "Loại pin",
                "Model pin (VD: LP-E6NH)", group, TechSpecDefinition.DataType.ENUM, null, false, false, 1);
        createEnumItems(batteryType, new String[]{
                "LP-E6NH", "LP-E6N", "LP-E6",
                "LP-E19", "LP-E12", "LP-E17",
                "EN-EL15", "EN-EL14",
                "NP-FZ100", "NP-W126S",
                "DMW-BLK22", "DMW-BLC12"
        });

        TechSpecDefinition usbPort = createTechSpecDefinition("usb_port", "USB",
                "Loại cổng USB", group, TechSpecDefinition.DataType.ENUM, null, false, false, 2);
        createEnumItems(usbPort, new String[]{
                "USB-C 3.2 Gen 2", "USB-C 3.1 Gen 2", "USB-C 3.1 Gen 1", "USB-C",
                "USB Micro-B", "USB 3.0", "USB 2.0"
        });

        TechSpecDefinition hdmiPort = createTechSpecDefinition("hdmi_port", "HDMI",
                "Loại cổng HDMI", group, TechSpecDefinition.DataType.ENUM, null, false, false, 3);
        createEnumItems(hdmiPort, new String[]{
                "HDMI Type A", "HDMI Type D (Micro)", "HDMI Type C (Mini)", "HDMI", "Không có"
        });

        TechSpecDefinition cardType = createTechSpecDefinition("card_type", "Loại thẻ nhớ",
                "Các loại thẻ tương thích", group, TechSpecDefinition.DataType.ENUM, null, true, false, 4);
        createEnumItems(cardType, new String[]{
                "SD (UHS-II)", "SD (UHS-I)", "CFexpress Type B", "CFexpress Type A",
                "CFast", "MicroSD", "XQD", "SD + CFexpress", "SD + CFast"
        });

        // TEXT
        createTechSpecDefinition("bluetooth", "Bluetooth",
                "Phiên bản Bluetooth (VD: 5.0, 5.3)", group, TechSpecDefinition.DataType.TEXT, null, false, false, 5);
        createTechSpecDefinition("wifi_standard", "Wi-Fi",
                "Tiêu chuẩn Wi-Fi (VD: Wi-Fi 5, Wi-Fi 6E)", group, TechSpecDefinition.DataType.TEXT, null, false, false, 6);
        // NUMBER
        createTechSpecDefinition("card_slots", "Số khe thẻ nhớ",
                "Số lượng khe cắm thẻ", group, TechSpecDefinition.DataType.NUMBER, "khe", false, false, 7);
    }

    private void seedBodyBuildDefinitions(TechSpecGroup group) {
        // NUMBER
        createTechSpecDefinition("weight", "Trọng lượng",
                "Trọng lượng thân máy", group, TechSpecDefinition.DataType.NUMBER, "g", false, false, 1);
        // TEXT
        createTechSpecDefinition("dimensions", "Kích thước",
                "Kích thước tổng thể (D x R x S)", group, TechSpecDefinition.DataType.TEXT, null, false, false, 2);
        createTechSpecDefinition("weather_sealing", "Chống thời tiết",
                "Mức độ chống bụi/ẩm (VD: Dust & Moisture Resistant)", group, TechSpecDefinition.DataType.TEXT, null, false, false, 3);
        createTechSpecDefinition("body_material", "Chất liệu thân máy",
                "Vật liệu cấu tạo thân (VD: Magie alloy)", group, TechSpecDefinition.DataType.TEXT, null, false, false, 4);
        createTechSpecDefinition("grip_material", "Báng cầm",
                "Chất liệu báng cầm (VD: Rubber)", group, TechSpecDefinition.DataType.TEXT, null, false, false, 5);
        createTechSpecDefinition("shutter_rating", "Tuổi thọ cửa trập",
                "Số lần đóng mở cửa trập (VD: 200,000 lần)", group, TechSpecDefinition.DataType.TEXT, null, false, false, 6);
    }

    private TechSpecDefinitionItem createEnumItem(TechSpecDefinition definition, String name, int order) {
        TechSpecDefinitionItem item = new TechSpecDefinitionItem();
        item.setTechSpecDefinition(definition);
        item.setName(name);
        item.setValue(name);
        item.setDisplayOrder(order);
        item.setStatus(EntityStatus.ACTIVE);
        return itemRepository.save(item);
    }

    // ============================================================
    // SEED: TechSpec Values cho từng sản phẩm
    // ============================================================

    private void seedProductTechSpecs() {
        try {
            List<Product> products = productRepository.findAll();
            if (products.isEmpty()) {
                System.out.println(">>> Không có sản phẩm để seed techspec values");
                return;
            }

            // Xóa dữ liệu cũ
            techSpecValueRepository.deleteAll();

            // Lấy map definition theo code
            Map<String, TechSpecDefinition> defMap = getDefinitionMap();

            int totalValues = 0;
            for (Product product : products) {
                int count = seedProductTechSpecValues(product, defMap);
                totalValues += count;
            }

            System.out.println(">>> Đã seed " + totalValues + " thông số kỹ thuật cho " + products.size() + " sản phẩm");
        } catch (Exception e) {
            System.err.println(">>> Lỗi seed TechSpec Values: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private Map<String, TechSpecDefinition> getDefinitionMap() {
        Map<String, TechSpecDefinition> map = new java.util.HashMap<>();
        List<TechSpecDefinition> defs = techSpecDefinitionRepository.findAll();
        for (TechSpecDefinition def : defs) {
            map.put(def.getCode(), def);
        }
        return map;
    }

    private int seedProductTechSpecValues(Product product, Map<String, TechSpecDefinition> defMap) {
        String name = product.getName().toLowerCase();
        List<TechSpecValue> values = new ArrayList<>();

        if (name.contains("eos r5")) {
            values.addAll(seedEOSR5(defMap));
        } else if (name.contains("eos r6")) {
            values.addAll(seedEOSR6(defMap));
        } else if (name.contains("eos r8")) {
            values.addAll(seedEOSR8(defMap));
        } else if (name.contains("eos r10")) {
            values.addAll(seedEOSR10(defMap));
        } else if (name.contains("eos 90d")) {
            values.addAll(seedEOS90D(defMap));
        } else if (name.contains("eos m50")) {
            values.addAll(seedEOSM50(defMap));
        } else if (name.contains("powershot g7") || name.contains("g7 x")) {
            values.addAll(seedG7X(defMap));
        }

        // Lưu tất cả values
        for (TechSpecValue v : values) {
            v.setProduct(product);
            techSpecValueRepository.save(v);
        }
        return values.size();
    }

    // ---- Canon EOS R5 ----
    private List<TechSpecValue> seedEOSR5(Map<String, TechSpecDefinition> defMap) {
        List<TechSpecValue> list = new ArrayList<>();
        TechSpecDefinition d;

        // Nhóm Cảm biến
        d = defMap.get("sensor_type");
        if (d != null) list.add(createEnumValue(d, "Full-frame CMOS"));
        d = defMap.get("image_processor");
        if (d != null) list.add(createEnumValue(d, "DIGIC X"));
        d = defMap.get("sensor_size");
        if (d != null) list.add(createTextValue(d, "36 x 24mm"));
        d = defMap.get("iso_standard");
        if (d != null) list.add(createTextValue(d, "100-51200"));
        d = defMap.get("iso_extended");
        if (d != null) list.add(createTextValue(d, "50-204800"));
        d = defMap.get("resolution_mp");
        if (d != null) list.add(createNumberValue(d, 45.0, "45MP"));
        d = defMap.get("bit_depth");
        if (d != null) list.add(createNumberValue(d, 14.0, "14-bit"));

        // Nhóm Ống kính & Lấy nét
        d = defMap.get("lens_mount");
        if (d != null) list.add(createEnumValue(d, "Canon RF"));
        d = defMap.get("af_system");
        if (d != null) list.add(createEnumValue(d, "Dual Pixel CMOS AF II"));
        d = defMap.get("articulating_screen");
        if (d != null) list.add(createEnumValue(d, "Full Articulating (xoay 180°)"));
        d = defMap.get("eye_af");
        if (d != null) list.add(createTextValue(d, "Có — AF người + động vật + xe"));
        d = defMap.get("af_points");
        if (d != null) list.add(createNumberValue(d, 5940.0, "5940 điểm"));
        d = defMap.get("burst_fps");
        if (d != null) list.add(createNumberValue(d, 20.0, "20 fps"));

        // Nhóm Video
        d = defMap.get("video_max_resolution");
        if (d != null) list.add(createEnumValue(d, "8K 30fps"));
        d = defMap.get("video_max_fps");
        if (d != null) list.add(createNumberValue(d, 120.0, "120fps"));
        d = defMap.get("log_profile");
        if (d != null) list.add(createEnumValue(d, "Canon Log 3"));
        d = defMap.get("video_format");
        if (d != null) list.add(createEnumValue(d, "RAW"));
        d = defMap.get("slow_motion");
        if (d != null) list.add(createTextValue(d, "4K 120fps, Full HD 240fps"));
        d = defMap.get("recording_limit");
        if (d != null) list.add(createNumberValue(d, 120.0, "120 phút"));
        d = defMap.get("video_stabilization");
        if (d != null) list.add(createTextValue(d, "IBIS 5 trục + Lens IS (8-stop)"));

        // Nhóm Màn hình & Kính ngắm
        d = defMap.get("screen_size");
        if (d != null) list.add(createNumberValue(d, 3.2, "3.2 inch"));
        d = defMap.get("screen_dots");
        if (d != null) list.add(createNumberValue(d, 2100000.0, "2.100.000 điểm ảnh"));
        d = defMap.get("evf_resolution");
        if (d != null) list.add(createNumberValue(d, 5760000.0, "5.760.000 điểm ảnh"));
        d = defMap.get("evf_magnification");
        if (d != null) list.add(createNumberValue(d, 0.76, "0.76x"));
        d = defMap.get("touchscreen");
        if (d != null) list.add(createEnumValue(d, "Có — Cảm ứng đa điểm"));
        d = defMap.get("viewfinder_type");
        if (d != null) list.add(createEnumValue(d, "Electronic Viewfinder (OLED)"));

        // Nhóm Pin & Kết nối
        d = defMap.get("battery_type");
        if (d != null) list.add(createEnumValue(d, "LP-E6NH"));
        d = defMap.get("bluetooth");
        if (d != null) list.add(createTextValue(d, "5.0"));
        d = defMap.get("wifi_standard");
        if (d != null) list.add(createTextValue(d, "Wi-Fi 5 (802.11ac)"));
        d = defMap.get("usb_port");
        if (d != null) list.add(createEnumValue(d, "USB-C 3.1 Gen 2"));
        d = defMap.get("hdmi_port");
        if (d != null) list.add(createEnumValue(d, "HDMI Type A"));
        d = defMap.get("card_type");
        if (d != null) list.add(createEnumValue(d, "CFexpress Type B"));
        d = defMap.get("card_slots");
        if (d != null) list.add(createNumberValue(d, 2.0, "2 khe"));

        // Nhóm Thân máy
        d = defMap.get("weight");
        if (d != null) list.add(createNumberValue(d, 738.0, "738g"));
        d = defMap.get("dimensions");
        if (d != null) list.add(createTextValue(d, "138.5 x 97.5 x 88mm"));
        d = defMap.get("weather_sealing");
        if (d != null) list.add(createTextValue(d, "Dust & Moisture Resistant"));
        d = defMap.get("body_material");
        if (d != null) list.add(createTextValue(d, "Magnesium Alloy"));
        d = defMap.get("grip_material");
        if (d != null) list.add(createTextValue(d, "Rubber"));
        d = defMap.get("shutter_rating");
        if (d != null) list.add(createTextValue(d, "500,000 lần"));

        return list;
    }

    // ---- Canon EOS R6 Mark II ----
    private List<TechSpecValue> seedEOSR6(Map<String, TechSpecDefinition> defMap) {
        List<TechSpecValue> list = new ArrayList<>();
        TechSpecDefinition d;

        d = defMap.get("sensor_type");
        if (d != null) list.add(createEnumValue(d, "Full-frame CMOS"));
        d = defMap.get("image_processor");
        if (d != null) list.add(createEnumValue(d, "DIGIC X"));
        d = defMap.get("sensor_size");
        if (d != null) list.add(createTextValue(d, "36 x 24mm"));
        d = defMap.get("iso_standard");
        if (d != null) list.add(createTextValue(d, "100-102400"));
        d = defMap.get("iso_extended");
        if (d != null) list.add(createTextValue(d, "50-204800"));
        d = defMap.get("resolution_mp");
        if (d != null) list.add(createNumberValue(d, 24.2, "24.2MP"));
        d = defMap.get("bit_depth");
        if (d != null) list.add(createNumberValue(d, 14.0, "14-bit"));

        d = defMap.get("lens_mount");
        if (d != null) list.add(createEnumValue(d, "Canon RF"));
        d = defMap.get("af_system");
        if (d != null) list.add(createEnumValue(d, "Dual Pixel CMOS AF II"));
        d = defMap.get("articulating_screen");
        if (d != null) list.add(createEnumValue(d, "Full Articulating (xoay 180°)"));
        d = defMap.get("eye_af");
        if (d != null) list.add(createTextValue(d, "Có — AF người + động vật + xe"));
        d = defMap.get("af_points");
        if (d != null) list.add(createNumberValue(d, 1053.0, "1053 điểm"));
        d = defMap.get("burst_fps");
        if (d != null) list.add(createNumberValue(d, 40.0, "40 fps (Electronic)"));

        d = defMap.get("video_max_resolution");
        if (d != null) list.add(createEnumValue(d, "4K 60fps"));
        d = defMap.get("video_max_fps");
        if (d != null) list.add(createNumberValue(d, 180.0, "180fps"));
        d = defMap.get("log_profile");
        if (d != null) list.add(createEnumValue(d, "Canon Log 3"));
        d = defMap.get("video_format");
        if (d != null) list.add(createEnumValue(d, "H.265 / HEVC"));
        d = defMap.get("slow_motion");
        if (d != null) list.add(createTextValue(d, "4K 60fps, Full HD 180fps"));
        d = defMap.get("recording_limit");
        if (d != null) list.add(createNumberValue(d, 60.0, "60 phút (4K 60fps)"));
        d = defMap.get("video_stabilization");
        if (d != null) list.add(createTextValue(d, "IBIS 5 trục + Lens IS (8-stop)"));

        d = defMap.get("screen_size");
        if (d != null) list.add(createNumberValue(d, 3.0, "3.0 inch"));
        d = defMap.get("screen_dots");
        if (d != null) list.add(createNumberValue(d, 1620000.0, "1.620.000 điểm ảnh"));
        d = defMap.get("evf_resolution");
        if (d != null) list.add(createNumberValue(d, 3690000.0, "3.690.000 điểm ảnh"));
        d = defMap.get("evf_magnification");
        if (d != null) list.add(createNumberValue(d, 0.76, "0.76x"));
        d = defMap.get("touchscreen");
        if (d != null) list.add(createEnumValue(d, "Có — Cảm ứng đa điểm"));
        d = defMap.get("viewfinder_type");
        if (d != null) list.add(createEnumValue(d, "Electronic Viewfinder (OLED)"));

        d = defMap.get("battery_type");
        if (d != null) list.add(createEnumValue(d, "LP-E6NH"));
        d = defMap.get("bluetooth");
        if (d != null) list.add(createTextValue(d, "5.0"));
        d = defMap.get("wifi_standard");
        if (d != null) list.add(createTextValue(d, "Wi-Fi 5 (802.11ac)"));
        d = defMap.get("usb_port");
        if (d != null) list.add(createEnumValue(d, "USB-C 3.1 Gen 2"));
        d = defMap.get("hdmi_port");
        if (d != null) list.add(createEnumValue(d, "HDMI Type A"));
        d = defMap.get("card_type");
        if (d != null) list.add(createEnumValue(d, "SD (UHS-II)"));
        d = defMap.get("card_slots");
        if (d != null) list.add(createNumberValue(d, 2.0, "2 khe"));

        d = defMap.get("weight");
        if (d != null) list.add(createNumberValue(d, 670.0, "670g"));
        d = defMap.get("dimensions");
        if (d != null) list.add(createTextValue(d, "138.4 x 98.4 x 88.4mm"));
        d = defMap.get("weather_sealing");
        if (d != null) list.add(createTextValue(d, "Dust & Moisture Resistant"));
        d = defMap.get("body_material");
        if (d != null) list.add(createTextValue(d, "Magnesium Alloy"));
        d = defMap.get("grip_material");
        if (d != null) list.add(createTextValue(d, "Rubber"));
        d = defMap.get("shutter_rating");
        if (d != null) list.add(createTextValue(d, "300,000 lần"));

        return list;
    }

    // ---- Canon EOS R8 ----
    private List<TechSpecValue> seedEOSR8(Map<String, TechSpecDefinition> defMap) {
        List<TechSpecValue> list = new ArrayList<>();
        TechSpecDefinition d;

        d = defMap.get("sensor_type");
        if (d != null) list.add(createEnumValue(d, "Full-frame CMOS"));
        d = defMap.get("image_processor");
        if (d != null) list.add(createEnumValue(d, "DIGIC X"));
        d = defMap.get("sensor_size");
        if (d != null) list.add(createTextValue(d, "36 x 24mm"));
        d = defMap.get("iso_standard");
        if (d != null) list.add(createTextValue(d, "100-102400"));
        d = defMap.get("iso_extended");
        if (d != null) list.add(createTextValue(d, "50-204800"));
        d = defMap.get("resolution_mp");
        if (d != null) list.add(createNumberValue(d, 24.2, "24.2MP"));
        d = defMap.get("bit_depth");
        if (d != null) list.add(createNumberValue(d, 14.0, "14-bit"));

        d = defMap.get("lens_mount");
        if (d != null) list.add(createEnumValue(d, "Canon RF"));
        d = defMap.get("af_system");
        if (d != null) list.add(createEnumValue(d, "Dual Pixel CMOS AF II"));
        d = defMap.get("articulating_screen");
        if (d != null) list.add(createEnumValue(d, "Full Articulating (xoay 180°)"));
        d = defMap.get("eye_af");
        if (d != null) list.add(createTextValue(d, "Có — AF người + động vật"));
        d = defMap.get("af_points");
        if (d != null) list.add(createNumberValue(d, 1053.0, "1053 điểm"));
        d = defMap.get("burst_fps");
        if (d != null) list.add(createNumberValue(d, 40.0, "40 fps (Electronic)"));

        d = defMap.get("video_max_resolution");
        if (d != null) list.add(createEnumValue(d, "4K 60fps"));
        d = defMap.get("video_max_fps");
        if (d != null) list.add(createNumberValue(d, 120.0, "120fps"));
        d = defMap.get("log_profile");
        if (d != null) list.add(createEnumValue(d, "Canon Log 3"));
        d = defMap.get("video_format");
        if (d != null) list.add(createEnumValue(d, "H.265 / HEVC"));
        d = defMap.get("slow_motion");
        if (d != null) list.add(createTextValue(d, "Full HD 120fps"));
        d = defMap.get("recording_limit");
        if (d != null) list.add(createNumberValue(d, 30.0, "30 phút (4K 60fps)"));
        d = defMap.get("video_stabilization");
        if (d != null) list.add(createTextValue(d, "Digital IS (không IBIS)"));

        d = defMap.get("screen_size");
        if (d != null) list.add(createNumberValue(d, 3.0, "3.0 inch"));
        d = defMap.get("screen_dots");
        if (d != null) list.add(createNumberValue(d, 1620000.0, "1.620.000 điểm ảnh"));
        d = defMap.get("evf_resolution");
        if (d != null) list.add(createNumberValue(d, 2360000.0, "2.360.000 điểm ảnh"));
        d = defMap.get("evf_magnification");
        if (d != null) list.add(createNumberValue(d, 0.70, "0.70x"));
        d = defMap.get("touchscreen");
        if (d != null) list.add(createEnumValue(d, "Có — Cảm ứng đa điểm"));
        d = defMap.get("viewfinder_type");
        if (d != null) list.add(createEnumValue(d, "Electronic Viewfinder (OLED)"));

        d = defMap.get("battery_type");
        if (d != null) list.add(createEnumValue(d, "LP-E17"));
        d = defMap.get("bluetooth");
        if (d != null) list.add(createTextValue(d, "5.0"));
        d = defMap.get("wifi_standard");
        if (d != null) list.add(createTextValue(d, "Wi-Fi 5 (802.11ac)"));
        d = defMap.get("usb_port");
        if (d != null) list.add(createEnumValue(d, "USB-C 3.1 Gen 1"));
        d = defMap.get("hdmi_port");
        if (d != null) list.add(createEnumValue(d, "HDMI Type D (Micro)"));
        d = defMap.get("card_type");
        if (d != null) list.add(createEnumValue(d, "SD (UHS-II)"));
        d = defMap.get("card_slots");
        if (d != null) list.add(createNumberValue(d, 1.0, "1 khe"));

        d = defMap.get("weight");
        if (d != null) list.add(createNumberValue(d, 461.0, "461g (thân máy)"));
        d = defMap.get("dimensions");
        if (d != null) list.add(createTextValue(d, "132.5 x 86.1 x 70mm"));
        d = defMap.get("weather_sealing");
        if (d != null) list.add(createTextValue(d, "Dust & Moisture Resistant"));
        d = defMap.get("body_material");
        if (d != null) list.add(createTextValue(d, "Polycarbonate (GFRP)"));
        d = defMap.get("grip_material");
        if (d != null) list.add(createTextValue(d, "Rubber"));
        d = defMap.get("shutter_rating");
        if (d != null) list.add(createTextValue(d, "100,000 lần"));

        return list;
    }

    // ---- Canon EOS R10 ----
    private List<TechSpecValue> seedEOSR10(Map<String, TechSpecDefinition> defMap) {
        List<TechSpecValue> list = new ArrayList<>();
        TechSpecDefinition d;

        d = defMap.get("sensor_type");
        if (d != null) list.add(createEnumValue(d, "APS-C CMOS"));
        d = defMap.get("image_processor");
        if (d != null) list.add(createEnumValue(d, "DIGIC X"));
        d = defMap.get("sensor_size");
        if (d != null) list.add(createTextValue(d, "22.3 x 14.9mm"));
        d = defMap.get("iso_standard");
        if (d != null) list.add(createTextValue(d, "100-32000"));
        d = defMap.get("iso_extended");
        if (d != null) list.add(createTextValue(d, "100-51200"));
        d = defMap.get("resolution_mp");
        if (d != null) list.add(createNumberValue(d, 24.2, "24.2MP"));
        d = defMap.get("bit_depth");
        if (d != null) list.add(createNumberValue(d, 14.0, "14-bit"));

        d = defMap.get("lens_mount");
        if (d != null) list.add(createEnumValue(d, "Canon RF-S"));
        d = defMap.get("af_system");
        if (d != null) list.add(createEnumValue(d, "Dual Pixel CMOS AF II"));
        d = defMap.get("articulating_screen");
        if (d != null) list.add(createEnumValue(d, "Full Articulating (xoay 180°)"));
        d = defMap.get("eye_af");
        if (d != null) list.add(createTextValue(d, "Có — AF người + động vật"));
        d = defMap.get("af_points");
        if (d != null) list.add(createNumberValue(d, 651.0, "651 điểm"));
        d = defMap.get("burst_fps");
        if (d != null) list.add(createNumberValue(d, 15.0, "15 fps (Mechanical)"));

        d = defMap.get("video_max_resolution");
        if (d != null) list.add(createEnumValue(d, "4K 60fps"));
        d = defMap.get("video_max_fps");
        if (d != null) list.add(createNumberValue(d, 120.0, "120fps"));
        d = defMap.get("log_profile");
        if (d != null) list.add(createEnumValue(d, "HDR PQ"));
        d = defMap.get("video_format");
        if (d != null) list.add(createEnumValue(d, "H.264 / AVC"));
        d = defMap.get("slow_motion");
        if (d != null) list.add(createTextValue(d, "Full HD 120fps"));
        d = defMap.get("recording_limit");
        if (d != null) list.add(createNumberValue(d, 60.0, "60 phút"));
        d = defMap.get("video_stabilization");
        if (d != null) list.add(createTextValue(d, "Digital IS"));

        d = defMap.get("screen_size");
        if (d != null) list.add(createNumberValue(d, 2.95, "2.95 inch"));
        d = defMap.get("screen_dots");
        if (d != null) list.add(createNumberValue(d, 1040000.0, "1.040.000 điểm ảnh"));
        d = defMap.get("evf_resolution");
        if (d != null) list.add(createNumberValue(d, 2360000.0, "2.360.000 điểm ảnh"));
        d = defMap.get("evf_magnification");
        if (d != null) list.add(createNumberValue(d, 0.95, "0.95x"));
        d = defMap.get("touchscreen");
        if (d != null) list.add(createEnumValue(d, "Có — Cảm ứng đa điểm"));
        d = defMap.get("viewfinder_type");
        if (d != null) list.add(createEnumValue(d, "Electronic Viewfinder (OLED)"));

        d = defMap.get("battery_type");
        if (d != null) list.add(createEnumValue(d, "LP-E17"));
        d = defMap.get("bluetooth");
        if (d != null) list.add(createTextValue(d, "4.2"));
        d = defMap.get("wifi_standard");
        if (d != null) list.add(createTextValue(d, "Wi-Fi 5 (802.11ac)"));
        d = defMap.get("usb_port");
        if (d != null) list.add(createEnumValue(d, "USB-C 3.1 Gen 1"));
        d = defMap.get("hdmi_port");
        if (d != null) list.add(createEnumValue(d, "HDMI Type D (Micro)"));
        d = defMap.get("card_type");
        if (d != null) list.add(createEnumValue(d, "SD (UHS-I)"));
        d = defMap.get("card_slots");
        if (d != null) list.add(createNumberValue(d, 1.0, "1 khe"));

        d = defMap.get("weight");
        if (d != null) list.add(createNumberValue(d, 429.0, "429g (thân máy)"));
        d = defMap.get("dimensions");
        if (d != null) list.add(createTextValue(d, "122.5 x 87.8 x 83.4mm"));
        d = defMap.get("weather_sealing");
        if (d != null) list.add(createTextValue(d, "Không"));
        d = defMap.get("body_material");
        if (d != null) list.add(createTextValue(d, "Polycarbonate"));
        d = defMap.get("grip_material");
        if (d != null) list.add(createTextValue(d, "Rubber"));
        d = defMap.get("shutter_rating");
        if (d != null) list.add(createTextValue(d, "100,000 lần"));

        return list;
    }

    // ---- Canon EOS 90D ----
    private List<TechSpecValue> seedEOS90D(Map<String, TechSpecDefinition> defMap) {
        List<TechSpecValue> list = new ArrayList<>();
        TechSpecDefinition d;

        d = defMap.get("sensor_type");
        if (d != null) list.add(createEnumValue(d, "APS-C CMOS"));
        d = defMap.get("image_processor");
        if (d != null) list.add(createEnumValue(d, "DIGIC 8"));
        d = defMap.get("sensor_size");
        if (d != null) list.add(createTextValue(d, "22.3 x 14.9mm"));
        d = defMap.get("iso_standard");
        if (d != null) list.add(createTextValue(d, "100-25600"));
        d = defMap.get("iso_extended");
        if (d != null) list.add(createTextValue(d, "100-51200"));
        d = defMap.get("resolution_mp");
        if (d != null) list.add(createNumberValue(d, 32.5, "32.5MP"));
        d = defMap.get("bit_depth");
        if (d != null) list.add(createNumberValue(d, 14.0, "14-bit"));

        d = defMap.get("lens_mount");
        if (d != null) list.add(createEnumValue(d, "Canon EF-S"));
        d = defMap.get("af_system");
        if (d != null) list.add(createEnumValue(d, "Phase Detection AF"));
        d = defMap.get("articulating_screen");
        if (d != null) list.add(createEnumValue(d, "Vari-angle (xoay lật đa hướng)"));
        d = defMap.get("eye_af");
        if (d != null) list.add(createTextValue(d, "Không"));
        d = defMap.get("af_points");
        if (d != null) list.add(createNumberValue(d, 45.0, "45 điểm"));
        d = defMap.get("burst_fps");
        if (d != null) list.add(createNumberValue(d, 10.0, "10 fps"));

        d = defMap.get("video_max_resolution");
        if (d != null) list.add(createEnumValue(d, "4K 30fps"));
        d = defMap.get("video_max_fps");
        if (d != null) list.add(createNumberValue(d, 120.0, "120fps"));
        d = defMap.get("log_profile");
        if (d != null) list.add(createEnumValue(d, "None"));
        d = defMap.get("video_format");
        if (d != null) list.add(createEnumValue(d, "H.264 / AVC"));
        d = defMap.get("slow_motion");
        if (d != null) list.add(createTextValue(d, "Full HD 120fps"));
        d = defMap.get("recording_limit");
        if (d != null) list.add(createNumberValue(d, 30.0, "30 phút (4K)"));
        d = defMap.get("video_stabilization");
        if (d != null) list.add(createTextValue(d, "Digital IS"));

        d = defMap.get("screen_size");
        if (d != null) list.add(createNumberValue(d, 3.0, "3.0 inch"));
        d = defMap.get("screen_dots");
        if (d != null) list.add(createNumberValue(d, 1040000.0, "1.040.000 điểm ảnh"));
        d = defMap.get("evf_resolution");
        if (d != null) list.add(createNumberValue(d, 2360000.0, "2.360.000 điểm ảnh"));
        d = defMap.get("evf_magnification");
        if (d != null) list.add(createNumberValue(d, 0.95, "0.95x"));
        d = defMap.get("touchscreen");
        if (d != null) list.add(createEnumValue(d, "Có — Cảm ứng đa điểm"));
        d = defMap.get("viewfinder_type");
        if (d != null) list.add(createEnumValue(d, "OVF (quang học)"));

        d = defMap.get("battery_type");
        if (d != null) list.add(createEnumValue(d, "LP-E6N"));
        d = defMap.get("bluetooth");
        if (d != null) list.add(createTextValue(d, "4.1"));
        d = defMap.get("wifi_standard");
        if (d != null) list.add(createTextValue(d, "Wi-Fi (802.11b/g/n)"));
        d = defMap.get("usb_port");
        if (d != null) list.add(createEnumValue(d, "USB 2.0"));
        d = defMap.get("hdmi_port");
        if (d != null) list.add(createEnumValue(d, "HDMI Type C (Mini)"));
        d = defMap.get("card_type");
        if (d != null) list.add(createEnumValue(d, "SD (UHS-I)"));
        d = defMap.get("card_slots");
        if (d != null) list.add(createNumberValue(d, 1.0, "1 khe"));

        d = defMap.get("weight");
        if (d != null) list.add(createNumberValue(d, 701.0, "701g (thân máy)"));
        d = defMap.get("dimensions");
        if (d != null) list.add(createTextValue(d, "140.7 x 104.8 x 76.8mm"));
        d = defMap.get("weather_sealing");
        if (d != null) list.add(createTextValue(d, "Dust & Moisture Resistant"));
        d = defMap.get("body_material");
        if (d != null) list.add(createTextValue(d, "Aluminum Alloy / Polycarbonate"));
        d = defMap.get("grip_material");
        if (d != null) list.add(createTextValue(d, "Rubber"));
        d = defMap.get("shutter_rating");
        if (d != null) list.add(createTextValue(d, "100,000 lần"));

        return list;
    }

    // ---- Canon EOS M50 Mark II ----
    private List<TechSpecValue> seedEOSM50(Map<String, TechSpecDefinition> defMap) {
        List<TechSpecValue> list = new ArrayList<>();
        TechSpecDefinition d;

        d = defMap.get("sensor_type");
        if (d != null) list.add(createEnumValue(d, "APS-C CMOS"));
        d = defMap.get("image_processor");
        if (d != null) list.add(createEnumValue(d, "DIGIC 8"));
        d = defMap.get("sensor_size");
        if (d != null) list.add(createTextValue(d, "22.3 x 14.9mm"));
        d = defMap.get("iso_standard");
        if (d != null) list.add(createTextValue(d, "100-25600"));
        d = defMap.get("iso_extended");
        if (d != null) list.add(createTextValue(d, "100-51200"));
        d = defMap.get("resolution_mp");
        if (d != null) list.add(createNumberValue(d, 24.1, "24.1MP"));
        d = defMap.get("bit_depth");
        if (d != null) list.add(createNumberValue(d, 14.0, "14-bit"));

        d = defMap.get("lens_mount");
        if (d != null) list.add(createEnumValue(d, "Canon EF-M"));
        d = defMap.get("af_system");
        if (d != null) list.add(createEnumValue(d, "Dual Pixel CMOS AF"));
        d = defMap.get("articulating_screen");
        if (d != null) list.add(createEnumValue(d, "Full Articulating (xoay 180°)"));
        d = defMap.get("eye_af");
        if (d != null) list.add(createTextValue(d, "Có — AF người"));
        d = defMap.get("af_points");
        if (d != null) list.add(createNumberValue(d, 143.0, "143 điểm"));
        d = defMap.get("burst_fps");
        if (d != null) list.add(createNumberValue(d, 10.0, "10 fps"));

        d = defMap.get("video_max_resolution");
        if (d != null) list.add(createEnumValue(d, "4K 24fps"));
        d = defMap.get("video_max_fps");
        if (d != null) list.add(createNumberValue(d, 120.0, "120fps"));
        d = defMap.get("log_profile");
        if (d != null) list.add(createEnumValue(d, "HDR PQ"));
        d = defMap.get("video_format");
        if (d != null) list.add(createEnumValue(d, "H.264 / AVC"));
        d = defMap.get("slow_motion");
        if (d != null) list.add(createTextValue(d, "Full HD 120fps"));
        d = defMap.get("recording_limit");
        if (d != null) list.add(createNumberValue(d, 30.0, "30 phút (4K)"));
        d = defMap.get("video_stabilization");
        if (d != null) list.add(createTextValue(d, "Digital IS"));

        d = defMap.get("screen_size");
        if (d != null) list.add(createNumberValue(d, 3.0, "3.0 inch"));
        d = defMap.get("screen_dots");
        if (d != null) list.add(createNumberValue(d, 1040000.0, "1.040.000 điểm ảnh"));
        d = defMap.get("evf_resolution");
        if (d != null) list.add(createNumberValue(d, 2360000.0, "2.360.000 điểm ảnh"));
        d = defMap.get("evf_magnification");
        if (d != null) list.add(createNumberValue(d, 0.95, "0.95x"));
        d = defMap.get("touchscreen");
        if (d != null) list.add(createEnumValue(d, "Có — Cảm ứng đa điểm"));
        d = defMap.get("viewfinder_type");
        if (d != null) list.add(createEnumValue(d, "Electronic Viewfinder (OLED)"));

        d = defMap.get("battery_type");
        if (d != null) list.add(createEnumValue(d, "LP-E12"));
        d = defMap.get("bluetooth");
        if (d != null) list.add(createTextValue(d, "4.2"));
        d = defMap.get("wifi_standard");
        if (d != null) list.add(createTextValue(d, "Wi-Fi 5 (802.11ac)"));
        d = defMap.get("usb_port");
        if (d != null) list.add(createEnumValue(d, "USB Micro-B"));
        d = defMap.get("hdmi_port");
        if (d != null) list.add(createEnumValue(d, "HDMI Type D (Micro)"));
        d = defMap.get("card_type");
        if (d != null) list.add(createEnumValue(d, "SD (UHS-I)"));
        d = defMap.get("card_slots");
        if (d != null) list.add(createNumberValue(d, 1.0, "1 khe"));

        d = defMap.get("weight");
        if (d != null) list.add(createNumberValue(d, 387.0, "387g (thân máy)"));
        d = defMap.get("dimensions");
        if (d != null) list.add(createTextValue(d, "116.3 x 88.1 x 58.7mm"));
        d = defMap.get("weather_sealing");
        if (d != null) list.add(createTextValue(d, "Không"));
        d = defMap.get("body_material");
        if (d != null) list.add(createTextValue(d, "Polycarbonate"));
        d = defMap.get("grip_material");
        if (d != null) list.add(createTextValue(d, "Rubber"));
        d = defMap.get("shutter_rating");
        if (d != null) list.add(createTextValue(d, "50,000 lần"));

        return list;
    }

    // ---- Canon PowerShot G7 X Mark III ----
    private List<TechSpecValue> seedG7X(Map<String, TechSpecDefinition> defMap) {
        List<TechSpecValue> list = new ArrayList<>();
        TechSpecDefinition d;

        d = defMap.get("sensor_type");
        if (d != null) list.add(createEnumValue(d, "1-inch CMOS"));
        d = defMap.get("image_processor");
        if (d != null) list.add(createEnumValue(d, "DIGIC 8"));
        d = defMap.get("sensor_size");
        if (d != null) list.add(createTextValue(d, "13.2 x 8.8mm"));
        d = defMap.get("iso_standard");
        if (d != null) list.add(createTextValue(d, "125-12800"));
        d = defMap.get("iso_extended");
        if (d != null) list.add(createTextValue(d, "125-25600"));
        d = defMap.get("resolution_mp");
        if (d != null) list.add(createNumberValue(d, 20.1, "20.1MP"));
        d = defMap.get("bit_depth");
        if (d != null) list.add(createNumberValue(d, 14.0, "14-bit"));

        d = defMap.get("lens_mount");
        if (d != null) list.add(createEnumValue(d, "Fixed"));
        d = defMap.get("af_system");
        if (d != null) list.add(createEnumValue(d, "Contrast AF"));
        d = defMap.get("articulating_screen");
        if (d != null) list.add(createEnumValue(d, "Full Articulating (xoay 180°)"));
        d = defMap.get("eye_af");
        if (d != null) list.add(createTextValue(d, "Có — AF người"));
        d = defMap.get("af_points");
        if (d != null) list.add(createNumberValue(d, 31.0, "31 điểm"));
        d = defMap.get("burst_fps");
        if (d != null) list.add(createNumberValue(d, 20.0, "20 fps"));

        d = defMap.get("video_max_resolution");
        if (d != null) list.add(createEnumValue(d, "4K 30fps"));
        d = defMap.get("video_max_fps");
        if (d != null) list.add(createNumberValue(d, 120.0, "120fps"));
        d = defMap.get("log_profile");
        if (d != null) list.add(createEnumValue(d, "None"));
        d = defMap.get("video_format");
        if (d != null) list.add(createEnumValue(d, "H.265 / HEVC"));
        d = defMap.get("slow_motion");
        if (d != null) list.add(createTextValue(d, "Full HD 120fps"));
        d = defMap.get("recording_limit");
        if (d != null) list.add(createNumberValue(d, 10.0, "10 phút (4K 30fps)"));
        d = defMap.get("video_stabilization");
        if (d != null) list.add(createTextValue(d, "IS 5 trục"));

        d = defMap.get("screen_size");
        if (d != null) list.add(createNumberValue(d, 3.0, "3.0 inch"));
        d = defMap.get("screen_dots");
        if (d != null) list.add(createNumberValue(d, 1040000.0, "1.040.000 điểm ảnh"));
        d = defMap.get("evf_resolution");
        if (d != null) list.add(createTextValue(d, "Không có"));
        d = defMap.get("evf_magnification");
        if (d != null) list.add(createTextValue(d, "Không có"));
        d = defMap.get("touchscreen");
        if (d != null) list.add(createEnumValue(d, "Có — Cảm ứng đa điểm"));
        d = defMap.get("viewfinder_type");
        if (d != null) list.add(createEnumValue(d, "Không có"));

        d = defMap.get("battery_type");
        if (d != null) list.add(createEnumValue(d, "NB-13L"));
        d = defMap.get("bluetooth");
        if (d != null) list.add(createTextValue(d, "4.2"));
        d = defMap.get("wifi_standard");
        if (d != null) list.add(createTextValue(d, "Wi-Fi 5 (802.11ac)"));
        d = defMap.get("usb_port");
        if (d != null) list.add(createEnumValue(d, "USB-C 3.1 Gen 1"));
        d = defMap.get("hdmi_port");
        if (d != null) list.add(createEnumValue(d, "HDMI Type D (Micro)"));
        d = defMap.get("card_type");
        if (d != null) list.add(createEnumValue(d, "SD (UHS-I)"));
        d = defMap.get("card_slots");
        if (d != null) list.add(createNumberValue(d, 1.0, "1 khe"));

        d = defMap.get("weight");
        if (d != null) list.add(createNumberValue(d, 304.0, "304g"));
        d = defMap.get("dimensions");
        if (d != null) list.add(createTextValue(d, "105.5 x 60.9 x 41.4mm"));
        d = defMap.get("weather_sealing");
        if (d != null) list.add(createTextValue(d, "Không"));
        d = defMap.get("body_material");
        if (d != null) list.add(createTextValue(d, "Aluminum Alloy"));
        d = defMap.get("grip_material");
        if (d != null) list.add(createTextValue(d, "Rubber"));
        d = defMap.get("shutter_rating");
        if (d != null) list.add(createTextValue(d, "Không có thông số"));

        return list;
    }

    // ---- Helper tạo TechSpecValue ----
    private TechSpecValue createEnumValue(TechSpecDefinition def, String displayValue) {
        TechSpecValue v = new TechSpecValue();
        v.setTechSpecDefinition(def);
        v.setDisplayValue(displayValue);
        v.setStatus(EntityStatus.ACTIVE);
        return v;
    }

    private TechSpecValue createTextValue(TechSpecDefinition def, String text) {
        TechSpecValue v = new TechSpecValue();
        v.setTechSpecDefinition(def);
        v.setValueText(text);
        v.setDisplayValue(text);
        v.setStatus(EntityStatus.ACTIVE);
        return v;
    }

    private TechSpecValue createNumberValue(TechSpecDefinition def, Double number, String display) {
        TechSpecValue v = new TechSpecValue();
        v.setTechSpecDefinition(def);
        v.setValueNumber(number);
        v.setDisplayValue(display);
        v.setStatus(EntityStatus.ACTIVE);
        return v;
    }

    private void createEnumItems(TechSpecDefinition definition, String[] names) {
        for (int i = 0; i < names.length; i++) {
            createEnumItem(definition, names[i], i + 1);
        }
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
