package com.example.datn.infrastructure.config.database;

import com.example.datn.core.admin.employee.repository.ADEmployeeRepository;
import com.example.datn.entity.*;
import com.example.datn.infrastructure.constant.BannerPosition;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.example.datn.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

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

            System.out.println(">>> Hoàn tất seed dữ liệu sản phẩm!");

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
        banner.setType(com.example.datn.infrastructure.constant.BannerType.HERO);
        banner.setStatus(EntityStatus.ACTIVE);
        banner.setStartAt(LocalDateTime.now());
        banner.setEndAt(LocalDateTime.now().plusMonths(12));
        return banner;
    }
}
