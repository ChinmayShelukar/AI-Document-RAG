package com.aidocrag.utils;

import java.util.UUID;

import com.aidocrag.entity.UserDomain;
import com.aidocrag.exception.JWTException;
import jakarta.servlet.http.HttpServletRequest;

public interface JWTUtils {

    String generateUserToken(UserDomain user);

    String validateAndExtractUserId(String token);

    UUID getUserIdFromCookie(HttpServletRequest request) throws JWTException;
}