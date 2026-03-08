package com.example.datn.infrastructure.exception;

import lombok.Getter;

import java.util.List;

@Getter
public class ValidationException extends RuntimeException {

    private final List<String> errors;

    public ValidationException(String message) {
        super(message);
        this.errors = List.of(message);
    }

    public ValidationException(List<String> errors) {
        super(String.join(", ", errors));
        this.errors = errors;
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
        this.errors = List.of(message);
    }
}
