package com.example.datn.infrastructure.exception;

import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.infrastructure.security.exception.OAuth2AuthenticationProcessingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler{
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

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ResponseObject<?>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ResponseObject.error(HttpStatus.NOT_FOUND, ex.getMessage())
        );
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ResponseObject<?>> handleValidationException(ValidationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ResponseObject.error(HttpStatus.BAD_REQUEST, ex.getMessage())
        );
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ResponseObject<?>> handleDuplicateResource(DuplicateResourceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ResponseObject.error(HttpStatus.CONFLICT, ex.getMessage())
        );
    }

    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<ResponseObject<?>> handleService(ServiceException ex) {
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

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseObject<?>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                ResponseObject.error(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện hành động này")
        );
    }

    @ExceptionHandler(OAuth2AuthenticationProcessingException.class)
    public ResponseEntity<ResponseObject<?>> handleOAuth2Exception(OAuth2AuthenticationProcessingException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ResponseObject.error(HttpStatus.BAD_REQUEST, ex.getMessage())
        );
    }
}
