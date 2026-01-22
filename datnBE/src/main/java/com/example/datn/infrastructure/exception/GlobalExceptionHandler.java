package com.example.datn.infrastructure.exception;

import com.example.datn.core.common.base.ResponseObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler extends RuntimeException {
    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public ResponseEntity<ResponseObject<?>> handleValidation(Exception ex) {
        String message;

        if (ex instanceof MethodArgumentNotValidException) {
            message = ((MethodArgumentNotValidException) ex).getBindingResult()
                    .getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.joining(", "));
        } else {
            message = ((BindException) ex).getBindingResult()
                    .getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.joining(", "));
        }

        return ResponseEntity.badRequest().body(
                ResponseObject.error(HttpStatus.BAD_REQUEST, message)
        );
    }

    @ExceptionHandler(CloudinaryException.class)
    public ResponseEntity<ResponseObject<?>> handleCloudinary(CloudinaryException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ResponseObject.error(HttpStatus.BAD_REQUEST, ex.getMessage())
        );
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ResponseObject<?>> handleRuntime(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ResponseObject.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage())
        );
    }
}
