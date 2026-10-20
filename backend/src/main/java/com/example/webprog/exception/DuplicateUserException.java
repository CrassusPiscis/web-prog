package com.example.webprog.exception;

public class DuplicateUserException
        extends RuntimeException {

    public DuplicateUserException(String message) {
        super(message);
    }
}