package com.loanlens.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error(404, ex.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error(409, ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCreds(BadCredentialsException ex) {
        // Pass through our custom codes so frontend can differentiate
        String msg = ex.getMessage();
        if ("USER_NOT_FOUND".equals(msg) || "WRONG_PASSWORD".equals(msg)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error(401, msg));
        }
        // Default fallback for any other bad credentials
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error(401, "WRONG_PASSWORD"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error(400, msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(error(500, "Internal server error"));
    }

    private ErrorResponse error(int status, String message) {
        return new ErrorResponse(status, message, LocalDateTime.now().toString());
    }

    public record ErrorResponse(int status, String message, String timestamp) {}
}