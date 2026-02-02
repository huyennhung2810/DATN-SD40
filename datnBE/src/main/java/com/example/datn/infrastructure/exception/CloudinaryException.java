package com.example.datn.infrastructure.exception;

public class CloudinaryException extends RuntimeException{
    private static final long serialVersionUID = 5003320033602480096L;

    public CloudinaryException(String message) {
        super(message);
    }
}
