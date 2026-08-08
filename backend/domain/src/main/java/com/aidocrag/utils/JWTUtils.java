package com.aidocrag.utils;

import com.aidocrag.entity.UserDomain;

public interface JWTUtils {

    String generateUserToken(UserDomain user);

    String validateAndExtractUserId(String token);
}