package com.example.datn.infrastructure.job.imei.service.impl;

import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.job.common.model.request.EXDataRequest;
import com.example.datn.infrastructure.job.imei.model.SerialNumberExcelResponse;
import com.example.datn.infrastructure.job.imei.repository.SerialNumberExcelRepository;
import com.example.datn.infrastructure.job.imei.service.SerialNumberExcelService;
import com.example.datn.repository.SerialRepository;
import com.example.datn.utils.ExcelHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class SerialNumberExcelServiceImpl implements SerialNumberExcelService {

    private final SerialNumberExcelRepository serialNumberExcelRepository;
    private final SerialRepository serialRepository;


    @Override
    public ResponseEntity<?> downloadTemplate(EXDataRequest request) {
        String filename = "mau-import-so-seri.xlsx";
        List<String> headers = List.of("Số Sê-ri (Serial Number)");

        byte[] data = ExcelHelper.createExcelStream("serial-number-template", headers, new ArrayList<>());

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentDisposition(ContentDisposition.builder("attachment").filename(filename).build());
        httpHeaders.set(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION);
        httpHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);

        return new ResponseEntity<>(data, httpHeaders, HttpStatus.OK);
    }

    @Override
    public ResponseObject<?> importExcelSerialNumber(MultipartFile file) {
        List<String> serialNumbers = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null || sheet.getLastRowNum() < 1) {
                return ResponseObject.error(HttpStatus.BAD_REQUEST, "File Excel không có dữ liệu!");
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                Cell cell = row.getCell(0);
                if (cell == null) continue;

                String value = "";
                if (cell.getCellType() == CellType.NUMERIC) {
                    value = String.format("%.0f", cell.getNumericCellValue());
                } else {
                    value = cell.getStringCellValue().trim();
                }

                if (!value.isEmpty()) serialNumbers.add(value);
            }
        } catch (IOException e) {
            log.error("Lỗi đọc file Excel: {}", e.getMessage());
            return ResponseObject.error(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống khi đọc file");
        }

        // Kiểm tra xem những số Serial nào đã tồn tại trong DB
        Set<String> existCodes = serialRepository.findByCodeIn(
                new HashSet<>(serialNumbers)
        );


        List<SerialNumberExcelResponse> responseList = serialNumbers.stream()
                .map(code -> new SerialNumberExcelResponse(code, existCodes.contains(code)))
                .toList();

        return ResponseObject.success(responseList, "Kiểm tra dữ liệu thành công");
    }

}
